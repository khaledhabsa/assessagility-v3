
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('survey.urls', namespace='survey')),
    path('', include('user_management.urls', namespace='user_management')),
]
