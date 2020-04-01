from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.shortcuts import redirect
from django.http import HttpResponse
from ..models.option import Option
from ..models.role import Role
import json
from ..models.questionAnswer import Indicator, Answer, Comment, AnswerRange, McqAnswer, Test

from ..models.macro import Macro
from user_management.models.candidate import Candidate
from ..models.graphics import Demographic, DemographicValue
from ..models.users import UserDemographics, UserProfile
from ..models.message import Message
from django.core import serializers
from ..models.instanceSetting import InstanceSetting
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from ..views.addSurveyOptionIfNotExist import addSurveyOptionIfNotExist
from ..views.isValidSurveyOption import isValidSurveyOption


@login_required(login_url="/accounts/login?next=survey:opened")
def survey_opened(request):
    return render(request, 'survey/opened.html')


@login_required(login_url="/accounts/login?next=survey:answerpage")
def answerPage(request, *args, **kwargs):

    if not request.user.profile.roles.count():
        return redirect('survey:select_role')

    if isValidSurveyOption('closed', 'closed'):
        return redirect('survey:closed')

    if request.user.profile.survey_finished:
        # print(request.user.profile.survey_finished)
        return redirect('survey:finished')

    my_roles = request.user.profile.roles.all()
    questions = Indicator.objects.filter(roles__in=my_roles)
    questions = questions.distinct().order_by('answer_range__order')
    answers = Answer.objects.filter(user=request.user)

    if kwargs.get('mode') == '0':
        template_name = 'questions/multiple.html'
    else:
        template_name = 'questions/single.html'

    return render(request, template_name, {'questions': questions,
                                           'answers': answers,
                                           'progress': int(float(answers.count())/questions.count()*100),
                                           })


@login_required(login_url="/accounts/login?next=survey:select_role")
def select_role(request):
    if request.method == 'POST':
        role = Role.objects.get(pk=request.POST['role'])
        userprofile = request.user.profile
        userprofile.roles.add(role)

        try:
            candidate = Candidate.objects.get(email=request.user.email)
            candidate.status = 'Started'
            candidate.save()
        except Candidate.DoesNotExist:
            candidate = None
        return redirect('survey:edit_user_demographic')

    if request.user.profile.roles.count() > 0:
        return redirect('survey:edit_user_demographic')

    return render(request, 'questions/select_role.html',  {'roles': Role.objects.all().order_by('rank')})


@login_required(login_url="/accounts/login?next=survey:edit_user_demographic")
def edit_user_demographics(request):
    demographics = Demographic.objects.filter(viewable=1)
    currentDemographics = UserDemographics.objects.filter(
        userProfile=request.user.profile)
    if request.method == 'POST':
        for d in demographics:
            if request.POST[str(d.id)]:
                ud = UserDemographics.objects.filter(userProfile=request.user.profile,
                                                     demographic=d)
                if ud.count() > 0:
                    ud = ud[0]
                    ud.demographic_value_id = request.POST[str(d.id)]
                    ud.save()
                else:
                    ud = UserDemographics.objects.create(userProfile=request.user.profile,
                                                         demographic=d,
                                                         demographic_value_id=request.POST[str(
                                                             d.id)]
                                                         )

        user_profile = request.user.profile
        user_profile.did_fill_demographics = True
        user_profile.save()
        return redirect('survey:answerpage', mode=0)

    return render(request, 'questions/demographic.html', {'demographics': demographics,
                                                          'currentDemographics': currentDemographics
                                                          })


@login_required(login_url="/accounts/login?next=survey:finished")
def finished(request):

    user_profile = request.user.profile
    user_profile.survey_finished = True
    user_profile.save()

    try:
        # print("request.user.email: ", request.user.email)
        # # print("Candidate.objects.get all: ", Candidate.objects.all())
        candidate = Candidate.objects.get(email=request.user.email)
        # print("candidate: ", candidate)
        candidate.status = 'Finished'
        candidate.save()
    except Candidate.DoesNotExist:
        candidate = None

    # print("request.method: ", request.method)
    if request.method == 'POST':
        comment = Comment.objects.create(
            user=request.user, text=request.POST['comment'])
        comment.save()
        # send_mail('Agile Readiness Survey ( Comment )',
        #           'user :' + request.user.username +
        #           '\n"' + request.POST['comment'] + '"',
        #           'noreply@dragile.com',
        #           ['Kott_Alex_W@cat.com'], fail_silently=False)

        return render(request, 'questions/finished.html', {'hide_comment_box': True,
                                                           'message': 'Your comment has been sent. Thank you!',
                                                           'welcomemessage': Message.objects.get(code="welcome").body,
                                                           'logomessage': Message.objects.get(code="logo").body
                                                           })

    return render(request, 'questions/finished.html', {})


@login_required(login_url="/accounts/login?next=survey:closed")
def closed(request):
    if request.method == 'POST':
        value = request.POST.get('value', False)
        addSurveyOptionIfNotExist('closed', value)
        return HttpResponse()

    # value = request.POST.get('value', False)
    addSurveyOptionIfNotExist('closed', "closed")
    return render(request, 'questions/closed.html')


@login_required(login_url='/accouts/login/iphone/?next=survey:iphone')
def iphone(request):
    if request.user.profile.roles.count() == 0:
        return redirect('survey:select_role')

    if(request.user.profile.survey_finished):
        return redirect('survey:finished')

    return render(request, 'iphone/iphone.html', {'welcomemessage': Message.objects.get(code="welcome").body,
                                                  'logomessage': Message.objects.get(code="logo").body
                                                  })


@login_required(login_url='/accounts/login?next=survey:get_question')
def get_my_indicators_as_json(request):
    my_roles = request.user.profile.roles.all()
    indicators = Indicator.objects.filter(
        roles__in=my_roles).distinct().order_by('answer_range__order')
    return HttpResponse(serializers.serialize('json', indicators, indent=4))


@login_required(login_url='/accounts/login?next=survey:get_answerrange')
def get_answerrange_as_json(request, id):
    ar = AnswerRange.objects.get(pk=id)
    return HttpResponse(serializers.serialize('json', McqAnswer.objects.filter(answerrange=ar)))


@login_required(login_url='/accounts/login?next=survey:get_answers')
def get_my_answers(request):
    return HttpResponse(serializers.serialize('json', Answer.objects.filter(user=request.user), indent=4))


@login_required(login_url='/accounts/login?next=survey:get_answerrange_all')
def get_answer_ranges(request):
    return HttpResponse(serializers.serialize('json', McqAnswer.objects.all()))


@login_required(login_url='/accounts/login?next=survey:set_answer')
def set_my_answer(request, question_id, mcqanswer_id):
    i = Indicator.objects.get(pk=question_id)
    mcqa = McqAnswer.objects.get(pk=mcqanswer_id)
    try:
        a = Answer.objects.get(indicator=i, user=request.user)
        a.mcqanswer = mcqa
    except:
        a = Answer.objects.create(
            indicator=i, user=request.user, mcqanswer=mcqa)
    a.save()
    return HttpResponse(serializers.serialize('json', [a, ]))


@login_required(login_url='/accounts/login?next=survey:get_answer')
def get_my_answer(request, question_id):
    i = Indicator.objects.get(pk=question_id)
    try:
        a = Answer.objects.get(indicator=i, user=request.user)
    except:
        return HttpResponse('[]')
    return HttpResponse(serializers.serialize('json', (a.mcqanswer,)))


@login_required(login_url='/accounts/login?next=survey:get_macros')
def get_macros(request):
    return HttpResponse(serializers.serialize('json', Macro.objects.all()))


@login_required(login_url='/accounts/login?next=survey:hide_welcome_message')
def hide_welcome_message(request):
    user_profile = request.user.profile
    user_profile.hide_welcome_message = True
    user_profile.save()
    return HttpResponse("ok")


def instanceSetting(request):
    ss = {}
    for s in InstanceSetting.objects.all():
        ss[s.code] = s.value
    return ss


def surveyOption(request):
    ss = {}
    for s in Option.objects.all():
        ss[s.key] = s.value
    return ss


def test_add(request):
    t = Test.objects.get(code='cron')
    return HttpResponse(t.value)


def test_view(request):
    t = Test.objects.get(code='cron')
    return HttpResponse(t.value)


def add_comment(request, comment):
    c = Comment.objects.create(user=request.user, text=comment)
    c.save()
    return HttpResponse('ok')


def mark_complete_as_finished(request):
    for up in UserProfile.objects.filter(did_fill_demographics=True, survey_finished=False):
        questions_count = Indicator.objects.filter(
            roles__in=up.roles.all()).count()
        answers_count = Answer.objects.filter(user=up.user).count()
        if questions_count == answers_count:
            up.survey_finished = True
            up.save()
    return HttpResponse('mark_complete_as_finished')


def thank_you(request):
    return render(request, 'survey/thank_you.html')


@login_required(login_url='/accounts/login?next=survey:demographic')
def demographic(request):
    return render(request, 'survey/demographic.html', {})


def flat_user_date(users_list):
    users = []
    for c in users_list:
        viewable = 'false'
        required = 'false'

        if c.viewable == 1:
            viewable = 'true'
        if c.required == 1:
            required = 'true'
        users.append({'id': c.id,
                      'title': c.title,
                      'required': required,
                      'viewable': viewable})
    return users


def getalldemgraphic(request):
    demographic_list = Demographic.objects.all()
    page = int(request.GET.get('page', 0))
    if page > 0:
        paginator = Paginator(demographic_list, 20)

        try:
            demographics = paginator.page(page)
        except PageNotAnInteger:
            # If page is not an integer, deliver first page.
            demographics = paginator.page(1)
        except EmptyPage:
            demographics = paginator.page(paginator.num_pages)

        users = flat_user_date(demographics.object_list)
        paginatordata = []
        paginatordata.append(
            {'number': demographics.number, 'num_pages': demographics.paginator.num_pages})
        data = json.dumps({'users': users, 'paginatordata': paginatordata})
        return HttpResponse(data, content_type='application/json')
    else:
        users = flat_user_date(demographic_list)
        return HttpResponse(json.dumps(users))


def adddemographic(request):
    title = request.POST.get('title', False)
    required = int(request.POST.get('required', 0))
    viewable = int(request.POST.get('viewable', 0))

    duplicate = Demographic.objects.filter(title=title)
    if duplicate.count() > 0:
        return HttpResponse(json.dumps({'error': 'duplicate'}))

    c = Demographic.objects.create(
        title=title, required=required, viewable=viewable)
    c.save()

    return HttpResponse(json.dumps(flat_user_date([c])))


def updatedemographic(request):
    id = request.POST.get('id', False)

    title = request.POST.get('title', False)
    required = int(request.POST.get('required', 0))
    viewable = int(request.POST.get('viewable', 0))

    c = Demographic.objects.get(pk=id)
    c.title = title
    c.required = required
    c.viewable = viewable
    c.save()

    return HttpResponse(json.dumps('success'))


def deletedemographic(request):
    ids = request.POST.get('ids', False)
    deletedDemographics = Demographic.objects.filter(pk__in=ids.split(','))
    deletedDemographics.delete()
    return HttpResponse(json.dumps('success.'))


@login_required(login_url='/accounts/login?next=survey:demographic_values')
def demographic_values(request):
    demographic_list = Demographic.objects.all()

    demographic = int(request.GET.get('demographic', 0))
    # ctx = RequestContext(request, {'csrf_token': get_token(request)})
    return render(request, 'survey/demographic_values.html',
                  {'demographics': demographic_list, 'demographic': demographic})


def flat_user_date_values(users_list):
    users = []
    for c in users_list:
        users.append({'id': c.id,
                      'title': c.demographic.title,
                      'value': c.value})
    return users


def getalldemgraphicvalue(request):
    demographic = int(request.GET.get('demographic', 0))
    if demographic > 0:
        demographicValue_list = DemographicValue.objects.select_related().filter(
            demographic__id=demographic)
    else:
        demographicValue_list = DemographicValue.objects.select_related()
    page = int(request.GET.get('page', 0))
    if page > 0:
        paginator = Paginator(demographicValue_list, 20)
        try:
            demographics = paginator.page(page)
        except PageNotAnInteger:
            demographics = paginator.page(1)
        except EmptyPage:
            demographics = paginator.page(paginator.num_pages)

        users = flat_user_date_values(demographics.object_list)
        paginatordata = []
        paginatordata.append(
            {'number': demographics.number, 'num_pages': demographics.paginator.num_pages})

        data = json.dumps({'users': users, 'paginatordata': paginatordata})
        return HttpResponse(data, content_type='application/json')
    else:
        users = flat_user_date_values(demographicValue_list)
        return HttpResponse(json.dumps(users))


def adddemographicvalue(request):

    value = request.POST.get('value', False)
    demographic_id = request.POST.get('demographic_id', False)

    duplicate = DemographicValue.objects.filter(
        demographic__id=demographic_id).filter(value=value)
    if duplicate.count() > 0:
        return HttpResponse(json.dumps({'error': 'duplicate'}))

    c = DemographicValue.objects.create(
        demographic_id=demographic_id, value=value)
    c.save()
    return HttpResponse(json.dumps(flat_user_date_values([c])))


def updatedemographicvalue(request):
    id = request.POST.get('id', False)
    value = request.POST.get('value', False)
    demographic_id = request.POST.get('demographic_id', False)

    duplicate = DemographicValue.objects.filter(
        demographic__id=demographic_id).filter(value=value)
    if duplicate.count() > 0:
        return HttpResponse(json.dumps('duplicate'))

    c = DemographicValue.objects.get(pk=id)
    c.value = value
    c.save()
    return HttpResponse(json.dumps('success'))


def deletedemographicvalue(request):
    ids = request.POST.get('ids', False)
    deletedDemographics = DemographicValue.objects.filter(
        pk__in=ids.split(','))
    deletedDemographics.delete()
    return HttpResponse(json.dumps('success.'))
