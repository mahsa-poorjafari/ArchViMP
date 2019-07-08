from django.shortcuts import render
from logical_vis.logical_data_inputs import *
from logical_vis.dynamic_analysis import *
from operator import is_not
from functools import partial
import csv
from django.conf import settings
from django.utils import timezone
# Create your views here.
import itertools

settings.CURRENT_TIME = str(timezone.now()).replace(" ", "")
print("CURRENT_TIME: ", settings.CURRENT_TIME)


def index(request):

    return render(request, 'Home.html')


def home(request):

    return render(request, 'home.html')


def write_to_csv_file(data, data_name):
    print("-----------------write_to_csv_file-------------------")
    file_name = data_name + '_' + settings.CURRENT_TIME
    with open('output_csv/' + file_name + '.csv', 'w', encoding='utf-8') as csv_file:
        csv_writer = csv.writer(csv_file)
        for key, value in data.items():
            csv_writer.writerow([key, list(value)])
    csv_file.close()


def get_shared_var_names():
    with open('logical_vis/shared_variables.txt', 'r') as csv_file:
        csv_file.seek(0, 0)
        csv_reader = csv.reader(csv_file, delimiter=',')
        var_names = map(lambda var: var[0], csv_reader)
        shared_variables_names = list(var_names)
        # print("Number of Shared Variables: ", shared_variables_names)
    csv_file.close()
    return shared_variables_names


def get_all_shared_var_names():
    with open('benchmark_traces/ROSACE/PowerWindowRosace.txt', 'r') as csv_file:
        csv_file.seek(0, 0)
        csv_reader = csv.reader(csv_file, delimiter=',')
        var_records = filter(lambda var: var[2] in ["LOAD", "STORE", "GETELEMENTPTR"] and var[3] != '', csv_reader)
        var_names = map(lambda var: var[3], var_records)
        shared_variables_names = remove_dups(list(var_names))
        # print("Shared Variables: \n", shared_variables_names)
    csv_file.close()
    return shared_variables_names


def get_var_struct(shared_vars):
    struct_vars_groups = {}
    struct_group = []
    shared_group = []
    for v in shared_vars:
        if v.find(".") > 0:
            struct_var = v.split(".")
            struct_group.append(struct_var)
        else:
            shared_group.append(v)

    struct_names = map(lambda a: a[0], struct_group)
    struct_names_keys = remove_dups(list(struct_names))
    for s in struct_names_keys:
        find_struct_vars = map(lambda i: i[1] if i[0] == s else None, struct_group)
        struct_vars_not_none = filter(partial(is_not, None), find_struct_vars)
        struct_vars_groups.update({s: list(struct_vars_not_none)})
    struct_vars_groups.update({"variables": shared_group})
    # print(struct_vars_groups)
    return struct_vars_groups




def get_records():
    with open('logical_vis/PowerWindowRosace.txt') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
    csv_file.close()
    print("csv_reader=>  ", type(csv_reader))
    return csv_reader


def get_threads():
    # get_records()
    with open('logical_vis/PowerWindowRosace.txt', 'r') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        main_thread_filter = filter(lambda row: row[2] == "FUNCTIONCALL" and row[3] == "main", csv_reader)
        main_thread_list = list(main_thread_filter)
        main_thread_id = main_thread_list[0][1]
        # print("main_thread_id =>  ", main_thread_id)

        csv_file.seek(0, 0)
        thread_ids = map(lambda var: var[1], csv_reader)
        thr_dict = dict.fromkeys(list(thread_ids))
        thread_list = list(thr_dict)
        threads = ['Main_' + item if item == main_thread_id else item for item in thread_list]
        # threads = {"threads": thread_list, "Main": main_thread_id}
        # print(threads)
    csv_file.close()
    return threads


def thread_per_vars(shared_variables, thread_ids):
    thread_vars_op = {}
    thread_op = dict()
    # print("\n shared_variables=> ", shared_variables)
    # print("\n thread_ids=> ", thread_ids)
    with open('logical_vis/PowerWindowRosace.txt', 'r') as csv_file:
        # csv_file.seek(0, 0)
        csv_reader = csv.reader(csv_file, delimiter=',')
        for v in shared_variables:
            for t in thread_ids:
                csv_file.seek(0, 0)
                var_thr = list(filter(lambda r: r[3] == v and r[1] == t, csv_reader))
                var_thr_op = list(map(lambda o: o[2], var_thr))
                dict_var_thr_op = dict.fromkeys(var_thr_op)
                op_list = list(dict_var_thr_op)
                thread_op.update({t: None if not op_list else op_list})

            thread_vars_op.update({v: thread_op})
    csv_file.close()
    # print("\n => ", thread_vars)
    return thread_vars_op


def catastrophe(request):
    shared_variables_names = get_shared_var_names()
    thread_ids = get_threads()
    t_v_op = thread_per_vars(shared_variables_names, thread_ids)
    return render(request, 'catastrophe.html', {"t_v_op": t_v_op,
                                                "t_v_op_list": list(t_v_op),
                                                "shared_variables": shared_variables_names,
                                                "thread_ids": thread_ids})


def logical_data(request):
    shared_variables = logical_data_input_function()
    struct_vars_groups = get_var_struct(shared_variables)
    fun_names = get_function_names()
    # print(fun_names)

    return render(request, 'Logical_data.html', {'shared_variables': shared_variables,
                                                 'shared_struct': struct_vars_groups,
                                                 'function_names': fun_names})


def logical_data_l0(request):
    benchmark_name = request.GET.get('b') if (request.GET.get('b')) else None
    shared_variables = get_shared_var_names()
    data_types_vars = get_data_types()
    # struct_vars_groups = get_var_struct(shared_variables)
    # data_types_vars = list(filter(None, data_types_vars))
    # print("data_types_vars=>  ", data_types_vars)
    # write_to_csv_file(data_types_vars, "data_types_vars")
    # threads = get_threads()

    return render(request, 'logical_data_L0.html', {'data_types': data_types_vars,
                                                    'shared_variables': shared_variables,
                                                    'benchmark_name': benchmark_name})


def logical_comp(request):
    benchmark_name = request.GET.get('b') if (request.GET.get('b')) else None
    thread_list = get_threads()
    # print("thread_list=  ", thread_list)
    thr_func_dict = {}
    for indx, t in enumerate(thread_list):
        thr_func = get_first_function(t, indx)
        thr_func_dict.update(thr_func)
    # print("thr_func_list => ", thr_func_dict)

    return render(request, 'logical_component.html', {'threads': thread_list,
                                                      'thread_function': thr_func_dict,
                                                      'benchmark_name': benchmark_name})


def logical_data_l1(request):
    benchmark_name = request.GET.get('b') if (request.GET.get('b')) else None
    shared_variables_names = get_all_shared_var_names()
    threads = get_threads()
    struct_vars_groups = get_var_struct(shared_variables_names)
    # print("struct_vars_groups   =>  ", struct_vars_groups)
    # write_to_csv_file(struct_vars_groups, "struct_vars")
    return render(request, 'logical_data_L1.html', {'struct_vars': struct_vars_groups,
                                                    'benchmark_name': benchmark_name})


def logical_data_l2_ungrouped(request):
    print("\n --------------logical_data_l2_ungrouped--------------- \n")
    benchmark_name = request.GET.get('b') if (request.GET.get('b')) else None
    threads = get_threads()
    thread_var_op = get_thread_var_op(threads)
    return render(request, 'logical_data_L2_Ungrouped.html', {'thread_var_op': thread_var_op,
                                                              'benchmark_name': benchmark_name})


def logical_data_l2(request):
    benchmark_name = request.GET.get('b') if (request.GET.get('b')) else None
    threads = get_threads()
    thread_var_op = get_thread_var_op(threads)
    ld_l2_group = {}
    a = []

    for lc, ld_vars in thread_var_op.items():
        lc_list = []
        lc_members = {k for k in ld_vars}
        del a[:]
        if not ld_l2_group:
            group_name = "Input_" + lc
            lc_list.append(lc)
            ld_l2_group.update({group_name: {"logical_components": lc_list, "group_members": lc_members}})

        else:
            a = list({k if lc_members == v['group_members'] else None for k, v in ld_l2_group.items()})
            a_avoid_none = list(filter(partial(is_not, None), a))
            if len(a_avoid_none) != 0:
                group_name = str(a_avoid_none[0]) + "-" + lc
                ld_l2_group[group_name] = ld_l2_group.pop(a_avoid_none[0])
                ld_l2_group[group_name]['logical_components'].append(lc)
            else:
                group_name = "Input_" + lc
                lc_list.append(lc)
                ld_l2_group.update({group_name: {"logical_components": lc_list, "group_members": lc_members}})

    # print("ld_l2_group----->   \n", ld_l2_group)

    return render(request, 'logical_data_L2.html', {'benchmark_name': benchmark_name,
                                                    'ld_input_lc': ld_l2_group})
