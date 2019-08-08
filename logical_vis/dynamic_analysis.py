import csv
from operator import is_not
from functools import partial
from logical_vis.logical_data_inputs import *
import itertools


def get_b_parameter(request):
    file_name = None
    b_parameter = request.GET.get('b', "ThreadFourFunction")
    if b_parameter == "UPLOADED":
        file_name = request.GET.get('FileName')
        trace_file = get_trace_file_path(b_parameter, file_name=file_name)
        which_way = b_parameter + " File"
    else:
        trace_file = get_trace_file_path(b_parameter)
        which_way = b_parameter + " Benchmark"

    return [b_parameter, trace_file, which_way, file_name]


def remove_dups(a_list):
    # Remove Duplicates
    var_thr_dict = dict.fromkeys(a_list)
    the_list = list(var_thr_dict)
    return the_list


def get_file_records(file_path):
    with open(file_path, 'r') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        csv_reader_list = list(csv_reader)
    csv_file.close()
    return csv_reader_list


def get_first_function(t, trace_file):
    csv_reader = get_file_records(trace_file)
    thread_function_list = []
    t_id = t.split("Main_")[1] if "Main_" in t else t
    if "Main_" in t:
        thread_functioncall_flist = list(filter(lambda r: "FUNCTIONCALL" in r[2] and
                                          r[1] == t_id, csv_reader))
        # print(thread_functioncall_flist)
        thread_functioncall_list = thread_functioncall_flist[0] if len(thread_functioncall_flist) > 0 else None
        thread_function_list.append(thread_functioncall_list[3])
    else:
        thread_functioncall_flist = list(filter(lambda row: row[2].lstrip() == "FUNCTIONCALL" and
                                         row[1] == t_id and "CONSTANT;" in row[5], csv_reader))

        # print("thread_functioncall_flist => \n", thread_functioncall_flist)
        if "ROSACE" in trace_file:
            thread_functioncall_list = thread_functioncall_flist[-1] \
                if len(thread_functioncall_flist) > 0 else None
        else:
            thread_functioncall_list = thread_functioncall_flist[0] \
                if len(thread_functioncall_flist) > 0 else None
        thread_function_list.append(thread_functioncall_list[3])
    thread_function = {t: thread_function_list}
    return thread_function


def get_var_names(var_list, op):
    var_names = map(lambda var: var[3], var_list)
    # Remover Duplicates
    var_name_list = remove_dups(list(var_names))
    return var_name_list


def get_thread_var_op(thr_func_dict, op, trace_file, shared_var_and_pointer):
    print("\n __________________", op, "___________")
    thread_var_op = {}
    # print("shared_var_and_pointer   ", shared_var_and_pointer)
    # What I need is?: To show the inputs-LD of each threads
    # For that, I built an dict: {'first function of each thread as the key': [list of variables or structs]}
    csv_reader = get_file_records(trace_file)
    for tK, fV in thr_func_dict.items():
        thread_var_dict = {}
        # get the pure thread id
        t_id = tK.strip("Main_") if "Main_" in tK else tK
        # get all records for this thead from Trace file and Filter the records based on operation
        thread_records = filter(lambda row: row[1] == t_id and row[2] in op, csv_reader)
        thread_pointers_list = list(filter(lambda row: row[4] in shared_var_and_pointer or
                                    row[3] in shared_var_and_pointer, list(thread_records)))
        # print("\n thread_pointers_list---  ", thread_pointers_list)
        # Some of the Pointers don't have any names, So I assigned their memory address to specify them as well as/
        # fill the gap.
        thread_access_pointer_map = map(lambda row: ["{" + row[4] + "}" if row[3] is "" else row[3], row[0], row[1],
                                        row[2], row[5]], thread_pointers_list)
        thread_access_pointer_list = list(thread_access_pointer_map)
        # print("thread_access_pointer_list====>   ", thread_access_pointer_list)
        if len(shared_var_and_pointer) > 1:
            # if it is struct, only show it as logicalData
            # need to specify the type of elements
            thread_vars_list = [[v[0].split(".")[0], v[1], v[2], v[3], "logicalData"] if "." in v[0]
                                else [v[0], v[1], v[2], v[3], "variable"] for v in thread_access_pointer_list]

            # remove duplicate rows
            thread_var_dict.update({i[0]: i[4] for i in thread_vars_list})
        # TO DO... fV[0]
        thread_var_op.update({fV[0]: thread_var_dict})
    return thread_var_op


def create_ld_thread_op(thread_var_op, op):
    # print("\n thread_var_op==>>", thread_var_op)
    ld_l2_group = {}
    a = []

    for lc, ld_vars in thread_var_op.items():
        lc_list = []
        lc_members = {k for k in ld_vars}
        del a[:]
        if len(ld_vars) > 0:
            if not ld_l2_group:
                group_name = op + lc
                lc_list.append(lc)
                ld_l2_group.update({group_name: {"logical_components": lc_list, "group_members": ld_vars}})

            else:
                a = list({k if lc_members == {k for k in v['group_members']} else None for k, v in ld_l2_group.items()})
                a_avoid_none = list(filter(partial(is_not, None), a))
                if len(a_avoid_none) != 0:
                    group_name = str(a_avoid_none[0]) + "-" + lc
                    ld_l2_group[group_name] = ld_l2_group.pop(a_avoid_none[0])
                    ld_l2_group[group_name]['logical_components'].append(lc)
                else:
                    # print("op= ", op, "    lc= ", lc)
                    group_name = op + lc
                    lc_list.append(lc)
                    ld_l2_group.update({group_name: {"logical_components": lc_list, "group_members": ld_vars}})

    return ld_l2_group


def get_trace_file_path(benchmark_name, *args, **kwargs):
    file_name = kwargs.get('file_name') if kwargs.get('file_name') is not None else ""
    switcher = {
        "ROSACE": "benchmark_traces/ROSACE/TraceDataRosace.txt",
        "OCEAN": "benchmark_traces/OCEAN/Splash2ocean_contiguous_partitions.txt",
        "ThreadFourFunction": "benchmark_traces/ThreadFourFunction/ThreadFourFunctionsLLVMWitFunctionsReturn.txt",
        "UPLOADED": "Uploaded_files/" + file_name + ".txt",
    }
    return switcher.get(benchmark_name, "Invalid Value")


def get_logical_decision_file_path(benchmark_name, *args, **kwargs):
    # file_name = kwargs.get('file_name') if kwargs.get('file_name') is not None else ""
    switcher = {
        "ThreadFourFunction": "benchmark_traces/ThreadFourFunction/LogicalDec_sharedVars.txt",
    }
    return switcher.get(benchmark_name, "Invalid Value")


def get_variable_file_path(benchmark_name):
    switcher = {
        "ROSACE": "benchmark_traces/ROSACE/SharedVariablesRosace.txt",
        "ThreadFourFunction":
            "benchmark_traces/ThreadFourFunction/ThreadFourFunctionsSharedVariables.txt",
    }
    return switcher.get(benchmark_name, "Invalid Value")


def get_all_shared_var_names(benchmark_name):
    var_names_list = []
    var_file_path = get_variable_file_path(benchmark_name)
    # print("var_file_path \n", var_file_path)
    csv_reader = get_file_records(var_file_path)
    # print("Variables \n", csv_reader)
    [var_names_list.append(r[1] if r[0] is "" else r[0]) if len(r) > 0 else None for r in csv_reader]
    # var_names = map(lambda var: var[1] if var[0] is "" else var[0], csv_reader)
    # var_names_list = list(var_names)
    return var_names_list


def get_threads(file_path):
    trace_file_path = str(file_path)
    # print("trace_file_path", trace_file_path)
    with open(trace_file_path, 'r') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        main_thread_filter = filter(lambda row: row[2].lstrip() == "FUNCTIONCALL" and row[3].lstrip() == "main", csv_reader)
        main_thread_list = list(main_thread_filter)
        # print("\n main_thread_list", main_thread_list)
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


def group_over10_child(ld_lc):
    ld_op_g = {}
    for k, v in ld_lc.items():
        ld_input_lc_g = {}
        # print(len(v['group_members']))
        if len(v['group_members']) > 11:
            child_list_var = [k if a == "variable" else None for k, a in v['group_members'].items()]
            child_list_var = list(filter(partial(is_not, None), child_list_var))
            if len(child_list_var) > 10:
                ld_input_lc_g.update({"group_over10_var": {"LogicalData_group_over10_variable": "logicalData_var",
                                                                        "child_list": child_list_var}})
            else:
                ld_input_lc_g.update({k: "variable" for k in child_list_var})

            child_list_ld = [k if a == "logicalData" else None for k, a in v['group_members'].items()]
            child_list_ld = list(filter(partial(is_not, None), child_list_ld))
            if len(child_list_ld) > 10:
                ld_input_lc_g.update({"group_over10_ld": {"LogicalData_group_over10_LogicalData": "logicalData",
                                                                       "child_list": child_list_ld}})
            else:
                ld_input_lc_g.update({k: "logicalData" for k in child_list_ld})
            # print("ld_input_lc_g=>  ", ld_input_lc_g)
        else:
            ld_input_lc_g.update(v['group_members'])
        # {group_name: {"logical_components": lc_list, "group_members": ld_vars}
        ld_op_g.update({k: {"logical_components": v['logical_components'], "group_members": ld_input_lc_g}})
    return ld_op_g


def get_time_stamp_list(trace_file):
    csv_reader_list = get_file_records(trace_file)
    time_stamps = map(lambda v: v[0], csv_reader_list)
    time_stamps_list = list(time_stamps)
    time_stamps_no_dups = remove_dups(time_stamps_list)
    time_stamps_no_dups.sort()
    return time_stamps_no_dups


def reformat_the_rows(r):
    row = r[0]
    open_bracket = row.find('{')
    row = row[:open_bracket] + ',' + row[open_bracket:]
    close_bracket = row.find('-')
    row = row[:close_bracket] + row[close_bracket+1:]
    row_list = row.split()
    row_final = ",".join(row_list)
    return row_final


def get_formatted_shared_variables(var_file_path):
    with open(var_file_path, 'r') as csv_file:
        next(csv_file)
        csv_reader = csv.reader(csv_file, delimiter=',')
        formatted_file = map(reformat_the_rows, csv_reader)
        formatted_file = list(formatted_file)
    csv_file.close()
    return formatted_file


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


def get_functions_with_body(trace_file, thread_list):
    thread_funciton_list = {}
    thread_funcitons = {}
    thr_func_list = []
    f_avoid_dups = []
    for t in thread_list:
        funciton_body_list = {}
        t_id = t.split("_")[1] if "Main_" in t else t
        with open(trace_file, 'r') as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',')
            funciton_list = list(map(lambda r: r[3] if r[1] == t_id and r[2] == "FUNCTIONCALL" and "CONSTANT;" in r[5]
                                 else None, csv_reader))
            f_avoid_none = list(filter(partial(is_not, None), funciton_list))
            f_avoid_dups = remove_dups(f_avoid_none)

        csv_file.close()
        thread_funciton_list.update({t_id: f_avoid_dups})
        thr_func = get_first_function(t, trace_file)
        thr_func_list.append(list(thr_func.values())[0])

    with open(trace_file, 'r') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        csv_reader_list = list(csv_reader)
        [record.insert(0, index) for index, record in enumerate(csv_reader_list)]
        # The index of record are +1
        for k, f_list in thread_funciton_list.items():
            [f_list.remove(i) for i in f_list if i in thr_func_list]
            for f in f_list:
                function_start_end = list(filter(lambda r: r[2] == k and r[4] == f and r[3] in ["FUNCTIONCALL", "FUNCTIONRETURN"]
                                                 , csv_reader_list))
                print("function_start_end==>>  ", function_start_end)
                for indx, elem in enumerate(function_start_end):
                    # print("elem--------------------")
                    # print(elem)
                    next_item_index = indx + 1
                    # print("next_item_index", next_item_index)
                    if len(function_start_end) > 1 and next_item_index < len(function_start_end):
                        function_return_index = function_start_end[next_item_index][0] if \
                            function_start_end[next_item_index][3] == "FUNCTIONRETURN" else \
                            None

                        function_call_index = elem[0] if elem[3] == "FUNCTIONCALL" else None
                        print("function_call_index==>>  ", function_call_index)
                        print("function_return_index==>>  ", function_return_index)
                        distance = function_return_index - function_call_index if function_return_index is not None \
                                                                                  and function_call_index is not \
                                                                                  None else None

                        if distance is not None and not distance <= 1:
                            f_body = csv_reader_list[function_call_index+1:function_return_index]
                            print("\n f_body   \n", f_body)
                            funciton_body_list.update({f: csv_reader_list[function_call_index+1:
                                                                          function_return_index]})
                        if len(funciton_body_list) > 0:
                            thread_funcitons.update({k: funciton_body_list})

            csv_file.seek(0, 0)
        csv_file.close()
    # print("\n thread_funcitons          => ", thread_funcitons)
    return thread_funcitons


def get_first_function_body(function_name, trace_file):
    csv_reader_list = get_file_records(trace_file)
    [record.insert(0, index) for index, record in enumerate(csv_reader_list)]

    function_begin = list(filter(lambda r: r[3] == "FUNCTIONCALL" and r[4] == function_name, csv_reader_list))
    function_end = list(filter(lambda r: r[3] == "FUNCTIONRETURN" and r[4] == function_name, csv_reader_list))
    function_body = csv_reader_list[function_begin[0][0]:function_end[0][0]+1]

    return function_body


def retrieve_exe_path(exe_path_set):
    # print(exe_path_set)
    exe_path = list(map(lambda r: [r[3], r[4]], exe_path_set['function_body']))
    print("\n Operation on vars => ", exe_path)
    var_exe_path = []
    var_op = []
    for indx, item in enumerate(exe_path):
        if len(var_exe_path) < 0 or item not in var_exe_path:
            var_exe_path.append(item)
    print("exe_path =>  ", var_exe_path)

    return exe_path


def get_all_functions(logical_decision_file):
    csv_reader_list = get_file_records(logical_decision_file)
    function_records = list(filter(lambda r: r[0] == "Function", csv_reader_list))

    all_function_list = {f[1] for f in function_records}
    # print(all_function_list)
    return all_function_list


def get_lc_functions(logical_decision_file):
    csv_reader_list = get_file_records(logical_decision_file)
    function_records = list(filter(lambda r: r[0] == "Thread", csv_reader_list))

    lc_function_list = {f[1] for f in function_records}
    # print(lc_function_list)
    return lc_function_list


def get_vars_exe_block(logical_decision_file):
    csv_reader_list = get_file_records(logical_decision_file)
    [r.insert(0, indx) for indx, r in enumerate(csv_reader_list)]
    variable_records = list(filter(lambda r: r[1] == "Variable", csv_reader_list))
    # print(variable_records)

    variable_access_infos = {}
    block_begin = None
    block_end = None
    for indx, var_record in enumerate(variable_records):
        if indx+1 < len(variable_records):
            block_begin = var_record[0]
            block_end = variable_records[indx+1][0]
        var_exe_block = csv_reader_list[block_begin:block_end]
        var_infos = var_access_info(var_exe_block)
        variable_access_infos.update(var_infos)
        # vars_info.update({var_record[3]: var_record[2], "exe_block": var_exe_block})
    # print(variable_access_infos)
    return variable_access_infos


def var_access_info(var_exe_block):
    print("\n _______________________")
    # print(var_exe_block)
    thr = []
    func = []
    var = {}
    var_id = None
    var_name = None
    for indx, r in enumerate(var_exe_block):
        # print("\n", r)
        if r[1] == "Variable":
            var_id = r[3]
            var_name = r[2]
        elif r[1] == "Thread":
            thr.append(r[3])
        elif r[1] == "Function":
            if r[2] not in func:
                func.append(r[2])
            if var_exe_block[indx+1][1] == "Accesses":
                print(var_exe_block[indx+1])

    if var_id is not None:
        var = {var_id: {
                   "varName": var_name,
                   "threadList": thr,
                   "funcitonList": func
               }}
    # var.update({"threadList": thr})
    # var.update({"funcitonList": func})
    # print(var)
    return var


def get_thread_ids(report_file):
    thread_ids = []
    csv_reader_list = get_file_records(report_file)
    thread_records = list(filter(lambda r: r[0] == "Thread", csv_reader_list))
    [thread_ids.append("Main_" + r[2] if "main" in r[1] else r[2]) for r in thread_records]
    thread_id_list = remove_dups(thread_ids)
    # print("thread_ids \n", thread_id_list)
    return thread_id_list


def get_thread_function(t, report_file):
    # print("Thread ID   ", t)
    parent_function = []
    csv_reader_list = get_file_records(report_file)
    t_id = t.strip("Main_") if "Main_" in t else t
    [parent_function.append(r[1]) if r[0] == "Thread" and r[2] == t_id else None for r in csv_reader_list]
    # parent_function = list(filter(lambda r: r[0] == "Thread" and r[2] == t_id, csv_reader_list))

    thread_parent_function = []
    # [thread_parent_function.append(r[1]) if r[2] == t_id else None for r in parent_function]
    # thread_function_list = remove_dups(thread_parent_function)
    thread_function_list = remove_dups(parent_function)
    # print(t_id, "    => ", thread_function_list)
    return {t: thread_function_list}


