from django.http import HttpResponse
from django.shortcuts import render, redirect
from survey.models.role import Role
from survey.models.users import UserProfile, User, UsersWaitingList
from survey.models.instanceSetting import InstanceSetting
from survey.models.questionAnswer import Practice, Characteristic, AnswerRange, McqAnswer
from survey.views.asnwer import isValidSurveyOption, Demographic, DemographicValue
from django.contrib.auth.decorators import login_required, user_passes_test
from email_sender.views.edit_email_template import edit_email_template
from email_sender.views.preview_email_template import preview_email_template
from ..forms.user import AddUserForm
from ..forms.uploadFile import UploadFileForm
from ..forms.roleForm import RoleForm
from django.conf.urls.static import settings
from django.forms.models import inlineformset_factory
from helper.decorator.superuser_required import superuser_required
import random
import os
import xlwt


@user_passes_test(lambda u: u.is_superuser or u.has_perm('survey.change_ticket'))
def home(request):
    roles = Role.objects.all()
    roles_completed = {}
    roles_in_progress = {}
    roles_not_started = {}

    for r in roles:
        roles_completed[r.title] = UserProfile.objects.filter(
            survey_finished=True, roles__in=[r, ]).distinct().exclude(user__is_superuser=True).count
        roles_in_progress[r.title] = UserProfile.objects.filter(survey_finished=False, user__answer__isnull=False, roles__in=[
                                                                r, ]).distinct().exclude(user__is_superuser=True).count
        roles_not_started[r.title] = UserProfile.objects.filter(survey_finished=False, user__answer__isnull=True, roles__in=[
                                                                r, ]).distinct().exclude(user__is_superuser=True).count

    ctx = {'roles_not_started': roles_not_started.items(),
           'roles_in_progress': roles_in_progress.items(),
           'roles_completed': roles_completed.items(),
           'roles': roles,
           'users_count': User.objects.all().count,
           'roles_count': Role.objects.all().count,
           'practices_count': Practice.objects.all().count,
           'characteristics_count': Characteristic.objects.all().count,
           'users_started':  sum([x() for x in roles_in_progress.values()]),
           'users_finished': sum([x() for x in roles_completed.values()]),
           'users_not_started': sum([x() for x in roles_not_started.values()]),
           'survey_closed': isValidSurveyOption('survey_closed', 'closed'),
           }

    return render(request, 'client_admin_home.html', ctx)


@login_required(login_url="/accounts/login/?next=client_admin:adduser")
def adduser(request):
    message = None
    if request.method == 'POST':
        form = AddUserForm(request.POST)
        if form.is_valid():
            newUser = UsersWaitingList()
            newUser.first_name = form.cleaned_data['first_name']
            newUser.last_name = form.cleaned_data['last_name']
            newUser.email = form.cleaned_data['email']
            newUser.save()

            message = '%s has been added successfully.' % form.cleaned_data['email']
            form = AddUserForm()
    else:
        form = AddUserForm()

    return render(request, 'adduser.html',
                  {'form': form,
                   'message': message},
                  #   context_instance=RequestContext(request)
                  )


@login_required(login_url="/accounts/login/?next=client_admin:upload_logo")
def upload_logo(request):
    message = None
    if request.method == 'POST':
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            with open('%s/images/customers/logo.jpg' % os.path.join(settings.BASE_DIR, 'media'), 'wb+') as destination:
                for chunk in request.FILES['file'].chunks():
                    destination.write(chunk)
            lfn = InstanceSetting.objects.get(code='logo_file_name')
            lfn.value = 'logo.jpg?v=%s' % random.random()
            lfn.save()
            message = 'new logo uploaded successfully.'
    else:
        form = UploadFileForm()

    return render(request, 'upload_logo.html',
                  {'form': form,
                   'message': message})


@login_required(login_url="/accounts/login/?next=client_admin:view_roles")
@superuser_required
def view_roles(request):
    roles = Role.objects.all().order_by('rank')
    return render(request, 'view_roles.html',
                  {'roles': roles, })


@login_required
@superuser_required
def client_admin_preview_email_template(request, template_name):
    return preview_email_template(request, template_name)


@login_required
@superuser_required
def client_admin_edit_email_template(request, template_name):
    return edit_email_template(request, template_name)


def edit_role(request, id):
    message = None
    r = Role.objects.get(pk=id)
    if request.method == 'POST':
        form = RoleForm(request.POST, instance=r)
        if form.is_valid():
            form.save()
            message = 'Role data updated successfully.'
    else:
        form = RoleForm(instance=r)

    return render(request, 'edit_role.html',
                  {'form': form,
                   'message': message})


@login_required(login_url="/accounts/login/?next=client_admin:view_ranges")
@superuser_required
def view_ranges(request):
    ranges = AnswerRange.objects.all()
    return render(request, 'view_answer_ranges.html', {'ranges': ranges})


def edit_range(request, id):
    message = None
    r = AnswerRange.objects.get(pk=id)
    McqFormSet = inlineformset_factory(
        AnswerRange, McqAnswer, fields='__all__', can_delete=False, exclude=0)

    if request.method == 'POST':
        formset = McqFormSet(request.POST, instance=r)
        if formset.is_valid():
            formset.save()
            message = 'answer range updated successfully.'

    formset = McqFormSet(instance=r)

    return render(request, 'edit_range.html', {'answer_range': r,
                                               'formset': formset,
                                               'message': message})


@login_required(login_url="/accounts/login/?next=client_admin:view_demographics")
@superuser_required
def view_demographics(request):
    demographics = Demographic.objects.all()
    return render(request, 'view_demographics.html', {'demographics': demographics, })


def edit_demographic(request, id):
    message = None
    d = Demographic.objects.get(pk=id)
    DVFormSet = inlineformset_factory(
        Demographic, DemographicValue, fields="__all__",  can_delete=True, extra=3)
    if request.method == 'POST':
        formset = DVFormSet(request.POST, instance=d)
        if formset.is_valid():
            formset.save()
            message = 'demographic updated successfully.'

    formset = DVFormSet(instance=d)

    ctx = {'demographic': d,
           'formset': formset,
           'message': message}
    return render(request, 'edit_demographic.html', ctx)


@login_required(login_url="/accounts/login/?next=client_admin:contact")
@superuser_required
def contact(request):
    return render(request, 'contact.html', {})


@login_required(login_url="/accounts/login/?next=client_admin:schedule_call")
@superuser_required
def schedule_call(request):
    return render(request, 'schedule_call.html', {})


@login_required(login_url="/accounts/login/?next=client_admin:admin_landing")
@superuser_required
def admin_landing(request):

    if request.user.is_superuser:
        return render(request, 'admin_landing.html', {})
    else:
        return redirect("survey:answerpage", mode=0)


@superuser_required
def get_not_started(request):
    not_started_users = UserProfile.objects.filter(survey_finished=False,
                                                   user__answer=None).exclude(user__is_superuser=True)
    emails = not_started_users.values_list('user__email', flat=True)
    response = HttpResponse(content_type='application/ms-excel')
    response['Content-Disposition'] = 'attachment; filename="not_started_emails.xls"'
    wb = xlwt.Workbook()
    ws = wb.add_sheet('Sheetname')
    for index, email in enumerate(emails):
        ws.write(index, 0, email)
    wb.save(response)
    return response
