from ..models.option import Option


def isValidSurveyOption(key, value):

    try:
        option = Option.objects.get(key=key)

    except Exception:
        option = None

    if option is not None:
        # value = value.replace("survey_", "")
        if(option.value == value):
            return True

    return False
