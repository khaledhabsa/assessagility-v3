from django.db import models


class Role(models.Model):
    '''
        role model:
        save:
        - code , title -> varchar.
        - description -> text.
        - rank -> integer.
    '''
    code = models.CharField(max_length=10)

    title = models.CharField(max_length=200)

    description = models.TextField()

    rank = models.IntegerField(default=1)

    def __unicode__(self):
        return '[ %s ] %s ' % (self.code, self.title)
