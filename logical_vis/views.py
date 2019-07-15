from django.shortcuts import render
from logical_vis.logical_data_inputs import *
from logical_vis.dynamic_analysis import *
from operator import is_not
from functools import partial
import csv
import os
import collections
from django.conf import settings
from django.utils import timezone
from django.core.files.storage import FileSystemStorage

settings.CURRENT_TIME = str(timezone.now()).replace(" ", "-")


def index(request):
    context = {}
    current_time = str(settings.CURRENT_TIME).replace("+00:00", "").replace(":", "-").replace(".", "-")
    print("CURRENT_TIME: ", settings.CURRENT_TIME)
    existing_files = [f for f in os.listdir(settings.MEDIA_ROOT)]
    context['existing_files'] = existing_files
    context['error'] = ""
    # print(dict(request.FILES))
    if request.method == 'POST':
        if 'trace_file' in request.FILES:
            uploaded_file = request.FILES['trace_file']
            fname = uploaded_file.name
            file_data = fname.split(".")
            print(file_data[-1])
            if file_data[-1] not in ["txt"]:
                context['error'] = "Valid format of the file is txt."
            else:
                project_name = request.POST.get("program_name")
                project_name = str(project_name).replace(" ", "_")
                fs = FileSystemStorage()
                raw_file_name = project_name + "_" + current_time
                file_name = raw_file_name + "." + file_data[-1]
                name = fs.save(file_name, uploaded_file)
                context['url'] = fs.url(name)
                context['program_name'] = project_name if project_name else "Unnamed Program"
                context['href_id'] = "UPLOADED"
                context['file_path'] = fs.url(name)
                context['raw_file_name'] = raw_file_name

        elif request.POST.get('select_tag_file'):
            uploaded_file = request.POST.get('select_tag_file')
            file_data = uploaded_file.split(".")
            context['url'] = os.path.join(settings.MEDIA_ROOT, uploaded_file)
            context['program_name'] = "Unnamed Program"
            context['href_id'] = "UPLOADED"
            context['file_path'] = os.path.join(settings.MEDIA_ROOT, uploaded_file)
            context['raw_file_name'] = file_data[0]

        else:
            context['error'] = "Please enter a trace file."

    return render(request, 'trace_vis.html', context)


def home(request):

    return render(request, 'home.html')


def trace_file_upload(request):
    return render(request, 'upload_file.html')


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
    file_name = None
    b_parameter = request.GET.get('b') if (request.GET.get('b')) else None
    if b_parameter == "UPLOADED":
        file_name = request.GET.get('FileName')
        trace_file = get_file_path(b_parameter, file_name=file_name)
        which_way = b_parameter + " File"
    else:
        trace_file = get_file_path(b_parameter)
        which_way = b_parameter + " Benchmark"
    shared_variables_names = get_shared_var_names()
    thread_ids = get_threads(trace_file)
    t_v_op = thread_per_vars(shared_variables_names, thread_ids)
    return render(request, 'catastrophe.html', {"t_v_op": t_v_op,
                                                "t_v_op_list": list(t_v_op),
                                                "shared_variables": shared_variables_names,
                                                "thread_ids": thread_ids})


def logical_data_l0(request):
    file_name = None
    b_parameter = request.GET.get('b') if (request.GET.get('b')) else None
    if b_parameter == "UPLOADED":
        file_name = request.GET.get('FileName')
        trace_file = get_file_path(b_parameter, file_name=file_name)
        which_way = b_parameter + " File"
    else:
        trace_file = get_file_path(b_parameter)
        which_way = b_parameter + " Benchmark"

    # shared_variables = get_shared_var_names()
    shared_variables_names = get_all_shared_var_names(trace_file)
    data_types_vars = get_data_types(trace_file)
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
        trace_file = get_file_path(b_parameter, file_name=file_name)
        which_way = b_parameter + " File"
    else:
        trace_file = get_file_path(b_parameter)
        which_way = b_parameter + " Benchmark"

    thread_list = get_threads(trace_file)
    thr_func_dict = {}
    for indx, t in enumerate(thread_list):
        thr_func = get_first_function(t, indx, trace_file)
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
        trace_file = get_file_path(b_parameter, file_name=file_name)
        which_way = b_parameter + " File"
    else:
        trace_file = get_file_path(b_parameter)
        which_way = b_parameter + " Benchmark"

    # print("trace_file=>  ", trace_file)
    shared_variables_names = get_all_shared_var_names(trace_file)
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
    trace_file = get_file_path(benchmark_name)
    threads = get_threads(trace_file)
    thread_var_op = get_thread_var_op(threads, ["LOAD"], trace_file)
    return render(request, 'logical_data_L2_Ungrouped.html', {'thread_var_op': thread_var_op,
                                                              'benchmark_name': benchmark_name})


def logical_data_l2(request):
    b_parameter = request.GET.get('b') if (request.GET.get('b')) else None
    file_name = None
    if b_parameter == "UPLOADED":
        file_name = request.GET.get('FileName')
        trace_file = get_file_path(b_parameter, file_name=file_name)
        which_way = b_parameter + " File"
    else:
        trace_file = get_file_path(b_parameter)
        which_way = b_parameter + " Benchmark"

    threads = get_threads(trace_file)

    # Get the variables that are threads Input
    thread_var_input = get_thread_var_op(threads, ["LOAD"], trace_file)
    # print("\n thread_var_input =  ", thread_var_input)
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

    return render(request, 'logical_data_L2.html', {'title_name': which_way,
                                                    'file_path': trace_file,
                                                    'raw_file_name': file_name,
                                                    'href_id': b_parameter,
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


def time_line_view(request):
    b_parameter = request.GET.get('b') if (request.GET.get('b')) else None
    time_activity = {}
    thread_activity = {}
    # file_name = None
    if b_parameter == "UPLOADED":
        file_name = request.GET.get('FileName')
        trace_file = get_file_path(b_parameter, file_name=file_name)
        which_way = b_parameter + " File"
    else:
        trace_file = get_file_path(b_parameter)
        which_way = b_parameter + " Benchmark"

    threads = get_threads(trace_file)
    for t in threads:
        t_id = t if "Main_" not in t else t.split("_")[1]
        print(t_id)
        with open(trace_file, 'r') as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',')

            thread_filter = filter(lambda row: row[2] in ["STORE", "LOAD"] and row[1] == t_id and
                                               row[3] is not "" and "CONSTANT;" in row[5], csv_reader)
            thread_list = list(thread_filter)
            # csv_file.seek(0, 0)
        csv_file.close()
        # write_to_csv_file(thread_list, "timeline_" + t_id)
        activity_dict = {k[0] for k in thread_list}
        # print(activity_dict)
        for ts in activity_dict:
            thread_filter = map(lambda r: {r[3]: r[2]} if r[0] == ts else None, thread_list)
            time_stamp_act = list(filter(partial(is_not, None), thread_filter))
            time_stamp_act_list = list(time_stamp_act)
            time_activity.update({ts: time_stamp_act_list})
            # time_activity.sort()
            # time_activity_nodups = remove_dups(time_activity)
        od = collections.OrderedDict(sorted(time_activity.items()))
        thread_activity.update({t: od})
    return render(request, 'time_line_view.html', {'title_name': which_way,
                                                   "threads": threads,
                                                   "thread_activity": thread_activity})


