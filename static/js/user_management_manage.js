var panal_expand_emode = 0;
var usedinvitations = 0;
var counter = 0;
function test() {
    $('.pageHeader').each(function () {
        $(this).text($(this).next().find('tbody > tr').length);
    });
}

jQuery(document).ajaxSend(function (event, xhr, settings) {
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function sameOrigin(url) {
        // url could be relative or scheme relative or absolute
        var host = document.location.host;
        // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') || (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }

    function safeMethod(method) {
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    }
});

$("#apply").click(function () {
    // if ($("#selectOption").val() === 'participant')
    //     GetAll(1, "participant")
    // else if ($("#selectOption").val() === 'completed')
    //     GetAll(1, "finished")
    // else if ($("#selectOption").val() === 'progress')
    //     GetAll(1, "started")
    // else if ($("#selectOption").val() === 'include')
    //     GetAll(1, "invited")
    // else if ($("#selectOption").val() === 'exclude')
    GetAll(1, $("#selectOption").val())

})


function pageInit(ps) {
    for (i in ps) {
        $(ps[i] + " > .result").setTemplateElement("table_template");
        $(ps[i] + " > .result").processTemplate();
    }
}

function pageSet(items, ps) {
    for (i in ps) {
        $("#temp").setParam("filter", ps[i].filter);
        $("#temp").processTemplate(items);
        $(ps[i].page + ' > .result > .users_table tbody').append($("#temp").html());
        $("#temp").html('');
    }
}

function renderUsers(items, status, count) {

    if (status === 'Participant') {
        $("#participant").css("display", "block")
        $("#completed").css("display", "none")
        $("#include").css("display", "none")
        $("#progress").css("display", "none")
        $("#exclude").css("display", "none")

    } else if (status === 'Finished') {
        $("#participant").css("display", "none")
        $("#completed").css("display", "block")
        $("#include").css("display", "none")
        $("#progress").css("display", "none")
        $("#exclude").css("display", "none")

    } else if (status === 'Invited') {
        $("#participant").css("display", "none")
        $("#completed").css("display", "none")
        $("#include").css("display", "block")
        $("#progress").css("display", "none")
        $("#exclude").css("display", "none")

    } else if (status === 'Started') {
        $("#participant").css("display", "none")
        $("#completed").css("display", "none")
        $("#include").css("display", "none")
        $("#progress").css("display", "block")
        $("#exclude").css("display", "none")

    } else if (status === 'Deleted') {
        $("#participant").css("display", "none")
        $("#completed").css("display", "none")
        $("#include").css("display", "none")
        $("#progress").css("display", "none")
        $("#exclude").css("display", "block")

    }

    if (count > 0) {
        counter = count
        $(".CandidateCount").empty()
        $(".CandidateCount").html(count)
        $("#temp").setTemplateElement('rows_template');
        $("#temp").setParam("filter", status);
        $("#temp").processTemplate(items);
        $('.candidateresult > .users_table tbody').append($("#temp").html());
        $("#temp").html('');


        pageSet(items, [
            // { 'page': '.participant', 'filter': 'Invited' },
            { 'page': '.notstartedpage', 'filter': 'Invited' },
            { 'page': '.inprogresspage', 'filter': 'Started' },
            { 'page': '.finishedpage', 'filter': 'Finished' },
            { 'page': '.excludedpage', 'filter': 'Deleted' },
        ]);
        refreshDisplay();
    } else {
        $("#temp").css("display", "block")
        $("#temp").html("<div class='alert alert-warning text-center'>No data in this Section!</div>")
        $(".portlets").css('display', "none")
    }

}


function refreshDisplay() {
    //$('.result').html($('.result').html());
    $("tr:visible:even").css("background-color", "#fff");
    $("tr:visible:odd").css("background-color", "#eee");
    // CandidateCount = $(".status:contains('Participant')").length;
    $(".CandidateCount").text(counter);

    $('.pageHeader').each(function () {
        var ccount = $(this).next().find('tbody > tr').length;
        $(this).find('.count').text(ccount);
        if ($(this).hasClass('page1')) { $("#ccount-1").text(ccount) };
        if ($(this).hasClass('page2')) { $("#ccount-2").text(ccount) };
        if ($(this).hasClass('page3')) { $("#ccount-3").text(ccount) };
        if ($(this).hasClass('page4')) { $("#ccount-4").text(ccount) }

    });



    usedinvitations = 0;
    $('.rightpanel .count').each(function () { eval('usedinvitations=usedinvitations +' + $(this).text()) })

    $('.usedinvitations').text(usedinvitations);

}


function render(items, status, count) {
    // attach the template
    jQuery.jTemplatesDebugMode(true);
    $(".candidateresult").setTemplateElement("table_template");

    $(".candidateresult").processTemplate();

    // pageInit(['.participant', '.notstartedpage', '.inprogresspage', '.finishedpage', '.excludedpage']);

    renderUsers(items, status, count);

}


function renderpager(candidates) {

    if (candidates[0]['num_pages'] >= 2) {
        $(".footerpagination").show();
    }
    else {
        $(".footerpagination").hide();
    }

    $("#current").text(candidates[0]['number']);
    $("#num_pages").text(candidates[0]['num_pages']);

    selectPage(candidates[0]['number']);
}


function selectPage(pageNumber) {

    currentPageNumber = parseInt(pageNumber);
    renderPagesIndex(currentPageNumber - 1);
}



function renderPagesIndex(currentPageNumber) {
    var num_pages = parseInt($("#num_pages").text());
    var output = "";
    x = 0;
    y = 10;

    if (num_pages > 10) {
        x = currentPageNumber - 5;
        y = currentPageNumber + 5;

        for (var i = 0; i < 6; i++) {
            if (y > num_pages) {
                y = y - 1;
                x = x - 1;
            }

            if (x < 0) {
                y = y + 1;
                x = x + 1;
            }
        }

    }
    else {
        y = num_pages;
    }


    for (var i = x; i < y; i++) {
        output += '<span id="' + i + '" class="pageIndex btn btn-default btn-sm ';
        if (i == currentPageNumber) {
            output += 'currentPageIndex';
        }
        output += '">' + (i + 1) + '</span>'
    }

    $(".pagesIndex").html(output);

    if (currentPageNumber + 1 == 1) {
        $("#previous").addClass('disabled');
    } else {
        $("#previous").removeClass('disabled');
    }
    if (num_pages == currentPageNumber + 1) {
        $("#next").addClass('disabled');

    } else {
        $("#next").removeClass('disabled');
    }
}


function GetWithStatus(page, status) {
    $.ajax(
        {
            url: '/usermanagement/getallcandidate/',
            cache: false,
            data: {
                "status": status,
                "page": page
            },
            dataType: "json",
            success: function (data) {
                //alert('hello from ajax render');
                // console.log("DOne");
                if (status === 'participant') {
                    render(data['users'], "Participant");
                    renderpager(data['paginatordata']);
                }
                else if (status === 'finished') {
                    render(data['users'], "Finished");
                    renderpager(data['paginatordata']);
                } else if (status === 'started') {
                    render(data['users'], "Started");
                    renderpager(data['paginatordata']);
                } else if (status === 'invited') {
                    render(data['users'], "Invited");
                    renderpager(data['paginatordata']);
                } else if (status === 'deleted') {
                    render(data['users'], "Deleted");
                    renderpager(data['paginatordata']);
                }
                // render(data);
                //alert('hello after ajax render');
            },
            error: function (request, status, error) { alert(status + ", " + error); }
        });

}

function GetAll(page, status) {
    $.ajax(
        {
            url: '/usermanagement/getallcandidate/',
            cache: false,
            data: {
                'page': page,
                "status": status,
            },
            dataType: "json",
            success: function (data) {
                //alert('hello from ajax render');
                render(data['users'], status, data['count']);
                renderpager(data['paginatordata']);
                //alert('hello after ajax render');
            },
            error: function (request, status, error) { alert(status + ", " + error); }
        });

}


function Checkusedinvitations() {
    quota = parseInt($('#quota').text());

    var ids = [];
    $('.leftpanel .checked').each(function () {
        id = $(this).attr('id');
        if (id != undefined) {

            ids.push(id);
        }

    });

    //limit disabled #56
    /*if (ids.length +usedinvitations > quota)
    {
        return false;
    }*/
    return true;
}

function UpdateSelectall() {
    if ($('.selectall').hasClass('checked')) {

        $('.selectall').removeClass('checked');
        $('.selectall').parents('table').find('.usercheckbox').removeClass('checked');

    }
}

function PrepareSelectall() {
    $(document).on('click', '.selectall', function () {
        if ($(this).hasClass('checked')) {
            $(this).removeClass('checked');
            $(this).parents('table').find('.usercheckbox').removeClass('checked');

        } else {
            $(this).addClass('checked');
            $(this).parents('table').find('.usercheckbox').addClass('checked');

        }
    });
}

function update_expand_mode(newmode) {
    panal_expand_emode = newmode
    switch (panal_expand_emode) {
        case 0:
            $('.rightpanel').animate({ width: '45%' }, 1000);
            $('.leftpanel').animate({ width: '45%' }, 1000);
            $(".expandText").removeClass("collapseText"); // added by Joe - switch between collapse and expand
            break;
        case 1:
            $(".expandText").addClass("collapseText");// added by Joe - switch between collapse and expand
            $('.rightpanel').animate({ width: '0%' }, 1000);
            $('.leftpanel').animate({ width: '90%' }, 1000);
            break;
        case 2:
            $(".expandText").addClass("collapseText"); // added by Joe - switch between collapse and expand
            $('.rightpanel').animate({ width: '90%' }, 1000);
            $('.leftpanel').animate({ width: '0%' }, 1000);

            break;
    }

};
$(document).ready(function () {

    PrepareSelectall();

    jQuery.expr.filters.icontains = function (elem, i, m) {
        return (elem.innerText || elem.textContent || "").toLowerCase().indexOf(m[3].toLowerCase()) > -1;
    }
    $('#next').click(function () {

        var number = parseInt($("#current").text());
        var num_pages = $("#num_pages").text();
        if (num_pages > number) {
            number = (number + 1);

            $("#current").text(number);

            GetAll(number, $("#selectOption").val());
            selectPage(number);
        }

    });

    $('#previous').click(function () {

        var number = parseInt($("#current").text());
        if (number > 1) {

            number = (number - 1);


            $("#current").text(number);

            GetAll(number, $("#selectOption").val());
            selectPage(number);
        }

    });


    //$(".pageIndex").live('click', function (event)
    $(document).on('click', '.pageIndex', function (event) {
        var number = parseInt(event.target.id) + 1;
        GetAll(number, $("#selectOption").val());
        selectPage(number);
    });


    $('#devinvite.yes').click(function () {

        var ids = [];
        $('.leftpanel .checked').each(function () {
            id = $(this).attr('id');
            if (id != undefined) {

                ids.push(id);
            }

        });

        if (ids.length > 0) {
            noty({ text: '<div class="preloader-wait">Sending invitations. Please wait...</div>', layout: 'topRight', type: 'information' });
            $.ajax({
                url: '/usermanagement/invite/',
                cache: false,
                type: 'POST',
                data: {
                    'ids': ids.toString(),

                },
                dataType: 'json',
                success: function (data) {
                    GetAll();
                    $.noty.closeAll();
                    noty({ text: 'All invitations has been sent.', layout: 'topRight', type: 'success', timeout: 2000 });
                    //document.location.reload(true);
                },
                error: function () {
                    //alert('failure');
                    $.noty.closeAll();
                    noty({ text: 'Error sending invitations. Please try again.', layout: 'topRight', type: 'error', timeout: 2000 });
                }
            });
        }
    });

    $('.rightpanelexpand').click(function () {
        switch (panal_expand_emode) {
            case 0:
                update_expand_mode(2);
                break;
            case 1:
                update_expand_mode(0);
                break;
            case 2:
                update_expand_mode(0);
                break;
        }
    });
    $('.leftpanelexpand').click(function () {
        switch (panal_expand_emode) {
            case 0:
                update_expand_mode(1);
                break;
            case 1:
                update_expand_mode(0);
                break;
            case 2:
                update_expand_mode(0);
                break;
        }
    });


    //$('.pages').accordion();

    //$.getJSON('/usermanagement/getallcandidate/', function(data) {
    //    alert('hello from render'); render(data); alert('hello after render');
    //});


    GetAll(1, "Participant");

    $('.closeaddform').click(function () {
        $('.addform').hide();
        $('.addform fieldset input').val('');
    });
    $('.addone').click(function () {
        $('.addform').show();
    });

    //$('.usercheckbox').live('click', function () {
    $(document).on('click', '.usercheckbox', function () {
        if ($(this).hasClass('checked')) {
            $(this).removeClass('checked');
        } else {
            $(this).addClass('checked');
        }
    });
    $('.addnewcandidatebutton').click(function () {

        if ($('#addnewcadidateform').valid()) {

            $.ajax({
                url: '/usermanagement/addcandidate/',
                type: 'POST',
                data: {
                    'firstname': $('#firstname').val(),
                    'lastname': $('#lastname').val(),
                    'email': $('#email').val(),
                },
                dataType: 'json',
                success: function (data) {
                    if (data['error'] != undefined) {
                        // alert(data['error']);
                        $('.pageWrapper .displayerror').append('<div class="submit_form_message"><div class="confirmationerror2">Data is duplicated. Please check</div></div>');
                    } else {
                        renderUsers(data);
                        $('#firstname').val('');
                        $('#lastname').val('');
                        $('#email').val('');
                        $('.pageWrapper .displayerror').html('');
                    }
                },
                error: function () {
                    //alert('failure');
                }
            });
        }
    });

    $('.addclosecandidatebutton').click(function () {

        if ($('#addnewcadidateform').valid()) {

            $.ajax({
                url: '/usermanagement/addcandidate/',
                type: 'POST',
                data: {
                    'firstname': $('#firstname').val(),
                    'lastname': $('#lastname').val(),
                    'email': $('#email').val(),
                },
                dataType: 'json',
                success: function (data) {
                    if (data['error'] != undefined) {
                        //  alert(data['error']);
                        $('.pageWrapper .displayerror').append('<div class="submit_form_message"><div class="confirmationerror2">Data is duplicated. Please check</div></div>');
                    } else {
                        renderUsers(data);
                        $('#firstname').val('');
                        $('#lastname').val('');
                        $('#email').val('');
                        $('.addform').hide();
                        $('.pageWrapper .displayerror').html('');
                    }
                },
                error: function () {
                    //alert('failure');
                }
            });
        }
    });

    $('.delete').click(function () {
        ids = [];
        var todelete = $(this).parents('.section').find('.usercheckbox.checked');
        var todelete = $('#puserlist').find('.usercheckbox.checked');

        //$('.checked').parent().parent().remove();

        for (i = 0; i < todelete.length; i++) {
            id = $(todelete[i]).attr('id');
            ids.push(id);

        }

        if (ids.length > 0) {

            $.ajax({
                url: '/usermanagement/deletecandidate/',
                type: 'POST',
                data: {
                    'ids': ids.toString()
                },
                dataType: 'json',
                success: function (data) {
                    UpdateSelectall();
                    todelete.parent().parent().remove();

                    //alert(data);
                },
                error: function () {
                    //alert('failure');
                }
            });

            refreshDisplay();
        }
    });


    $('.notify').click(function () {

        ids = [];
        var tonotify = $(this).parents('.notstartedpage.section').find('.usercheckbox.checked');
        //alert(tonotify.length);
        //return;
        //$('.checked').parent().parent().remove();
        for (i = 0; i < tonotify.length; i++) {
            id = $(tonotify[i]).attr('id');
            ids.push(id);

        }
        if (ids.length > 0) {

            $.ajax({
                url: '/usermanagement/notifycandidate/',
                type: 'POST',
                data: {
                    'ids': ids.toString()
                },
                dataType: 'json',
                success: function (data) {
                    document.location.reload(true);
                    //alert(data);
                },
                error: function () {
                    //alert('failure');
                }
            });

            refreshDisplay();
        }
    });

    //$('#reinvite.reinvite').click(function ()
    $('#divreinvite.yes').click(function () {
        //alert('tonotify');
        ids = [];
        var tonotify = $('#reinvite.reinvite').parents('.notstartedpage.section').find('.usercheckbox.checked');

        //alert(tonotify.length);

        //alert(tore.length);
        //$('.checked').parent().parent().remove();
        for (i = 0; i < tonotify.length; i++) {
            id = $(tonotify[i]).attr('id');
            ids.push(id);

        }


        if (ids.length > 0) {
            noty({ text: '<div class="preloader-wait">Sending invitations. Please wait...</div>', layout: 'topRight', type: 'information' });
            $.ajax({
                url: '/usermanagement/invite/',
                type: 'POST',
                data: {
                    'ids': ids.toString()
                },
                dataType: 'json',
                success: function (data) {

                    GetAll();
                    $.noty.closeAll();
                    noty({ text: 'All invitations has been sent.', layout: 'topRight', type: 'success', timeout: 2000 });
                    //document.location.reload(true);
                    //alert(data);
                },
                error: function () {
                    $.noty.closeAll();
                    noty({ text: 'Error sending invitations. Please try again.', layout: 'topRight', type: 'error', timeout: 2000 });
                }
            });

            refreshDisplay();
        }
    });

    // $('#inprogresspagereinvite.reinvite').click(function () {
    $('#divinprogresspagereinvite.yes').click(function () {

        ids = [];
        var tonotify = $('#inprogresspagereinvite.reinvite').parents('.inprogresspage.section').find('.usercheckbox.checked');
        //alert(tonotify.length);
        //return;
        //$('.checked').parent().parent().remove();
        for (i = 0; i < tonotify.length; i++) {
            id = $(tonotify[i]).attr('id');
            ids.push(id);

        }
        if (ids.length > 0) {
            noty({ text: '<div class="preloader-wait">Sending invitations (In Progress). Please wait...</div>', layout: 'topRight', type: 'information' });
            $.ajax({
                url: '/usermanagement/invite/',
                cache: false,
                type: 'POST',
                data: {
                    'ids': ids.toString()
                },
                dataType: 'json',
                success: function (data) {

                    GetAll();
                    $.noty.closeAll();
                    noty({ text: 'All invitations has been sent.', layout: 'topRight', type: 'success', timeout: 2000 });
                },
                error: function () {
                    $.noty.closeAll();
                    noty({ text: 'Error sending invitations. Please try again.', layout: 'topRight', type: 'error', timeout: 2000 });
                }
            });

            refreshDisplay();
        }
    });

    //$('#finishedpagereinvite.reinvite').click(function () {
    $('#divfinishedpagereinvite.yes').click(function () {


        ids = [];
        var tonotify = $('#finishedpagereinvite.reinvite').parents('.finishedpage.section').find('.usercheckbox.checked');
        //alert(tonotify.length);
        //return;
        //$('.checked').parent().parent().remove();
        for (i = 0; i < tonotify.length; i++) {
            id = $(tonotify[i]).attr('id');
            ids.push(id);

        }
        if (ids.length > 0) {
            noty({ text: '<div class="preloader-wait">Sending invitations (Completed). Please wait...</div>', layout: 'topRight', type: 'information' });
            $.ajax({
                url: '/usermanagement/invite/',
                type: 'POST',
                data: {
                    'ids': ids.toString()
                },
                dataType: 'json',
                success: function (data) {

                    GetAll();
                    $.noty.closeAll();
                    noty({ text: 'All invitations has been sent.', layout: 'topRight', type: 'success', timeout: 2000 });
                },
                error: function () {
                    $.noty.closeAll();
                    noty({ text: 'Error sending invitations. Please try again.', layout: 'topRight', type: 'error', timeout: 2000 });
                }
            });

            refreshDisplay();
        }
    });


    $('#notstartedpageexclude.exclude').click(function () {
        ids = [];
        var tonotify = $(this).parents('.notstartedpage.section').find('.usercheckbox.checked');
        //alert(tonotify.length);

        for (i = 0; i < tonotify.length; i++) {
            id = $(tonotify[i]).attr('id');
            ids.push(id);

        }

        if (ids.length > 0) {
            noty({ text: '<div class="preloader-wait">Excluding Participants. Please wait...</div>', layout: 'topRight', type: 'information' });
            $.ajax(
                {
                    url: '/usermanagement/exclude/',
                    type: 'POST',
                    data: {
                        'ids': ids.toString()
                    },
                    dataType: 'json',
                    success: function (data) {
                        GetAll();
                        $.noty.closeAll();
                        noty({ text: 'The operation completed successfully.', layout: 'topRight', type: 'success', timeout: 2000 });
                    },
                    error: function () {
                        $.noty.closeAll();
                        noty({ text: 'Error. Please try again.', layout: 'topRight', type: 'error', timeout: 2000 });
                    }
                });

            refreshDisplay();
        }
    });


    $('#inprogresspageexclude.exclude').click(function () {
        ids = [];
        var tonotify = $(this).parents('.inprogresspage.section').find('.usercheckbox.checked');

        //alert(tonotify.length);

        for (i = 0; i < tonotify.length; i++) {
            id = $(tonotify[i]).attr('id');
            ids.push(id);

        }

        if (ids.length > 0) {
            noty({ text: '<div class="preloader-wait">Excluding Participants. Please wait...</div>', layout: 'topRight', type: 'information' });
            $.ajax(
                {
                    url: '/usermanagement/exclude/',
                    type: 'POST',
                    data: {
                        'ids': ids.toString()
                    },
                    dataType: 'json',
                    success: function (data) {
                        GetAll();
                        $.noty.closeAll();
                        noty({ text: 'The operation completed successfully.', layout: 'topRight', type: 'success', timeout: 2000 });
                    },
                    error: function () {
                        $.noty.closeAll();
                        noty({ text: 'Error. Please try again.', layout: 'topRight', type: 'error', timeout: 2000 });
                    }
                });

            refreshDisplay();
        }
    });

    $('#finishedpageexclude.exclude').click(function () {
        ids = [];
        var tonotify = $(this).parents('.finishedpage.section').find('.usercheckbox.checked');

        //alert(tonotify.length);

        for (i = 0; i < tonotify.length; i++) {
            id = $(tonotify[i]).attr('id');
            ids.push(id);

        }

        if (ids.length > 0) {
            noty({ text: '<div class="preloader-wait">Excluding Participants. Please wait...</div>', layout: 'topRight', type: 'information' });
            $.ajax(
                {
                    url: '/usermanagement/exclude/',
                    type: 'POST',
                    data: {
                        'ids': ids.toString()
                    },
                    dataType: 'json',
                    success: function (data) {
                        GetAll();
                        $.noty.closeAll();
                        noty({ text: 'The operation completed successfully.', layout: 'topRight', type: 'success', timeout: 2000 });
                    },
                    error: function () {
                        $.noty.closeAll();
                        noty({ text: 'Error. Please try again.', layout: 'topRight', type: 'error', timeout: 2000 });
                    }
                });

            refreshDisplay();
        }
    });


    $('.include').click(function () {
        ids = [];
        var tonotify = $(this).parents('.excludedpage.section').find('.usercheckbox.checked');
        //alert(tonotify.length);

        for (i = 0; i < tonotify.length; i++) {
            id = $(tonotify[i]).attr('id');
            ids.push(id);

        }

        if (ids.length > 0) {
            noty({ text: '<div class="preloader-wait">Including Participants. Please wait...</div>', layout: 'topRight', type: 'information' });
            $.ajax(
                {
                    url: '/usermanagement/include/',
                    type: 'POST',
                    data: {
                        'ids': ids.toString()
                    },
                    dataType: 'json',
                    success: function (data) {
                        GetAll();
                        $.noty.closeAll();
                        noty({ text: 'The operation completed successfully.', layout: 'topRight', type: 'success', timeout: 2000 });
                    },
                    error: function () {
                        $.noty.closeAll();
                        noty({ text: 'Error. Please try again.', layout: 'topRight', type: 'error', timeout: 2000 });
                    }
                });

            refreshDisplay();
        }
    });


    $('.searchbox').keyup(function () {
        var keyword = $('.searchbox').val().toLowerCase();
        $('tr').hide();
        $('.header').show();
        $('tr:icontains("' + keyword + '")').show();
        refreshDisplay();

    });
    //$('.edit').live('click', function ()
    $(document).on('click', '.edit', function () {

        var row = $(this).closest('tr');

        var tdText = row.find('.firstname .editabletext').text();
        row.find('.firstname .editabletext').hide();
        row.find('.firstname').append('<div class="editfiled"><input id="firstname" name="firstname" class="form-control required" minlength="2" value="' + tdText + '" /></div>');

        var tdText = row.find('.lastname .editabletext').text();
        row.find('.lastname .editabletext').hide();
        row.find('.lastname').append('<div class="editfiled"><input id="lastname" name="lastname" class="form-control required" minlength="2" value="' + tdText + '" /></div>');

        var tdText = row.find('.email .editabletext').text();
        row.find('.email .editabletext').hide();
        row.find('.email').append('<div class="editfiled"><input id="email" name="email" class="form-control required email" minlength="2" value="' + tdText + '" /></div>');

        $(this).siblings('.update').show();
        $(this).siblings('.cancel').show();
        $(this).hide();
        $('.edit').each(function () {
            $(this).removeClass('edit');
            $(this).addClass('editdisable');
        });
    });
    $(document).on('click', '.cancel', function () {
        //$('.cancel').live('click', function () {
        $(this).closest('tr').find('.editabletext').show();

        $(this).closest('tr').find('.editfiled').remove();
        $('.editdisable').each(function () {
            $(this).removeClass('editdisable');
            $(this).addClass('edit');
        });
        $(this).hide();
        $(this).siblings('.update').hide();
        $(this).siblings('.edit').show();
    });
    //$('.update').live('click', function () {
    $(document).on('click', '.update', function () {
        if ($('#editform').valid()) {
            var row = $(this).closest('tr');
            id = row.find('.usercheckbox').attr('id');
            firstname = row.find('#firstname').val();
            lastname = row.find('#lastname').val();
            email = row.find('#email').val();

            $.ajax({
                url: '/usermanagement/updateuser/',
                type: 'POST',
                data: {
                    'id': id,
                    'firstname': firstname,
                    'lastname': lastname,
                    'email': email

                },
                dataType: 'json',
                success: function (data) {
                    if (data.toString() != 'success') {
                        alert('communication failure with the server.');
                    }
                },
                error: function () {
                    alert('error : communication failure with the server.');
                }
            });

            row.find('.firstname').text(firstname);
            row.find('.lastname').text(lastname);
            row.find('.email').text(email);

            row.find('.editabletext').show();

            $('.editdisable').each(function () {
                $(this).removeClass('editdisable');
                $(this).addClass('edit');
            });
            $(this).hide();
            $(this).siblings('.cancel').hide();
            $(this).siblings('.edit').show();
            row.find('.editfiled').remove();
        }

    });

    $('.findallduplicate').click(function () {
        findDuplicate();
    });

    $('.findduplicate').click(function () {
        findDuplicate(true);
    });
    function findDuplicate(stopAtFirstDuplicate) {
        if (stopAtFirstDuplicate == undefined)
            stopAtFirstDuplicate = false;

        var duplicateCount = 0;
        var emails = $('td:.email > .editabletext');
        for (var i = 0; i < emails.length; i++) {
            for (var j = 0; j < emails.length; j++) {
                if (i != j && $(emails[i]).text() == $(emails[j]).text()) {
                    duplicateCount++;
                    $(emails[i]).closest('tr').css({
                        'background-color': '#f00'
                    });
                    $(emails[j]).closest('tr').css({
                        'background-color': '#f00'
                    });
                    if (stopAtFirstDuplicate)
                        return;
                }

            }
        }
        //alert(duplicateCount);

    }

    $(document).on('click', '.test', function () {
        //$('.test').live('click', function () {
        $('#editform').valid();
    });


    // Change defualt JQuery validation Messages.
    var validator = $("#addnewcadidateform").validate({
        rules: {
            firstname: "required",
            lastname: "required",
            email: "required email",
        },
        messages: {
            firstname: "Please provide the first name of your invitee",
            lastname: "Please provide the last name of your invitee",
            email: {
                required: "Please provide Email of your invitee",
                email: "Please be sure that your invitee�s email is correct",

            }


        }
    });


});
