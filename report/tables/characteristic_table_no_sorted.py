import django_tables2 as tables


class CharacteristicTableWithNoSort(tables.Table):
    Characteristic = tables.Column()
    weight = tables.Column()
    readiness = tables.Column()

    class Meta:
        attrs = {'class': 'paleblue'}
        sortable = False
