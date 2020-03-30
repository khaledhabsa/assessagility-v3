from django.contrib import admin

from .models.questionAnswer import Answer, Indicator
from .models.users import UserProfile, UserDemographics, ticket
from .models.instanceSetting import InstanceSetting


admin.site.register(Answer)
admin.site.register(UserProfile)
admin.site.register(InstanceSetting)
admin.site.register(Indicator)
admin.site.register(UserDemographics)
admin.site.register(ticket)
