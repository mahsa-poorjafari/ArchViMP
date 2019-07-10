from django.shortcuts import render
from logical_vis.logical_data_inputs import *
from logical_vis.dynamic_analysis import *
from operator import is_not
from functools import partial
import csv
from django.conf import settings
from django.utils import timezone
import collections


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


def get_records():
    with open('logical_vis/PowerWindowRosace.txt') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
    csv_file.close()
    print("csv_reader=>  ", type(csv_reader))
    return csv_reader


def thread_per_vars(shared_variables, thread_ids):
    thread_vars_op = {}
    thread_op = dict()

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


def logical_data_l0(request):
    benchmark_name = request.GET.get('b') if (request.GET.get('b')) else None
    trace_file = get_file_path(benchmark_name)
    # shared_variables = get_shared_var_names()
    shared_variables_names = get_all_shared_var_names(trace_file)
    data_types_vars = get_data_types(trace_file)
    # print("\n data_types_vars=>  ", data_types_vars)

    return render(request, 'logical_data_L0.html', {'data_types': data_types_vars,
                                                    'shared_variables': shared_variables_names,
                                                    'benchmark_name': benchmark_name})


def logical_comp(request):
    benchmark_name = request.GET.get('b') if (request.GET.get('b')) else None
    trace_file = get_file_path(benchmark_name)
    thread_list = get_threads(trace_file)
    thr_func_dict = {}
    for indx, t in enumerate(thread_list):
        thr_func = get_first_function(t, indx, trace_file)
        thr_func_dict.update(thr_func)
    # print("thr_func_list => ", thr_func_dict)

    return render(request, 'logical_component.html', {'threads': thread_list,
                                                      'thread_function': thr_func_dict,
                                                      'benchmark_name': benchmark_name})


def logical_data_l1(request):
    benchmark_name = request.GET.get('b') if (request.GET.get('b')) else None
    trace_file = get_file_path(benchmark_name)
    # print("trace_file=>  ", trace_file)
    shared_variables_names = get_all_shared_var_names(trace_file)
    struct_vars_groups = get_var_struct(shared_variables_names)
    variables = {"variables": struct_vars_groups.pop("variables")}
    return render(request, 'logical_data_L1.html', {'struct_vars': struct_vars_groups,
                                                    'variable_list': variables,
                                                    'benchmark_name': benchmark_name})


def logical_data_l2_ungrouped(request):
    benchmark_name = request.GET.get('b') if (request.GET.get('b')) else None
    trace_file = get_file_path(benchmark_name)
    threads = get_threads(trace_file)
    thread_var_op = get_thread_var_op(threads, ["LOAD"], trace_file)
    return render(request, 'logical_data_L2_Ungrouped.html', {'thread_var_op': thread_var_op,
                                                              'benchmark_name': benchmark_name})


def logical_data_l2(request):
    benchmark_name = request.GET.get('b') if (request.GET.get('b')) else None
    trace_file = get_file_path(benchmark_name)
    threads = get_threads(trace_file)

    # Get the variables that are threads Input
    thread_var_input = get_thread_var_op(threads, ["LOAD"], trace_file)
    ld_input_lc = create_ld_thread_op(thread_var_input, "Input_")
    ld_input_g = group_over10_child(ld_input_lc)

    # Get the variables that are threads Output
    thread_var_output = get_thread_var_op(threads, ["STORE"], trace_file)
    ld_output_lc = create_ld_thread_op(thread_var_output, "Output_")
    ld_output_g = group_over10_child(ld_output_lc)

    # Get the variables that are threads Processed
    thread_var_process = get_thread_var_op(threads, ["LOAD", "STORE"], trace_file)
    ld_process_lc = create_ld_thread_op(thread_var_process, "Process_")
    ld_process_g = group_over10_child(ld_process_lc)

    return render(request, 'logical_data_L2.html', {'benchmark_name': benchmark_name,
                                                    'ld_input_lc': ld_input_g,
                                                    'ld_output_lc': ld_output_g,
                                                    'ld_process_lc': ld_process_g})


def ld_exe_path_l2(request):
    benchmark_name = request.GET.get('b') if (request.GET.get('b')) else None
    trace_file = get_file_path(benchmark_name)
    threads = get_threads(trace_file)
    thr_func_dict = {}
    parent_function_list = []
    for indx, t in enumerate(threads):
        thr_func = get_first_function(t, indx, trace_file)
        thr_func_dict.update(thr_func)

    print("thr_func_dict=>  ", thr_func_dict)

    # I start to catch the first ExePath from the Main thread
    # For that purpose I have to get the function body of the first/parent function of the main thread
    # get the first/parent function of the main thread
    main_pfuntion_name = [v if "Main_" in k else parent_function_list.append(v) for k, v in thr_func_dict.items()]
    # main_pfuntion_name = list(filter(partial(is_not, None), main_pfuntion_name_with_none))
    main_pfuntion_name = main_pfuntion_name[0] if len(main_pfuntion_name) is 1 else None
    print("parent_function_list=>  ", parent_function_list)

    return render(request, 'exe_path_L2.html', {'benchmark_name': benchmark_name})

