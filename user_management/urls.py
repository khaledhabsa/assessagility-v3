from django.conf.urls import url
from .views.user import(

    home, manage, get_all_candidate, ajax_upload, delete_candidate,
    add_candidate, update_user, invite, notify_candidate, exclude, include

)

app_name = 'user_management'

urlpatterns = [

    url(r'^$', home, name="home"),
    url(r'^manage/$', manage, name="manage"),
    url(r'^ajax_upload/$', ajax_upload, name="ajax_upload"),
    url(r'^getallcandidate/$', get_all_candidate, name="get_all_candidate"),
    url(r'^deletecandidate/$', delete_candidate, name="delete_candidate"),
    url(r'^addcandidate/$', add_candidate, name="add_candidate"),
    url(r'^updateuser/$', update_user, name="update_user"),
    url(r'^invite/$', invite, name="invite"),
    url(r'^notifycandidate/(?P<template_name>.*)/$',
        notify_candidate, name="notify_candidate"),
    url(r'^exclude/$', exclude, name="exclude"),
    url(r'^include/$', include, name="include"),

]
