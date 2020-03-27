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



function survey_closed(){
    if(_surveyClosed == "vtrue"){ /* IF NOT ACTIVE */
	$('#divopensurvey').show();
	$('#testdiv').show();
	$('#menu-item-12').hide();
	$('#menu-item-13').show();
	$('#divclosesurvey').hide();	
    }else{
	$('#divopensurvey').hide();
	$('#testdiv').hide();
	$('#menu-item-12').show();
	$('#menu-item-13').hide();
	$('#divclosesurvey').show();
	
	$('#btnclosesurvey').click(function(){
	    //$('#btnclosesurvey').prop('disabled', true);			 
	    $("#testdiv a").click(function(event){
		$('a').unbind('click');			
	    });
	});
    }      
}

function CS(redirect){
    $.ajax({
	url: '/survey/closed/',
	cache: false,
	type: 'POST',
	data: { 'value': 'closed' },
	//dataType: 'json',
	success: function (){
	    _surveyClosed = "vtrue";
	    survey_closed();
	    if (redirect) window.location = "/report/category/radar/";
	},
	error: function (request, status, error){
	    $.noty.closeAll();
	}
        
    });
    
}

function GetAll(){
    $.ajax({
        url: '/usermanagement/getallcandidate/',
        cache: false,
        dataType: "json",
        success: function (data) {
          
	    participantsList = [];      
	    $.each(data, function(i, item) {
		participantsList.push({status: data[i].status, 
                                       first_name: data[i].first_name, 
                                       last_name: data[i].last_name, 
                                       id: data[i].id, 
                                       email: data[i].email});
	    });      
        },
        error: function (request, status, error) { alert(status + ", " + error); }
    });
}


function Invite_inprogress(){
    $('.modal').modal('hide');
    
    ids = [];
    $(participantsList).each(function() {
	if (this.status === "Started"){
	    ids.push(this.id);
	}
    });
    if (ids.length > 0) {
	noty({text: '<div class="preloader-wait">Sending reminders. Please wait...</div>',layout:'topRight',type:'information'});
        $.ajax({
            url: '/usermanagement/notifycandidate/ReminderInProgress/',
            type: 'POST',
            data: {
                'ids': ids.toString()
            },
            dataType: 'json',
            success: function (data) {
                $.noty.closeAll();
		noty({text: 'All reminders has been sent.',layout:'topRight',type:'success',timeout:2000});
            },
            error: function () {
		noty({text: 'Error sending reminders. Please try again.',layout:'topRight',type:'error',timeout:2000});
            }
        });
        
    }else{
	noty({text: 'All reminders have been sent or surveyed list is empty.',layout:'topRight',type:'error',timeout:2000});
    }    
}

function Invite_notstarted(){
    $('.modal').modal('hide');
    
    ids = [];
    $(participantsList).each(function() {
	if (this.status === "Invited"){
	    ids.push(this.id);
	}
    });
    if (ids.length > 0) {
	noty({text: '<div class="preloader-wait">Sending reminders. Please wait...</div>',layout:'topRight',type:'information'});
        $.ajax({
            url: '/usermanagement/notifycandidate/ReminderNotStarted/',
            type: 'POST',
            data: {
                'ids': ids.toString()
            },
            dataType: 'json',
            success: function (data) {
                $.noty.closeAll();
		noty({text: 'All reminders has been sent.',layout:'topRight',type:'success',timeout:2000});
            },
            error: function () {
		noty({text: 'Error sending reminders. Please try again.',layout:'topRight',type:'error',timeout:2000});
            }
        });
    }else{
	noty({text: 'All reminders have been sent or surveyed list is empty.',layout:'topRight',type:'warning',timeout:2000});	
    }
}


$(document).ready(function (e){
    survey_closed();	

    GetAll();
    $('#notstarted-accept').click(function () {Invite_notstarted();});
    $('#progress-accept').click(function () {Invite_inprogress();});
    $('#btncs').click(function () {CS(true);});
    $('#btnclosesurvey, #menu-closesurvey').click(function () {CS();});
    $('#btnopensurvey, #menu-opensurvey').click(function () {
	
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
	    }

	});
	_surveyClosed = "vfalse";
	survey_closed();

    });

});
