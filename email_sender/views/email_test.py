from django.http import HttpResponse
from django.shortcuts import render
from .templates import send_complete_reminder


def test_email_sender(request):
    send_complete_reminder(request.user)
    return HttpResponse('email_sender')


def test_template(request, templatefile):
    # return HttpResponse(templatefile)
    return render(request, templatefile)
