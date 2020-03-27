from django.db import models


class Message(models.Model):
    '''
        message model:
        save:
        - code -> varchar.
        - body -> text.
    '''
    code = models.CharField(max_length=40)

    body = models.TextField(max_length=1500)

    def __unicode__(self):
        return '%s -> %s' % (self.code, self.body)
