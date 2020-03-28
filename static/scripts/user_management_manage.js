var panal_expand_emode = 0;
var usedinvitations = 0;
function test(){
 $('.pageHeader').each(function(){
    $(this).text($(this).next().find('tbody > tr').size());
    });
}

jQuery(document).ajaxSend(function(event, xhr, settings) {
	function getCookie(name) {
		var cookieValue = null;
		if(document.cookie && document.cookie != '') {
			var cookies = document.cookie.split(';');
			for(var i = 0; i < cookies.length; i++) {
				var cookie = jQuery.trim(cookies[i]);
				// Does this cookie string begin with the name we want?
				if(cookie.substring(0, name.length + 1) == (name + '=')) {
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

	if(!safeMethod(settings.type) && sameOrigin(settings.url)) {
		xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
	}
});

function pageInit(ps){
    for(i in ps){
        $(ps[i]+" > .result").setTemplateElement("table_template");        
		$(ps[i]+" > .result").processTemplate();
    }
}

function pageSet(items,ps){
    for(i in ps){
        $("#temp").setParam("filter", ps[i].filter);
	    $("#temp").processTemplate(items);
	    $(ps[i].page+' > .result > .users_table tbody').append($("#temp").html());
	    $("#temp").html('');
       // $(ps[i].page+' > .result > .users_table').tablesorter();
        //$(ps[i].page+' > .result > .users_table').bind("sortEnd",function() { 
         //   refreshDisplay(); 
        //}); 
    }
}

function renderUsers(items) {
	$("#temp").setTemplateElement('rows_template');
	$("#temp").setParam("filter", 'Participant');
	$("#temp").processTemplate(items);
	$('.candidateresult > .users_table tbody').append($("#temp").html());
	$("#temp").html('');
//    $(".candidateresult > .users_table").tablesorter();
//    $(".candidateresult > .users_table").bind("sortEnd",function() { 
//        refreshDisplay();
//    }); 

 
	pageSet(items,[
    {'page':'.notstartedpage','filter':'Invited'},
    {'page':'.inprogresspage','filter':'Started'},
    {'page':'.finishedpage','filter':'Finished'},
    {'page':'.excludedpage','filter':'Deleted'},
    ]);
    refreshDisplay();
}


function refreshDisplay() {
	//$('.result').html($('.result').html());
	$("tr:visible:even").css("background-color", "#fff");
	$("tr:visible:odd").css("background-color", "#eee");
	CandidateCount = $(".status:contains('Participant')").size();
	$(".CandidateCount").text(CandidateCount);
	InvitedCount = $(".status:contains('Invited')").size();
	$(".InvitedCount").text(InvitedCount);
	StartedCount = $(".status:contains('Started')").size();
	$(".StartedCount").text(StartedCount);
	FinishedCount = $(".status:contains('Finished')").size();
	$(".FinishedCount").text(FinishedCount);
	UsedQuota = InvitedCount + StartedCount + FinishedCount;
	$(".UsedQuota").text(UsedQuota);

    $('.pageHeader').each(function(){
		var ccount = $(this).next().find('tbody > tr').size();
    	$(this).find('.count').text(ccount);
		if($(this).hasClass('page1')){$("#ccount-1").text(ccount)};
		if($(this).hasClass('page2')){$("#ccount-2").text(ccount)};
		if($(this).hasClass('page3')){$("#ccount-3").text(ccount)};
		if($(this).hasClass('page4')){$("#ccount-4").text(ccount)}

	});
	


    usedinvitations = 0;
    $('.rightpanel .count').each(function () { eval('usedinvitations=usedinvitations +' + $(this).text()) })

    $('.usedinvitations').text(usedinvitations);

}


function render(items) {

    // attach the template
    jQuery.jTemplatesDebugMode(true);

    $(".candidateresult").setTemplateElement("table_template");

    $(".candidateresult").processTemplate();

    pageInit(['.notstartedpage', '.inprogresspage', '.finishedpage', '.excludedpage']);


    renderUsers(items);

}


function GetAll()
{
     $.ajax(
        {
            url: '/usermanagement/getallcandidate/',
            cache: false,
            dataType: "json",
            success: function (data) {
                //alert('hello from ajax render');
                render(data);
                //alert('hello after ajax render');
            },
            error: function (request, status, error) { alert(status + ", " + error); }
        });

}


function Checkusedinvitations() 
{    
    quota = parseInt($('#quota').text());
 
    var ids = [];
    $('.leftpanel .checked').each(function () {
        id = $(this).attr('id');
        if (id != undefined) {

            ids.push(id);
        }

    });


    if (ids.length +usedinvitations > quota)
    {
        return false;
    }
    return true;
}

function UpdateSelectall() {
    if ($('.selectall').hasClass('checked')) {
       
        $('.selectall').removeClass('checked');
        $('.selectall').parents('table').find('.usercheckbox').removeClass('checked');

    }
}

function PrepareSelectall()
{
	$(document).on('click', '.selectall', function()
    {
        if ($(this).hasClass('checked'))
        {           
            $(this).removeClass('checked');
            $(this).parents('table').find('.usercheckbox').removeClass('checked');

        } else
        {           
            $(this).addClass('checked');
            $(this).parents('table').find('.usercheckbox').addClass('checked');

        }
    });
}

function update_expand_mode(newmode){
   panal_expand_emode=newmode
        switch(panal_expand_emode){
            case 0:
				$('.rightpanel').animate({width:'45%'},1000);
				$('.leftpanel').animate({width:'45%'},1000);
				$(".expandText").removeClass("collapseText"); // added by Joe - switch between collapse and expand
				break;
            case 1:
				$(".expandText").addClass("collapseText");// added by Joe - switch between collapse and expand
				$('.rightpanel').animate({width:'0%'},1000);
				$('.leftpanel').animate({width:'90%'},1000);
				break;
            case 2:
				$(".expandText").addClass("collapseText"); // added by Joe - switch between collapse and expand
				$('.rightpanel').animate({width:'90%'},1000);
				$('.leftpanel').animate({width:'0%'},1000);

	            break;
        }

};
$(document).ready(function () {

    PrepareSelectall();

    jQuery.expr.filters.icontains = function (elem, i, m) {
        return (elem.innerText || elem.textContent || "").toLowerCase().indexOf(m[3].toLowerCase()) > -1;
    }

   


    $('#devinvite.yes').click(function () {
       
            var ids = [];
            $('.leftpanel .checked').each(function () {
                id = $(this).attr('id');
                if (id != undefined) {

                    ids.push(id);
                }

            });

            if (ids.length > 0) {

                $.ajax({
                    url: 'invite/',
                    cache: false,
                    type: 'POST',
                    data: {
                        'ids': ids.toString(),

                    },
                    dataType: 'json',
                    success: function (data) {
                        GetAll();

                        //document.location.reload(true);
                    },
                    error: function () {
                        //alert('failure');
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
      

    GetAll();
      
    $('.closeaddform').click(function () {
        $('.addform').hide();
		$('.addform fieldset input').val('');
    });
    $('.addone').click(function () {
        $('.addform').show();
    });

    //$('.usercheckbox').live('click', function () {
		$(document).on('click', '.usercheckbox', function(){
        if ($(this).hasClass('checked')) {
            $(this).removeClass('checked');
        } else {
            $(this).addClass('checked');
        }
    });
    $('.addnewcandidatebutton').click(function () {

        if ($('#addnewcadidateform').valid()) {

            $.ajax({
                url: 'addcandidate/',
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
                url: 'addcandidate/',
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
                url: 'deletecandidate/',
                type: 'POST',
                data: {
                    'ids': ids.toString()
                },
                dataType: 'json',
                success: function (data)
                {                    
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
                url: 'notifycandidate/',
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
    $('#divreinvite.yes').click(function ()
    {
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
           
            $.ajax({
                url: 'invite/',
                type: 'POST',
                data: {
                    'ids': ids.toString()
                },
                dataType: 'json',
                success: function (data) {
                  
                    GetAll();
                    //document.location.reload(true);
                    //alert(data);
                },
                error: function () {
                    //alert('failure');
                }
            });

            refreshDisplay();
        }
    });

   // $('#inprogresspagereinvite.reinvite').click(function () {
    $('#divinprogresspagereinvite.yes').click(function () {
       
        ids = [];
        var tonotify =  $('#inprogresspagereinvite.reinvite').parents('.inprogresspage.section').find('.usercheckbox.checked');
        //alert(tonotify.length);
        //return;
        //$('.checked').parent().parent().remove();
        for (i = 0; i < tonotify.length; i++) {
            id = $(tonotify[i]).attr('id');
            ids.push(id);

        }
        if (ids.length > 0) {

            $.ajax({
                url: 'invite/',
                cache: false,
                type: 'POST',
                data: {
                    'ids': ids.toString()
                },
                dataType: 'json',
                success: function (data) {

                    GetAll();
                    //document.location.reload(true);
                    //alert(data);
                },
                error: function () {
                    //alert('failure');
                }
            });

            refreshDisplay();
        }
    });

     //$('#finishedpagereinvite.reinvite').click(function () {
     $('#divfinishedpagereinvite.yes').click(function () {
        
        
        ids = [];
        var tonotify =$('#finishedpagereinvite.reinvite').parents('.finishedpage.section').find('.usercheckbox.checked');
        //alert(tonotify.length);
        //return;
        //$('.checked').parent().parent().remove();
        for (i = 0; i < tonotify.length; i++) {
            id = $(tonotify[i]).attr('id');
            ids.push(id);

        }
        if (ids.length > 0) {

            $.ajax({
                url: 'invite/',
                type: 'POST',
                data: {
                    'ids': ids.toString()
                },
                dataType: 'json',
                success: function (data) {

                    GetAll();
                    //document.location.reload(true);
                    //alert(data);
                },
                error: function () {
                    //alert('failure');
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
       
        if (ids.length > 0)
        {

            $.ajax(
                {
                url: 'exclude/',
                type: 'POST',
                data: {
                    'ids': ids.toString()
                },
                dataType: 'json',
                success: function (data)
                {
                    GetAll();
                    //document.location.reload(true);
                    //alert(data);
                },
                error: function () {
                   // alert('failure');
                }
            });

            refreshDisplay();
        }
    });

    
    $('#inprogresspageexclude.exclude').click(function ()
    {
        ids = [];
        var tonotify = $(this).parents('.inprogresspage.section').find('.usercheckbox.checked');
        
        //alert(tonotify.length);

        for (i = 0; i < tonotify.length; i++) {
            id = $(tonotify[i]).attr('id');
            ids.push(id);

        }

        if (ids.length > 0) {

            $.ajax(
                {
                    url: 'exclude/',
                    type: 'POST',
                    data: {
                        'ids': ids.toString()
                    },
                    dataType: 'json',
                    success: function (data) {
                        GetAll();
                        //document.location.reload(true);
                        //alert(data);
                    },
                    error: function () {
                        alert('failure');
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

            $.ajax(
                {
                    url: 'exclude/',
                    type: 'POST',
                    data: {
                        'ids': ids.toString()
                    },
                    dataType: 'json',
                    success: function (data) {
                        GetAll();
                        //document.location.reload(true);
                        //alert(data);
                    },
                    error: function () {
                        alert('failure');
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

            $.ajax(
                {
                    url: 'include/',
                    type: 'POST',
                    data: {
                        'ids': ids.toString()
                    },
                    dataType: 'json',
                    success: function (data) {
                        GetAll();
                        //document.location.reload(true);
                        //alert(data);
                    },
                    error: function () {
                        //alert('failure');
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
	$(document).on('click', '.edit', function()
    {
        
        var row = $(this).closest('tr');

        var tdText = row.find('.firstname .editabletext').text();
        row.find('.firstname .editabletext').hide();
        row.find('.firstname').append('<div class="editfiled"><input id="firstname" name="firstname" size="25" class="required" minlength="2" value="' + tdText + '" /></div>');

        var tdText = row.find('.lastname .editabletext').text();
        row.find('.lastname .editabletext').hide();
        row.find('.lastname').append('<div class="editfiled"><input id="lastname" name="lastname" size="25" class="required" minlength="2" value="' + tdText + '" /></div>');

        var tdText = row.find('.email .editabletext').text();
        row.find('.email .editabletext').hide();
        row.find('.email').append('<div class="editfiled"><input id="email" name="email" size="25" class="required email" minlength="2" value="' + tdText + '" /></div>');

        $(this).siblings('.update').show();
        $(this).siblings('.cancel').show();
        $(this).hide();
        $('.edit').each(function () {
            $(this).removeClass('edit');
            $(this).addClass('editdisable');
        });
    });
	$(document).on('click', '.cancel', function(){
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
		$(document).on('click', '.update', function(){
        if ($('#editform').valid()) {
            var row = $(this).closest('tr');
            id = row.find('.usercheckbox').attr('id');
            firstname = row.find('#firstname').val();
            lastname = row.find('#lastname').val();
            email = row.find('#email').val();

            $.ajax({
                url: 'updateuser/',
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

	$(document).on('click', '.test', function(){
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
