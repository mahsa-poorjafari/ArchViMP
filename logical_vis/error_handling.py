from django.shortcuts import render

# This file contains the pages if any errors happened


def error_404_view(request, exception):
    return render(request, 'error_pages/404.html')
