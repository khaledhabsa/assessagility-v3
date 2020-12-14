from django.http import HttpResponse
from django.shortcuts import render, redirect
from survey.models.users import UsersWaitingList, UserDemographics, UserProfile
from survey.models.questionAnswer import *
from survey.models.macro import Macro
from survey.models.instanceSetting import InstanceSetting
from django.contrib.sites.models import Site
from django.core.mail import EmailMultiAlternatives
from django.contrib.auth.decorators import login_required
from django.template import RequestContext, loader, Template
from email_sender.models.emailTemplate import EmailTemplate
from xlrd import open_workbook
from survey.models.graphics import *
from survey.models.role import Role
from django.contrib.auth.models import User
from ..forms.fileUploadForm import UploadFileForm
import random
import string
import xlwt


def GenPasswd():
    return ''.join(random.choice(string.ascii_uppercase + string.digits) for x in range(8))


def enroll_users(request):
    patch_size = 10
    users_patch = UsersWaitingList.objects.all()[:patch_size]
    for u in users_patch:
        password = GenPasswd()
        try:
            user = User.objects.get(username=u.email)
        except User.DoesNotExist:
            user = User.objects.create_user(u.email, u.email, password)
            profile = user.get_profile()
            profile.first_name = u.first_name
            profile.last_name = u.last_name

            if u.role != '':
                role = Role.objects.get(code=u.role)
                if not role in profile.roles.all():
                    profile.roles.add(role)
            user.save()
            profile.save()

            dmg = Demographic.objects.get(title="Company Role")
            dmg_vl = DemographicValue.objects.get(
                demographic=dmg, value=u.supervisor)
            UserDemographics.objects.create(userProfile=profile,
                                            demographic=dmg,
                                            demographic_value=dmg_vl)

            dmg = Demographic.objects.get(title="Department")
            val = u.department_manager.split('|')[0]
            if val:
                dmg_vl = DemographicValue.objects.get(
                    demographic=dmg, value=val)
                UserDemographics.objects.create(userProfile=profile,
                                                demographic=dmg,
                                                demographic_value=dmg_vl)

            dmg = Demographic.objects.get(title="Region")
            val = u.department_manager.split('|')[1]
            if val:
                dmg_vl = DemographicValue.objects.get(
                    demographic=dmg, value=val)
                UserDemographics.objects.create(userProfile=profile,
                                                demographic=dmg,
                                                demographic_value=dmg_vl)

            dmg = Demographic.objects.get(title="Area")
            val = u.department_manager.split('|')[2]
            if val:
                dmg_vl = DemographicValue.objects.get(
                    demographic=dmg, value=val)
                UserDemographics.objects.create(userProfile=profile,
                                                demographic=dmg,
                                                demographic_value=dmg_vl)

            profile.did_fill_demographics = True
            profile.save()

            c = RequestContext(request, {'domain': Site.objects.get_current().domain,
                                         'first_name': u.first_name,
                                         'user_name': u.email,
                                         'password': password})
            tpl = EmailTemplate.objects.get(
                template_name='Invitee Welcome Email')
            text_content = Template(tpl.body_text).render(c)
            html_content = Template(tpl.body_html).render(c)

            msg = EmailMultiAlternatives(tpl.subject,
                                         text_content,
                                         tpl.from_email,
                                         [u.email],
                                         headers={'Reply-To': tpl.reply_to_email})
            msg.attach_alternative(html_content, "text/html")
            msg.send()
        u.delete()

    return HttpResponse('ok')


@login_required
def upload_users(request):
    users = []

    if request.method == 'POST':
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            wb = open_workbook(file_contents=request.FILES['file'].read())
            output = ''
            for s in wb.sheets():
                for row in range(s.nrows):
                    if row > 0:
                        output += s.cell(row, 0).value + " <br>"
                        users.append({'first_name': s.cell(row, 0).value,
                                      'last_name': s.cell(row, 1).value,
                                      'email': s.cell(row, 2).value, })

                        dpr = '{0}|{1}|{2}'.format(s.cell(row, 5).value, s.cell(
                            row, 6).value, s.cell(row, 7).value)
                        waiting_user = UsersWaitingList.objects.create(first_name=s.cell(row, 0).value,
                                                                       last_name=s.cell(
                                                                           row, 1).value,
                                                                       email=s.cell(
                                                                           row, 2).value,
                                                                       role=s.cell(
                                                                           row, 3).value,
                                                                       supervisor=s.cell(
                                                                           row, 4).value,
                                                                       department_manager=dpr)
                        waiting_user.save()

            return render(request, 'new_users_list.html', {'users': users})
        return HttpResponse('not valid')
    else:
        form = UploadFileForm()
    return render(request, 'usersupload.html', {'form': form})


@login_required
def upload_users_simple(request):
    if request.method == 'GET':
        form = UploadFileForm()
        return render(request, 'usersupload.html', {'form': form})
    if request.method == 'POST':
        wb = open_workbook(file_contents=request.FILES['file'].read())
        for s in wb.sheets():
            for row in range(s.nrows):
                if row > 0:
                    first_name = s.cell(row, 0).value,
                    last_name = s.cell(row, 1).value,
                    email = s.cell(row, 2).value
                    try:
                        user = User.objects.get(username=email)
                    except User.DoesNotExist:
                        password = GenPasswd()
                        user = User.objects.create_user(email, email, password)
                        profile = user.get_profile()
                        profile.first_name = first_name
                        profile.last_name = last_name
                        profile.save()
                        user.save()
                        c = RequestContext(request, {'domain': Site.objects.get_current().domain,
                                                     'first_name': first_name,
                                                     'user_name': email,
                                                     'password': password})
                        tpl = EmailTemplate.objects.get(
                            template_name='Invitee Welcome Email')
                        text_content = Template(tpl.body_text).render(c)
                        html_content = Template(tpl.body_html).render(c)
                       # msg = EmailMultiAlternatives(tpl.subject,
                        #                             text_content,
                        #                            tpl.from_email,
                        #                           [email],
                        #                          headers={'Reply-To': tpl.reply_to_email})
                       # msg.attach_alternative(html_content, "text/html")
                       # msg.send()
        return render(request, 'new_users_list.html', {})


@login_required
def export_db(request):
    response = HttpResponse(content_type="application/ms-excel")
    response['Content-Disposition'] = 'attachment; filename=DrAgile.xls'
    wb = xlwt.Workbook()
    style = xlwt.easyxf('align: wrap 1;')
    # practices
    ws = wb.add_sheet('practices')
    ws.col(1).width = 256 * 50
    ws.col(2).width = 256 * 80
    row = 0
    ws.write(row, 0, 'Code')
    ws.write(row, 1, 'Title')
    ws.write(row, 2, 'Description')
    ws.write(row, 3, 'characteristic-1')
    ws.write(row, 4, 'characteristic-2')
    ws.write(row, 5, 'characteristic-3')
    ws.write(row, 6, 'characteristic-4')
    for p in Practice.objects.all():
        row = row + 1
        ws.write(row, 0, p.code)
        ws.write(row, 1, p.title, style)
        ws.write(row, 2, p.description, style)
        characteristicindex = 0
        for c in p.characteristics.all():
            ws.write(row, 3 + characteristicindex, c.code)
            characteristicindex = characteristicindex + 1

    # characteristic
    ws = wb.add_sheet('characteristic')
    ws.col(1).width = 256 * 50
    ws.col(2).width = 256 * 80
    row = 0
    ws.write(row, 0, 'Code')
    ws.write(row, 1, 'Title')
    ws.write(row, 2, 'Description')
    ws.write(row, 3, 'Category')
    ws.write(row, 4, 'indicators-1')
    ws.write(row, 5, 'indicators-2')
    ws.write(row, 6, 'indicators-3')
    for c in Characteristic.objects.all():
        row = row + 1
        ws.write(row, 0, c.code)
        ws.write(row, 1, c.title, style)
        ws.write(row, 2, c.description, style)
        if c.characteristic_category:
            ws.write(row, 3, c.characteristic_category.title)
        indicatorindex = 0
        for i in c.indicators.all():
            ws.write(row, 4 + indicatorindex, i.code)
            indicatorindex = indicatorindex + 1

    # CharacteristicCategory
    ws = wb.add_sheet('CharacteristicCategory')
    ws.col(0).width = 256 * 50
    row = 0
    ws.write(row, 0, 'title')

    for cc in CharacteristicCategory.objects.all():
        row = row + 1
        ws.write(row, 0, cc.title)

    # indicator
    ws = wb.add_sheet('indicator')
    ws.col(1).width = 256 * 80
    row = 0
    ws.write(row, 0, 'Code')
    ws.write(row, 1, 'Indicator')
    ws.write(row, 2, 'Answer-set')
    ws.write(row, 3, 'Role-1')
    ws.write(row, 4, 'Role-2')
    ws.write(row, 5, 'Role-3')
    ws.write(row, 6, 'Role-4')
    for i in Indicator.objects.all():
        row = row + 1
        ws.write(row, 0, i.code)
        ws.write(row, 1, i.question, style)
        ws.write(row, 2, i.answer_range.title)
        roleindex = 0
        for r in i.roles.all():
            ws.write(row, 3 + roleindex, r.code)
            roleindex = roleindex + 1

    # roles
    ws = wb.add_sheet('roles')
    ws.col(0).width = 256 * 50
    ws.col(1).width = 256 * 50
    ws.col(2).width = 256 * 80
    row = 0
    ws.write(row, 0, 'code')
    ws.write(row, 1, 'title')
    ws.write(row, 2, 'Description', style)
    ws.write(row, 3, 'rank')

    for r in Role.objects.all():
        row = row + 1
        ws.write(row, 0, r.code)
        ws.write(row, 1, r.title)
        ws.write(row, 2, r.description, style)
        ws.write(row, 3, r.rank)

    # answer-set
    ws = wb.add_sheet('answer-set')
    row = 0
    ws.write(row, 0, 'Code')
    ws.write(row, 1, 'A1')
    ws.write(row, 2, 'A1-min')
    ws.write(row, 3, 'A1-max')
    ws.write(row, 4, 'A2')
    ws.write(row, 5, 'A2-min')
    ws.write(row, 6, 'A2-max')
    ws.write(row, 7, 'A3')
    ws.write(row, 8, 'A3-min')
    ws.write(row, 9, 'A3-max')
    ws.write(row, 10, 'A4')
    ws.write(row, 11, 'A4-min')
    ws.write(row, 12, 'A4-max')
    ws.write(row, 13, 'A5')
    ws.write(row, 14, 'A5-min')
    ws.write(row, 15, 'A5-max')
    for a in AnswerRange.objects.all():
        row = row + 1
        ws.write(row, 0, a.title)
        micqindex = 0
        for mcq in a.mcqanswer_set.all():
            ws.write(row, 1 + micqindex * 3, mcq.title)
            ws.write(row, 1 + micqindex * 3 + 1, mcq.minValue)
            ws.write(row, 1 + micqindex * 3 + 2, mcq.maxValue)
            micqindex = micqindex + 1

    # Macro
    ws = wb.add_sheet('Macro')
    ws.col(0).width = 256 * 50
    ws.col(1).width = 256 * 80
    row = 0
    ws.write(row, 0, 'place_holder')
    ws.write(row, 1, 'translation', style)
    for m in Macro.objects.all():
        row = row + 1
        ws.write(row, 0, m.place_holder)
        ws.write(row, 1, m.translation, style)

    wb.save(response)
    return response


@login_required
def import_db(request):

    if request.method == 'POST':
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            wb = open_workbook(file_contents=request.FILES['file'].read())
            error = ''
            # Macro
            Macro.objects.all().delete()
            ws = wb.sheet_by_name('Macro')
            for row in range(ws.nrows):
                if row > 0:
                    current_macro = Macro.objects.create(place_holder=ws.cell(
                        row, 0).value, translation=ws.cell(row, 1).value)
                    current_macro.save()

            # roles
            Role.objects.all().delete()
            ws = wb.sheet_by_name('roles')
            for row in range(ws.nrows):
                if row > 0:
                    current_role = Role.objects.create(code=ws.cell(row, 0).value, title=ws.cell(
                        row, 1).value, description=ws.cell(row, 2).value, rank=ws.cell(row, 3).value)
                    current_role.save()

            # answer-set
            McqAnswer.objects.all().delete()
            AnswerRange.objects.all().delete()
            ws = wb.sheet_by_name('answer-set')
            for row in range(1, ws.nrows):
                current_answer_range = AnswerRange.objects.create(
                    title=ws.cell(row, 0).value)
                current_answer_range.save()
                for index, number in enumerate(range(int((ws.ncols-1)/3))):
                    current_mcq = McqAnswer.objects.create(answerrange=current_answer_range,
                                                           title=ws.cell(
                                                               row, 1+index*3).value,
                                                           minValue=ws.cell(
                                                               row, 1+index*3+1).value,
                                                           maxValue=ws.cell(
                                                               row, 1+index*3+2).value
                                                           )
                    current_mcq.save()

            # CharacteristicCategory
            CharacteristicCategory.objects.all().delete()
            ws = wb.sheet_by_name('CharacteristicCategory')
            for row in range(ws.nrows):
                if row > 0:
                    current_CharacteristicCategory = CharacteristicCategory.objects.create(
                        title=ws.cell(row, 0).value)
                    current_CharacteristicCategory.save()

            # indicator
            Indicator.objects.all().delete()
            ws = wb.sheet_by_name('indicator')
            for row in range(ws.nrows):
                if row > 0:
                    try:
                        ar = AnswerRange.objects.get(
                            title=ws.cell(row, 2).value)
                    except:
                        print('Exception here')

                        return HttpResponse(ws.cell(row, 2).value + ' not found in answer range')
                    current_indicator = Indicator.objects.create(code=ws.cell(row, 0).value,
                                                                 question=ws.cell(
                                                                     row, 1).value,
                                                                 answer_range=ar
                                                                 )
                    for i in range(3, ws.ncols):
                        if not ws.cell(row, i).value == '':
                            try:
                                current_indicator.roles.add(
                                    Role.objects.get(code=ws.cell(row, i).value))
                            except:
                                error += "bad roles code :" + \
                                    ws.cell(row, i).value + "<br>"
                    current_indicator.save()

            if not error == '':
                return HttpResponse(error)

            # characteristic
            Characteristic.objects.all().delete()
            ws = wb.sheet_by_name('characteristic')

            for row in range(ws.nrows):
                if row > 0:
                    current_characteristic = Characteristic.objects.create(code=ws.cell(row, 0).value,
                                                                           title=ws.cell(
                                                                               row, 1).value,
                                                                           description=ws.cell(row, 2).value)
                    if not ws.cell(row, 3).value == '':
                        current_characteristic.characteristic_category = CharacteristicCategory.objects.get(
                            title=ws.cell(row, 3).value)

                    for i in range(4, ws.ncols):
                        if not ws.cell(row, i).value == '':
                            try:
                                current_characteristic.indicators.add(
                                    Indicator.objects.get(code=ws.cell(row, i).value))
                            except:
                                error += "bad indicators code :{0} <br>".format(
                                    ws.cell(row, i).value)
                    current_characteristic.save()

            if error:
                return HttpResponse(error)

            # practices
            Practice.objects.all().delete()
            ws = wb.sheet_by_name('practices')
            for row in range(ws.nrows):
                if row > 0:
                    current_practice = Practice.objects.create(code=ws.cell(row, 0).value,
                                                               title=ws.cell(
                                                                   row, 1).value,
                                                               description=ws.cell(
                                                                   row, 2).value,
                                                               )

                    for i in range(3, ws.ncols):
                        if ws.cell(row, i).value:
                            try:
                                current_practice.characteristics.add(
                                    Characteristic.objects.get(code=ws.cell(row, i).value))
                            except:
                                error += 'bad characteristic code {0} <br>'.format(
                                    ws.cell(row, i).value)
                    current_practice.save()

            if not error == '':
                return HttpResponse(error)

            Answer.objects.all().delete()
            return HttpResponse('ok')
        return HttpResponse('not valid')
    else:
        form = UploadFileForm()
    return render(request, 'upload_db.html', {'form': form})


@login_required
def export_role_questions(request, mode):
    response = HttpResponse(content_type="application/ms-excel")
    response['Content-Disposition'] = 'attachment; filename=DrAgile_role_questions.xls'
    wb = xlwt.Workbook()
    style_wrap = xlwt.easyxf('align: wrap 1;')
    style_characteristic = xlwt.easyxf(
        'font: bold on; align: wrap on, vert centre, horiz center; pattern: pattern solid, fore-colour grey25')

    macros = Macro.objects.all()

    for r in Role.objects.all():
        ws = wb.add_sheet(r.code)
        ws.col(0).width = 256 * 120

        row = 0
        for c in Characteristic.objects.all().order_by('title'):
            if c.indicators.filter(roles__in=[r, ]).count() > 0:
                ws.write(row, 0, c.title, style_characteristic)
                row = row + 1
                for i in c.indicators.filter(roles__in=[r, ]).order_by('answer_range'):
                    if mode == 'translate':
                        q = i.question
                        for m in macros:
                            if not '#' in m.place_holder:
                                q = q.replace(m.place_holder, m.translation)
                                q = q.replace(
                                    '$#' + m.place_holder.replace('$', '') + '#$', '#' + m.translation + '#')

                        ws.write(row, 0, q, style_wrap)
                    else:
                        ws.write(row, 0, i.question, style_wrap)
                    row = row + 1
    wb.save(response)
    return response


@login_required
def export_characteristic(request, mode):
    response = HttpResponse(content_type="application/ms-excel")
    response['Content-Disposition'] = 'attachment; filename=DrAgile_characteristic.xls'
    wb = xlwt.Workbook()
    style_wrap = xlwt.easyxf('align: wrap 1;')
    style_characteristic = xlwt.easyxf(
        'font: bold on; align: wrap on, vert centre, horiz center; pattern: pattern solid, fore-colour grey25')

    macros = Macro.objects.all()

    ws = wb.add_sheet('characteristic')
    ws.col(0).width = 256 * 15
    ws.col(1).width = 256 * 100
    row = 0
    for c in Characteristic.objects.all().order_by('code'):

        ws.write(row, 0, c.code, style_characteristic)
        ws.write(row, 1, c.title, style_characteristic)
        for i in range(2, 10):
            ws.write(row, i, '', style_characteristic)

        row += 1
        for i in c.indicators.all():
            ws.write(row, 0, i.code)

            if mode == 'translate':
                q = i.question
                for m in macros:
                    if not '#' in m.place_holder:
                        q = q.replace(m.place_holder, m.translation)
                        q = q.replace(
                            '$#' + m.place_holder.replace('$', '') + '#$', '#' + m.translation + '#')

                ws.write(row, 1, q, style_wrap)
            else:
                ws.write(row, 1, i.question, style_wrap)

            role_index = 2
            for r in i.roles.all().order_by('title'):
                ws.write(row, role_index, r.title)
                ws.col(role_index).width = 256 * 16
                role_index = role_index + 1
            row = row + 1

    wb.save(response)
    return response


def export_not_started_users(request, mode):
    response = HttpResponse(content_type="application/ms-excel")
    response['Content-Disposition'] = 'attachment; filename=DrAgile_not_started_users.xls'
    wb = xlwt.Workbook()
    style_wrap = xlwt.easyxf('align: wrap 1;')

    ws = wb.add_sheet('users')
    ws.col(0).width = 256 * 30
    ws.col(1).width = 256 * 30
    ws.col(2).width = 256 * 30
    ws.col(3).width = 256 * 30
    ws.col(4).width = 256 * 30
    ws.col(5).width = 256 * 30

    row = 0

    ws.write(row, 0, 'First Name', style_wrap)
    ws.write(row, 1, 'Last Name', style_wrap)
    ws.write(row, 2, 'Email', style_wrap)
    ws.write(row, 3, 'Role', style_wrap)
    ws.write(row, 4, 'supervisor', style_wrap)
    ws.write(row, 5, 'department_manager', style_wrap)
    row += 1

    for up in UserProfile.objects.filter(did_fill_demographics=False, survey_finished=False):
        if up.first_name:
            ws.write(row, 0, up.first_name)
            ws.write(row, 1, up.last_name)
            ws.write(row, 2, up.user.email)
            ws.write(row, 4, up.supervisor)
            row += 1

    if mode == 'delete':
        for up in UserProfile.objects.filter(did_fill_demographics=False, survey_finished=False):
            up.user.delete()

    wb.save(response)
    return response


def export_in_progress_users(request):
    response = HttpResponse(content_type="application/ms-excel")
    response['Content-Disposition'] = 'attachment; filename=DrAgile_in_progress_users.xls'
    wb = xlwt.Workbook()
    style_wrap = xlwt.easyxf('align: wrap 1;')

    ws = wb.add_sheet('users')
    ws.col(0).width = 256 * 30
    ws.col(1).width = 256 * 30
    ws.col(2).width = 256 * 30
    ws.col(3).width = 256 * 30
    ws.col(4).width = 256 * 30
    ws.col(5).width = 256 * 30

    row = 0

    ws.write(row, 0, 'First Name', style_wrap)
    ws.write(row, 1, 'Last Name', style_wrap)
    ws.write(row, 2, 'Email', style_wrap)
    ws.write(row, 3, 'Role', style_wrap)
    ws.write(row, 4, 'supervisor', style_wrap)
    ws.write(row, 5, 'department_manager', style_wrap)
    ws.write(row, 6, 'questions', style_wrap)
    ws.write(row, 7, 'answered', style_wrap)
    ws.write(row, 8, 'progress', style_wrap)
    row += 1

    for up in UserProfile.objects.filter(did_fill_demographics=True, survey_finished=False):
        ws.write(row, 0, up.first_name)
        ws.write(row, 1, up.last_name)
        ws.write(row, 2, up.user.email)
        ws.write(row, 3, up.roles.all()[0].title)
        ws.write(row, 4, up.supervisor)
        ws.write(row, 5, up.department_manager)

        questions_count = Indicator.objects.filter(
            roles__in=up.roles.all()).count()
        answers_count = Answer.objects.filter(user=up.user).count()
        if questions_count > 0:
            progress = int(float(answers_count) / questions_count * 100)
        else:
            progress = 0

        ws.write(row, 6, questions_count)
        ws.write(row, 7, answers_count)
        ws.write(row, 8, progress)
        row += 1

    wb.save(response)
    return response


def test(request):

    html_content = loader.get_template(InstanceSetting.objects.get(
        code='email_template_enrollment_html').value)
    c = {'domain': Site.objects.get_current().domain,
         'first_name': 'Hossam',
         'user_name': 'hossamzain@santeon.com',
         'password': 'password'}

    return HttpResponse(html_content.render(c))
