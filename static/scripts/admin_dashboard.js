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



function survey_closed()
{
	if(_surveyClosed){
		$('#divopensurvey').show();
		$('#testdiv').show();
		$('#lireports').show();
		$('#divclosesurvey').hide();	
	}else{
		$('#divopensurvey').hide();
		$('#testdiv').hide();
		$('#lireports').hide();
		$('#divclosesurvey').show();
		
		$('#btnclosesurvey').click(function(){
			//$('#btnclosesurvey').prop('disabled', true);			 
			 $("#testdiv a").click(function(event){
				$('a').unbind('click');			
			});
	   });
	}      
}



$(document).ready(function (e)
{
	

	$(".resultSummeryBlock li").mouseover(function(){
		$(this).addClass("hightlightRow");
	})

	$(".resultSummeryBlock li").mouseout(function(){
		$(this).removeClass("hightlightRow");
	})

	$(".resultSummeryBlock li").mouseout(function () {
	    $(this).removeClass("hightlightRow");
	})

	$('#btnclosesurvey').click(function () {
	    $.ajax({
	        url: '/survey/closed/',
	        cache: false,
	        type: 'POST',
	        data: { 'value': 'closed' },
	        dataType: 'json',
	        success: function (data)
	        {
	            survey_closed();
	        },
	        error: function (request, status, error)
	        {
	            //alert(status + ", " + error);
	        }

	    });
				_surveyClosed = true;
	            survey_closed();


	});

	$('#btnopensurvey').click(function () {
	    $.ajax({
	        url: '/survey/closed/',
	        cache: false,
	        type: 'POST',
	        data: { 'value': 'opened' },
	        dataType: 'json',
	        success: function (data) {
				survey_closed();
	        },
	        error: function (request, status, error) {
	            //alert(status + ", " + error);
	        }

	    });
				_surveyClosed = false;
	            survey_closed();

	});

});