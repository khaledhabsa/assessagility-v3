from django.db import models


class Email(models.Model):
    '''
        email template model:
        save:
        - type , from_email , to_email , reply_to_email , status -> varchar.
        - subject, body_text , body_html -> text
    '''
    type = models.CharField(max_length=200, null=True, blank=True)
    subject = models.TextField()
    from_email = models.CharField(max_length=200, null=True, blank=True)
    to_email = models.CharField(max_length=200, null=True, blank=True)
    reply_to_email = models.CharField(max_length=200, null=True, blank=True)
    body_text = models.TextField()
    body_html = models.TextField()
    status = models.CharField(
        max_length=200, null=True, blank=True, default='waiting')

    def __unicode__(self):
        return self.to_email
