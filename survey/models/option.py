from django.db import models


class Option(models.Model):
    '''
        option model:
        save:
        - key , value -> varchar.
    '''
    key = models.CharField(max_length=80)

    value = models.CharField(max_length=80)

    def __unicode__(self):
        return self.key
