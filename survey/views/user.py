from django.shortcuts import redirect
from django.contrib.auth import logout, authenticate, login
from ..forms.user import UserLoginForm, ForgetPasswordForm
from django.shortcuts import render
from django.http import HttpResponse
import hashlib
import time
from django.core.mail import EmailMultiAlternatives, send_mail
from ..models.users import ticket
from django.contrib.sites.models import Site
from django.template import Context, Template
from email_sender.models.emailTemplate import EmailTemplate


def user_login(request):
    '''
        This function is called by two ways:
        - if request post then you submit the form login,
        - otherwise use request get to load the login page
    '''
    if request.user.is_authenticated:
        if request.POST.get('next') is None:
            return redirect(request.POST.get('next'))
        else:
            return redirect("survey:answerpage", mode=0)
    else:

        if request.method == 'POST':
            form_user = UserLoginForm(request.POST)
            if form_user.is_valid():
                user = form_user.cleaned_data.get('user')
                login(request, user)
                nextUrl = request.POST.get('next')
                if nextUrl:
                    if user.is_superuser:
                        return redirect("/client/admin/admin_landing")
                    else:
                        return redirect("/answerpage/0/")
                else:
                    return redirect(nextUrl)

            return render(request, 'user/login.html', {'form': form_user,
                                                       "errors": form_user.errors.as_data()['__all__'][0],
                                                       'next': request.POST['next']})
        else:
            form = UserLoginForm()
            return render(request, 'user/login.html', {'next': request.GET.get('next'), "form": form})


def user_logout(request):
    '''
        this function is call when you need to logout your account
    '''
    logout(request)
    return redirect('/accounts/login')


def forget_password(request):
    if request.method == "POST":
        reset_form = ForgetPasswordForm(request.POST)
        if reset_form.is_valid():
            message = "An email has been sent to the email provided. Thank you!"
            user = reset_form.cleaned_data.get('user')
            timestamp = str(int(time.time())).encode("utf-8")
            code = hashlib.sha1()
            code.update(timestamp)
            # print(Site.objects.get_current())
            # t = ticket.objects.create(code=code.hexdigest(),
            #                           data=reset_form.cleaned_data.get('email'), type='change password', status='available')
            # t.save()

            # reset_password_url = '%s/resetpassword/%s' % (
            #     Site.objects.get_current().domain, t.code)

            # forgot_password = EmailTemplate.objects.get(
            #     template_name='forgot_password')

            # text_content = Template(forgot_password.body_text)
            # html_content = Template(forgot_password.body_html)
            # subject_content = Template(forgot_password.subject)

            # c = Context({'company': Site.objects.get_current().name,
            #              'company_url': Site.objects.get_current().domain,
            #              'first_name': user.first_name,
            #              'reset_password_url': reset_password_url})

            # msg = EmailMultiAlternatives(subject_content.render(c),
            #                              text_content.render(c),
            #                              forgot_password.from_email,
            #                              [reset_form.cleaned_data.get(
            #                                  'email')],
            #                              headers={'Reply-To': forgot_password.reply_to_email})
            # msg.attach_alternative(html_content.render(c), "text/html")
            msg = EmailMultiAlternatives(
                "test data", "this is message", "djangoapp123@gmail.com", ["eng.hassan2015@yahoo.com"])
            msg.send()

        else:
            return render(request, 'user/forget_password.html', {
                "message": "This email %s is not listed in our system" % request.POST.get('email')
            })

    return render(request, 'user/forget_password.html')


{
    # def forgot_password(request):

    #     message = ""
    #     if request.POST:
    #         email = request.POST['email']
    #         try:
    #             user = User.objects.get(email=email)
    #             message = "An email has been sent to the email provided. Thank you!"
    #             timestamp = str(int(time.time()))
    #             m = hashlib.sha1()
    #             m.update(timestamp)

    #             t = ticket.objects.create(code=m.hexdigest(), data=email, type='change password', status='available')
    #             t.save()
    #             reset_password_url = '%s/resetpassword/%s' % (Site.objects.get_current().domain, t.code)

    #             text_content = Template(EmailTemplate.objects.get(template_name='forgot_password').body_text)
    #             html_content = Template(EmailTemplate.objects.get(template_name='forgot_password').body_html)
    #             subject_content = Template(EmailTemplate.objects.get(template_name='forgot_password').subject)

    #             c = Context({'company': Site.objects.get_current().name,
    #                          'company_url': Site.objects.get_current().domain,
    #                          'first_name': user.first_name,
    #                          'reset_password_url': reset_password_url})

    #             msg = EmailMultiAlternatives(subject_content.render(c),
    #                                          text_content.render(c),
    #                                          EmailTemplate.objects.get(template_name='forgot_password').from_email,
    #                                          [email],
    #                                          headers={'Reply-To': EmailTemplate.objects.get(template_name='forgot_password').reply_to_email})
    #             msg.attach_alternative(html_content.render(c), "text/html")
    #             msg.send()

    #         except User.DoesNotExist:
    #             message = "This email %s is not listed in our system" % email

    #     return render(request, 'forgot_password.html', {'message': message}, RequestContext(request))


    # def reset_password(request, code):
    #     message = ""
    #     showform = False
    #     showLoginLink = False
    #     try:
    #         t = ticket.objects.get(code=code)
    #         if t.type == 'change password' and t.status == 'available':
    #             showform = True
    #         else:
    #             message = "link expired."

    #     except ticket.DoesNotExist:
    #         message = "invalid link."

    #     if request.POST:
    #         try:
    #             t = ticket.objects.get(code=code)
    #             if t.type == 'change password' and t.status == 'available':
    #                 u = User.objects.get(email=t.data)
    #                 u.set_password(request.POST['Password'])
    #                 u.save()
    #                 t.status = 'inavailable'
    #                 t.save()
    #                 message = "Your password has been successfully reset."
    #                 showLoginLink = True
    #                 showform = False
    #             else:
    #                 message = "link expired."

    #         except ticket.DoesNotExist:
    #             message = "invalid link."

    #     ctx = {'message': message,
    #            'showform': showform,
    #            'showLoginLink': showLoginLink}
    #     return render(request, 'reset_password.html', ctx)
}
