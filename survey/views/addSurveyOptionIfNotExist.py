from ..models.option import Option


def addSurveyOptionIfNotExist(key, value):
    try:
        option = Option.objects.get(key=key)
    except Exception:
        option = None
    if option is not None:
        option.value = value
        option.save()
    else:
        Option.objects.create(key=key, value=value)
