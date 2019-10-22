import csv
from operator import is_not
from functools import partial
from logical_vis.logical_data_inputs import *
import itertools
from itertools import cycle


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


def get_logical_components(logical_decision_file):
    csv_reader = get_file_records(logical_decision_file)
    thread_rows = []
    logical_components = {}
    logical_components_dic = {}

    # Filter only rows that have Thread infos
    [thread_rows.append(r) if r[0] == "Thread" else None for r in csv_reader]
    [logical_components.update({t[1]: ''}) for t in thread_rows]
    for lc in logical_components:
        thread_ids = []
        [thread_ids.append(t[2]) if t[1] == lc else None for t in thread_rows]
        thread_ids = remove_dups(thread_ids)
        logical_components_dic.update({lc: thread_ids})
    return logical_components_dic


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
    # print("\n __________________", op, "___________")
    thread_var_op = {}
    # print("shared_var_and_pointer   ", shared_var_and_pointer)
    # What I need is?: To show the inputs-LD of each threads
    # For that, I built an dict: {'first function of each thread as the key': [list of variables or structs]}
    csv_reader = get_file_records(trace_file)
    for tK, fV in thr_func_dict.items():
        thread_var_dict = {}
        # get the pure thread id
        t_id = tK.strip("Main_") if "Main_" in tK else tK

        # print("------------", t_id, "--------------")
        for v in shared_var_and_pointer:
            # print(v)
            thread_op_variable = []
            [thread_op_variable.append(r[2]) if r[1] == t_id and r[2] in ['LOAD', 'STORE'] and r[3] == v else None for r in csv_reader]
            thread_op_variable = remove_dups(thread_op_variable)
            # print(thread_op_variable)

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
        "ROSACE": "benchmark_traces/ROSACE/ROSACE_trace.txt",
        "OCEAN": "benchmark_traces/OCEAN/Splash2ocean_contiguous_partitions.txt",
        "powerwindow": "benchmark_traces/TACLe_PowerWindow/powerwindow_trace.txt",
        "Autonomous": "benchmark_traces/SA_Autonomous/trace_2019.10.22.17.14.31.txt",
        "ThreadFourFunction": "benchmark_traces/ThreadFourFunction/ThreadFourFunctionsLLVMWitFunctionsReturn.txt",
        "UPLOADED": "Uploaded_files/" + file_name + ".txt",
    }
    return switcher.get(benchmark_name, "Invalid Value")


def get_logical_decision_file_path(benchmark_name, *args, **kwargs):
    # file_name = kwargs.get('file_name') if kwargs.get('file_name') is not None else ""
    switcher = {
        "ThreadFourFunction": "benchmark_traces/ThreadFourFunction/LogicalDec_sharedVars.txt",
        "ROSACE": "benchmark_traces/ROSACE/ROSACE_LogicalDec_sharedVars.txt",
        "Autonomous": "benchmark_traces/SA_Autonomous/coverage_test.txt",
        "powerwindow": "benchmark_traces/TACLe_PowerWindow/powerwindow_LogicalDec_sharedVars.txt"
    }
    return switcher.get(benchmark_name, "Invalid Value")


def get_variable_file_path(benchmark_name):
    switcher = {
        "ROSACE": "benchmark_traces/ROSACE/ROSACE_SharedVariables.txt",
        "powerwindow": "benchmark_traces/TACLe_PowerWindow/powerwindow_SharedVariables.txt",
        "Autonomous": "benchmark_traces/SA_Autonomous/shared_test.txt",
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
    csv_reader = get_file_records(trace_file_path)
    # main_thread_filter = filter(lambda row: row[2].lstrip() == "FUNCTIONCALL" and row[3].lstrip() == "main", csv_reader)
    # main_thread_list = list(main_thread_filter)
    main_thread_list = csv_reader[0]
    # print(main_thread_list)
    # print("\n main_thread_list", main_thread_list)
    main_thread_id = main_thread_list[0][1]
    # print("main_thread_id =>  ", main_thread_id)

    thread_ids = map(lambda var: var[1], csv_reader)
    thr_dict = dict.fromkeys(list(thread_ids))
    thread_list = list(thr_dict)
    threads = ['Main_' + item if item == main_thread_id else item for item in thread_list]
    # threads = {"threads": thread_list, "Main": main_thread_id}
    # print(threads)

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


def get_functions_with_body(trace_file, function_name, all_shared_resources):
    thread_function_var_op = {}
    # print("\n all_shared_resources", all_shared_resources)
    thread_funcitons = {}
    thr_func_list = []
    func_var_list = []
    funciton_body_list = []
    thread_ids = get_threads(trace_file)
    csv_reader_list = get_file_records(trace_file)
    pure_thread_ids = []
    [pure_thread_ids.append(tid.split("_")[1]) if "Main_" in tid else pure_thread_ids.append(tid) for tid in thread_ids]
    # print(pure_thread_ids)
    f_avoid_dups = []
    [record.insert(0, index) for index, record in enumerate(csv_reader_list)]
    for t in pure_thread_ids:
        function_start_end = list(filter(lambda r: r[2] == t and r[4] == function_name and r[3] in ["FUNCTIONCALL", "FUNCTIONRETURN"],
                                         csv_reader_list))
        if len(function_start_end) > 0:
            start = function_start_end[0][0] if function_start_end[0][3] == "FUNCTIONCALL" else None
            end = function_start_end[1][0] if function_start_end[1][3] == "FUNCTIONRETURN" else None
            # print("\n Function:  ", function_name, " Start ==>>  ", start, "   End =>", end)
            if start is not None and end is not None:
                # print("csv_reader_list [Start] ==>> \n ", csv_reader_list[start])
                # print("csv_reader_list [End] ==>> \n ", csv_reader_list[end])
                for item in range(start+1, end):
                    # print(csv_reader_list[item])
                    if csv_reader_list[item][4] in all_shared_resources and csv_reader_list[item][3] in ["STORE", "LOAD"]:
                        func_var_list.append([csv_reader_list[item][4], csv_reader_list[item][3]])
                        thr_func_list.append(csv_reader_list[item][2])
    # print(func_var_list)
    thr_func_list = remove_dups(thr_func_list)
    # print(thr_func_list)
    if len(func_var_list) > 0:
        for shared_var in all_shared_resources:
            var_op_list = []
            shared_var_struct = shared_var.split(".")[0] + "." if "." in shared_var else shared_var
            a = list(filter(lambda r: r[0] == shared_var, func_var_list))
            if len(a) > 0:
                # print("\n a------")
                # print(a)
                var_struct_list = []
                [var_struct_list.append([i[0].split(".")[0] + ".", i[1]]) if "." in i[0] else var_struct_list.append(i) for i in a]
                # print("\n var_struct_list ")
                # print(var_struct_list)
                [var_op_list.append(i[1]) for i in var_struct_list]
                var_op_list = remove_dups(var_op_list)
                thread_function_var_op.update({
                    shared_var_struct: "PROCESS" if len(var_op_list) > 1 else var_op_list[0]
                })
    # print(thread_function_var_op)

    return thread_function_var_op


def get_first_function_body(function_name, trace_file):
    # Not needed, check first then remove this function
    csv_reader_list = get_file_records(trace_file)
    [record.insert(0, index) for index, record in enumerate(csv_reader_list)]

    function_begin = list(filter(lambda r: r[3] == "FUNCTIONCALL" and r[4] == function_name, csv_reader_list))
    function_end = list(filter(lambda r: r[3] == "FUNCTIONRETURN" and r[4] == function_name, csv_reader_list))
    function_body = csv_reader_list[function_begin[0][0]:function_end[0][0]+1]

    return function_body


# Future work
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


def get_all_logical_decisions(logical_decision_file):
    csv_reader_list = get_file_records(logical_decision_file)
    [r.insert(0, indx) for indx, r in enumerate(csv_reader_list)]
    logical_decision_dic = {}
    log_dec_list = []
    logical_components = get_logical_components(logical_decision_file)
    print('------logComp_list------------\n')

    for indx, r in enumerate(csv_reader_list):
        log_dec_names = {}
        if r[1] == "Accesses" and r[2] == "within":
            row_number = r[0]
            logical_decision_rows = logical_decision_block(csv_reader_list[row_number:])
            if logical_decision_rows != 1:
                for ld_indx, ld in enumerate(logical_decision_rows):
                    if ld[1] == "logicalDecision":
                        ld[1] = "LogicalDecision\n"
                        #ld[1] = "LogicalDecision"
                        var_list, thread_list, file_name = get_logical_decision_vars(logical_decision_rows[ld_indx+1:])
                        log_dec_names.update({''.join(ld[1:]): {"START": ld[2],
                                                                    "END": ld[3],
                                                                    "var_list": var_list,
                                                                    "thread_list": thread_list,
                                                                    "file_name": file_name
                                                                  }
                                              })

                #print(log_dec_names)
                log_dec_list.append(log_dec_names)
    # print("log_dec_list =>  ", log_dec_list)
    Gnames = []
    [Gnames.append(list(ld_item.keys())[0] if len(list(ld_item.keys())) == 1 else list(ld_item.keys())[0])
     for ld_item in log_dec_list]
    # print(Gnames)
    Gnames = remove_dups(Gnames)
    logical_decision_groups = {}
    for ld_gname in Gnames:
        ld_variable_list = []
        ld_thread_list = []
        ld_file_name_list = []
        # print("\n ld_gname : ", ld_gname)
        for ld in log_dec_list:
            if list(ld.keys())[0] == ld_gname:
                ld_variable_list.append(list(ld.values())[0]['var_list'][0]
                                        if len(list(ld.values())[0]['var_list']) == 1
                                        else list(ld.values())[0]['var_list'])
                ld_thread_list.append(list(ld.values())[0]['thread_list'][0]
                                      if len(list(ld.values())[0]['thread_list']) == 1
                                      else list(ld.values())[0]['thread_list'])
                ld_file_name_list.append(list(ld.values())[0]['file_name'][0]
                                         if len(list(ld.values())[0]['file_name']) == 1
                                         else list(ld.values())[0]['file_name'])
        ld_variable_list = remove_dups(ld_variable_list)

        ld_thread_list = remove_dups(ld_thread_list)
        ld_file_name_list = remove_dups(ld_file_name_list)
        ld_name = ld_gname + '_' + ld_file_name_list[0]
        lc_list = []
        for thr_id in ld_thread_list:
            [lc_list.append(k) if thr_id in v else None for k, v in logical_components.items()]

        lc_list = remove_dups(lc_list)
        if len(ld_variable_list) > 1:
            logical_decision_dic.update({ld_name: {
                "variable_list": ld_variable_list,
                "thread_list": ld_thread_list,
                "Logical_component_list": lc_list,
            }})
        elif len(ld_variable_list) == 1:
            logical_decision_dic.update({"technical_data": {
                "variable_list": ld_variable_list,
                "thread_list": ld_thread_list,
                "Logical_component_list": lc_list,
            }})
    print(logical_decision_dic)
    return logical_decision_dic


def logical_decision_block(a_list):
    block = []
    for r in a_list:
        if r[1] not in ["Thread", "Variable", "Function"]:
            block.append(r)
        else:
            # print(block)
            return block
    return 1


def get_logical_decision_vars(ld_list):
    # print("ld_list   \n ", ld_list)
    var_list = []
    thread_list = []
    file_name = []
    [var_list.append(item[4]) if item[1] not in ["Conditional", "logicalDecision"] else None for item in ld_list]
    [thread_list.append(item[2]) if item[1] not in ["Conditional", "logicalDecision"] else None for item in ld_list]
    [file_name.append(item[8]) if item[1] not in ["Conditional", "logicalDecision"] else None for item in ld_list]
    var_list = remove_dups(var_list)
    thread_list = remove_dups(thread_list)
    file_name = remove_dups(file_name)
    return var_list, thread_list, file_name


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
    # print("\n _______________________")
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
            # if var_exe_block[indx+1][1] == "Accesses":
            #     print(var_exe_block[indx+1])

    if var_id is not None:
        var = {var_id: {
                   "varName": var_name,
                   "threadList": thr,
                   "funcitonList": func
               }}

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

    parent_function = []
    csv_reader_list = get_file_records(report_file)
    t_id = t.strip("Main_") if "Main_" in t else t
    [parent_function.append(r[1]) if r[0] == "Thread" and r[2] == t_id else None for r in csv_reader_list]

    thread_function_list = remove_dups(parent_function)
    return {t: thread_function_list}


def get_thread_access_function(trace_file, nested_function_name):
    # print("\n -----------", nested_function_name, "-----------")
    csv_reader_list = get_file_records(trace_file)
    thread_list = []
    records_list = list(filter(lambda r: r[3] == nested_function_name, csv_reader_list))
    [thread_list.append(r[1]) for r in records_list]
    thread_list = remove_dups(thread_list)
    # print(thread_list)
    return thread_list


