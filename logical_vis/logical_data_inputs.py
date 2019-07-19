from logical_vis.dynamic_analysis import *


def get_types(var_list):
    var_records = filter(lambda var: var[2] in ["LOAD", "STORE"] and var[3] != '', var_list)
    var_records_not_none = filter(partial(is_not, None), var_records)
    type_names = map(lambda var: var[5], var_records_not_none)
    type_names = remove_dups(list(type_names))
    return type_names


def get_var_struct(shared_vars):
    struct_vars_groups = {}
    struct_group = []
    shared_group = []
    [struct_group.append(v.split(".")) if "." in v else shared_group.append(v) for v in shared_vars]
    struct_names_keys = remove_dups([a[0] for a in struct_group])
    for s in struct_names_keys:
        find_struct_vars = map(lambda i: i[1] if i[0] == s else None, struct_group)
        struct_vars_not_none = filter(partial(is_not, None), find_struct_vars)
        struct_vars_groups.update({s: list(struct_vars_not_none)})
    struct_vars_groups.update({"variables": shared_group})
    # print(struct_vars_groups)
    return struct_vars_groups


def get_data_types(benchmark_name):
    var_file_path = get_variable_file_path(benchmark_name)
    data_types_vars = {}
    with open(var_file_path, "r") as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        vars_data_type = map(lambda i: i[2], csv_reader)
        vars_data_type_list = list(vars_data_type)
        vars_data_type = remove_dups(vars_data_type_list)

        # print("data_types", data_types)
        for dt in vars_data_type:
            csv_file.seek(0, 0)
            var_names = map(lambda var: var[1] if var[0] is " " else var[0] if var[2] == dt else None, csv_reader)
            var_names_not_none = filter(partial(is_not, None), var_names)
            var_names_not_none = filter(partial(is_not, ''), var_names_not_none)
            var_names = remove_dups(list(var_names_not_none))
            var_struct_list = get_var_struct(var_names)
            data_types_vars.update({dt: var_struct_list})
    csv_file.close()
    return data_types_vars


def catch_the_trace_error(files_of_forms):
    error = "The form is not filled properly"
    if 'trace_file' not in files_of_forms and 'shared_var_file' not in files_of_forms:
        error = "Please enter the files."

    elif 'shared_var_file' not in files_of_forms:
        error = "Please enter a shared variable file."

    elif 'trace_file' not in files_of_forms:
        error = "Please enter a trace file."

    return error


def catch_the_shvar_error(files_of_forms):
    error = "The form is not filled properly"
    if files_of_forms['selected_trace_file'] in [None, ""] and files_of_forms['selected_shared_var_file'] in [None, ""]:
        error = "Please select files."

    elif files_of_forms['selected_shared_var_file'] in [None, ""]:
        error = "Please select a shared variable file."

    elif files_of_forms['selected_trace_file'] in [None, ""]:
        error = "Please select a trace file."

    return error
