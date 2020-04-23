import os
import json
import urllib.request
import urllib.parse
from django.conf.urls.static import settings
from survey.models.role import Role
from survey.models.graphics import DemographicValue
from PIL import Image
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
import base64


def underline(c, y):
    c.setLineWidth(1)
    c.setStrokeColor(colors.HexColor('#c7c6c7'))
    c.line(15, y, 600, y)
    c.setStrokeColor(colors.HexColor('#595657'))
    c.line(15, y+1, 600, y+1)


def draw_report_header(c, request, report_name):
    logopath = os.path.join(settings.BASE_DIR,
                            'static', 'images', 'logo.png')
    x = 15
    y = 15

    c.saveState()
    c.translate(0, y)
    c.scale(1, -1)
    c.drawImage(logopath, 440, -1*y-25, height=40, width=150, mask='auto')
    c.restoreState()

    c.setFont("Helvetica", 16)
    c.drawString(x, y+25, report_name.upper())

    y += 55
    underline(c, y)


def draw_segmentation(c, request):
    role = "All Roles"
    if request.POST['role'] != '-1':
        role = Role.objects.get(pk=request.POST['role'])
        role = role.title
    demographics = {}

    for item in request.POST['demographics_values'].strip().split('+'):
        if item != '-1':
            try:
                dv = DemographicValue.objects.get(pk=item)
                demographics[dv.demographic.title] = dv.value
            except:
                pass
    if not demographics:
        demographics = "All"

    x = 15
    y = 90
    c.setFont('Helvetica', 15)
    c.setFillColor(colors.HexColor('#000000'))
    c.drawString(x, y, 'SEGMENTATION')
    y += 20
    c.setFont('Helvetica', 12)
    c.drawString(x, y, 'Role: {0} '.format(role))
    y += 20
    if demographics == 'All':
        c.drawString(x, y, 'Demographics: All')
        y += 15
    else:
        for key, value in demographics.items():
            c.drawString(x, y, '{0} : {1}'.format(key, value))
            y += 15

    underline(c, y)

    return y+1


def draw_base64_image(c, request, w=None, h=None, y=None):
    tmpfile = os.path.join(settings.BASE_DIR, 'upload', 'tmp_img.png')
    data = urllib.parse.unquote(request.POST['image'], encoding="utf-8")
    raw_data = data.split(',')[1]
    fh = open(tmpfile, "wb")

    fh.write(base64.b64decode(raw_data))
    fh.close()

    x = 15
    c.saveState()
    c.translate(x, 0)
    c.scale(1, -1)

    img = Image.open(tmpfile)
    width, height = img.size
    if h:
        h = min(height, h)
        c.drawImage(tmpfile, 0, -1*(y+h),  width=w,
                    height=h, preserveAspectRatio=True)
    else:
        c.drawImage(tmpfile, x, -1*(y+height), width=w)
    c.restoreState()


def detect_color(value):
    if 0 <= value <= 9.99:
        return '#ee3c23'
    if 10 <= value <= 19.99:
        return '#ef7624'
    if 20 <= value <= 29.99:
        return '#ec9b26'
    if 30 <= value <= 39.99:
        return '#e8b127'
    if 40 <= value <= 49.99:
        return '#e4c027'
    if 50 <= value <= 59.99:
        return '#e2d528'
    if 60 <= value <= 69.99:
        return '#a0cc3a'
    if 70 <= value <= 79.99:
        return '#69bd45'
    if 80 <= value <= 89.99:
        return '#28aa4a'
    if 90 <= value <= 100.99:
        return '#188a43'
    return '#ffffff'


def organizational_characteristic_pdf(request):
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="Organizational Characteristic Assessment.pdf"'
    c = canvas.Canvas(response, pagesize=A4, bottomup=0)
    draw_report_header(c, request, "Organizational Characteristic Assessment")
    y = draw_segmentation(c, request)
    total_width, total_height = A4
    draw_base64_image(c, request, w=total_width-30,
                      h=total_height-y-40, y=y+20)
    c.showPage()

    x = 15
    y = 30
    c.setFillColor(colors.HexColor('#000000'))
    c.setFont('Helvetica', 15)
    c.drawString(x, y, 'Legend')
    y += 20

    report_data = urllib.parse.unquote(request.POST['data'], encoding="utf8")
    report_data = json.loads(report_data)

    for item in report_data:
        underline(c, y)
        c.setFont('Helvetica', 12)
        c.setFillColor(colors.HexColor('#000000'))
        y += 20
        txt = '{0}'.format(item['title'].replace('+', ' '))
        c.drawString(x, y, txt)
        c.setFillColor(colors.HexColor('#e5e5e5'))
        c.rect(350, y-10, 200, 15, stroke=0, fill=1)
        color = detect_color(item['average'])
        c.setFillColor(colors.HexColor(color))
        width = 200*float(item['average'])/100
        c.rect(350, y-10, width, 15, stroke=0, fill=1)

        c.setFillColor(colors.HexColor('#ffffff'))
        c.setFontSize(10)
        val = '{0:.2f}'.format(item['average'])
        c.drawString(width+350-25, y, val)

        y += 20
        if y > 750:
            c.showPage()
            y = 30

        c.setFont('Helvetica', 10)
        for subitem in item['characteristicTitles']:
            c.setFillColor(colors.HexColor('#000'))
            try:
                txt = u'{0}'.format(subitem.replace('+', ' '))
                c.drawString(350, y, txt)
            except:
                pass

            y += 20
            if y > 750:
                c.showPage()
                c.setFont('Helvetica', 10)
                y = 50
    c.showPage()
    c.save()
    return response


def detailed_practice_readings_pdf(request):
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="Detailed Practice Readings.pdf"'
    c = canvas.Canvas(response, pagesize=A4, bottomup=0)
    draw_report_header(c, request, "Detailed Practice Readings")
    y = draw_segmentation(c, request)
    total_width, total_height = A4
    draw_base64_image(c, request, w=total_width-30,
                      h=total_height-y-40, y=y+20)
    c.showPage()

    x = 15
    y = 30
    c.setFillColor(colors.HexColor('#000000'))
    c.setFont('Helvetica', 15)
    c.drawString(x, y, 'Legend')
    y += 20

    report_data = urllib.parse.unquote(request.POST['data'], encoding="utf8")
    report_data = json.loads(report_data)

    for item in report_data:
        underline(c, y)
        c.setFont('Helvetica', 12)
        c.setFillColor(colors.HexColor('#000000'))
        y += 20
        txt = u'{0}'.format(item['title'].replace('+', ' '))
        c.drawString(x, y, txt)
        c.setFillColor(colors.HexColor('#e5e5e5'))
        c.rect(400, y-10, 200, 15, stroke=0, fill=1)
        color = detect_color(float(item['display_max']+item['display_min'])/2)
        c.setFillColor(colors.HexColor(color))
        width = 200*float(item['display_max']-item['display_min'])/100
        left = 400+item['display_min']*2
        right = 400+item['display_max']*2
        c.rect(left, y-10, width, 15, stroke=0, fill=1)
        c.setFillColor(colors.HexColor('#ffffff'))
        c.setFontSize(8)
        left_val = '{0:.0f}'.format(item['display_min'])
        right_val = '{0:.0f}'.format(item['display_max'])
        c.drawString(left+2, y, left_val)
        c.drawString(right-18, y, right_val)

        y += 20
        if y > 750:
            c.showPage()
            y = 30

        for subitem in item['characteristics']:
            c.setFont('Helvetica', 10)
            c.setFillColor(colors.HexColor('#000'))
            txt = u'{0}'.format(subitem['title'].replace('+', ' '))
            c.drawString(150, y, txt)

            c.setFillColor(colors.HexColor('#e5e5e5'))
            c.rect(400, y-10, 200, 15, stroke=0, fill=1)
            color = detect_color(
                float(subitem['display_max']+subitem['display_min'])/2)
            c.setFillColor(colors.HexColor(color))
            width = 200*float(subitem['display_max'] -
                              subitem['display_min'])/100
            left = 400+subitem['display_min']*2
            right = 400+subitem['display_max']*2
            c.rect(left, y-10, width, 15, stroke=0, fill=1)
            c.setFillColor(colors.HexColor('#ffffff'))
            c.setFontSize(8)
            left_val = '{0:.0f}'.format(subitem['display_min'])
            right_val = '{0:.0f}'.format(subitem['display_max'])
            c.drawString(left+2, y, left_val)
            c.drawString(right-18, y, right_val)

            y += 20
            if y > 750:
                c.showPage()
                y = 50

    c.save()
    return response


def agile_maturity_pdf(request):
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="Agile Maturity by Practice.pdf"'
    c = canvas.Canvas(response, pagesize=A4, bottomup=0)
    draw_report_header(c, request, "Agile Maturity by Practice")
    y = draw_segmentation(c, request)
    total_width, total_height = A4
    draw_base64_image(c, request, w=total_width-30,
                      h=total_height-y-40, y=y+20)
    c.showPage()

    x = 15
    y = 30
    c.setFillColor(colors.HexColor('#000000'))
    c.setFont('Helvetica', 15)
    c.drawString(x, y, 'Legend')
    y += 20

    report_data = urllib.parse.unquote(request.POST['data'], encoding="utf8")
    report_data = json.loads(report_data)

    for item in report_data:
        underline(c, y)
        c.setFont('Helvetica', 12)
        c.setFillColor(colors.HexColor('#000000'))
        y += 20
        txt = u'{0}'.format(item['title'].replace('+', ' '))
        c.drawString(x, y, txt)
        c.setFillColor(colors.HexColor('#e5e5e5'))
        c.rect(400, y-10, 200, 15, stroke=0, fill=1)
        color = detect_color(item['average'])
        c.setFillColor(colors.HexColor(color))
        width = 200*float(item['average'])/100
        c.rect(400, y-10, width, 15, stroke=0, fill=1)

        c.setFillColor(colors.HexColor('#ffffff'))
        c.setFontSize(10)
        val = '{0:.2f}'.format(item['average'])
        c.drawString(width+400-25, y, val)

        y += 20
        if y > 750:
            c.showPage()
            y = 30

        c.setFont('Helvetica', 10)
        for subitem in item['characteristics']:
            c.setFillColor(colors.HexColor('#000'))
            txt = u'{0}'.format(subitem['title'].replace('+', ' '))
            c.drawString(150, y, txt)

            c.setFillColor(colors.HexColor('#e5e5e5'))
            c.rect(400, y-10, 200, 15, stroke=0, fill=1)
            color = detect_color(subitem['average'])
            c.setFillColor(colors.HexColor(color))
            width = 200*float(subitem['average'])/100
            c.rect(400, y-10, width, 15, stroke=0, fill=1)

            c.setFillColor(colors.HexColor('#ffffff'))
            c.setFontSize(10)
            val = '{0:.2f}'.format(subitem['average'])
            c.drawString(width+400-25, y, val)

            y += 20
            if y > 750:
                c.showPage()
                y = 30

    c.save()
    return response
