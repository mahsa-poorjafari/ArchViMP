from django.shortcuts import render
from logical_vis.logical_data_inputs import *
from logical_vis.dynamic_analysis import *
from operator import is_not
from functools import partial
import csv
import os
import collections
import string
from django.conf import settings
from django.utils import timezone
from django.core.files.storage import FileSystemStorage
import time
from datetime import datetime

# In this file, each functions will render a page of the web-framework

settings.CURRENT_TIME = str(timezone.now()).replace(" ", "-")


def trace_vis(request):
    context = {}
    current_time = str(settings.CURRENT_TIME).replace("+00:00", "").replace(":", "-").replace(".", "-")
    print("CURRENT_TIME: ", settings.CURRENT_TIME)
    # Get all existing trace files
    dir_trace_files = os.path.join(settings.MEDIA_ROOT, "TraceFiles")
    existing_trace_files = [f if '.txt' in f else '' for f in os.listdir(dir_trace_files)]
    print(existing_trace_files)
    context['existing_trace_files'] = existing_trace_files

    # get all existing shared variable files
    dir_shvar_files = os.path.join(settings.MEDIA_ROOT, "SharedVariablesFiles")
    existing_shvar_files = [f if '.txt' in f else '' for f in os.listdir(dir_shvar_files)]
    print(existing_shvar_files)
    context['existing_shvar_files'] = existing_shvar_files

    context['trace_error'] = ""
    context['shvar_error'] = ""

    if request.method == 'POST':
        if 'trace_file' in request.FILES and 'shared_var_file' in request.FILES:
            uploaded_t_file = request.FILES['trace_file']
            trace_file_name = uploaded_t_file.name
            trace_file_data = trace_file_name.split(".")

            uploaded_shv_file = request.FILES['shared_var_file']
            shared_var_file_name = uploaded_shv_file.name
            shared_var_file_data = shared_var_file_name.split(".")

            if trace_file_data[-1] not in ["txt"] or shared_var_file_data[-1] not in ["txt"]:
                context['trace_error'] = "Valid format of the files is txt."
            else:
                project_name = request.POST.get("program_name")
                project_name_capit = string.capwords(str(project_name))
                print(project_name_capit)
                project_name = project_name_capit.replace(" ", "").replace("_", "")

                # Save the trace files
                fs = FileSystemStorage(location="Uploaded_files/TraceFiles")
                raw_trace_file_name = project_name + "_TraceFile_" + current_time
                t_file_name = raw_trace_file_name + "." + trace_file_data[-1]
                trace_name = fs.save(t_file_name, uploaded_t_file)
                trace_file_url = fs.url(trace_name)

                # Save the shared Variables files
                fs = FileSystemStorage(location="Uploaded_files/SharedVariablesFiles")
                raw_shvar_file_name = project_name + "_SharedVariables_" + current_time
                sh_var_file_name = raw_shvar_file_name + "." + shared_var_file_data[-1]
                sh_var_name = fs.save(sh_var_file_name, uploaded_t_file)
                sh_var_file_url = fs.url(sh_var_name)

                context['trace_url'] = trace_file_url
                context['shvar_url'] = sh_var_file_url
                context['program_name'] = project_name if project_name else "Unnamed Program"
                context['href_id'] = "UPLOADED"
                context['file_path'] = fs.url(trace_name)
                context['trace_raw_file_name'] = raw_trace_file_name
                context['shvar_raw_file_name'] = raw_shvar_file_name

        elif request.POST.get('selected_trace_file') not in [None, ""] and request.POST.get('selected_shared_var_file') not in [None, ""]:
            selected_trace_file = request.POST.get('selected_trace_file')
            selected_shared_var_file = request.POST.get('selected_shared_var_file')
            selected_trace_file_data = selected_trace_file.split(".")
            selected_shvar_file_data = selected_shared_var_file.split(".")

            context['selected_trace_url'] = os.path.join(dir_trace_files, selected_trace_file)
            context['selected_shvar_url'] = os.path.join(dir_shvar_files, selected_shared_var_file)
            context['program_name'] = "Unnamed Program"
            context['href_id'] = "UPLOADED"
            # context['file_path'] = os.path.join(settings.MEDIA_ROOT, uploaded_file)
            context['trace_raw_file_name'] = selected_trace_file_data[0]
            context['shvar_raw_file_name'] = selected_shvar_file_data[0]

        elif request.POST.get('selected_trace_file') in [None, ""] or\
                request.POST.get('selected_shared_var_file') in [None, ""]:
            context['shvar_error'] = catch_the_shvar_error(dict(request.POST))
            # else:
                # context['trace_error'] = catch_the_trace_error(dict(request.FILES))
        else:
            print("Something went wrong...!")

    return render(request, 'trace_vis.html', context)


def home(request):
    return render(request, 'home.html')


def write_to_csv_file(data, data_name):
    print("-----------------write_to_csv_file-------------------")
    current_time = str(settings.CURRENT_TIME).replace("+00:00", "").replace(":", "-").replace(".", "-")
    file_name = data_name + '_' + current_time
    # f = open('output_csv/' + file_name + '.csv', "w+")
    # for row in data:
    #     f.write(row + "\n")
    # f.close()
    with open('output_csv/' + file_name + '.txt', 'w+', encoding='utf-8') as csv_file:
        csv_writer = csv.writer(csv_file)
        for row in data:
            csv_writer.writerow(row)
    csv_file.close()


def catastrophe(request):
    b_parameter, trace_file, which_way, file_name = get_b_parameter(request)
    shared_variables_names = get_all_shared_var_names(b_parameter)
    # print(shared_variables_names)
    thread_ids = get_threads(trace_file)
    pure_thread_ids = []
    [pure_thread_ids.append(tid.split("_")[1]) if "Main_" in tid else pure_thread_ids.append(tid) for tid in thread_ids]
    t_v_op = thread_per_vars(shared_variables_names, thread_ids)
    return render(request, 'catastrophe.html', {"t_v_op": t_v_op,
                                                'title_name': which_way,
                                                "t_v_op_list": list(t_v_op),
                                                "shared_variables": shared_variables_names,
                                                "thread_ids": pure_thread_ids})


def logical_data_l0(request):
    b_parameter, trace_file, which_way, file_name = get_b_parameter(request)
    shared_variables_names = get_all_shared_var_names(b_parameter)
    data_types_vars = get_data_types(b_parameter)
    data_types_names = list(data_types_vars.keys())
    return render(request, 'logical_data_L0.html', {'data_types': data_types_vars,
                                                    'shared_variables': shared_variables_names,
                                                    'title_name': which_way,
                                                    'file_path': trace_file,
                                                    'raw_file_name': file_name,
                                                    'href_id': b_parameter,
                                                    'data_types_names': data_types_names})


def logical_comp(request):
    b_parameter, trace_file, which_way, file_name = get_b_parameter(request)
    logical_decision_file = get_logical_decision_file_path(b_parameter)
    lc_for_threads = get_logical_components(logical_decision_file)
    thread_id_list = []
    [thread_id_list.append("Main_"+thrList[0]) if "main" in lc else thread_id_list.extend(thrList)
     for lc, thrList in lc_for_threads.items()]
    thread_id_list = remove_dups(thread_id_list)

    # logical_decision_file = ""
    # # b_parameter, trace_file, which_way, file_name = get_b_parameter(request)
    # if b_parameter == "ThreadFourFunction":
    #     logical_decision_file = get_logical_decision_file_path(b_parameter)
    #     thread_list = get_thread_ids(logical_decision_file)
    # else:
    #     thread_list = get_threads(trace_file)
    # thr_func_dict = {}
    # for t in thread_list:
    #     if b_parameter == "ThreadFourFunction":
    #         thr_func = get_thread_function(t, logical_decision_file)
    #     else:
    #         thr_func = get_first_function(t, trace_file)
    #     thr_func_dict.update(thr_func)
    return render(request, 'logical_component.html', {
                                                      'thread_id_list': thread_id_list,
                                                      'title_name': which_way,
                                                      'file_path': trace_file,
                                                      'raw_file_name': file_name,
                                                      'href_id': b_parameter,
                                                      'lc_for_threads': lc_for_threads})


def logical_data_l1(request):
    b_parameter, trace_file, which_way, file_name = get_b_parameter(request)
    shared_variables_names = get_all_shared_var_names(b_parameter)
    struct_vars_groups = get_var_struct(shared_variables_names)
    struct_names = list(struct_vars_groups.keys())
    struct_names.remove("variables")
    variables = {"variables": struct_vars_groups.pop("variables")}
    return render(request, 'logical_data_L1.html', {'struct_vars': struct_vars_groups,
                                                    'struct_names': struct_names,
                                                    'variable_list': variables,
                                                    'title_name': which_way,
                                                    'file_path': trace_file,
                                                    'raw_file_name': file_name,
                                                    'href_id': b_parameter})


def logical_data_l2_ungrouped(request):
    thr_func_dict = {}
    shared_var_and_pointer = []
    b_parameter = request.GET.get('b') if (request.GET.get('b')) else None
    trace_file = get_trace_file_path(b_parameter)
    shared_vars_names = get_all_shared_var_names(b_parameter)
    [shared_var_and_pointer.append(p.replace("{", "").replace("}", "")) if "{" in p and "}" in p else
     shared_var_and_pointer.append(p) for p in shared_vars_names]
    threads = get_threads(trace_file)
    for t in threads:
        thr_func = get_first_function(t, trace_file)
        thr_func_dict.update(thr_func)
    thread_var_op = get_thread_var_op(thr_func_dict, ["LOAD"], trace_file, shared_var_and_pointer)
    return render(request, 'logical_data_L2_Ungrouped.html', {'thread_var_op': thread_var_op,
                                                              'benchmark_name': b_parameter})


def logical_data_l3(request):
    thr_func_dict = {}
    b_parameter, trace_file, which_way, file_name = get_b_parameter(request)
    ld_input_lc = []
    ld_output_lc = []
    ld_process_lc = []

    shared_vars_names = get_all_shared_var_names(b_parameter)
    struct_vars_groups = get_var_struct(shared_vars_names)
    # remove brackets for pointers in order to catch their records
    shared_var_and_pointer = []
    [shared_var_and_pointer.append(p.replace("{", "").replace("}", "")) if "{" in p and "}" in p else
     shared_var_and_pointer.append(p) for p in shared_vars_names]

    if b_parameter == "ThreadFourFunction":
        logical_decision_file = get_logical_decision_file_path(b_parameter)
        thread_list = get_thread_ids(logical_decision_file)
        for t in thread_list:
            thr_func = get_thread_function(t, logical_decision_file)
            thr_func_dict.update(thr_func)
    else:
        thread_list = get_threads(trace_file)
        for t in thread_list:
            thr_func = get_first_function(t, trace_file)
            thr_func_dict.update(thr_func)
    print("\n++++++++++++++++++++++++++++\n")
    # Get the variables that are threads Input
    thread_var_input = get_thread_var_op(thr_func_dict, ["LOAD"], trace_file, shared_var_and_pointer)

    # Get the variables that are threads Output
    thread_var_output = get_thread_var_op(thr_func_dict, ["STORE"], trace_file, shared_var_and_pointer)

    # Get the variables that are threads Processed
    thread_var_process = get_thread_var_op(thr_func_dict, ["LOAD", "STORE"], trace_file, shared_var_and_pointer)

    if len(shared_vars_names) > 5:
        ld_input_lc = create_ld_thread_op(thread_var_input, "Input_")

        ld_output_lc = create_ld_thread_op(thread_var_output, "Output_")
        # ld_output_g = group_over10_child(ld_output_lc)
        ld_process_lc = create_ld_thread_op(thread_var_process, "Process_")
        # ld_process_g = group_over10_child(ld_process_lc)
    return render(request, 'logical_data_L3.html', {'title_name': which_way, 'file_path': trace_file,
                                                    'raw_file_name': file_name, 'href_id': b_parameter,
                                                    'ld_input_lc': ld_input_lc, 'ld_output_lc': ld_output_lc,
                                                    'ld_process_lc': ld_process_lc, 'logical_comps': thr_func_dict,
                                                    'shared_vars_names': struct_vars_groups,
                                                    'thread_var_input': thread_var_input,
                                                    'thread_var_output': thread_var_output,
                                                    'thread_var_process': thread_var_process})


def ld_exe_path_l2(request):
    b_parameter, trace_file, which_way, file_name = get_b_parameter(request)

    shared_vars_names = get_all_shared_var_names(b_parameter)
    threads = get_threads(trace_file)
    thr_func_dict = {}
    thr_function_body_exe_paths = {}

    for t in threads:
        thr_func = get_first_function(t, trace_file)
        if not len(list(thr_func.values())) > 1:
            first_funciton_name = list(thr_func.values())[0]
            first_funciton_body = get_first_function_body(first_funciton_name, trace_file)
            thr_func_dict.update({t: {first_funciton_name: first_funciton_body}})
            function_shared_vars = list(filter(lambda r: r[4] in shared_vars_names and r[3] in ["LOAD", "STORE"],
                                               first_funciton_body))
            if len(function_shared_vars) > 1:
                thr_function_body_exe_paths.update({
                    t: {
                        "function_name": first_funciton_name,
                        "function_body": function_shared_vars,
                        "function_body_length": len(function_shared_vars)
                    }
                })

    # print("\n ", thr_function_body_exe_paths)
    exe_paths_set = thr_function_body_exe_paths
    while len(exe_paths_set) > 0:
        smallest_set = min(exe_paths_set, key=lambda k: exe_paths_set[k]['function_body_length'])
        # print(smallest_set)
        smallest_exe_path_set = exe_paths_set.pop(smallest_set)
        exe_path = retrieve_exe_path(smallest_exe_path_set)
        # print(exe_path)

    # I start to catch the first ExePath from the Main thread
    # For that purpose I have to get the function body of the first/parent function of the main thread
    # get the first/parent function of the main thread
    # main_pfuntion_name = [v if "Main_" in k else parent_function_list.append(v) for k, v in thr_func_dict.items()]
    # main_pfuntion_name = list(filter(partial(is_not, None), main_pfuntion_name_with_none))
    # main_pfuntion_name = main_pfuntion_name[0] if len(main_pfuntion_name) is 1 else None
    # print("parent_function_list=>  ", parent_function_list)

    return render(request, 'exe_path_L2.html', {'title_name': which_way})


def time_line_view(request):
    thread_activity = {}
    b_parameter, trace_file, which_way, file_name = get_b_parameter(request)

    threads = get_threads(trace_file)
    all_time_stamp = get_time_stamp_list(trace_file)
    if "." in all_time_stamp[-1]:
        del all_time_stamp[-1]
    for t in threads:
        time_activity = {}
        t_id = t if "Main_" not in t else t.split("_")[1]
        # print(t_id)
        with open(trace_file, 'r') as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',')

            thread_filter = filter(lambda row: row[2] in ["STORE", "LOAD"] and row[1] == t_id and
                                   row[3] is not "" and "CONSTANT;" in row[5], csv_reader)
            thread_list = list(thread_filter)
            # print(thread_list)
            # csv_file.seek(0, 0)
        csv_file.close()
        # write_to_csv_file(thread_list, "timeline_" + t_id)
        time_stamp_dict = {k[0] for k in thread_list}
        time_stamp_list = list(time_stamp_dict)
        time_stamp_list.sort()

        for ts in time_stamp_list:
            activity_list = []
            thread_filter = map(lambda r: {r[3].split(".")[0] if "." in r[3] else r[3]: r[2],
                                "node_type": "logicalData" if "." in r[3] else "variable"} if r[0] == ts and
                                r[1] == t_id else None, thread_list)
            time_stamp_act = list(filter(partial(is_not, None), thread_filter))
            for indx, item in enumerate(time_stamp_act):
                if indx is 0 or item != time_stamp_act[indx-1]:
                    activity_list.append(item)
            if len(activity_list) > 1:
                t_ld_name = t_id + "-" + ts
                time_activity.update({ts: {t_ld_name: activity_list}})
            else:
                time_activity.update({ts: {"noGroup": activity_list}})

        od = collections.OrderedDict(sorted(time_activity.items()))
        thread_activity.update({t: od})

    return render(request, 'time_line_view.html', {'title_name': which_way,
                                                   "threads": threads,
                                                   "thread_activity": thread_activity,
                                                   "time_stamp_list": all_time_stamp})


def op_funcs_l2(request):
    b_parameter, trace_file, which_way, file_name = get_b_parameter(request)

    threads = get_threads(trace_file)
    shared_vars_names = get_all_shared_var_names(b_parameter)
    # print("shared_vars_names=   ", shared_vars_names)
    all_func_body_in_thread = get_functions_with_body(trace_file, threads)
    print("================= \n")
    # print(all_func_body_in_thread)
    thread_function_shared_var = {}
    for t, fun_list in all_func_body_in_thread.items():
        for fun, body in fun_list.items():
            funcitons_shared_vars = map(lambda line: line[4] if line[4] in shared_vars_names else None, body)
            funcitons_shared_vars_nonone = list(filter(partial(is_not, None), funcitons_shared_vars))
            if len(funcitons_shared_vars_nonone) > 0:
                thread_function_shared_var.update({t: {fun: funcitons_shared_vars_nonone}})
    # print(thread_function_shared_var)
    return render(request, 'ld_l2_operation_functions.html', {'title_name': which_way,
                                                              'thread_function_shared_var': thread_function_shared_var})


def functions_ld_l2(request):
    b_parameter, trace_file, which_way, file_name = get_b_parameter(request)
    logical_decision_file = get_logical_decision_file_path(b_parameter)
    trace_exe_file = get_trace_file_path(b_parameter)

    # all funcitons that are exist
    all_functions = get_all_functions(logical_decision_file)

    # first functions that threads execute
    lc_functions = get_lc_functions(logical_decision_file)
    lc_for_threads = get_logical_components(logical_decision_file)
    # print(lc_for_threads)

    # list of nested functions
    [all_functions.remove(lc_f) if lc_f in all_functions else None for lc_f in lc_functions]
    nested_functions = all_functions

    variables_execution_block = get_vars_exe_block(logical_decision_file)

    logical_data_function = {}
    all_var_accessed = []
    all_lc_accessed_nested_function = []
    for f in nested_functions:
        function_access_var = []
        lc_of_nested_function = []
        [function_access_var.append(v['varName'].split(".")[0]+".") if "." in v['varName']
                                    else function_access_var.append(v['varName'])
         if f in v['funcitonList'] else None for k, v in variables_execution_block.items()]
        all_var_accessed.extend(function_access_var)
        function_access_var = remove_dups(function_access_var)

        # Get threads that accessed this nested function
        thread_access_function = get_thread_access_function(trace_exe_file, f)
        # retrieve logical components that access this nested function
        [lc_of_nested_function.append(lc) if thr in thrIds else None
         for lc, thrIds in lc_for_threads.items() for thr in thread_access_function]
        lc_of_nested_function = remove_dups(lc_of_nested_function)
        all_lc_accessed_nested_function.extend(lc_of_nested_function)

        logical_data_function.update({f: {
            "VarList": function_access_var,
            "LogicalComponets": lc_of_nested_function
        }})
    all_var_accessed = remove_dups(all_var_accessed)
    all_lc_accessed_nested_function = remove_dups(all_lc_accessed_nested_function)
    # print(all_var_accessed)
    # print(logical_data_funciton)
    return render(request, 'logical_data_l2_functions.html', {'title_name': which_way,
                                                              'logical_data_function': logical_data_function,
                                                              'all_var_accessed': all_var_accessed,
                                                              'all_lc_accessed_nested_function':
                                                                  all_lc_accessed_nested_function
                                                              })


def logical_decision_ld_l2(request):
    b_parameter, trace_file, which_way, file_name = get_b_parameter(request)
    logical_decision_file = get_logical_decision_file_path(b_parameter)
    logical_components = get_logical_components(logical_decision_file)
    # all logical_decision that are exist
    all_logical_decisions = get_all_logical_decisions(logical_decision_file)
    all_shared_resources = get_all_shared_var_names(b_parameter)
    shared_variables_list = []
    [shared_variables_list.append(s.split(".")[0]+".") if "." in s else shared_variables_list.append(s)
     for s in all_shared_resources]
    shared_variables_list = remove_dups(shared_variables_list)
    # all variables that accessed within logical decision
    var_list_log_des = []
    [var_list_log_des.append(x.split('.')[0] + ".") if '.' in x else var_list_log_des.append(x) if k == 'variable_list'
     else None for des_k, des_v in all_logical_decisions.items() for k, v in des_v.items() for x in v]
    var_list_log_des = remove_dups(var_list_log_des)
    # print(var_list_log_des)
    # Logical component that access logical decision
    lc_list_log_des = []
    [lc_list_log_des.append(x) if k == 'Logical_component_list' else None for des_k, des_v in all_logical_decisions.items()
     for k, v in des_v.items() for x in v]
    lc_list_log_des = remove_dups(lc_list_log_des)
    # print(lc_list_log_des)
    return render(request, 'logical_data_l2_decision.html', {'title_name': which_way,
                                                             'logical_data_decision': all_logical_decisions,
                                                             'logical_components': logical_components,
                                                             'lc_list_log_des': lc_list_log_des,
                                                             'var_list_log_des': var_list_log_des,
                                                             'shared_variables_list': shared_variables_list
                                                             })




