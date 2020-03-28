from ..models.email import Email
from ..models.emailTemplate import EmailTemplate
from django.http import HttpResponse
from django.core.mail import EmailMultiAlternatives
from django.template import Context, loader
from survey.models import InstanceSetting
from django.contrib.sites.models import Site


def send_complete_reminder(to_user):
    text_content = loader.get_template(InstanceSetting.objects.get(
        code='email_template_complete_reminder_text').value)
    html_content = loader.get_template(InstanceSetting.objects.get(
        code='email_template_complete_reminder_html').value)
    c = Context({'domain': Site.objects.get_current().domain,
                 'first_name': to_user.get_profile().first_name,
                 'email': to_user.email,
                 })

    email = Email.objects.create(type='complete_reminder',
                                 subject=InstanceSetting.objects.get(
                                     code='email_template_complete_reminder_subject').value,
                                 from_email=InstanceSetting.objects.get(
                                     code='email_template_complete_reminder_from').value,
                                 to_email=to_user.email,
                                 reply_to_email=InstanceSetting.objects.get(
                                     code='email_template_complete_reminder_replyto').value,
                                 body_text=text_content.render(c),
                                 body_html=html_content.render(c))
    email.save()

    return


def send_start_reminder(to_user):
    text_content = loader.get_template(InstanceSetting.objects.get(
        code='email_template_start_reminder_text').value)
    html_content = loader.get_template(InstanceSetting.objects.get(
        code='email_template_start_reminder_html').value)
    c = Context({'domain': Site.objects.get_current().domain,
                 'first_name': to_user.get_profile().first_name,
                 'email': to_user.email,
                 })

    email = Email.objects.create(type='complete_reminder',
                                 subject=InstanceSetting.objects.get(
                                     code='email_template_start_reminder_subject').value,
                                 from_email=InstanceSetting.objects.get(
                                     code='email_template_start_reminder_from').value,
                                 to_email=to_user.email,
                                 reply_to_email=InstanceSetting.objects.get(
                                     code='email_template_start_reminder_replyto').value,
                                 body_text=text_content.render(c),
                                 body_html=html_content.render(c))
    email.save()

    return
