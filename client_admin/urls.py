from django.conf.urls import url
from .views.user import (
    home, adduser, upload_logo, view_roles, edit_role, view_ranges,
    edit_range, view_demographics, edit_demographic, contact, schedule_call,
    admin_landing, get_not_started, client_admin_edit_email_template,
    client_admin_preview_email_template

)

app_name = "client_admin"

urlpatterns = [

    url(r'^$', home, name='home'),
    url(r'^adduser/$', adduser, name='adduser'),
    url(r'^upload/logo/$', upload_logo, name='upload_logo'),
    url(r'^edit/role/$', view_roles, name='view_roles'),
    url(r'^edit/role/(?P<id>.*)/$', edit_role, name='edit_role'),
    url(r'^edit/answerrange/$', view_ranges, name='view_ranges'),
    url(r'^edit/answerrange/(?P<id>.*)/$', edit_range, name='edit_range'),
    url(r'^edit/demographic/$', view_demographics, name='view_demographics'),
    url(r'^edit/demographic/(?P<id>.*)/$',
        edit_demographic, name='edit_demographic'),

    url(r'^edit/emailtemplate/(?P<template_name>.*)/$',
        client_admin_edit_email_template, name='client_admin_edit_email_template'),

    url(r'^preview/emailtemplate/(?P<template_name>.*)/$',
        client_admin_preview_email_template, name='client_admin_preview_email_template'),

    url(r'^contact/$', contact, name='contact'),
    url(r'^schedule_call/$', schedule_call, name='schedule_call'),
    url(r'^admin_landing/$', admin_landing, name='admin_landing'),
    url(r'^get_not_started/$', get_not_started, name='get_not_started'),

]
