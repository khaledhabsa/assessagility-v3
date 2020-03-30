from django.conf.urls import url
from .views.user import (

    enroll_users, upload_users, upload_users_simple, import_db, export_db,
    export_role_questions, export_characteristic, export_not_started_users,
    export_in_progress_users, test
)

app_name = 'excel'

urlpatterns = [
    url(r'^upload/users/$', upload_users, name='upload_users'),
    url(r'^upload/users/simple/$', upload_users_simple, name='upload_users_simple'),
    url(r'^upload/db/$', import_db, name='import_db'),

    url(r'^enroll_users/$', enroll_users, name='enroll_users'),

    url(r'^export/all/$', export_db, name='export_db'),
    url(r'^export/rolequestions/(?P<mode>.*)/$',
        export_role_questions, name='export_role_questions'),
    url(r'^export/rolequestions/$',
        export_role_questions, {'mode': 'normal'},  name='export_role_questions_normal'),
    url(r'^export/characteristic/(?P<mode>.*)/$',
        export_characteristic,  name='export_characteristic'),
    url(r'^export/characteristic/$',
        export_characteristic, {'mode': 'normal'},  name='export_characteristic_normal'),

    url(r'^export/not_started_users/(?P<mode>.*)/$',
        export_not_started_users,  name='export_not_started_users'),
    url(r'^export/not_started_users/$',
        export_not_started_users, {'mode': 'normal'},  name='export_not_started_users_normal'),
    url(r'^export/export_in_progress_users/$',
        export_in_progress_users,  name='export_in_progress_users'),

    url(r'^test/$', test,  name='test'),
]
