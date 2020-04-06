from functools import wraps
from django.shortcuts import redirect
from django.contrib.auth.decorators import user_passes_test
from django.core.exceptions import PermissionDenied
from django.contrib import messages


def superuser_required(func):
    def decorator(request):

        if request.user.is_superuser:
            return func(request)
        else:
            raise PermissionDenied  # redirect("survey:closed")
            # messages.error(request, "Unauthorized To access This link!")
            # raise PermissionDenied('Unauthorized To access This link!')

    return decorator
