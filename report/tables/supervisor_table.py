import django_tables2 as tables


class SupervisorTable(tables.Table):
    supervisor = tables.Column()
    supervisor__count = tables.Column(verbose_name='Not Started Count')

    class Meta:
        attrs = {'class': 'paleblue'}
