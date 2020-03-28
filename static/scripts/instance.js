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


function renderpager() {

    selectPage($("#current").text());
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

    } else {
        y = num_pages;
    }


    for (var i = x; i < y; i++) {
        output += '<div id="' + i + '" class="pageIndex ';
        if (i == currentPageNumber) {
            output += 'currentPageIndex';
        }
        output += '">' + (i + 1) + '</div>'
    }

    $(".pagesIndex").html(output);
}




function GetAll(page) {

   
   
    
    var input = $("<input>").attr("type", "hidden").attr("name", "page").val($("#current").text());
    $('#instanceform').append($(input));


    $('#instanceform').submit();
}


function NotifyAdmin(from,to,body)
{
    var f2 = $('.cmxform').valid();    
    if (f2) {
            $.ajax({
                url: 'notify_instance_admin/' + to,
                data: {
                    'from': from,
                    'body': body,
                    
                }
                ,
                success: function (data) {

                    if ('{success}' == data) {
                        alert('success');
                        //input.removeAttr('disabled');


                    }
                }

            });
            return true;
        } else {
        return false;
        }




}


$(document).ready(function () {

    jQuery(".content").hide();
    //toggle the componenet with class msg_body
    jQuery(".heading").click(function () {
        jQuery(this).next(".content").slideToggle(500);
    });



    $('.notifyinstanceadmin').click(function () {

        input = $(this);
        var email = $(this).prev().html();      
        $('#to').val(email);
       




    });


    renderpager();

    $('#next').click(function () {
       
        var number = parseInt($("#current").text());
        var num_pages = $("#num_pages").text();
        if (num_pages > number) {
            number = (number + 1);

            $("#current").text(number);         

            GetAll(number);
            selectPage(number);
        }

    });

    $('#previous').click(function () {

       
        var number = parseInt($("#current").text());
        if (number > 1)
        {
            number = (number - 1);
            $("#current").text(number);

           
            GetAll(number);
            selectPage(number);
        }

    });


    $(".pageIndex").live('click', function (event) {
        var number = parseInt(event.target.id) + 1;
        $("#current").text(number);
        GetAll(number);
        selectPage(number);
    });
   
    // Change defualt JQuery validation Messages.
    $(".cmxform").validate({
        rules: {
            to: "required",
            from: "required",
            emailbody: "required",
        },
        messages: {
            to: {
                required: "Please provide an email address (ex. yourname@company.com).",
                email: "Please be sure that your email is correct",
            },
            from: {
                required: "Please provide an email address (ex. yourname@company.com).",
                email: "Please be sure that your email is correct",
            },
          
          
            emailbody: "Please provide email body.",

        }
    });

});