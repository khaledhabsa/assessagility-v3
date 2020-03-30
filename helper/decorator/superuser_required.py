from functools import wraps
from django.shortcuts import redirect


def superuser_required(func):
    def decorator(func):
        def inner_decorator(request, *args, **kwargs):
            if request.user.is_superuser:
                return func(request, *args, **kwargs)
            else:
                return redirect('answerpage', mode=0)

        return wraps(func)(inner_decorator)

    return decorator
