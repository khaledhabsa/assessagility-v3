from django.db import models


class Macro(models.Model):
    '''
        macro model:
        save:
        - place_holder -> varchar.
        - translation -> text.

    '''
    place_holder = models.CharField(max_length=255)

    translation = models.TextField()

    def __unicode__(self):
        return '%s -> %s' % (self.place_holder, self.translation)
