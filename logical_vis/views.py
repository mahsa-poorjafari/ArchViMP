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
from datetime import datetime

# In this file, each functions will render a page of the web-framework

settings.CURRENT_TIME = str(timezone.now()).replace(" ", "-")


def trace_vis(request):
    context = {}
    current_time = str(settings.CURRENT_TIME).replace("+00:00", "").replace(":", "-").replace(".", "-")
    print("CURRENT_TIME: ", settings.CURRENT_TIME)
    # Get all existing trace files
    dir_trace_files = os.path.join(settings.MEDIA_ROOT, "TraceFiles")
    existing_trace_files = [f for f in os.listdir(dir_trace_files)]
    context['existing_trace_files'] = existing_trace_files

    # get all existing shared variable files
    dir_shvar_files = os.path.join(settings.MEDIA_ROOT, "SharedVariablesFiles")
    existing_shvar_files = [f for f in os.listdir(dir_shvar_files)]
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
    b_parameter = request.GET.get('b') if (request.GET.get('b')) else None
    if b_parameter == "UPLOADED":
        file_name = request.GET.get('FileName')
        trace_file = get_trace_file_path(b_parameter, file_name=file_name)
        which_way = b_parameter + " File"
    else:
        trace_file = get_trace_file_path(b_parameter)
        which_way = b_parameter + " Benchmark"

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
    file_name = None
    b_parameter = request.GET.get('b') if (request.GET.get('b')) else None
    if b_parameter == "UPLOADED":
        file_name = request.GET.get('FileName')
        trace_file = get_trace_file_path(b_parameter, file_name=file_name)
        which_way = b_parameter + " File"
    else:
        trace_file = get_trace_file_path(b_parameter)
        which_way = b_parameter + " Benchmark"

    shared_variables_names = get_all_shared_var_names(b_parameter)

    data_types_vars = get_data_types(b_parameter)
    # print("\n data_types_vars=>  ", data_types_vars)

    return render(request, 'logical_data_L0.html', {'data_types': data_types_vars,
                                                    'shared_variables': shared_variables_names,
                                                    'title_name': which_way,
                                                    'file_path': trace_file,
                                                    'raw_file_name': file_name,
                                                    'href_id': b_parameter})


def logical_comp(request):
    b_parameter = request.GET.get('b') if (request.GET.get('b')) else None
    file_name = None
    if b_parameter == "UPLOADED":
        file_name = request.GET.get('FileName')
        trace_file = get_trace_file_path(b_parameter, file_name=file_name)
        which_way = b_parameter + " File"
    else:
        trace_file = get_trace_file_path(b_parameter)
        which_way = b_parameter + " Benchmark"

    thread_list = get_threads(trace_file)
    thr_func_dict = {}
    for t in thread_list:
        thr_func = get_first_function(t, trace_file)
        thr_func_dict.update(thr_func)
    # print("thr_func_list => ", thr_func_dict)

    return render(request, 'logical_component.html', {'threads': thread_list,
                                                      'thread_function': thr_func_dict,
                                                      'title_name': which_way,
                                                      'file_path': trace_file,
                                                      'raw_file_name': file_name,
                                                      'href_id': b_parameter})


def logical_data_l1(request):
    b_parameter = request.GET.get('b') if (request.GET.get('b')) else None
    file_name = None
    if b_parameter == "UPLOADED":
        file_name = request.GET.get('FileName')
        trace_file = get_trace_file_path(b_parameter, file_name=file_name)
        which_way = b_parameter + " File"
    else:
        trace_file = get_trace_file_path(b_parameter)
        which_way = b_parameter + " Benchmark"

    # print("trace_file=>  ", trace_file)
    shared_variables_names = get_all_shared_var_names(b_parameter)
    struct_vars_groups = get_var_struct(shared_variables_names)
    variables = {"variables": struct_vars_groups.pop("variables")}
    return render(request, 'logical_data_L1.html', {'struct_vars': struct_vars_groups,
                                                    'variable_list': variables,
                                                    'title_name': which_way,
                                                    'file_path': trace_file,
                                                    'raw_file_name': file_name,
                                                    'href_id': b_parameter})


def logical_data_l2_ungrouped(request):
    benchmark_name = request.GET.get('b') if (request.GET.get('b')) else None
    trace_file = get_trace_file_path(benchmark_name)
    threads = get_threads(trace_file)
    thread_var_op = get_thread_var_op(threads, ["LOAD"], trace_file)
    return render(request, 'logical_data_L2_Ungrouped.html', {'thread_var_op': thread_var_op,
                                                              'benchmark_name': benchmark_name})


def logical_data_l3(request):
    b_parameter = request.GET.get('b') if (request.GET.get('b')) else None
    file_name = None
    if b_parameter == "UPLOADED":
        file_name = request.GET.get('FileName')
        trace_file = get_trace_file_path(b_parameter, file_name=file_name)
        which_way = b_parameter + " File"
    else:
        trace_file = get_trace_file_path(b_parameter)
        which_way = b_parameter + " Benchmark"

    threads = get_threads(trace_file)

    # Get the variables that are threads Input
    thread_var_input = get_thread_var_op(threads, ["LOAD"], trace_file, b_parameter)
    # print("\n thread_var_input =  ", thread_var_input)
    ld_input_lc = create_ld_thread_op(thread_var_input, "Input_")
    # print("\n ld_input_lc=> ", ld_input_lc)
    # ld_input_g = group_over10_child(ld_input_lc)

    # Get the variables that are threads Output
    thread_var_output = get_thread_var_op(threads, ["STORE"], trace_file, b_parameter)
    ld_output_lc = create_ld_thread_op(thread_var_output, "Output_")
    # ld_output_g = group_over10_child(ld_output_lc)

    # Get the variables that are threads Processed
    thread_var_process = get_thread_var_op(threads, ["LOAD", "STORE"], trace_file, b_parameter)
    ld_process_lc = create_ld_thread_op(thread_var_process, "Process_")
    # ld_process_g = group_over10_child(ld_process_lc)

    thread_list = get_threads(trace_file)
    thr_func_dict = {}
    for t in thread_list:
        thr_func = get_first_function(t, trace_file)
        thr_func_dict.update(thr_func)

    return render(request, 'logical_data_L3.html', {'title_name': which_way,
                                                    'file_path': trace_file,
                                                    'raw_file_name': file_name,
                                                    'href_id': b_parameter,
                                                    'ld_input_lc': ld_input_lc,
                                                    'ld_output_lc': ld_output_lc,
                                                    'ld_process_lc': ld_process_lc,
                                                    'logical_comps': thr_func_dict})


def ld_exe_path_l2(request):
    benchmark_name = request.GET.get('b') if (request.GET.get('b')) else None
    trace_file = get_trace_file_path(benchmark_name)
    threads = get_threads(trace_file)
    thr_func_dict = {}
    parent_function_list = []
    for t in threads:
        thr_func = get_first_function(t, trace_file)
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


def time_line_view(request):
    thread_activity = {}
    # file_name = None
    b_parameter = request.GET.get('b') if (request.GET.get('b')) else None
    if b_parameter == "UPLOADED":
        file_name = request.GET.get('FileName')
        trace_file = get_trace_file_path(b_parameter, file_name=file_name)
        which_way = b_parameter + " File=>   " + file_name
    else:
        trace_file = get_trace_file_path(b_parameter)
        which_way = b_parameter + " Benchmark"

    threads = get_threads(trace_file)
    all_time_stamp = get_time_stamp_list(trace_file)
    if "." in all_time_stamp[-1]:
        del all_time_stamp[-1]
    print(all_time_stamp)
    for t in threads:
        time_activity = {}
        t_id = t if "Main_" not in t else t.split("_")[1]
        print(t_id)
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
            thread_filter = map(lambda r: {r[3]: r[2]} if r[0] == ts and r[1] == t_id else None, thread_list)
            time_stamp_act = list(filter(partial(is_not, None), thread_filter))
            time_activity.update({ts: time_stamp_act})

        od = collections.OrderedDict(sorted(time_activity.items()))
        thread_activity.update({t: od})

    return render(request, 'time_line_view.html', {'title_name': which_way,
                                                   "threads": threads,
                                                   "thread_activity": thread_activity,
                                                   "time_stamp_list": all_time_stamp})


def op_funcs_l2(request):
    b_parameter = request.GET.get('b') if (request.GET.get('b')) else None
    if b_parameter == "UPLOADED":
        file_name = request.GET.get('FileName')
        trace_file = get_trace_file_path(b_parameter, file_name=file_name)
        which_way = b_parameter + " File=>   " + file_name
    else:
        trace_file = get_trace_file_path(b_parameter)
        which_way = b_parameter + " Benchmark"

    threads = get_threads(trace_file)
    shared_vars_names = get_all_shared_var_names(b_parameter)
    print("shared_vars_names=   ", shared_vars_names)
    all_func_body_in_thread = get_functions_with_body(trace_file, threads)
    print("================= \n")
    print(all_func_body_in_thread)
    for t, fun_list in all_func_body_in_thread.items():
        for fun, body in fun_list.items():
            funcitons_shared_vars = list(filter(lambda line: line[4] in shared_vars_names, body))
    return render(request, 'ld_l2_operation_functions.html', {'title_name': which_way})
