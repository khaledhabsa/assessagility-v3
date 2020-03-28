from django.forms import ModelForm
from survey.models.role import Role


class RoleForm(ModelForm):
    class Meta:
        model = Role
        exclude = ('code',)

    def clean_title(self):
        return self.instance.title
