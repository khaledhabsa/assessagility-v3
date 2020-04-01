from django.contrib.auth.decorators import login_required
from ..models.emailTemplate import EmailTemplate
from django.shortcuts import render
from ..forms.emailTemplate import EmailTemplateForm
from user_management.models.candidate import Candidate
from helper.decorator.superuser_required import superuser_required


def edit_email_template(request, template_name):
    try:
        template = EmailTemplate.objects.get(template_name=template_name)
    except EmailTemplate.DoesNotExist:
        template = EmailTemplate.objects.create(template_name=template_name)

    message = None
    if request.method == 'POST':
        form = EmailTemplateForm(request.POST, instance=template)
        if form.is_valid():
            form.save()
            message = 'Your %s has been updated successfully.' % template_name
    else:
        form = EmailTemplateForm(instance=template)

    numofinvitees = Candidate.objects.filter(status='Invited').count()

    return render(request, 'edit_email_template.html', {'form': form,
                                                        'message': message,
                                                        'numofinvitees': numofinvitees,
                                                        'template_name': template_name,
                                                        })
