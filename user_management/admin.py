from django.contrib import admin

# Register your models here.
from user_management.models.candidate import Candidate

admin.site.register(Candidate)
