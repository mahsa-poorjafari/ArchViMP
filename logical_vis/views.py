from django.shortcuts import render
from logical_vis.logical_data_inputs import *
from logical_vis.dynamic_analysis import *
from operator import is_not
from functools import partial
import csv
# Create your views here.


def index(request):
    return render(request, 'Home.html')

def home(request):
    return render(request, 'home.html')

def get_shared_var_names():
    with open('logical_vis/shared_variables.txt') as csv_file:
        csv_file.seek(0, 0)
        csv_reader = csv.reader(csv_file, delimiter=',')
        var_names = map(lambda var: var[0], csv_reader)
        shared_variables_names = list(var_names)
        # print("Number of Shared Variables: ", shared_variables_names)
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


def get_first_function(t, indx):

    print("=========>", t, " - ", indx)
    with open('logical_vis/PowerWindowRosace.txt') as csv_file:
        csv_file.seek(0, 0)
        csv_reader = csv.reader(csv_file, delimiter=',')
        if "Main_" in t:
            b = t.split('_')
            thread_functioncall_filter = filter(lambda row: row[2] == "FUNCTIONCALL" and row[1] == b[1]
                                                , csv_reader)
            thread_functioncall_list = list(thread_functioncall_filter)[1]
            thread_function = {t: thread_functioncall_list[3]}

        else:
            thread_functioncall_filter = filter(lambda row: row[2] == "FUNCTIONCALL" and row[1] == t
                                                and (row[5] == "CONSTANT;LOCAL;" or row[5] == "LOCAL;CONSTANT;"),
                                                csv_reader)
            thread_functioncall_list = list(thread_functioncall_filter)[indx-1]

            thread_function= {t: thread_functioncall_list[3]}
        print(t, "=>  ", thread_function)
        return thread_function


def get_records():
    with open('logical_vis/PowerWindowRosace.txt') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
    print("csv_reader=>  ", type(csv_reader))
    return csv_reader


def get_threads():
    # get_records()
    with open('logical_vis/PowerWindowRosace.txt') as csv_file:
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
        return threads


def thread_per_vars(shared_variables, thread_ids):
    thread_vars_op = {}
    thread_op = dict()
    # print("\n shared_variables=> ", shared_variables)
    # print("\n thread_ids=> ", thread_ids)
    with open('logical_vis/PowerWindowRosace.txt') as csv_file:
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

    shared_variables = get_shared_var_names()
    data_types_vars = get_data_types()
    # struct_vars_groups = get_var_struct(shared_variables)
    # print(struct_vars_groups)
    # threads = get_threads()

    return render(request, 'logical_data_L0.html', {'data_types': data_types_vars,
                                                    'shared_variables': shared_variables})


def logical_comp(request):
    thread_list = get_threads()
    thr_func_dict = {}
    for indx, t in enumerate(thread_list):
        thr_func = get_first_function(t, indx)
        thr_func_dict.update(thr_func)
    print("thr_func_list => ", thr_func_dict)

    return render(request, 'logical_component.html', {'threads': thread_list,
                                                      'thread_function': thr_func_dict})


def logical_data_l1(request):
    shared_variables_names = get_shared_var_names()
    threads = get_threads()
    struct_vars_groups = get_var_struct(shared_variables_names)
    return render(request, 'logical_data_L1.html', {'shared_variables': shared_variables_names,
                                                    'thread_ids': threads,
                                                    'struct_vars': struct_vars_groups})


def logical_data_l2(request):
    shared_variables_names = get_shared_var_names()
    threads = get_threads()
    thread_var_op = {}

    with open('logical_vis/PowerWindowRosace.txt') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        for t in threads:

            # thr = t.split("_")[1] if "Main_" in t else t
            # print(thr)
            if "Main_" not in t:
                thread_vars_filter = filter(lambda row: row[1] == t and row[2] in ["LOAD", "STORE"], csv_reader)
                # csv_file.seek(0, 0)
                thread_vars_filter = map(lambda row: [row[3], row[0], row[1], row[2]] if row[3] != '' else None,
                                         thread_vars_filter)

                thread_var_not_none = filter(partial(is_not, None), thread_vars_filter)
                thread_var_list = list(thread_var_not_none)
                thread_var_op.update({t: thread_var_list})
            csv_file.seek(0, 0)
        # print("thread_var_list", thread_var_op)
        var_order = list()
        for k, v in thread_var_op.items():
            for var in v:
                if v[0] not in var_order:
                    var_order.append(v[0])

    return render(request, 'logical_data_L2.html', {'shared_variables': shared_variables_names,
                                                    'thread_ids': threads})