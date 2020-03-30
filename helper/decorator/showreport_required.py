from functools import wraps
from django.shortcuts import redirect
from survey.views.asnwer import isValidSurveyOption


def showreport_required():

    def decorator(func):
        def inner_decorator(request, *args, **kwargs):
            if isValidSurveyOption('show_report', 'show'):
                return func(request, *args, **kwargs)
            else:
                return redirect('answerpage', mode=0)

        return wraps(func)(inner_decorator)

    return decorator
