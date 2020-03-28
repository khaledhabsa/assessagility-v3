from django import forms
from django.contrib.auth.models import User
from survey.models.users import UsersWaitingList


class AddUserForm(forms.ModelForm):
    first_name = forms.CharField(max_length=5)
    last_name = forms.CharField(max_length=80)
    email = forms.EmailField()

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email',)

    def clean_email(self):
        email = self.cleaned_data['email']
        user = User.objects.filter(username=email)
        if not user.exists():
            user = UsersWaitingList.objects.filter(email=email)
            if not user.exists():
                return email

        raise forms.ValidationError(u'%s already exists' % email)
