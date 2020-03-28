from django.db import models
from django.contrib.auth.models import User
from .graphics import Demographic, DemographicValue
from .role import Role
from django.utils.timezone import now
from django.db.models.signals import post_save


class UserProfile(models.Model):

    '''
        user Profile model:
        - have relation with User model o2m.
        - have relation with role model m2m.
        - have relation with demo graphic m2m.
        save :
        - first_name , last_name , supervisor , department_manager -> varchar.
        - hide_welcome_message , did_fill_demographics , survey_finished -> bool 
    '''

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='profile')

    first_name = models.CharField(max_length=80)

    last_name = models.CharField(max_length=80)

    roles = models.ManyToManyField(
        Role, through='Userprofile_Roles', blank=True)

    supervisor = models.CharField(max_length=80)

    department_manager = models.CharField(max_length=80)

    demographics = models.ManyToManyField(
        Demographic, through='UserDemographics')

    hide_welcome_message = models.BooleanField(default=True)

    did_fill_demographics = models.BooleanField(default=True)

    survey_finished = models.BooleanField(default=True)

    def __unicode__(self):
        return self.user.username


class Userprofile_Roles(models.Model):
    '''
        User profile roles model:
        - have relation with role foreign key.
        - have relation with user profile foreign key
    '''
    role = models.ForeignKey(Role, on_delete=models.CASCADE)

    userprofile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)

    def __unicode__(self):
        return self.userprofile.first_name


class UsersWaitingList(models.Model):
    '''
        user waiting list model:
        save :
        - first_name , last_name , email , role , supervisor , department_manager -> varchar
    '''
    first_name = models.CharField(max_length=80)

    last_name = models.CharField(max_length=80)

    email = models.CharField(max_length=80)

    role = models.CharField(max_length=80)

    supervisor = models.CharField(max_length=80)

    department_manager = models.CharField(max_length=80)

    def __unicode__(self):
        return self.email


class UserDemographics(models.Model):
    '''
        user demo graphics model:
        - have relation with user profile foreign key.
        - have relation with demo graphic foreign key.
        - have relation with demo graphic value foreign key.
    '''
    userProfile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)

    demographic = models.ForeignKey(Demographic, on_delete=models.CASCADE)

    demographic_value = models.ForeignKey(
        DemographicValue, on_delete=models.CASCADE)


class ReportPassword(models.Model):
    '''
        report password model:
        save: 
        - url , password -> varchar.
    '''
    url = models.CharField(max_length=400)

    password = models.CharField(max_length=20)

    def __unicode__(self):
        return self.url


class ticket(models.Model):
    '''
        ticket model:
        save:
        - code , type, data , status -> text
        - date_created , date_modified -> date time
    '''
    code = models.TextField()

    type = models.TextField()

    data = models.TextField()

    status = models.TextField()

    date_created = models.DateTimeField(auto_now_add=True)

    date_modified = models.DateTimeField(auto_now=True)


# def create_user_profile(sender, **kwargs):
#     """When creating a new user, make a profile for him or her."""
#     u = kwargs["instance"]
#     if not UserProfile.objects.filter(user=u):
#         UserProfile(user=u).save()


# post_save.connect(create_user_profile, sender=User)
