function apply_macros(input, macros) {
    var re;
    if (input.indexOf("#") > -1) {
        for (var i in macros) {
            if (macros[i]['fields']['place_holder'].indexOf("#") > -1) {
                var key = "\\$" + macros[i]['fields']['place_holder'] + "\\$";
                re = new RegExp(key, "g");
                input = input.replace(re, '<a href="#" data-toggle="tooltip" title="' + macros[i]['fields']['translation'] + '">' + macros[i]['fields']['place_holder'].replace(/#/g, "$") + '</a>');
                re = new RegExp(macros[i]['fields']['place_holder'], "g");
                input = input.replace(re, '<a href="#" data-toggle="tooltip" title="' + macros[i]['fields']['translation'] + '">' + macros[i]['fields']['place_holder'].replace(/#/g, "") + '</a>');


            }
        }

    }
    for (var i in macros) {
        re = new RegExp(macros[i]['fields']['place_holder'].replace(/\$/g, "\\$"), "g");
        input = input.replace(re, macros[i]['fields']['translation']);
    }
    return input;
};

var update_progress = function () {

    var answered = $('.indicator .answer-option input:checked').length
    $('.counter .current').html(answered);
    var percentage = (answered / parseInt($('.counter .total').html())) * 100
    percentage = percentage.toFixed(0)

    $('.progress-bar').css('width', percentage + "%")
    $('.progress-bar').html(percentage + '%')

    if (answered == (parseInt($('.counter .total').html()))) {
        $('.submit-survey').prop('disabled', false);
    } else {
        $('.submit-survey').prop('disabled', true);
    };

}

var update_progress_single = function () {
    var answered = $('.indicators .answered').length
    $('.counter .current').html(answered);
    var percentage = (answered / parseInt($('.counter .total').html())) * 100
    percentage = percentage.toFixed(0)
    $('.progress-bar').css('width', percentage + "%")
    $('.progress-bar').html(percentage + '%')

    if (answered == (parseInt($('.counter .total').html()))) {
        $('.submit-survey').prop('disabled', false);
    } else {
        $('.submit-survey').prop('disabled', true);
    };

}

$(document).ready(function () {

    $('.submit-survey').click(function () {
        $('#survey-modal').modal();
    })

    $('#accept-survey').click(function () {
        location.href = '/survey/finished/'
    })

    if ($('.questions.multiple').length > 0) {

        $(".questions-items").customScrollbar({
            skin: 'default-skin',
        });

        $.getJSON('/macros/', function (response) {
            var macros = response;
            $('.questions-items .question').each(function () {
                var val = apply_macros($(this).html(), macros)
                $(this).html(val)

            });

            var options = {
                html: true,
                animation: true,
                placement: "auto left",
            };

            $('a').tooltip(options);
        })

        $.getJSON('/answers/', function (response) {
            for (var i in response) {
                indicator = response[i]['fields']['indicator']
                mcq = response[i]['fields']['mcqanswer']
                var query = '#indicator-' + indicator + ' input[data-mcq-id="' + mcq + '"]'

                $(query).attr('checked', true)
            }
            update_progress();
            $('input[type="radio"]').ezMark({
                radioCls: 'answer-type',
                selectedCls: 'selected'
            });
        })

        $('.answer-option input').on('change', function () {
            var indicator_id = $(this).parents('.indicator').attr('id').split('-')[1]
            var mcq_id = $(this).val();
            var url = '/set/answer/' + indicator_id + '/' + mcq_id + '/';
            $.get(url, function (response) {
                update_progress()
            })
        })

        $('.notcompleted').click(function () {
            $('.indicator').each(function () {
                if ($(this).find('input:checked').length != 0)
                    $(this).hide()
            })
            $(this).addClass('active')
            $('.all').removeClass('active')
            $(".questions-items").customScrollbar("resize", true)
        })

        $('.all').click(function () {
            $('.indicator').show();
            $(this).addClass('active')
            $('.notcompleted').removeClass('active')
            $(".questions-items").customScrollbar("resize", true)
        })
    }/* end miltiple questions code */


    if ($('.questions.single').length > 0) {

        $('.indicators li').click(function () {
            $('.indicators li').removeClass('current');
            $(this).addClass('current')
            var q = $(this).attr('id').split('-')[1]
            $('.answer-item').hide()
            $('#answer-' + q).fadeIn(500)
        })

        $(".indicators-wrapper").customScrollbar({
            skin: 'default-skin',
        });

        $.getJSON('/macros/', function (response) {
            var macros = response;
            $('ul.indicators li, .question-text').each(function () {
                var val = apply_macros($(this).html(), macros)
                $(this).html(val)
            });



            var options = {
                html: true,
                animation: true,
                placement: "auto left",
            };

            $('a').tooltip(options);
        })

        $.getJSON('/answers/', function (response) {
            for (var i in response) {
                indicator = response[i]['fields']['indicator']
                mcq = response[i]['fields']['mcqanswer']
                $('li#indicator-' + indicator).addClass('answered')
                var query = '#answer-' + indicator + ' input[data-mcq-id="' + mcq + '"]'
                $(query).attr('checked', true)
            }
            update_progress_single();
            $('input[type="radio"]').ezMark({
                radioCls: 'answer-type',
                selectedCls: 'selected'
            });

            $('.indicators li').not('.answered').first().click()
            $(".indicators-wrapper").customScrollbar("scrollTo", $('.indicators li').not('.answered').first().prev())
        })

        $('.answer-option input').on('click', function () {
            var indicator_id = $(this).parents('.answer-item').attr('id').split('-')[1]
            var mcq_id = $(this).val();
            var url = '/set/answer/' + indicator_id + '/' + mcq_id + '/';
            $.get(url, function (response) {
                update_progress_single();
                $('li#indicator-' + indicator_id).addClass('answered')
                if ($('li#indicator-' + indicator_id).next(':visible').length > 0) {
                    $('li#indicator-' + indicator_id).next(':visible').click()
                    $(".indicators-wrapper").customScrollbar("scrollTo", $('li#indicator-' + indicator_id))
                }
                else {
                    $('.indicators li').not('.answered').first().click()
                    $(".indicators-wrapper").customScrollbar("scrollTo", $('.indicators li').not('.answered').first().prev())
                }
            })
        })

        $('.notcompleted').click(function (evt) {
            evt.preventDefault()
            $('.all').removeClass('active')
            $(this).addClass('active')
            $('.indicators li.answered').hide();
            $('.indicators li:visible').first().click();
            $(".indicators-wrapper").customScrollbar("resize", true)
            $(".indicators-wrapper").customScrollbar("scrollToY", 0)
        })

        $('.all').click(function (evt) {
            evt.preventDefault()
            $('.notcompleted').removeClass('active')
            $(this).addClass('active')
            $('.indicators li').show();
            $('.indicators li').not('.answered').first().click()
            $(".indicators-wrapper").customScrollbar("resize", true)
            $(".indicators-wrapper").customScrollbar("scrollTo", $('.indicators li').not('.answered').first())
        })

    }/* end single page code */

})
