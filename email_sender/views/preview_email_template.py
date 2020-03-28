from django.contrib.auth.decorators import login_required
from ..models.emailTemplate import EmailTemplate
from django.shortcuts import render


@login_required
# @superuser_required
def preview_email_template(request, template_name):

    try:
        template = EmailTemplate.objects.get(template_name=template_name)
    except EmailTemplate.DoesNotExist:
        template = EmailTemplate(template_name=template_name)

    message = None

    return render(request, 'preview_email_template.html', {'message': message,
                                                           'template_name': template_name,
                                                           'template': template, })
