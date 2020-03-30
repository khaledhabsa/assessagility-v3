from functools import wraps
from django.shortcuts import redirect
from survey.views.asnwer import isValidSurveyOption


def survey_closed_required():

    def decorator(func):
        def inner_decorator(request, *args, **kwargs):
            if(isValidSurveyOption('survey_closed', 'closed') == True):
                return func(request, *args, **kwargs)
            else:
                return redirect('survey.views.opened')

        return wraps(func)(inner_decorator)

    return decorator
