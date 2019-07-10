import csv
from operator import is_not
from functools import partial
from logical_vis import views


def remove_dups(a_list):
    # Remove Duplicates
    new_dict = dict.fromkeys(a_list)
    the_list = list(new_dict)
    return the_list


def get_var_names(var_list):
    var_names = map(lambda var: var[0], var_list)
    return list(var_names)


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


def get_data_types(trace_file):
    data_types_vars = {}
    with open(trace_file) as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        data_types = get_types(csv_reader)
        # print("data_types", data_types)
        for t in data_types:
            csv_file.seek(0, 0)
            var_names = map(lambda var: var[3] if var[5] == t else None, csv_reader)
            var_names_not_none = filter(partial(is_not, None), var_names)
            var_names_not_none = filter(partial(is_not, ''), var_names_not_none)
            var_names = remove_dups(list(var_names_not_none))
            var_list = list(var_names)
            var_struct_list = get_var_struct(var_list)
            data_types_vars.update({t: var_struct_list})

    return data_types_vars
