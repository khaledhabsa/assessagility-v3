from django import forms
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import authenticate
from django.contrib.auth.models import User


class UserLoginForm(forms.ModelForm):
    username = forms.CharField(widget=forms.TextInput(
        {"placeholder": 'Username', 'class': 'form-control', "id": 'inputEmail'}))
    password = forms.CharField(widget=forms.PasswordInput(
        {"placeholder": 'Password', 'class': 'form-control', "id": 'inputPassword'}))

    class Meta:
        model = User
        fields = ('username', 'password',)

    error_msg = {
        "user_not_found": "This user doesn't exist",
        "password": "The password isn't correct"
    }

    def clean(self):
        username = self.cleaned_data.get('username')
        password = self.cleaned_data.get('password')
        user = User.objects.filter(username=username)
        if not user.exists():
            raise forms.ValidationError(self.error_msg['user_not_found'])

        else:
            auth_user = authenticate(username=username, password=password)
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
