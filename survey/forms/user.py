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
    username = forms.CharField(max_length=100, widget=forms.TextInput(attrs={
        "class": "form-control",
        "id": "inputUsername",
        "placeholder": "Username"
    }))
    email = forms.EmailField(widget=forms.TextInput(attrs={
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
        fields = ('first_name', 'last_name', 'username',
                  'email', 'password', 'password1',)

    def clean(self):
        email = self.cleaned_data['email']
        password = self.cleaned_data['password']
        password1 = self.cleaned_data['password1']
        username = self.cleaned_data['username']
        check_username = User.objects.filter(username=username)
        check_email = User.objects.filter(email=email)

        if check_email.exists():
            raise forms.ValidationError(u'%s already exists' % email)
        if check_username.exists():
            raise forms.ValidationError(u'%s already exists' % username)

        if password and password1 and password == password1:
            return self.cleaned_data
        else:
            raise forms.ValidationError(u"password didn't match")

    def save(self):
        from django.utils.timezone import now
        user = User.objects.create(
            first_name=self.cleaned_data.get("first_name"),
            last_name=self.cleaned_data.get("last_name"),
            username=self.cleaned_data.get("username"),
            email=self.cleaned_data.get("email"),
            last_login=now()
        )

        user.set_password(self.cleaned_data.get("password"))
        user.save()
