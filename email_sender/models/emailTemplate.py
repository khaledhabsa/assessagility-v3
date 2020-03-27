from django.db import models


class EmailTemplate(models.Model):
    '''
        email template model:
        save:
        - template_name , subject , from_email , reply_to_email -> varchar.
        - body_text , body_html -> text
    '''
    template_name = models.CharField(max_length=200)

    subject = models.CharField(max_length=200)

    from_email = models.CharField(max_length=200, null=True, blank=True)

    reply_to_email = models.CharField(max_length=200, null=True, blank=True)

    body_text = models.TextField()

    body_html = models.TextField()

    def __unicode__(self):
        return self.template_name
