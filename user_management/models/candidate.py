from django.db import models


USER_STATUS_CHOICES = (
    ('Participant', 'Participant'),
    ('Invited', 'Invited'),
    ('Started', 'Started'),
    ('Finished', 'Finished'),
    ('Deleted', 'Deleted'),
)


class Candidate(models.Model):
    first_name = models.CharField(max_length=80)
    last_name = models.CharField(max_length=80)
    email = models.CharField(max_length=80)
    status = models.CharField(
        max_length=11, choices=USER_STATUS_CHOICES, default='Participant')

    def __unicode__(self):
        return '%s' % (self.email)
