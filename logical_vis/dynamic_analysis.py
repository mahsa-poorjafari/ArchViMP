import csv
from operator import is_not
from functools import partial
from logical_vis.logical_data_inputs import *
import string


def remove_dups(a_list):
    # Remove Duplicates
    var_thr_dict = dict.fromkeys(a_list)
    the_list = list(var_thr_dict)
    return the_list


def get_first_function(t, indx, trace_file):
    with open(trace_file, 'r') as csv_file:
        csv_file.seek(0, 0)
        csv_reader = csv.reader(csv_file, delimiter=',')
        if "Main_" in t:
            # print("t=>  ", t)
            b = t.split('_')
            csv_file.seek(0, 0)
            thread_functioncall_filter = filter(lambda row: row[2].lstrip() == "FUNCTIONCALL" and
                                        row[1].lstrip() == b[1]
                                        and "CONSTANT;" in row[5].lstrip(), csv_reader)

            thread_functioncall_flist = list(thread_functioncall_filter)

            thread_functioncall_list = thread_functioncall_flist[0] \
                if len(thread_functioncall_flist) > 0 else None

            thread_function = {t: thread_functioncall_list[3] if thread_functioncall_list is not None else None}
        else:
            csv_file.seek(0, 0)
            thread_functioncall_filter = filter(lambda row: row[2].lstrip() == "FUNCTIONCALL" and
                                                row[1].lstrip() == str(t)
                                                and row[5].lstrip() in ["LOCAL;CONSTANT;", "CONSTANT;LOCAL;",
                                                "CONSTANT;CONSTANT;"],
                                                csv_reader)

            thread_functioncall_flist = list(thread_functioncall_filter)

            # print("thread_functioncall_flist => \n", thread_functioncall_flist)
            if "ROSACE" in trace_file:
                thread_functioncall_list = thread_functioncall_flist[-1] \
                    if len(thread_functioncall_flist) > 0 else None
            else:
                thread_functioncall_list = thread_functioncall_flist[0] \
                    if len(thread_functioncall_flist) > 0 else None

            thread_function = {t: thread_functioncall_list[3] if thread_functioncall_list is not None else None}
    csv_file.close()
    # print(t, "=>  ", thread_function)
    return thread_function


def create_groups(thr_l, loaded_var_list, access_op):
    var_group = {}
    var_thrids_filter = filter(lambda t: t[1] == thr_l, loaded_var_list.items())
    var_thrids_list = list(var_thrids_filter)
    num_thr = len(thr_l)
    # print("\n" + str(len(var_thrids_list)) + " variables " + str(access_op) + " by " + str(
      #   num_thr) + " threads. List in below:")
    # print(thr_l)
    if str(access_op) == "MAIN":
        group_name = "Only" + str(access_op) + "Thread"
    else:
        group_name = str(access_op) + "by" + str(num_thr) + "Threads"
    # print Group_name
    var_filter = map(lambda v: v[0], var_thrids_list)
    a = {"var_list": list(var_filter), "G_thrIDs": thr_l}
    var_group.update({group_name: a})

    # print "var_group ", var_group
    return var_group


def get_var_names(var_list, op):
    var_names = map(lambda var: var[3], var_list)
    # Remover Duplicates
    var_name_list = remove_dups(list(var_names))
    # print("Number of ACTUAL variables of " + op + "= ", len(var_name_list))
    return var_name_list


def get_thread_var_op(threads, op, trace_file, b_param):
    # print("get_thread_var_op   =>", op)
    shared_pointer = []
    shared_var_names = get_all_shared_var_names(b_param)
    [shared_pointer.append(p.replace("{", "").replace("}", "")) if "{" in p and "}" in p else None
     for p in shared_var_names]

    thread_var_op = {}
    thr_func_dict = {}
    for indx, t in enumerate(threads):
        thr_func = get_first_function(t, indx, trace_file)
        thr_func_dict.update(thr_func)

    # What I need is: To show the inputs-LD of each threads
    # For that, I built an dict: {'first function of each thread as the key': [list of variables or structs]}
    with open(trace_file) as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        for tK, fV in thr_func_dict.items():
            thread_var_dict = {}
            if "Main_" in tK:
                t_id = tK.strip("Main_")
            else:
                t_id = tK

            thread_records = filter(lambda row: row[1] == t_id and row[2] in op, csv_reader)
            # Filter the records based on operation
            thread_pointers_filter = filter(lambda row: row[4] in shared_pointer, list(thread_records))
            thread_pointers_list = list(thread_pointers_filter)
            thread_access_pointer_map = map(lambda row: ["{" + row[4] + "}" if row[3] is "" else row[3], row[0], row[1],
                                            row[2], row[5]], thread_pointers_list)
            thread_access_pointer_list = list(thread_access_pointer_map)
            # print(t_id, "\n", thread_access_pointer_list)

            csv_file.seek(0, 0)

            thread_vars_filter = filter(lambda row: row[3] in shared_var_names, list(thread_records))
            list_thread_vars = list(thread_vars_filter)
            thread_access_vars_map = map(lambda row: [row[3], row[0], row[1], row[2], row[5]], list_thread_vars)
            thread_access_vars_list = list(thread_access_vars_map)
            [thread_access_vars_list.append(a) for a in thread_access_pointer_list]

            csv_file.seek(0, 0)
            if len(list_thread_vars) > 1:
                # if it is struct, only show it as logicalData
                # need to specify the type of elements
                thread_vars_list = [[v[0].split(".")[0], v[1], v[2], v[3], "logicalData"] if "." in v[0]
                                    else [v[0], v[1], v[2], v[3], "variable"] for v in thread_access_vars_list]

                # remove duplicate rows
                thread_var_dict.update({i[0]: i[4] for i in thread_vars_list})

            thread_var_op.update({fV: thread_var_dict})
    csv_file.close()
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
                    print("op= ", op, "    lc= ", lc)
                    group_name = op + lc
                    lc_list.append(lc)
                    ld_l2_group.update({group_name: {"logical_components": lc_list, "group_members": ld_vars}})

    return ld_l2_group


def get_trace_file_path(benchmark_name, *args, **kwargs):
    file_name = kwargs.get('file_name') if kwargs.get('file_name') is not None else ""
    switcher = {
        "ROSACE": "benchmark_traces/ROSACE/TraceDataRosace.txt",
        "OCEAN": "benchmark_traces/OCEAN/Splash2ocean_contiguous_partitions.txt",
        "UPLOADED": "Uploaded_files/" + file_name + ".txt",
    }
    return switcher.get(benchmark_name, "Invalid Value")


def get_variable_file_path(benchmark_name):
    switcher = {
        "ROSACE": "benchmark_traces/ROSACE/SharedVariablesRosace.txt",
    }
    return switcher.get(benchmark_name, "Invalid Value")


def get_all_shared_var_names(benchmark_name):
    var_file_path = get_variable_file_path(benchmark_name)
    with open(var_file_path, 'r') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        var_names = map(lambda var: var[1] if var[0] is "" else var[0], csv_reader)
        var_names_list = list(var_names)
    csv_file.close()
    return var_names_list


def get_threads(file_path):
    trace_file_path = str(file_path)
    # print("trace_file_path", trace_file_path)
    # get_records()
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
    with open(trace_file, 'r') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        time_stamps = map(lambda v: v[0], csv_reader)
        time_stamps_list = list(time_stamps)
    csv_file.close()
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

