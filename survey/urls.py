from django.conf.urls import url
from .views.user import user_login, user_logout, forget_password, change_password
from .views.asnwer import (
    answerPage, finished, select_role,
    edit_user_demographics, closed, survey_opened,
    iphone, get_my_indicators_as_json, get_answerrange_as_json,
    get_my_answers, get_answer_ranges, set_my_answer, get_my_answer,
    get_macros, hide_welcome_message, add_comment, test_view, mark_complete_as_finished,
    thank_you, demographic, getalldemgraphic, adddemographic, updatedemographic,
    deletedemographic, demographic_values, getalldemgraphicvalue, adddemographicvalue,
    updatedemographicvalue, deletedemographicvalue,
)
app_name = 'survey'

urlpatterns = [
    url(r'^accounts/login/$', user_login, name='user_login'),
    url(r'^accounts/logout/$', user_logout, name='user_logout'),
    url(r'^accounts/forget_password/$', forget_password,
        name='forget_password'),  # fix this ------
    url(r'^accounts/change/password/$', change_password, name='change_password'),
    url(r'^answerpage/(?P<mode>.*)/$', answerPage, name='answerpage'),
    url(r'^select/role/$', select_role, name="select_role"),
    url(r'^user/demographic/$', edit_user_demographics,
        name="edit_user_demographic"),
    url(r'^survey/opened/$', survey_opened, name='opened'),
    url(r'^survey/finished/$', finished, name="finished"),
    url(r'^survey/closed/$', closed, name="closed"),
    url(r'^iphone/$', iphone, name='iphone'),
    url(r'^question/$', get_my_indicators_as_json, name='get_question'),
    url(r'^answerrange/(?P<id>\d+)/$',
        get_answerrange_as_json, name='get_answerrange'),
    url(r'^answers/$', get_my_answers, name='get_answers'),
    url(r'^$', get_answer_ranges, name='get_answerrange_all'),
    url(r'^set/answer/(?P<question_id>\d+)/(?P<mcqanswer_id>\d+)/$',
        set_my_answer, name='set_answer'),
    url(r'^answer/(?P<question_id>\d+)/$', get_my_answer, name='get_answer'),
    url(r'^macros/$', get_macros, name='get_macros'),
    url(r'^hide/welcome_message/$', hide_welcome_message,
        name='hide_welcome_message'),
    url(r'^test/view/$', test_view, name='test_view'),
    url(r'^comment/add/(?P<comment>.*)/$', add_comment, name='add_comment'),
    url(r'^survey/mark_complete_as_finished/$', mark_complete_as_finished,
        name='mark_complete_as_finished'),

    url(r'^survey/thankyou/$', thank_you, name='thank_you'),
    url(r'^survey/demographic/$', demographic, name='demographic'),
    url(r'^survey/adddemographic/$', adddemographic, name='adddemographic'),
    url(r'^survey/getalldemgraphic/$', getalldemgraphic, name='getalldemgraphic'),
    url(r'^survey/updatedemographic/$',
        updatedemographic, name='updatedemographic'),
    url(r'^survey/deletedemographic/$',
        deletedemographic, name='deletedemographic'),
    url(r'^survey/demographic/values/$',
        demographic_values, name='demographic_values'),
    url(r'^survey/getalldemgraphicvalue/$',
        getalldemgraphicvalue, name='getalldemgraphicvalue'),
    url(r'^survey/adddemographicvalue/$',
        adddemographicvalue, name='adddemographicvalue'),
    url(r'^survey/updatedemographicvalue/$',
        updatedemographicvalue, name='updatedemographicvalue'),
    url(r'^survey/deletedemographicvalue/$',
        deletedemographicvalue, name='deletedemographicvalue'),

]
