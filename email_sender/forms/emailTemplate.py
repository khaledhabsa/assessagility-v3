from django.forms.models import ModelForm
from ..models.emailTemplate import EmailTemplate


class EmailTemplateForm(ModelForm):
    class Meta:
        model = EmailTemplate
        exclude = ('template_name',)
