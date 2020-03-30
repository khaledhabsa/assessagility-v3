from django.conf.urls import url
from .views.practice import (

    get_practice_json, readiness_assessment, product_line_assessment,
    characteristic_answers, characteristic, characteristic_top_5_and_bottom_5,
    delete_cache, category_readiness_report, optimized_category_readiness_report,
    charactristic_pdf, practice_pdf, groupe_assessment, characteristic_answers_optimized,
    practice_spectrum, optimized_category_readiness_report_json, category_radar, comments


)

app_name = "report"

urlpatterns = [

    url(r'^practice/$', readiness_assessment, name='readiness_assessment'),
    url(r'^practice/pdf/$', practice_pdf, name='practice_pdf'),
    url(r'^practice/spectrum/$', practice_spectrum,
        name='practice_spectrum'),
    url(r'^practice/spectrum/json/$',
        get_practice_json, name='get_practice_json'),


    url(r'^demographic/(?P<current_demographic_id>.*)/(?P<current_demographic_value_id>.*)/$',
        product_line_assessment, name='product_line_assessment'),


    url(r'^characteristic/$', characteristic_top_5_and_bottom_5,
        name='characteristic_top_5_and_bottom_5'),
    url(r'^characteristic/details/$', characteristic, name='characteristic'),
    url(r'^characteristic/(?P<characteristic_id>\d+)/$',
        characteristic_answers, name='characteristic_answers'),


    url(r'^cache/delete/$', delete_cache, name='delete_cache'),


    url(r'^category/$', category_readiness_report,
        name='category_readiness_report'),


    url(r'^optimized/practice/$', optimized_category_readiness_report,
        name='optimized_category_readiness_report_practice'),
    url(r'^optimized/category/$', optimized_category_readiness_report,
        name='optimized_category_readiness_report_category'),


    url(r'^characteristic/pdf/$', charactristic_pdf,
        name='charactristic_pdf'),
    url(r'^optimized/characteristic/(?P<characteristic_id>\d+)/$', characteristic_answers_optimized,
        name='characteristic_answers_optimized'),


    url(r'^supervisor/$', groupe_assessment, {'aggregator': 'supervisor'}),
    url(r'^departmentmanager/$', groupe_assessment,
        {'aggregator': 'department_manager'}),


    url(r'^category/radar/$', category_radar,
        name='category_radar'),
    url(r'^category/radar/json/$', optimized_category_readiness_report_json,
        name='optimized_category_readiness_report_json'),

    url(r'^comments/$', comments, name='comments'),



]
