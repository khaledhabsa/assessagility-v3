from django import forms


class UploadFileForm(forms.Form):
    qqfile = forms.FileField()
