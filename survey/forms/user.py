from django import forms
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
import re


class UserLoginForm(forms.ModelForm):
    email = forms.EmailField(widget=forms.EmailInput(
        {"placeholder": 'Username', 'class': 'form-control', "id": 'inputEmail'}))
    password = forms.CharField(widget=forms.PasswordInput(
        {"placeholder": 'Password', 'class': 'form-control', "id": 'inputPassword'}))

    class Meta:
        model = User
        fields = ('email', 'password',)

    error_msg = {
        "user_not_found": "This Email doesn't exist",
        "password": "The password isn't correct",
    }

    def clean(self):
        email = self.cleaned_data.get('email')
        password = self.cleaned_data.get('password')
        user = User.objects.filter(email=email)
        if not user.exists():
            raise forms.ValidationError(self.error_msg['user_not_found'])

        else:

            user = user[0]
            if user.username != user.email:
                if user.email != '':
                    user.username = user.email
                    user = user.save()

            auth_user = authenticate(
                username=email, password=password)
            if auth_user:
                self.cleaned_data['user'] = auth_user
                return self.cleaned_data
            else:
                raise forms.ValidationError(self.error_msg['password'])

        return self.cleaned_data


class ForgetPasswordForm(forms.ModelForm):

    email = forms.EmailField(widget=forms.EmailInput({
        "id": "email", "class": "email form-control"
    }))

    class Meta:
        model = User
        fields = ('email',)

    def clean(self):
        email = self.cleaned_data.get('email')
        user = User.objects.filter(email=email)
        if not user.exists():
            raise forms.ValidationError("This email doesn't exists")

        self.cleaned_data['user'] = user[0]
        return self.cleaned_data


class AddUserForm(forms.ModelForm):
    first_name = forms.CharField(max_length=20, widget=forms.TextInput(attrs={
        "class": "form-control",
        "id": "inputFirstName",
        "placeholder": "First Name"
    }))
    last_name = forms.CharField(max_length=20, widget=forms.TextInput(attrs={
        "class": "form-control",
        "id": "inputLastName",
        "placeholder": "Last Name"
    }))
    email = forms.EmailField(widget=forms.EmailInput(attrs={
        "class": "form-control",
        "id": "inputEmail",
        "placeholder": "Email"
    }))
    password = forms.CharField(widget=forms.PasswordInput(attrs={
        "class": "form-control",
        "id": "inputPassword",
        "placeholder": "Password"
    }))
    password1 = forms.CharField(widget=forms.PasswordInput(attrs={
        "class": "form-control",
        "id": "inputPassword",
        "placeholder": "Confirm Password"
    }))

    class Meta:
        model = User
        fields = ('first_name', 'last_name',
                  'email', 'password', 'password1',)

    def clean(self):

        if 'email' not in self.cleaned_data:
            raise forms.ValidationError("Enter Correct Email")

        email = self.cleaned_data['email']
        password = self.cleaned_data['password']
        password1 = self.cleaned_data['password1']
        fname = self.cleaned_data['first_name']
        lname = self.cleaned_data['last_name']
        pat_name = r'^[a-zA-z]+$'
        pat_pass = r'^([a-zA-Z]+[0-9]+[!@#$%^&*(),.?":{}|<>_-]+|[a-zA-Z]+[!@#$%^&*(),.?":{}|<>_-]+[0-9]+|[!@#$%^&*(),.?":{}|<>_-]+[a-zA-Z]+[0-9]+|[!@#$%^&*(),.?":{}|<>_-]+[0-9]+[a-zA-Z]+|[0-9]+[a-zA-Z]+[!@#$%^&*(),.?":{}|<>_-]+|[0-9]+[!@#$%^&*(),.?":{}|<>_-]+[a-zA-Z]+)[a-zA-Z0-9!@#$%^&*(),.?":{}|<>_-]*$'
        if not re.match(pat_name, fname):
            raise forms.ValidationError(
                "First Name should be contain characters only")
        if not re.match(pat_name, lname):
            raise forms.ValidationError(
                "Last Name should be contain characters only")

        if len(password) < 8:
            raise forms.ValidationError(
                "Password should be contain at least 8 combination of characters,numbers, !@#$%^&*(),.?\":{}|<>_- only")
        if not re.match(pat_pass, password):
            raise forms.ValidationError(
                "Password should be contain combination of characters,numbers, !@#$%^&*(),.?\":{}|<>_- only")
        check_email = User.objects.filter(email=email)
        if check_email.exists():
            raise forms.ValidationError(u'%s already exists' % email)

        if password and password1 and password == password1:
            return self.cleaned_data
        else:
            raise forms.ValidationError(u"password didn't match")

    def save(self):
        from django.utils.timezone import now
        user = User.objects.create(
            first_name=self.cleaned_data.get("first_name"),
            last_name=self.cleaned_data.get("last_name"),
            username=self.cleaned_data.get("email"),
            email=self.cleaned_data.get("email"),
            last_login=now()
        )

        user.set_password(self.cleaned_data.get("password"))
        user.save()
