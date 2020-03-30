import django_tables2 as tables


class CharacteristicTable(tables.Table):
    Characteristic = tables.Column()
    weight = tables.Column()
    readiness = tables.Column()

    class Meta:
        attrs = {'class': 'paleblue'}
