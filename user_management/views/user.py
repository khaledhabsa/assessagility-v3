from django.http import HttpResponse, HttpResponseBadRequest, Http404
from django.shortcuts import render, redirect, get_object_or_404
from survey.models.role import Role
from survey.models.users import UserProfile, User, UsersWaitingList
from survey.models.instanceSetting import InstanceSetting
from survey.models.questionAnswer import Practice, Characteristic, AnswerRange, McqAnswer
from survey.views.asnwer import isValidSurveyOption, Demographic, DemographicValue
from django.contrib.auth.decorators import login_required, user_passes_test
from django.conf.urls.static import settings
from django.forms.models import inlineformset_factory
from ..models.candidate import Candidate
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from ..forms.fileUploadForm import UploadFileForm
import random
import os
import json
import string
from xlrd import open_workbook
from datetime import datetime
from django.db.models.query_utils import Q
import operator
from functools import reduce
from email_sender.models.emailTemplate import EmailTemplate
from django.template import RequestContext, Context, Template
from django.contrib.sites.models import Site
from django.core.mail import EmailMultiAlternatives


@login_required(login_url="/accounts/login?next=user_management:home")
def home(request):
    # ctx = RequestContext(request, {'csrf_token': get_token(request), })
    return render(request, 'user_management_home.html')


@login_required(login_url="/accounts/login?next=user_management:manage")
def manage(request):
    # ctx = RequestContext(request, {'csrf_token': get_token(request), })
    return render(request, 'user_management_manage.html')


def flat_user_date(users_list):
    users = []
    for c in users_list:
        if isinstance(c, User) or isinstance(c, UserProfile):
            data = {'id': c.user.id,
                    'first_name': c.user.first_name,
                    'last_name': c.user.last_name,
                    'email': c.user.email,
                    }
            if c.survey_finished:
                data['status'] = 'Finished'
            else:
                if c.user.answer_set.exists():
                    data['status'] = 'Started'
                else:
                    data['status'] = 'Invited'
            users.append(data)
        if isinstance(c, Candidate):
            data = {'id': c.id,
                    'first_name': c.first_name,
                    'last_name': c.last_name,
                    'email': c.email,
                    'status': c.status,
                    }
            users.append(data)
    return users


def get_all_candidate(request):
    # UserProfile.objects.all().exclude(user__is_superuser=True)
    candidates_list = Candidate.objects.all()
    page = int(request.GET.get('page', 0))
    if page:
        paginator = Paginator(candidates_list, 20)
        try:
            candidates = paginator.page(page)
        except PageNotAnInteger:
            candidates = paginator.page(1)
        except EmptyPage:
            candidates = paginator.page(paginator.num_pages)

        users = flat_user_date(candidates.object_list)
        paginatordata = []
        paginatordata.append({'number': candidates.number,
                              'num_pages': candidates.paginator.num_pages})

        data = json.dumps({'users': users, 'paginatordata': paginatordata})
        return HttpResponse(data, content_type='application/json')
    else:
        users = flat_user_date(candidates_list)
        return HttpResponse(json.dumps(users), content_type='application/json')


@login_required
def save_upload(uploaded, filename, raw_data):
    '''
    raw_data: if True, uploaded is an HttpRequest object with the file being
            the raw post data
            if False, uploaded has been submitted via the basic form
            submission and is a regular Django UploadedFile in request.FILES
    '''
    try:
        from io import FileIO, BufferedWriter
        with BufferedWriter(FileIO(filename, "wb")) as dest:

            # if the "advanced" upload, read directly from the HTTP request
            # with the Django 1.3 functionality
            if raw_data:
                foo = uploaded.read(1024)
                while foo:
                    dest.write(foo)
                    foo = uploaded.read(1024)
                    # if not raw, it was a form upload so read in the normal Django chunks fashion
            else:
                for c in uploaded.chunks():
                    dest.write(c)
                    # got through saving the upload, report success
            return True
    except IOError:
        # could not open the file most likely
        pass
    return False


def ajax_upload(request):
    if request.method == "POST":
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            file_contents = request.FILES['qqfile'].read()
            filename = request.FILES['qqfile'].name
        else:
            file_contents = request.read()
            filename = request.GET['qqfile']

        wb = open_workbook(file_contents=file_contents)
        sheet = wb.sheets()[0]
        result = {}
        users_list = []

        for row in range(1, sheet.nrows):
            duplicateinside = False
            duplicate = Candidate.objects.filter(
                email=sheet.cell(row, 2).value)
            if duplicate.count() > 0:
                continue

            if row > 1:
                for i in range(1, row):
                    if i in result:
                        if result[i]['email'] == sheet.cell(row, 2).value:
                            duplicateinside = True
                            break

            if not duplicateinside:
                result[row] = {'first_name': sheet.cell(row, 0).value,
                               'last_name': sheet.cell(row, 1).value,
                               'email': sheet.cell(row, 2).value}

        for r in result:
            c = Candidate.objects.create(first_name=result[r]['first_name'],
                                         last_name=result[r]['last_name'],
                                         email=result[r]['email'])

            c.save()
            users_list.append(c)

        file = open('%s/upload/%s_%s' % (settings.BASE_DIR,
                                         datetime.now().strftime('%d %m %Y %H %M %S %f'), filename), "wb")
        file.write(file_contents)
        file.close()
        return HttpResponse(json.dumps(flat_user_date(users_list)))

        for f in request.FILES:
            return HttpResponse(f)

        if request.is_ajax():
            # the file is stored raw in the request
            upload = request
            is_raw = True
            # AJAX Upload will pass the filename in the querystring if it is the "advanced" ajax upload
            try:
                filename = request.GET['qqfile']
            except KeyError:
                return HttpResponseBadRequest("AJAX request not valid")
            # not an ajax upload, so it was the "basic" iframe version with submission via form
        else:
            is_raw = False
            if len(request.FILES) == 1:
                # FILES is a dictionary in Django but Ajax Upload gives the uploaded file an
                # ID based on a random number, so it cannot be guessed here in the code.
                # Rather than editing Ajax Upload to pass the ID in the querystring,
                # observer that each upload is a separate request,
                # so FILES should only have one entry.
                # Thus, we can just grab the first (and only) value in the dict.
                upload = request.FILES.values()[0]
            else:
                raise Http404("Bad Upload")
            filename = upload.name

    # save the file
        success = save_upload(upload, filename, is_raw)

        # let Ajax Upload know whether we saved it or not
        ret_json = {'success': success}
        return HttpResponse(json.dumps(ret_json))
    return HttpResponse('not post')


def delete_candidate(request):
    ids = request.POST.get('ids', False)
    deletedCandidate = Candidate.objects.filter(pk__in=ids.split(','))
    deletedCandidateemail = deletedCandidate.values_list('email', flat=True)

    if deletedCandidateemail.count():
        users = User.objects.filter(reduce(
            operator.or_, (Q(email__contains=x) for x in set(deletedCandidateemail))))
        users.delete()
    deletedCandidate.delete()
    return HttpResponse(json.dumps('success.'))


def add_candidate(request):
    firstname = request.POST.get('firstname', False)
    lastname = request.POST.get('lastname', False)
    email = request.POST.get('email', False)
    if Candidate.objects.filter(email=email).count():
        return HttpResponse(json.dumps({'error': 'duplicate'}))

    c = Candidate.objects.create(first_name=firstname,
                                 last_name=lastname,
                                 email=email)
    c.save()
    return HttpResponse(json.dumps(flat_user_date([c])))


def update_user(request):
    id = request.POST.get('id', False)
    firstname = request.POST.get('firstname', False)
    lastname = request.POST.get('lastname', False)
    email = request.POST.get('email', False)

    c = Candidate.objects.get(pk=id)
    c.first_name = firstname
    c.last_name = lastname
    c.email = email
    c.save()

    return HttpResponse(json.dumps('success'))


def GenPasswd():
    return ''.join(random.choice(string.ascii_uppercase + string.digits) for x in range(8))


def oldinvite(request):
    ids = []
    if request.method == "POST":
        # fetch welcome_email templates
        #eT = EmailTemplate.objects.get(template_name='welcome_email')
        invitees = Candidate.objects.filter(
            pk__in=request.POST.get('ids', False).split(','))
        for cand in invitees:
            cand.status = 'Invited'
            cand.save()
            ids.append(cand.id)

            password = GenPasswd()

            try:
                user = User.objects.get(username=cand.email)
            except User.DoesNotExist:
                user = User.objects.create_user(
                    cand.email, cand.email, password)
                user.first_name = cand.first_name
                user.last_name = cand.last_name
                user.save()
                profile = user.get_profile()
                profile.first_name = cand.first_name
                profile.last_name = cand.last_name

                # user.save()
                profile.save()
                invitee_welcome_email = EmailTemplate.objects.get(
                    template_name='invitee welcome email')
                text_content = Template(invitee_welcome_email.body_text)
                html_content = Template(invitee_welcome_email.body_html)
                subject_content = Template(invitee_welcome_email.subject)

                site = Site.objects.get_current()

                c = Context({'company': site.name,
                             'company_url': site.domain,
                             'first_name': cand.first_name,
                             'user_name': cand.email,
                             'password': password})

                # print text_content.render(c)
                msg = EmailMultiAlternatives(subject_content.render(c),
                                             text_content.render(c),
                                             invitee_welcome_email.from_email,
                                             [cand.email],
                                             headers={'Reply-To': invitee_welcome_email.reply_to_email})
                msg.attach_alternative(html_content.render(c), "text/html")
                # print  invitee_welcome_email.from_email
                msg.send()
                # print datetime.now().strftime('%d %m %Y %H %M %S %f')

        return HttpResponse(json.dumps(ids))
    return HttpResponse(json.dumps('error'))


def invite(request):
    ids = []
    # print "I'm in invite function"
    if request.method == "POST":
        # UserProfile.objects.filter(pk__in=request.POST.get('ids', False).split(','))
        invitees = Candidate.objects.all()
        for cand in invitees:
            password = GenPasswd()
            try:
                user = User.objects.get(username=cand.email)  # user.email)
                user.set_password(password)
                user.save()
                # print "User  Details: ",cand.first_name, cand.email, password
                Send_EmailToCandidate(cand.first_name, cand.email, password)
            except User.DoesNotExist:
                user = User.objects.create_user(
                    cand.email, cand.email, password)
                user.first_name = cand.first_name
                user.last_name = cand.last_name
                user.save()
                profile = user.get_profile()
                profile.first_name = cand.first_name
                profile.last_name = cand.last_name

                # user.save()
                profile.save()
                # print "New User  Details: ",cand.first_name, cand.email, password
                Send_EmailToCandidate(cand.first_name, cand.email, password)

        return HttpResponse(json.dumps(ids))
    return HttpResponse(json.dumps('error'))


def Send_EmailToCandidate(first_name, email, password):
    invitee_welcome_email = EmailTemplate.objects.get(
        template_name='invitee welcome email')
    text_content = Template(invitee_welcome_email.body_text)
    html_content = Template(invitee_welcome_email.body_html)
    subject_content = Template(invitee_welcome_email.subject)
    site = Site.objects.get_current()
    c = Context({'company': site.name,
                 'company_url': site.domain,
                 'first_name': first_name,
                 'user_name': email,
                 'password': password})

    msg = EmailMultiAlternatives(subject_content.render(c),
                                 text_content.render(c),
                                 invitee_welcome_email.from_email,
                                 [email],
                                 headers={'Reply-To': invitee_welcome_email.reply_to_email})
    msg.attach_alternative(html_content.render(c), "text/html")
    msg.send()


def exclude(request):
    ids = []
    if request.method == "POST":
        for cand in Candidate.objects.filter(pk__in=request.POST.get('ids', False).split(',')):
            cand.status = 'Deleted'
            cand.save()
            ids.append(cand.id)
        return HttpResponse(json.dumps(ids))
    return HttpResponse(json.dumps('error'))


def include(request):
    ids = []
    if request.method == "POST":
        for cand in Candidate.objects.filter(pk__in=request.POST.get('ids', False).split(',')):
            cand.status = 'Invited'
            cand.save()
            ids.append(cand.id)
        return HttpResponse(json.dumps(ids))
    return HttpResponse(json.dumps('error'))


def notify_candidate(request, template_name=None):
    template = get_object_or_404(EmailTemplate, template_name=template_name)
    ids = []
    if request.method == "POST":
        ids = request.POST.get('ids', None).split(',')
        for cand in UserProfile.objects.filter(pk__in=ids):
            text_content = Template(template.body_text)
            html_content = Template(template.body_html)
            c = Context({'company': Site.objects.get_current().domain,
                         'first_name': cand.user.first_name,
                         'user_name': cand.user.email})

            msg = EmailMultiAlternatives(template.subject,
                                         text_content.render(c),
                                         template.from_email,
                                         [cand.user.email],
                                         headers={'Reply-To': template.reply_to_email})
            msg.attach_alternative(html_content.render(c), "text/html")
            msg.send()

        return HttpResponse(json.dumps(ids))
    return HttpResponse(json.dumps('error'))
