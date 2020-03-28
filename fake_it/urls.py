from django.conf.urls import url

from .views.user import (

    fake_users, fake_user_role, fake_user_answers, fake_user_demographics,
    fake_user_with_answer_from_file,

)

app_name = "fake"

urlpatterns = [

    url(r'^users/$', fake_users, {'group_size': '50'}, name='users'),
    url(r'^user/role/$', fake_user_role, name='user_role'),
    url(r'^user/answers/$', fake_user_answers, name='user_answers'),
    url(r'^user/demographics/$', fake_user_demographics, name='user_demographics'),
    url(r'^users/upload/$', fake_user_with_answer_from_file,
        name='user_with_answer_from_file'),


]
