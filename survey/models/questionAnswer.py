from django.db import models
from django.contrib.auth.models import User
from .role import Role

ANSWER_RANGE_DISPLAY_CHOICES = (
    ('sequence', 'sequence'),
    ('reverse', 'reverse'),
    ('random', 'random'),
)


class AnswerRange(models.Model):
    '''
        Answer range model:
        save:
        - title -> varchar,
        - order -> integer.
    '''
    title = models.CharField(max_length=200)

    order = models.IntegerField(default=0)

    def answers(self):  # fix this -------------
        result = ""

        for i in self.mcqanswer_set.all():
            result += "," + i.title
        return result[1:]

    def __unicode__(self):
        return self.title + '( ' + self.answers() + ' )'

    def extar_mcq(self):  # fix this -------------
        return serializers.serialize('python', self.mcqanswer_set.all())


class McqAnswer(models.Model):
    '''
        mcq answer model:
        - have relation with answer range foreign key.
        save:
        - title -> varchar.
        - minValue , maxValue -> float.
    '''

    answerrange = models.ForeignKey(AnswerRange, on_delete=models.CASCADE)

    title = models.CharField(max_length=200)

    minValue = models.FloatField()

    maxValue = models.FloatField()

    def __unicode__(self):
        return self.title


class Indicator(models.Model):
    '''
        Indicator model:
        - have relation with role m2m.
        - have relation with answer range foreign key.
        - have relation with user m2m.
        save:
        - code -> varchar.
        - answer range display -> varchar choices.

    '''
    code = models.CharField(max_length=10)

    roles = models.ManyToManyField(Role)

    question = models.TextField()

    answer_range = models.ForeignKey(AnswerRange, on_delete=models.CASCADE)

    answer_range_display = models.CharField(
        max_length=8, choices=ANSWER_RANGE_DISPLAY_CHOICES, default='sequence')

    answers = models.ManyToManyField(User, through='Answer')

    def text(self):  # fix this-----------------------
        # return html2text(self.question)
        # print("=====================self.question: ", self.question)
        return self.question

    def __unicode__(self):
        return '[ %s ] %s ' % (self.code, self.question)


class CharacteristicCategory(models.Model):
    '''
        characteristic category model:
        save:
        - title -> varchar.
    '''

    title = models.CharField(max_length=200)

    def __unicode__(self):
        return self.title


class Characteristic(models.Model):
    '''
        characteristic model:
        - have relation with characteristic catgeory foreign key.
        - have relation with indicator m2m.
        save:
        - code , title -> varchar.
        - description -> text.

    '''

    code = models.CharField(max_length=10)

    title = models.CharField(max_length=200)

    description = models.TextField()

    characteristic_category = models.ForeignKey(
        CharacteristicCategory, null=True, blank=True, on_delete=models.CASCADE)

    indicators = models.ManyToManyField(Indicator)

    def __unicode__(self):
        return '[ %s ] %s ' % (self.code, self.title)


class Practice(models.Model):
    '''
        practice model:
        - have relation with characteristic m2m.
        - code , title -> varchar.
        - description -> text
    '''
    code = models.CharField(max_length=10)

    title = models.CharField(max_length=200)

    description = models.TextField()

    characteristics = models.ManyToManyField(Characteristic)

    def __unicode__(self):
        return '[ %s ] %s ' % (self.code, self.title)


class Test(models.Model):
    '''
        test model:
        save:
        - code -> varchar.
        - value -> integer
    '''
    code = models.CharField(max_length=40)

    value = models.IntegerField(default=1)


class Answer(models.Model):
    '''
        answer model:
        - have relation with indeicator foreign key.
        - have relation with user foreign key.
        - have relation with mcq answer foreign key.
    '''
    indicator = models.ForeignKey(Indicator, on_delete=models.CASCADE)

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    mcqanswer = models.ForeignKey(McqAnswer, on_delete=models.CASCADE)


class Comment(models.Model):
    '''
        comment model:
        - have relation with user foreign key.
        save:
        - text -> text
    '''
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    text = models.TextField()

    def __unicode__(self):
        return self.text[:50]
