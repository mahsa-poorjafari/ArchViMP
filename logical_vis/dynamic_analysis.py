import csv
from operator import is_not
from functools import partial


def remove_dups(a_list):
    # Remove Duplicates
    var_thr_dict = dict.fromkeys(a_list)
    the_list = list(var_thr_dict)
    return the_list


def get_threads(a_list):
    threads_map = map(lambda r: r[1], a_list)
    threads_list = list(threads_map)
    return threads_list


def create_groups(thr_l, loaded_var_list, access_op):
    var_group = {}
    var_thrids_filter = filter(lambda t: t[1] == thr_l, loaded_var_list.items())
    var_thrids_list = list(var_thrids_filter)
    num_thr = len(thr_l)
    print("\n" + str(len(var_thrids_list)) + " variables " + str(access_op) + " by " + str(
        num_thr) + " threads. List in below:")
    print(thr_l)
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
    print("Number of ACTUAL variables of " + op + "= ", len(var_name_list))
    return var_name_list


def get_variables(a_list, op_list):
    filter_vars = filter(lambda row: row[2] in op_list and not row[3] == "", a_list)
    vars_list = list(filter_vars)
    print("TOTAL Lengh of variable list", len(vars_list))
    return vars_list


def variables_group(var_list, var_names):
    # To get variables that are access by threads

    threads_op_var = {}
    # Obtain the thread list that accessed each variable
    for n in var_names:

        print("n=>", n)
        var_rows = filter(lambda row: row[3] == n, var_list)
        var_rows_list = list(var_rows)
        print("var_rows_list", var_rows_list)
        # get threads that operates these vars
        var_thr_list = get_threads(var_rows_list)
        print(" var_thr_list ", var_thr_list)
        # Remove Duplicates
        var_thr_list = remove_dups(var_thr_list)
        b = {n: var_thr_list}
        threads_op_var.update(b)
    print("-------threads_op_var--------", threads_op_var)

    # Calculate the SUm of threads for each variables
    var_sum_thrs = map(lambda val: len(val), threads_op_var.values())
    # print(list(var_sum_thrs), len(list(var_sum_thrs)))
    return threads_op_var


def test_fun():
    var_groups = {}
    op_list = ["STORE", "LOAD", "GETELEMENTPTR"]
    with open('logical_vis/PowerWindowRosace.txt') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')

        main_thread_filter = filter(lambda row: row[2] == "FUNCTIONCALL" and row[3] == "main", csv_reader)
        main_thread_list = list(main_thread_filter)
        print(main_thread_list)
        main_threadid = main_thread_list[0][1]
        exe_timestamp = main_thread_list[0][0]
        print("Execution Date", exe_timestamp)

        # Create variable Group that all threads accessed
        # get all thread ids
        print("\n ===============ALL===================")
        csv_file.seek(0, 0)
        all_thread_list = get_threads(csv_reader)
        thread_list = remove_dups(all_thread_list)
        print("all_thread_list  ", thread_list)
        csv_file.seek(0, 0)
        all_variables = get_variables(csv_reader, ["LOAD", "STORE"])
        all_var_names = get_var_names(all_variables, "ALL")
        print("All Vriable Names= ", all_var_names)
        var_dict = variables_group(all_variables, all_var_names, "ALL")
        # print "================var_dict=============="
        # print var_dict
        var_group = create_groups(thread_list, var_dict, "ALL")
        print("Group of variables accessd by ALL Threads= ")
        print(var_group)
        var_groups.update(var_group)

        main_threadid_list = [main_threadid]
        print(main_threadid_list)

        var_group = create_groups(main_threadid_list, var_dict, "MAIN")
        print("Group of variables accessd only by MAIN Threads= ")
        print(var_group)
        var_groups.update(var_group)

        # print "all_variables= ", all_variables
        # print "Number of variables = ", len(all_variables)

        # Create varaible Group based on operations
        for a in op_list:
            print("\n ===============" + a + "===================")
            csv_file.seek(0, 0)
            vars_list = get_variables(csv_reader, a)
            var_names = get_var_names(vars_list, str(a))
            var_dict = variables_group(vars_list, var_names, str(a))
            n5_threads = next(iter(var_dict.values()))
            var_group = create_groups(n5_threads, var_dict, a)
            print("Group of variables with " + a + "access= ")
            print(var_group)
            var_groups.update(var_group)
            # print Var_load_groups

        # print Var_groups

# Get the list of function names


def get_function_names():
    with open('logical_vis/PowerWindowRosace.txt') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        fun_names = map(lambda row: row[3] if row[2] == "FUNCTIONCALL" else None, csv_reader)
        fun_names_not_none = filter(partial(is_not, None), fun_names)
        function_name_list = remove_dups(list(fun_names_not_none))
    return function_name_list

# Get the list of thread ids


def tech_comp():
    with open('logical_vis/PowerWindowRosace.txt') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        main_thread_filter = filter(lambda row: row[2] == "FUNCTIONCALL" and row[3] == "main", csv_reader)

        main_thread_list = list(main_thread_filter)
        exe_timestamp = main_thread_list[0][0]
        csv_file.seek(0, 0)
        all_thread_list = get_threads(csv_reader)
        thread_list = remove_dups(all_thread_list)
        thread_list[0] = 'Main_' + thread_list[0]
        # print("all_thread_list  ", thread_list)
    thread_infos = {'timestamp': exe_timestamp, 'thread_ids': thread_list}
    # print(thread_infos)

    return thread_infos
