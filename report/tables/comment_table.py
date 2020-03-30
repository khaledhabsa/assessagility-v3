import django_tables2 as tables


class CommentsTable(tables.Table):
    text = tables.Column(verbose_name='Comments')

    class Meta:
        attrs = {'class': 'paleblue'}
