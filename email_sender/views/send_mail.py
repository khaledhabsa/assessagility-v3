from ..models.email import Email
from django.core.mail import EmailMultiAlternatives


def send_email(request, patch_size):

    for m in Email.objects.filter(status='waiting')[:patch_size]:
        # print("Email Details:",m.from_email,m.to_email)
        text_content = m.body_text
        html_content = m.body_html
        EMAIL_HOST_USER = 'noreplay@desiredware.com'  # m.from_email
        email_msg = EmailMultiAlternatives(m.subject,
                                           text_content,
                                           EMAIL_HOST_USER,
                                           [m.to_email],
                                           headers={'Reply-To': m.reply_to_email})
        email_msg.attach_alternative(html_content, "text/html")
        # email_msg = EmailMessage(m.subject,
        # text_content,
        # EMAIL_HOST_USER,
        # to = [m.to_email], #'ali.osama@inet.works'],
        # headers={'Reply-To': m.reply_to_email})
        # print("From Email: ", EMAIL_HOST_USER)
        # print("To Email: ", m.to_email)
        email_msg.send()
        m.status = 'sent'
        m.save()
        return HttpResponse('Email is sent successfully!')
        # return redirect('/')
