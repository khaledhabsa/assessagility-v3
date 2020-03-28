from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.http import HttpResponse
from survey.models.role import Role
from survey.models.users import UserDemographics, UserProfile
from survey.models.questionAnswer import Indicator, Answer
from survey.models.graphics import Demographic
from ..forms.fileUploadForm import UploadFileForm
from user_management.models.candidate import Candidate
import random
from xlrd import open_workbook


def fake_users(request, group_size):
    for u in User.objects.filter(username__startswith='fake_user'):
        u.delete()
    for i in range(0, int(group_size)):
        User.objects.create_user(
            'fake_user_' + str(i+1), 'fake_user_' + str(i+1) + '@fake.com', 'fake_it')

    return HttpResponse('ok :')


def fake_user_role(request):
    roles = Role.objects.all()
    for u in User.objects.filter(username__startswith='fake_user'):
        profile = u.get_profile()
        profile.roles.add(roles[int(random.random()*len(roles))])
        profile.save()
    return HttpResponse('ok :')


def fake_user_answers(request):
    for u in User.objects.filter(username__startswith='fake_user'):
        indicators = Indicator.objects.filter(
            roles__in=u.get_profile().roles.all()).distinct()
        for i in indicators:
            a = Answer.objects.create(
                indicator=i, user=u, mcqanswer=i.answer_range.mcqanswer_set.all()[int(random.random()*5)])
            a.save()

    return HttpResponse('ok :')


def fake_user_demographics(request):
    demographic = Demographic.objects.all()
    for u in User.objects.filter(username__startswith='fake_user'):
        profile = u.get_profile()
        uds = UserDemographics.objects.filter(userProfile=profile)
        for ud in uds:
            ud.delete()
        for d in demographic:
            ud = UserDemographics.objects.create(userProfile=profile,
                                                 demographic=d,
                                                 demographic_value=d.demographicvalue_set.all()[int(random.random()*len(d.demographicvalue_set.all()))])
            ud.save()

    return HttpResponse('ok :')


def fake_user_with_answer_from_file(request):
    users = []

    if request.method == 'POST':
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            roles = {}
            for r in Role.objects.all():
                roles[r.code] = r

            User.objects.exclude(username='admin').delete()
            Answer.objects.all().delete()
            Candidate.objects.all().delete()
            candidates = []
            wb = open_workbook(file_contents=request.FILES['file'].read())
            demographic = Demographic.objects.all()
            s = wb.sheet_by_index(0)
            for row in range(1, s.nrows):
                u = {'name': s.cell(row, 0).value,
                     'role': s.cell(row, 1).value, }
                users.append(u)
                c = Candidate(first_name=u['name'],
                              last_name=u['name'],
                              email='ex@mple.com',
                              status='Finished')
                candidates.append(c)
                new_user = User.objects.create_user(u['name'], '', '')
                profile = new_user.get_profile()
                profile.roles.add(roles[u['role']])
                profile.save()
                UserDemographics.objects.filter(userProfile=profile).delete()
                ud = []
                for d in demographic:
                    demogr = UserDemographics(userProfile=profile,
                                              demographic=d,
                                              demographic_value=d.demographicvalue_set.all()[int(random.random()*len(d.demographicvalue_set.all()))])
                    ud.append(demogr)
                UserDemographics.objects.bulk_create(ud)
                answers = []
                for i in xrange(2, s.ncols):
                    if s.cell(row, i).value:
                        indicator = Indicator.objects.get(
                            code=s.cell(0, i).value)
                        mcqa = McqAnswer.objects.filter(answerrange=indicator.answer_range).order_by(
                            'pk')[int(s.cell(row, i).value)-1]
                        a = Answer(user=new_user,
                                   indicator=indicator,
                                   mcqanswer=mcqa)
                        answers.append(a)
                Answer.objects.bulk_create(answers)
                UserProfile.objects.filter(
                    id=profile.id).update(survey_finished=True)

            Candidate.objects.bulk_create(candidates)

            return render(request, 'fake_it/new_users_list.html', {'message': 'users list uploaded successfully.',
                                                                   'users': users,
                                                                   'answercount': Answer.objects.all().count(),
                                                                   })
        return HttpResponse('not valid')
    else:
        form = UploadFileForm()
        return render(request, 'usersupload.html', {'form': form})
