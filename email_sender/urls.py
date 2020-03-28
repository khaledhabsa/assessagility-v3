from django.conf.urls import url

from .views.send_mail import send_email

app_name = 'email_sender'

urlpatterns = [

    url(r'^send_emails/(?P<patch_size>.*)/$', send_email, name="send_mail"),
    url(r'^send_emails/$', send_email, {'patch_size': '50'}, name="send_mail"),
]
