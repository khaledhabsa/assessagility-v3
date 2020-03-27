from django.conf.urls import url
from .views.user import user_login, user_logout, forget_password
from .views.asnwer import answerPage, finished
app_name = 'survey'

urlpatterns = [
    url(r'^accounts/login/$', user_login, name='user_login'),
    url(r'^accounts/logout/$', user_logout, name='user_logout'),
    url(r'^accounts/forget_password/$', forget_password, name='forget_password'),
    url(r'^answerpage/(?P<mode>.*)/$', answerPage, name='answerpage'),
    # url(r'^select/role/$' , name="select_role"),
    # url(r'^survey/closed/$' , name="closed"),
    url(r'^survey/finished/$', finished, name="finished"),
]
