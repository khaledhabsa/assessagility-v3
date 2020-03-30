import django_tables2 as tables


class UserTable(tables.Table):
    username = tables.Column()
    email = tables.Column()
    questions = tables.Column()
    answered = tables.Column()
    progress = tables.Column()

    class Meta:
        attrs = {'class': 'paleblue'}
