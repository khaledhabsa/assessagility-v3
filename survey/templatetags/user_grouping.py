from django import template
from survey.models.graphics import *
from survey.models.instanceSetting import *
from survey.models.macro import *
from survey.models.message import *
from survey.models.option import *
from survey.models.questionAnswer import *
from survey.models.role import *
from survey.models.test import *
from survey.models.users import *


register = template.Library()


def group(answerrange, by):
    g = {}

    if by == 'role':
        for answer in answerrange:
            for role in answer.user.get_profile().roles.all():
                if role.title in g.keys():
                    g[role.title] = g[role.title] + 1
                else:
                    g[role.title] = 1

    else:
        for answer in answerrange:
            try:
                ud = UserDemographics.objects.get(
                    userProfile=answer.user.get_profile(), demographic__id=by)
            except:
                continue
            if ud.demographic_value in g.keys():
                g[ud.demographic_value] = g[ud.demographic_value] + 1
            else:
                g[ud.demographic_value] = 1

    return g.iteritems()


register.filter('group', group)


def chart(answerrange, by):

    value = ''
    label = ''

    g = {}

    if by == 'role':
        for answer in answerrange:
            for role in answer.user.get_profile().roles.all():
                if role.title in g.keys():
                    g[role.title] = g[role.title] + 1
                else:
                    g[role.title] = 1

    else:
        for answer in answerrange:
            try:
                ud = UserDemographics.objects.get(
                    userProfile=answer.user.get_profile(), demographic__id=by)
            except:
                continue
            if ud.demographic_value in g.keys():
                g[ud.demographic_value] = g[ud.demographic_value] + 1
            else:
                g[ud.demographic_value] = 1

    for k, v in g.iteritems():
        value = value + ',' + str(v)
        label = label + '|(' + str(v) + ') ' + str(k)

    value = value[1:]
    label = label[1:]
    googlechart = '<img src="http://chart.apis.google.com/chart?chd=t:' + \
        value + '&chl=' + label + '&chs=240x80&cht=p">'

    return googlechart


register.filter('chart', chart)


def bars(indicator, by):

    answer_range_labels = ''

    ur = []
    for ar in indicator.answer_range.mcqanswer_set.all():
        rusers = Answer.objects.filter(indicator=indicator, mcqanswer=ar)
        ur.append(rusers)
        answer_range_labels = answer_range_labels + '|' + ar.title

    g = []
    value = ''
    label = ''

    if by == 'role':
        for i in range(0, len(ur)):
            mcqanswer_users = ur[i]
            rs = {}
            for r in Role.objects.all():
                rs[r.title] = 0
            g.append(rs)
            for answer in mcqanswer_users:
                for role in answer.user.get_profile().roles.all():

                    g[i][role.title] = g[i][role.title] + 1

    elif by == 'supervisor':
        for i in range(0, len(ur)):
            mcqanswer_users = ur[i]
            sup = {}
            for answer in mcqanswer_users:
                aups = answer.user.get_profile().supervisor.strip()
                if not aups in sup.keys():
                    sup[aups] = 0
                sup[aups] = sup[aups] + 1
            g.append(sup)
    elif by == 'department_manager':
        for i in range(0, len(ur)):
            mcqanswer_users = ur[i]
            sup = {}
            for answer in mcqanswer_users:
                aups = answer.user.get_profile().department_manager.strip()
                if not aups in sup.keys():
                    sup[aups] = 0
                sup[aups] = sup[aups] + 1
            g.append(sup)

    else:
        for i in range(0, len(ur)):
            mcqanswer_users = ur[i]
            dvs = {}
            for dv in Demographic.objects.get(pk=by).demographicvalue_set.all():
                dvs[dv.value] = 0

            g.append(dvs)
            for answer in mcqanswer_users:
                try:
                    ud = UserDemographics.objects.get(
                        userProfile=answer.user.get_profile(), demographic__id=by)
                except:
                    continue

                g[i][ud.demographic_value.value] = g[i][ud.demographic_value.value] + 1

    for k, v in g[0].iteritems():

        label = label + '|' + str(k)

    for j in range(0, len(g[0].keys())):
        value = value + '|'
        for i in range(0, len(g)):
            if i == 0:
                value = value + str(g[i][g[i].keys()[j]])
            else:
                if i < len(g) and j < len(g[i].keys()):
                    value = value + ',' + str(g[i][g[i].keys()[j]])

    value = value[1:]
    label = label[1:]

    answer_range_labels = '0:' + answer_range_labels

    bar_max = 0
    for i in range(0, len(g)):
        current_bar_total = 0
        for j in range(0, len(g[i].keys())):
            current_bar_total = current_bar_total + g[i][g[i].keys()[j]]
        if bar_max < current_bar_total:
            bar_max = current_bar_total

    bar_max = str(bar_max)

    return '<img src="http://chart.apis.google.com/chart?chxl=' + answer_range_labels + '&chxr=1,0,' + bar_max + '&chds=0,' + bar_max + '&chxt=x,y&chbh=120&chs=770x220&cht=bvs&chco=00FFFF,0099FF,0033FF,00FF00,009900,003300,CCFF00,CC9900,CC3300,99FF66,999966,993366&chd=t:' + value + '&chdl=' + label + '" width="770" height="220" alt="" />'


register.filter('bars', bars)


def demographic_bars(indicator, by):
    labels = ''
    values = ''
    i = 0
    g = {}
    n = {}
    for answer in Answer.objects.filter(indicator=indicator):
        if by == 'role':
            t = answer.user.get_profile().roles.all()[0].title
        elif by == 'supervisor':
            t = answer.user.get_profile().supervisor.strip()
        elif by == 'department_manager':
            t = answer.user.get_profile().department_manager.strip()
        else:
            t = UserDemographics.objects.get(
                userProfile=answer.user.get_profile(), demographic=by).demographic_value.value
        if not t in g.keys():
            g[t] = 0
            n[t] = 0

        g[t] = g[t] + answer.mcqanswer.maxValue
        n[t] = n[t] + 1

    for k in g.keys():
        if n[k] > 0:
            g[k] = g[k] / n[k]
        labels = labels + '|t' + k + ',000000,0,' + str(i) + ',13'
        values = values + ',' + str(g[k])
        i = i + 1

    labels = labels[1:]
    values = values[1:]

    return '<img src="http://chart.apis.google.com/chart?chxt=x&chbh=15,1,2&chs=770x220&cht=bhg&chco=3D7930&chd=t:' + values + '&chm=' + labels + '" width="770" height="220" alt="" />'


register.filter('demographic_bars', demographic_bars)


def demographic_ranges(indicator, by):
    labels = ''
    mins = ''
    maxs = ''

    min = {}
    max = {}
    n = {}
    print(indicator)
    for answer in Answer.objects.filter(indicator=indicator):
        if by == 'role':
            try:
                if answer.user:
                    t = answer.user.get_profile().roles.all()[0].title
            except User.DoesNotExist:
                continue
        elif by == 'supervisor':
            t = answer.user.get_profile().supervisor.strip()
        elif by == 'department_manager':
            t = answer.user.get_profile().department_manager.strip()
        else:
            t = UserDemographics.objects.filter(userProfile=answer.user.get_profile(),
                                                demographic=by).demographic_value.value
        if not t in min.keys():
            min[t] = 0
            max[t] = 0
            n[t] = 0

        max[t] = max[t] + answer.mcqanswer.maxValue
        min[t] = min[t] + answer.mcqanswer.minValue
        n[t] = n[t] + 1

    for k in min.keys():
        if n[k] > 0:
            min[k] = min[k] / n[k]
            max[k] = max[k] / n[k]
        labels = labels + '|' + k
        mins = mins + '|' + str(min[k])
        maxs = maxs + '|' + str(max[k])

    ar_labels = ''
    ar_min = ''
    ar_max = ''
    for ar in indicator.answer_range.mcqanswer_set.all():
        ar_labels = ar_labels + '|' + ar.title
        ar_min = ar_min + '|' + str(ar.minValue)
        ar_max = ar_max + '|' + str(ar.maxValue)

    ar_labels = ar_labels[1:]
    ar_max = ar_max[1:]
    ar_min = ar_min[1:]

    labels = labels[1:]
    maxs = maxs[1:]
    mins = mins[1:]

    return '<div class="ranges_graph"><div class="graph_info"><div class="answer_labels">' + ar_labels + '</div><div class="answer_min">' + ar_min + '</div><div class="answer_max">' + ar_max + '</div><div class="mins">' + mins + '</div><div class="maxs">' + maxs + '</div><div class="labels">' + labels + '</div></div></div>'


register.filter('demographic_ranges', demographic_ranges)


def multi(a, b):
    if a:
        return int(a) * int(b)
    else:
        return int(b) * int(b)


register.filter('multi', multi)
