from django.db import models


class Demographic(models.Model):
    '''
        Demo Graphic model
        - save title  -> varchar,
        - required  -> Bool,
        - viewable -> Bool
    '''
    title = models.CharField(max_length=200)

    required = models.BooleanField(default=False)

    viewable = models.BooleanField(default=False)

    def __unicode__(self):
        return self.title


class DemographicValue(models.Model):
    """
        Demo Graphic value model:
        - have relation with demo graphic foreign key
        - store value -> varchar
    """
    demographic = models.ForeignKey(Demographic, on_delete=models.CASCADE)

    value = models.CharField(max_length=200)

    def __unicode__(self):
        return self.value
