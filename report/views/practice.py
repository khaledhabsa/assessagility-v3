from django.shortcuts import render, redirect, get_object_or_404
from survey.models.questionAnswer import (
    Characteristic, McqAnswer, Practice,
    Answer, Indicator, CharacteristicCategory,
    Comment
)
from survey.models.users import UserDemographics, Demographic, DemographicValue, UserProfile, Userprofile_Roles
from survey.models.role import Role
import decimal
from operator import itemgetter
from django.http import HttpResponse
import json
from django.core.cache import cache
from django.db.models.query_utils import Q
from ..tables.characteristic_table import CharacteristicTable
from ..tables.characteristic_table_no_sorted import CharacteristicTableWithNoSort
from ..tables.supervisor_table import SupervisorTable
from ..tables.user_table import UserTable
from ..tables.comment_table import CommentsTable
from django.contrib.auth.decorators import login_required, user_passes_test
from django.db import connection, transaction
from user_management.models.candidate import Candidate
import json
import operator
from ..pdf import organizational_characteristic_pdf, detailed_practice_readings_pdf, agile_maturity_pdf
from django.db import models


def get_practice(request):

    role = request.GET.get('role', False)
    demographics_values = request.GET.get('demographics_values', "")
    if request.method == 'POST':
        role = request.POST.get('role', False)
        demographics_values = request.POST.get('demographics_values', "")

    answers = GetAnswers(request, int(role), demographics_values)
    numberofparticipants = len(set(answers.values_list('user__id', flat=True)))

    mcqanswers = McqAnswer.objects.all()
    characteristics = Characteristic.objects.all()
    chars = {}
    mcqs = {}
    for mcq in mcqanswers:
        mcqs[mcq.id] = mcq

    indicators = get_indicators(answers, mcqs)

    for c in characteristics:
        chars[c.id] = {}
        chars[c.id]['characteristic'] = c
        chars[c.id]['count'] = 0
        chars[c.id]['max'] = 0
        chars[c.id]['min'] = 0

        for i in c.indicators.all():
            if i.id in indicators.keys() and indicators[i.id]['count'] > 0:
                chars[c.id]['count'] = chars[c.id]['count'] + 1
                chars[c.id]['max'] = chars[c.id]['max'] + \
                    (indicators[i.id]['max'] / indicators[i.id]['count'])
                chars[c.id]['min'] = chars[c.id]['min'] + \
                    (indicators[i.id]['min'] / indicators[i.id]['count'])

    practices = Practice.objects.all()
    practices_optimized = []
    for p in practices:
        practices_data = {}
        practices_data['title'] = p.title

        characteristics_optimized = []

        p_count = 0
        p_max = 0
        p_min = 0
        for c in p.characteristics.all():
            characteristic_data = {}
            characteristic_data['id'] = c.id
            characteristic_data['title'] = c.title

            if chars[c.id]['count'] > 0:
                characteristic_data['bar_width'] = round(
                    (chars[c.id]['max'] - chars[c.id]['min']) / chars[c.id]['count'] * decimal.Decimal(2.2))
                characteristic_data['bar_displacement'] = round(
                    (chars[c.id]['min']) / chars[c.id]['count'] * decimal.Decimal(2.2))
                characteristic_data['average'] = round(
                    (chars[c.id]['max'] + chars[c.id]['min']) / chars[c.id]['count'] / decimal.Decimal(2.2))

                characteristics_optimized.append(characteristic_data)
                p_max = p_max + (chars[c.id]['max'] / chars[c.id]['count'])
                p_min = p_min + (chars[c.id]['min'] / chars[c.id]['count'])
                p_count = p_count + 1

        practices_data['characteristics'] = characteristics_optimized

        try:
            practices_data['max'] = p_max/p_count
        except ZeroDivisionError:
            practices_data['max'] = 0
        try:
            practices_data['min'] = p_min/p_count
        except ZeroDivisionError:
            practices_data['min'] = 0
        try:
            practices_data['average'] = (p_max+p_min)/p_count/2
        except ZeroDivisionError:
            practices_data['average'] = 0

        try:
            practices_data['bar_width'] = (p_max - p_min)/p_count*2
        except ZeroDivisionError:
            practices_data['bar_width'] = 0
        try:
            practices_data['bar_displacement'] = p_min/p_count*2
        except ZeroDivisionError:
            practices_data['bar_displacement'] = 0

        practices_optimized.append({'average': int(practices_data['average']*100)/100.0,
                                    'title': practices_data['title'],
                                    'characteristics': characteristics_optimized,
                                    })

    return (sorted(practices_optimized, key=itemgetter('average'), reverse=True), numberofparticipants)


def get_practice_json(request):
    return HttpResponse(json.dumps(get_practice(request)))


def readiness(self):
    cache_key = 'Characteristic_readiness' + str(self.id)
    current_cache = cache.get(cache_key)

    max = 0
    min = 0
    ni = self.indicators.count()
    for i in self.indicators.all():
        imax = 0
        imin = 0
        na = i.answers.count()
        for a in Answer.objects.filter(indicator=i):
            imax += a.mcqanswer.maxValue
            imin += a.mcqanswer.minValue
        if(na > 0):
            max += imax / na
            min += imin / na
    if(ni > 0):
        max = round(max / ni, 2)
        min = round(min / ni, 2)

    current_cache = {'max': max,
                     'min': min,
                     'bar_width': (max - min) * 2,
                     'bar_displacement': min * 2}
    cache.set(cache_key, current_cache, 60 * 60 * 24 * 10)
    return current_cache


def demographic_readiness(self, d, v):
    cache_key = 'Characteristic_readiness' + \
        str(self.id) + ':' + str(d.id) + ':' + str(v.id)
    current_cache = cache.get(cache_key)
    if not current_cache:
        return current_cache

    max = 0
    min = 0
    ni = self.indicators.count()
    for i in self.indicators.all():
        imax = 0
        imin = 0
        na = 0
        for a in Answer.objects.filter(indicator=i):
            try:
                valid = UserDemographics.objects.get(
                    userProfile=a.user.get_profile(), demographic=d, demographic_value=v)
                imax += a.mcqanswer.maxValue
                imin += a.mcqanswer.minValue
                na = na + 1
            except:
                valid = None
        if(na > 0):
            max += imax / na
            min += imin / na
    if(ni > 0):
        max = round(max / ni, 2)
        min = round(min / ni, 2)

    current_cache = {'max': max,
                     'min': min,
                     'bar_width': (max - min) * 2,
                     'bar_displacement': min * 2}
    cache.set(cache_key, current_cache, 60 * 60 * 24 * 10)
    return current_cache


def role_readiness(self, r):
    cache_key = 'Characteristic_readiness' + str(self.id) + ':' + str(r.id)
    current_cache = cache.get(cache_key)
    if current_cache:
        return current_cache

    max = 0
    min = 0
    ni = self.indicators.count()
    for i in self.indicators.all():
        imax = 0
        imin = 0
        na = 0
        for a in Answer.objects.filter(indicator=i):
            if r in a.user.get_profile().roles.all():
                imax += a.mcqanswer.maxValue
                imin += a.mcqanswer.minValue
                na = na + 1
            else:
                valid = None
        if(na > 0):
            max += imax / na
            min += imin / na
    if(ni > 0):
        max = round(max / ni, 2)
        min = round(min / ni, 2)

    current_cache = {'max': max,
                     'min': min,
                     'bar_width': (max - min) * 2,
                     'bar_displacement': min * 2}
    cache.set(cache_key, current_cache, 60 * 60 * 24 * 10)
    return current_cache


def full_practices_readiness(self):

    Characteristic.readiness = readiness
    max = 0
    min = 0
    for c in self.characteristics.all():
        max = max + c.readiness()['max']
        min = min + c.readiness()['min']

    cn = self.characteristics.all().count()

    if cn > 0:
        max = round(max / cn, 2)
        min = round(min / cn, 2)

    return {'max': max, 'min': min, 'bar_width': (max-min)*2, 'bar_displacement': min*2}


def practices_readiness(self, d, v):

    max = 0
    min = 0
    cn = 0
    for c in self['characteristics']:
        if c['max'] > 0:
            max = max + c['max']
            min = min + c['min']
            cn = cn + 1

    if cn > 0:
        max = round(max / cn, 2)
        min = round(min / cn, 2)

    return {'max': max,
            'min': min,
            'bar_width': (max - min) * 2,
            'bar_displacement': min * 2}


def category_readiness(self):

    Characteristic.readiness = readiness
    max = 0
    min = 0
    for c in self.characteristic_set.all():
        max = max + c.readiness()['max']
        min = min + c.readiness()['min']
    cn = self.characteristic_set.all().count()
    if cn > 0:
        max = round(max / cn, 2)
        min = round(min / cn, 2)

    return {'max': max,
            'min': min,
            'bar_width': (max - min) * 2,
            'bar_displacement': min * 2}


def readiness_assessment(request):
    Characteristic.readiness = readiness

    Practice.readiness = full_practices_readiness
    practices = Practice.objects.all()

    return render(request, 'readiness_assessment.html', {'practices': practices, })


def product_line_assessment(request, current_demographic_id, current_demographic_value_id):

    demographics = Demographic.objects.all()
    demographics_list = []
    demographics_list.append({'id': 'role',
                              'title': 'role'})
    demographics_list.append({'id': demographics[0].id,
                              'title': demographics[0].title
                              })

    if current_demographic_id == '-1':
        current_demographic = Demographic.objects.all()[0]
    elif current_demographic_id == 'role':
        current_demographic = {'id': 'role',
                               'title': 'role'}
    else:
        current_demographic = Demographic.objects.get(
            pk=current_demographic_id)

    if current_demographic_id == 'role' and current_demographic_value_id == '-1':
        current_demographic_value = Role.objects.all()[0]
    elif current_demographic_id == 'role':
        current_demographic_value = Role.objects.get(
            pk=current_demographic_value_id)
    elif current_demographic_value_id == '-1':
        current_demographic_value = current_demographic.demographicvalue_set.all()[
            0]
    else:
        current_demographic_value = DemographicValue.objects.get(
            pk=current_demographic_value_id)

    if current_demographic_id == 'role':
        value_list = Role.objects.all()
    else:
        value_list = current_demographic.demographicvalue_set.all()
    practices = Practice.objects.all()
    characteristics = Characteristic.objects.all()

    ps = []
    for p in practices:
        np = {}
        np['title'] = p.title
        cs = []
        for c in p.characteristics.all():
            if current_demographic_id == 'role':
                dr = role_readiness(c, current_demographic_value)
            else:
                dr = demographic_readiness(
                    c, current_demographic, current_demographic_value)

            cs.append({'title': c.title,
                       'bar_width': dr['bar_width'],
                       'bar_displacement': dr['bar_displacement'],
                       'min': dr['min'],
                       'max': dr['max']
                       })
        np['characteristics'] = cs

        pr = practices_readiness(
            np, current_demographic, current_demographic_value)
        np['bar_width'] = pr['bar_width']
        np['bar_displacement'] = pr['bar_displacement']
        np['min'] = pr['min']
        np['max'] = pr['max']

        ps.append(np)

    return render(request, 'demographic_assessment.html', {'demographics': demographics_list,
                                                           'value_list': value_list,
                                                           'current_demographic': current_demographic,
                                                           'current_demographic_value': current_demographic_value,
                                                           'practices': ps})


def range_users(self):
    ur = []
    for ar in self.answer_range.mcqanswer_set.all():
        rusers = Answer.objects.filter(indicator=self, mcqanswer=ar)
        ur.append(rusers)
    return ur


def characteristic_answers(request, characteristic_id):
    Indicator.range_users = range_users
    characteristic = get_object_or_404(Characteristic, pk=characteristic_id)
    demographics = Demographic.objects.all()
    return render(request, 'characteristic_answers.html', {'characteristic': characteristic,
                                                           'demographics': demographics})


def characteristic(request):
    Characteristic.readiness = readiness
    characteristics = []
    for ch in Characteristic.objects.all().annotate(weight=models.Count('practice')).order_by('-weight'):
        r = ch.readiness()
        characteristics.append({'Characteristic': ch.title,
                                'weight': ch.weight,
                                'readiness': '%s : %s' % (int(r['min']), int(r['max'])),
                                })

    table = CharacteristicTable(
        characteristics, order_by=request.GET.get('sort'))
    table.paginate(page=request.GET.get('page', 1))
    return render(request, 'characteristic.html', {"table": table})


def readiness_compare(x, y):
    return cmp(y['readiness'], x['readiness'])


def characteristic_top_5_and_bottom_5(request):
    Characteristic.readiness = readiness
    characteristics = list()
    for ch in Characteristic.objects.all().annotate(weight=models.Count('practice')):
        r = ch.readiness()
        characteristics.append({'Characteristic': ch.title,
                                'weight': ch.weight,
                                'readiness': '%s : %s' % (int(r['min']), int(r['max'])),
                                })
    # (characteristics)
    # characteristics.sort(cmp=readiness_compare, reverse=False)

    table_top_5 = CharacteristicTableWithNoSort(characteristics[0:5])
    table_bottom_5 = CharacteristicTableWithNoSort(
        characteristics[len(characteristics) - 5:len(characteristics)])

    return render(request, 'characteristic_top_5_and_bottom_5.html', {"table_top_5": table_top_5,
                                                                      "table_bottom_5": table_bottom_5})


@login_required
def delete_cache(request):
    cursor = connection.cursor()
    cursor.execute('delete from cache')
    transaction.commit_unless_managed()
    return HttpResponse('cache deleted')


def category_readiness_report(request):
    labels = ''
    values = ''
    CharacteristicCategory.readiness = category_readiness
    for c in CharacteristicCategory.objects.all():
        labels = labels + '|' + c.title
        values = values + ',' + \
            str((c.readiness()['max'] + c.readiness()['min']) / 2)

    values = values[1:]
    if len(values) > 0 and values.index(',') > 0:
        values = values + ',' + values[0:values.index(',')]
    return render(request, 'category_readiness.html', {'labels': labels,
                                                       'values': values})


def optimized_category_readiness_report(request):
    # to exclude delete cadidates answers.
    deletedCandidate = Candidate.objects.values_list(
        'email', flat=True).filter(status='Deleted')
    if deletedCandidate.count() < 1:
        answers = Answer.objects.select_related('user').filter(
            user__profile__survey_finished=True)
    else:
        answers = Answer.objects.select_related('user').filter(reduce(operator.and_, (~Q(
            user__email__contains=x) for x in set(deletedCandidate)))).filter(user__profile__survey_finished=True)

    mcqanswers = McqAnswer.objects.all()
    characteristics = Characteristic.objects.all()
    chars = {}
    mcqs = {}
    for mcq in mcqanswers:
        mcqs[mcq.id] = mcq

    indicators = get_indicators(answers, mcqs)

    for c in characteristics:
        chars[c.id] = {}
        chars[c.id]['characteristic'] = c
        chars[c.id]['count'] = 0
        chars[c.id]['max'] = 0
        chars[c.id]['min'] = 0

        for i in c.indicators.all():
            chars[c.id]['count'] = chars[c.id]['count'] + 1
            chars[c.id]['max'] = chars[c.id]['max'] + \
                (indicators[i.id]['max'] / indicators[i.id]['count'])
            chars[c.id]['min'] = chars[c.id]['min'] + \
                (indicators[i.id]['min'] / indicators[i.id]['count'])

    labels = ''
    values = ''

    for c in CharacteristicCategory.objects.all():
        c.readiness = {}
        c.readiness['max'] = 0
        c.readiness['min'] = 0
        count = 0
        for chr in c.characteristic_set.all():
            count += 1
            c.readiness['max'] += chars[chr.id]['max'] / chars[chr.id]['count']
            c.readiness['min'] += chars[chr.id]['min'] / chars[chr.id]['count']

        c.readiness['max'] = round(c.readiness['max'] / count, 2)
        c.readiness['min'] = round(c.readiness['min'] / count, 2)
        c.readiness['avr'] = round((c.readiness['max']+c.readiness['min'])/2)

        labels = labels + '|' + c.title
        values = values + ',' + str(c.readiness['avr'])

    values = values[1:]
    if len(values) > 0 and values.index(',') > 0:
        values = values + ',' + values[0:values.index(',')]
    return render(request, 'category_readiness.html',
                  {'labels': labels,
                   'values': values})


def comments(request):
    table = CommentsTable(Comment.objects.all(),
                          order_by=request.GET.get('sort'))
    table.paginate(page=request.GET.get('page', 1))

    return render(request, 'comments.html', {"table": table})


def charactristic_pdf(request):
    characteristic = Characteristic.objects.all()
    demographics = [Demographic.objects.get(pk=2), ]

    return render(request, 'Characteristics_pdf.html', {'characteristic': characteristic,
                                                        'demographics': demographics})


@login_required
@user_passes_test(lambda u: u.is_superuser or u.has_perm('survey.change_ticket'))
def practice_pdf(request):

    practices = Practice.objects.all()
    # demographics = [Demographic.objects.get(pk=5), ]

    return render(request, 'Practices_pdf.html', {'practices': practices,
                                                  'demographics': Demographic.objects.filter(pk=5)})


def supervisor_characteristic_readiness(supervisor, characteristic):

    max = 0
    min = 0
    ni = characteristic.indicators.count()
    for i in characteristic.indicators.all():
        imax = 0
        imin = 0
        na = Answer.objects.filter(
            indicator=i, user__profile__supervisor=supervisor).count()
        for a in Answer.objects.filter(indicator=i, user__profile__supervisor=supervisor):
            imax += a.mcqanswer.maxValue
            imin += a.mcqanswer.minValue
        if(na > 0):
            max += imax / na
            min += imin / na
    if(ni > 0):
        max = round(max / ni, 2)
        min = round(min / ni, 2)

    return {'max': max, 'min': min}


def supervisor_practices_readiness(supervisor, practice):
    max = 0
    min = 0
    for c in practice.characteristics.all():
        cr = supervisor_characteristic_readiness(supervisor, c)
        max = max + cr['max']
        min = min + cr['min']

    cn = practice.characteristics.all().count()

    if cn > 0:
        max = round(max / cn, 2)
        min = round(min / cn, 2)

    return {'title': practice.title,
            'max': max,
            'min': min,
            'bar_width': (max - min) * 2,
            'bar_displacement': min * 2}


def department_manager_characteristic_readiness(department_manager, characteristic):

    max = 0
    min = 0
    ni = characteristic.indicators.count()
    for i in characteristic.indicators.all():
        imax = 0
        imin = 0
        na = Answer.objects.filter(
            indicator=i, user__profile__department_manager=department_manager).count()
        for a in Answer.objects.filter(indicator=i, user__profile__department_manager=department_manager):
            imax += a.mcqanswer.maxValue
            imin += a.mcqanswer.minValue
        if(na > 0):
            max += imax / na
            min += imin / na
    if ni > 0:
        max = round(max / ni, 2)
        min = round(min / ni, 2)

    return {'max': max, 'min': min}


def department_manager_practices_readiness(department_manager, practice):
    max = 0
    min = 0
    for c in practice.characteristics.all():
        cr = department_manager_characteristic_readiness(department_manager, c)
        max = max + cr['max']
        min = min + cr['min']

    cn = practice.characteristics.all().count()

    if cn > 0:
        max = round(max / cn, 2)
        min = round(min / cn, 2)
    return {'title': practice.title,
            'max': max,
            'min': min,
            'bar_width': (max - min) * 2,
            'bar_displacement': min * 2}


def groupe_assessment(request, aggregator):
    supervisors = UserProfile.objects.values(aggregator).exclude(
        first_name='admin').distinct().order_by(aggregator)
    practices = Practice.objects.all()
    supervisors_practices = {}
    for sv in supervisors:
        ps = []

        if aggregator == 'supervisor':
            for p in practices:
                ps.append(supervisor_practices_readiness(sv[aggregator], p))
        if aggregator == 'department_manager':
            for p in practices:
                ps.append(department_manager_practices_readiness(
                    sv[aggregator], p))

        supervisors_practices[sv[aggregator]] = ps

    ctx = {'supervisors': supervisors_practices['']}

    return render(request, 'groupe_assessment.html', ctx)


def characteristic_answers_optimized(request, characteristic_id):

    characteristic = get_object_or_404(Characteristic, pk=characteristic_id)
    demographics = GetViewableDemographics()
    roles = Role.objects.all()
    indicators = characteristic.indicators.all()
    ins = {}
    for i in indicators:
        ins[i.id] = {}
        ins[i.id]['indicator'] = i
        ins[i.id]['graph_data'] = {}
        ins[i.id]['graph_data']['role'] = {}
        ins[i.id]['graph_data']['supervisor'] = {}
        ins[i.id]['graph_data']['department_manager'] = {}
        for d in demographics:
            ins[i.id]['graph_data'][d.id] = {}

        for r in roles:
            ins[i.id]['graph_data']['role'][r.id] = {}
            ins[i.id]['graph_data']['role'][r.id]['role'] = r
            ins[i.id]['graph_data']['role'][r.id]['title'] = r.title
            ins[i.id]['graph_data']['role'][r.id]['max'] = 0
            ins[i.id]['graph_data']['role'][r.id]['min'] = 0
            ins[i.id]['graph_data']['role'][r.id]['count'] = 0

    answers = Answer.objects.filter(indicator__in=indicators)
    userprofiles = UserProfile.objects.select_related().all()
    ups = {}
    for p in userprofiles:
        ups[p.user_id] = p

    mcqanswers = McqAnswer.objects.all()
    mcqs = {}
    for m in mcqanswers:
        mcqs[m.id] = m
    userdemographics = UserDemographics.objects.select_related().all()
    uds = {}
    for ud in userdemographics:
        if ud.userProfile_id not in uds.keys():
            uds[ud.userProfile_id] = {}
        uds[ud.userProfile_id][ud.demographic_id] = ud.demographic_value
    not_found_answer_count = 0
    for a in answers:

        if a.user_id not in ups.keys():
            not_found_answer_count += 1
            continue

        t = ins[a.indicator_id]['graph_data']['role'][ups[a.user_id].roles.all()[
            0].id]
        t['count'] += 1
        t['max'] += mcqs[a.mcqanswer_id].maxValue
        t['min'] += mcqs[a.mcqanswer_id].minValue

        supervisor_key = ups[a.user_id].supervisor.strip()
        if supervisor_key not in ins[a.indicator_id]['graph_data']['supervisor'].keys():
            ins[a.indicator_id]['graph_data']['supervisor'][supervisor_key] = {}
            ins[a.indicator_id]['graph_data']['supervisor'][supervisor_key]['title'] = supervisor_key
            ins[a.indicator_id]['graph_data']['supervisor'][supervisor_key]['count'] = 0
            ins[a.indicator_id]['graph_data']['supervisor'][supervisor_key]['max'] = 0
            ins[a.indicator_id]['graph_data']['supervisor'][supervisor_key]['min'] = 0

        t = ins[a.indicator_id]['graph_data']['supervisor'][supervisor_key]
        t['count'] += 1
        t['max'] += mcqs[a.mcqanswer_id].maxValue
        t['min'] += mcqs[a.mcqanswer_id].minValue

        department_manager_key = ups[a.user_id].department_manager.strip()
        if department_manager_key not in ins[a.indicator_id]['graph_data']['department_manager'].keys():
            ins[a.indicator_id]['graph_data']['department_manager'][department_manager_key] = {}
            ins[a.indicator_id]['graph_data']['department_manager'][department_manager_key]['title'] = department_manager_key
            ins[a.indicator_id]['graph_data']['department_manager'][department_manager_key]['count'] = 0
            ins[a.indicator_id]['graph_data']['department_manager'][department_manager_key]['max'] = 0
            ins[a.indicator_id]['graph_data']['department_manager'][department_manager_key]['min'] = 0

        t = ins[a.indicator_id]['graph_data']['department_manager'][department_manager_key]
        t['count'] += 1
        t['max'] += mcqs[a.mcqanswer_id].maxValue
        t['min'] += mcqs[a.mcqanswer_id].minValue

        for d in demographics:
            try:
                demographic_value_key = uds[ups[a.user_id].id][d.id].value
                if demographic_value_key not in ins[a.indicator_id]['graph_data'][d.id].keys():
                    ins[a.indicator_id]['graph_data'][d.id][demographic_value_key] = {}
                    ins[a.indicator_id]['graph_data'][d.id][demographic_value_key]['title'] = demographic_value_key
                    ins[a.indicator_id]['graph_data'][d.id][demographic_value_key]['count'] = 0
                    ins[a.indicator_id]['graph_data'][d.id][demographic_value_key]['max'] = 0
                    ins[a.indicator_id]['graph_data'][d.id][demographic_value_key]['min'] = 0

                t = ins[a.indicator_id]['graph_data'][d.id][demographic_value_key]
                t['count'] += 1
                t['max'] += mcqs[a.mcqanswer_id].maxValue
                t['min'] += mcqs[a.mcqanswer_id].minValue
            except:
                pass
    graphs = []

    for i in ins.values():
        graph = {}
        graph['title'] = i['indicator'].question
        graph['views'] = {}

        ar_labels = ''
        ar_min = ''
        ar_max = ''
        for ar in i['indicator'].answer_range.mcqanswer_set.all():
            ar_labels = ar_labels + '|' + ar.title
            ar_min = ar_min + '|' + str(ar.minValue)
            ar_max = ar_max + '|' + str(ar.maxValue)

        ar_labels = ar_labels[1:]
        ar_max = ar_max[1:]
        ar_min = ar_min[1:]

        for k in i['graph_data'].keys():
            labels = ''
            maxs = ''
            mins = ''
            for r in i['graph_data'][k].values():
                if r['count'] > 0:
                    labels += '|{0} ({1})'.format(r['title'], r['count'])
                    maxs += '|'+str(r['max']/r['count'])
                    mins += '|'+str(r['min']/r['count'])

            labels = labels[1:]
            maxs = maxs[1:]
            mins = mins[1:]
            graph['views'][k] = '<div class="ranges_graph"><div class="graph_info"><div class="answer_labels">' + ar_labels + '</div><div class="answer_min">' + ar_min + \
                '</div><div class="answer_max">' + ar_max + '</div><div class="mins">' + mins + \
                '</div><div class="maxs">' + maxs + \
                '</div><div class="labels">' + labels + '</div></div></div>'

        graphs.append(graph)
    ctx = {'graphs': graphs,
           'characteristic': characteristic,
           #    'title': graphs['title'],
           'demographics': demographics,
           }
    #print("ctx: ", ctx)
    return render(request, 'characteristic_answers_optimized.html', ctx)


@login_required
@user_passes_test(lambda u: u.is_superuser or u.has_perm('survey.change_ticket'))
# @survey_closed_required()
def practice_spectrum(request):
    if request.POST.get('image'):
        return agile_maturity_pdf(request)

    roles = Role.objects.all()
    demographics = GetViewableDemographics()

    return render(request, 'practice_spectrum.html', {'roles': roles,
                                                      'demographics': demographics,
                                                      })


def optimized_category_readiness_report_json(request):
    return HttpResponse(json.dumps(getcategory_radar(request)[0]), content_type='application/json')


def getcategory_radar(request):
    role = request.GET.get('role', False)
    demographics_values = request.GET.get('demographics_values', "")
    if request.method == 'POST':
        role = request.POST.get('role', False)
        demographics_values = request.POST.get('demographics_values', "")

    answers = GetAnswers(request, int(role), demographics_values)
    numberofparticipants = len(set(answers.values_list('user__id', flat=True)))

    mcqanswers = McqAnswer.objects.all()
    characteristics = Characteristic.objects.all()

    chars = {}
    mcqs = {}
    for mcq in mcqanswers:
        mcqs[mcq.id] = mcq

    indicators = get_indicators(answers, mcqs)
    for c in characteristics:
        chars[c.id] = {}
        chars[c.id]['characteristic'] = c
        chars[c.id]['count'] = 0
        chars[c.id]['max'] = 0
        chars[c.id]['min'] = 0

        for i in c.indicators.all():
            if i.id in indicators.keys():
                chars[c.id]['count'] = chars[c.id]['count'] + 1
                chars[c.id]['max'] = chars[c.id]['max'] + \
                    (indicators[i.id]['max'] / indicators[i.id]['count'])
                chars[c.id]['min'] = chars[c.id]['min'] + \
                    (indicators[i.id]['min'] / indicators[i.id]['count'])

    labels = ''
    values = ''

    CharacteristicCategoryData = []
    for c in CharacteristicCategory.objects.all():
        c.readiness = {}
        c.readiness['max'] = 0
        c.readiness['min'] = 0

        count = 0
        c.characteristicTitles = []
        for chr in c.characteristic_set.all():
            if chars[chr.id]['count'] > 0:
                count += 1
                c.readiness['max'] += chars[chr.id]['max'] / \
                    chars[chr.id]['count']
                c.readiness['min'] += chars[chr.id]['min'] / \
                    chars[chr.id]['count']
                c.characteristicTitles.append(
                    {'title': chr.title, 'id': chr.id})

        if(count > 0):
            c.readiness['max'] = round(c.readiness['max']/count, 2)
            c.readiness['min'] = round(c.readiness['min']/count, 2)

        c.readiness['avr'] = round((c.readiness['max']+c.readiness['min'])/2)

        labels = labels + '|' + c.title
        values = values + ',' + str(c.readiness['avr'])
        CharacteristicCategoryData.append({'title': c.title,
                                           'average': round(c.readiness['avr'], 2),
                                           'characteristicTitles': c.characteristicTitles})

    values = values[1:]
    if len(values) > 0 and values.index(',') > 0:
        values = values + ',' + values[0:values.index(',')]

    return (CharacteristicCategoryData, numberofparticipants)


def get_indicators(answers, mcqs):
    indicators = {}
    indicator_ids = answers.values_list('indicator_id', 'mcqanswer_id')
    for ans in indicator_ids:
        ansindicator_id = ans[0]
        ansmcqanswer_id = ans[1]
        if ansindicator_id in indicators:
            indicators[ansindicator_id]['count'] = indicators[ansindicator_id]['count'] + 1
            indicators[ansindicator_id]['max'] = indicators[ansindicator_id]['max'] + \
                mcqs[ansmcqanswer_id].maxValue
            indicators[ansindicator_id]['min'] = indicators[ansindicator_id]['min'] + \
                mcqs[ansmcqanswer_id].minValue
        else:
            indicators[ansindicator_id] = {}
            indicators[ansindicator_id]['count'] = 1
            indicators[ansindicator_id]['max'] = mcqs[ansmcqanswer_id].maxValue
            indicators[ansindicator_id]['min'] = mcqs[ansmcqanswer_id].minValue
    return indicators


@login_required
@user_passes_test(lambda u: u.is_superuser or u.has_perm('survey.change_ticket'))
# @survey_closed_required()
def category_radar(request):
    roles = Role.objects.all()
    demographics = GetViewableDemographics()
    if request.POST.get('image'):
        return organizational_characteristic_pdf(request)

    return render(request, 'category_radar.html', {'roles': roles,
                                                   'demographics': demographics})


def GetAnswers(request, role, demographics_values):
    # print(Answer.objects.filter(user__profile__survey_finished=True))
    # Get only Answers for users who finished thier survies.
    answers = Answer.objects.filter(user__profile__survey_finished=True)
    # Exclude Not Applicable Answers
    answers = answers.exclude(mcqanswer__minValue__lt=0.0)
    # to exclude deleted cadidates answers.
    deleted_candidates = Candidate.objects.filter(status='Deleted')
    emails = deleted_candidates.values_list('email', flat=True)
    answers = answers.exclude(user__email__in=emails)

    # Get only Answers for users who belong to this survey Role.
    if role > 0:
        roles = Userprofile_Roles.objects.filter(
            role__id=role).values_list('userprofile__id', flat=True)
        if roles.count() > 0:
            answers = answers.filter(user__profile__id__in=roles)
        else:
            answers = answers.filter(id=-1)

    # Get only Answers for users who belong to this Demographic Values.
    values = demographics_values.split()
    current_demographic_values = []
    for x in values:
        if int(x) > 0:
            current_demographic_values.append(int(x))

    if len(current_demographic_values) > 0:
        usersprofile = UserDemographics.objects.filter(reduce(operator.and_, (Q(
            demographic_value__id__contains=x) for x in current_demographic_values))).values_list('userProfile__id', flat=True)
        if usersprofile.count() > 0:
            answers = answers.filter(reduce(operator.or_, (Q(
                user__profile__id__contains=x) for x in set(usersprofile))))
        else:
            answers = answers.filter(id=-1)

    return answers


def GetAnswersforRole(answers, role):
    if role > 0:
        usersprofile = Userprofile_Roles.objects.filter(
            role__id=role).values_list('userprofile__id', flat=True)
        if usersprofile.count() > 0:
            answers = answers.filter(reduce(operator.or_, (Q(
                user__profile__id__contains=x) for x in set(usersprofile))))
        else:
            answers = answers.filter(id=-1)

    return answers


def GetViewableDemographics():
    return Demographic.objects.filter(viewable=1)


@user_passes_test(lambda u: u.is_superuser or u.has_perm('survey.change_ticket'))
# @survey_closed_required()
def detailed_practice_readings(request):

    if request.method == "POST" and request.POST.get('image'):
        return detailed_practice_readings_pdf(request)

    result = []
    for practice in Practice.objects.all():
        pr = {'id': practice.pk,
              'title': practice.title,
              'description': practice.description,
              'characteristics': [],
              }

        if request.method == 'POST' and request.POST.get('role') != '-1':
            characteristic_len = practice.characteristics.filter(
                indicators__roles=request.POST['role']).distinct().count()
        else:
            characteristic_len = practice.characteristics.count()

        for characteristic in practice.characteristics.all():
            ch = {'id': characteristic.id,
                  'title': characteristic.title,
                  }

            indicators_len = characteristic.indicators.count()

            mins = []
            maxs = []
            for indicator in characteristic.indicators.all():
                answers = Answer.objects.filter(indicator=indicator)
                answers = answers.exclude(mcqanswer__minValue__lt=0)

                if request.method == 'POST':
                    if request.POST['role'] != '-1':
                        answers = answers.filter(
                            user__profile__roles__pk=request.POST['role'])
                        indicators_len = characteristic.indicators.filter(
                            roles__pk=request.POST['role']).distinct().count()
                        if not indicators_len:
                            indicators_len = 1

                    if request.POST['demographics_values']:
                        for item in request.POST['demographics_values'].strip().split(" "):
                            if item != '-1':
                                item = int(item)
                                answers = answers.filter(
                                    user__profile__userdemographics__demographic_value__pk=item)

                values = answers.values_list(
                    'mcqanswer__minValue', 'mcqanswer__maxValue')
                if values:
                    min = sum([x[0] for x in values])/len(values)
                    mins.append(float(min))
                    max = sum([x[1] for x in values])/len(values)
                    maxs.append(float(max))
                else:
                    mins.append(0)
                    maxs.append(0)
            ch['display_min'] = sum([x*(1.0/indicators_len) for x in mins])
            ch['display_max'] = sum([x*(1.0/indicators_len) for x in maxs])
            ch['bar_width'] = ch['display_max'] - ch['display_min']
            pr['characteristics'].append(ch)
        # print("characteristic_len :", characteristic_len)

        if characteristic_len == 0:
            continue

        pr['display_min'] = sum(
            [x['display_min']*(1.0/characteristic_len) for x in pr['characteristics']])
        pr['display_max'] = sum(
            [x['display_max']*(1.0/characteristic_len) for x in pr['characteristics']])

        pr['bar_width'] = pr['display_max'] - pr['display_min']
        result.append(pr)

    if request.is_ajax():
        data = json.dumps({'practices': result})
        return HttpResponse(data, mimetype='application/json')

    pdf_report = request.POST.get('Report2PDFhidden')
    if pdf_report == 'PDF':
        return DrawReadinessAssessmentOptimizedPDF(result,
                                                   request.POST.get('role'),
                                                   []
                                                   )

    if pdf_report == 'Mail':
        send_pdf_in_email(request, DrawReadinessAssessmentOptimizedPDF(request, practices_optimized, role, current_demographic_values, roles,
                                                                       demographics, 'Detailed Practice Readings', numberofparticipants), request.POST.get('email', ''), 'Detailed Practice Readings')

    return render(request, 'readiness_assessment_optimized.html', {'practices': result,
                                                                   'roles': Role.objects.all(),
                                                                   'demographics': Demographic.objects.filter(viewable=True),
                                                                   })
