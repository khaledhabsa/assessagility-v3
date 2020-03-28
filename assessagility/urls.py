
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('survey.urls', namespace='survey')),
    path('', include('email_sender.urls', namespace='email_sender')),
    path('usermanagement/', include('user_management.urls',
                                    namespace='user_management')),
    path('client/admin/', include('client_admin.urls', namespace='client_admin')),
    path('fake/', include('fake_it.urls', namespace='fake')),
]
