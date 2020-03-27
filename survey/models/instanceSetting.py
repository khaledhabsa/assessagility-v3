from django.db import models


class InstanceSetting(models.Model):
    '''
        instance setting model:
        save:
        - code -> varchar.
        - value -> text
    '''
    code = models.CharField(max_length=100)

    value = models.TextField()

    def __unicode__(self):
        return '%s -> %s' % (self.code, self.value)
