from django.http import JsonResponse
from django.http import Http404
from django.shortcuts import render, redirect


def index(request):
    if not request.user.is_authenticated:
        return redirect("survey:user_login")
    else:
        if request.user.is_superuser:
            return redirect("client_admin:home")
        else:
            return redirect("survey:answerpage", mode="0")


def health(request):
    state = {"status": "UP"}
    return JsonResponse(state)


def handler404(request, *args, **kwargs):
    return render(request, '404.html', status=404)


def handler403(request, *args, **kwargs):
    return render(request, '403.html', status=403)


def handler500(request):
    return render(request, '500.html', status=500)
