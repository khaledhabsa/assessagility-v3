from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.shortcuts import redirect
from django.http import HttpResponse
from ..models.option import Option
from ..models.role import Role
from ..models.questionAnswer import Indicator, Answer, Comment
from ..models.test import Candidate


@login_required(login_url="/accounts/login?next=survey:answerpage")
def answerPage(request, *args, **kwargs):

    if not request.user.profile.roles.count():
        return redirect('survey:select_role')

    if isValidSurveyOption('closed', 'closed'):
        return redirect('survey:closed')

    if request.user.profile.survey_finished:
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
        print('inif')
        role = Role.objects.get(pk=request.POST['role'])
        userprofile = request.user.profile
        userprofile.roles.add(role)

        try:
            candidate = Candidate.objects.get(email=request.user.email)
            candidate.status = 'Started'
            candidate.save()
        except Candidate.DoesNotExist:
            candidate = None
        return redirect('survey.views.edit_user_demographics')

    if request.user.profile.roles.count() > 0:
        return redirect('survey.views.edit_user_demographics')

    template = 'new/user/selectrole.html'
    ctx = {'roles': Role.objects.all().order_by('rank')}

    return render(request, template, ctx)


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
    return render(request, 'survey/closed.html', {})


def addSurveyOptionIfNotExist(key, value):
    try:
        option = Option.objects.get(key=key)
    except Exception:
        option = None
    if option is not None:
        option.value = value
        option.save()
    else:
        Option.objects.create(key=key, value=value)


def isValidSurveyOption(key, value):
    print(">>>>>>>>key,value:", key, value)
    try:
        option = Option.objects.get(key=key)
        # print(">>>>>>>>option:", option)

    except Exception:
        option = None

    if option is not None:
        print(">>>>>>>>option.value, value:", option.value, value)
        # value = value.replace("survey_", "")
        if(option.value == value):
            # print(">>>>>>>>option.value, value:", option.value, value)
            return True

    return False
