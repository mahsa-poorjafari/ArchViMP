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


def logical_data_input_function():
    with open('logical_vis/shared_variables.txt') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        shared_variables_names = get_var_names(csv_reader)
        print("Number of Shared Variables: ", len(shared_variables_names))
        # variables_names = {'names': list(shared_variables_names)}
    return list(shared_variables_names)


def get_data_types():
    data_types_vars = {}
    with open('logical_vis/PowerWindowRosace.txt') as csv_file:
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
            var_struct_list = views.get_var_struct(var_list)
            # print(t, "  var_names  ", var_struct_list)
            data_types_vars.update({t: var_struct_list})

    return data_types_vars
