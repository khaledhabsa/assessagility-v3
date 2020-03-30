from django.conf.urls import url

from .views.send_mail import send_email
from .views.email_test import test_email_sender, test_template
app_name = 'email_sender'

urlpatterns = [

    url(r'^send_emails/(?P<patch_size>.*)/$', send_email, name="send_mail"),
    url(r'^send_emails/$', send_email, {'patch_size': '50'}, name="send_mail"),

    url(r'^test_email_sender/$', test_email_sender, name='test_email_sender'),
    url(r'^test/template/(?P<templatefile>.*)/$',
        test_template, name='test_template'),

]
