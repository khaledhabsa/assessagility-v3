from django.conf.urls import url
from .views import index, health, handler404, handler500, handler403
app_name = 'app'

urlpatterns = [

    url(r'^$', index, name='app'),
    url(r'^health/$', health, name='health'),
    url(r'^404/$', handler404, name='404'),
    url(r'^403/$', handler403, name='403'),
    url(r'^500/$', handler500, name='500'),
]
