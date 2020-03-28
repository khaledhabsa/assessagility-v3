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




function SetDemographicsValues() {
    var demographics_values = "";
    $("select").each(function () {
        var id = $(this).attr('id').toString();
        if (id.indexOf('demo') == 0)
        { demographics_values += $(this).val() + " "; }
    });

    return demographics_values;

}


$(document).ready(function () {
	
	$('#Report2PDF').click(function () {
        
	//    //var html = "<html> <head>";
	//    //html = html + $("head").html() + "</head> <body>" + $('#divReport2PDF').html() + "</body> </html>"

	//    //html =  $('#divReport2PDF').html() 
	    
	//    //alert(document.documentElement.outerHTML);
	//    //alert(html);
	//    //html = "Hello <strong>World</strong>";
	   
	 $('#Report2PDFhidden').val('PDF');	    
	 $('#demographics_values').val(SetDemographicsValues()); 

	 $('#ToPDFFORM').submit();
	           
	});

	$('#Report2Mail').click(function () {
	    if ($('#ToPDFFORM').valid())
	    {
	        $('#Report2PDFhidden').val('Mail');
	        $('#demographics_values').val(SetDemographicsValues());
	        $('#ToPDFFORM').submit();
	    }
	   

	});

	$('#openoverlay').click(function () {

	    $('.centered').toggle();

	});
	$("#openoverlay").live('click', function () {
	    var divTop = 75 + $(window).scrollTop();    // places the popup 75px from the top       
	   // $('.centered').css({ 'top': divTop, 'display': 'block', 'z-index': '5005' });
	});
	

	$('#Customizereport').click(function () {
           
	   
	    $('#demographics_values').val(SetDemographicsValues());
	    $('#Report2PDFhidden').val('None');
	   
	   

	});

	
    // Change defualt JQuery validation Messages.
	$("#ToPDFFORM").validate({
	    rules: {            email: "required email",
	        


	    },
	    messages: {
	       
	        email: {
	            required: "Please provide an email address (ex. yourname@company.com).",
	            email: "Please be sure that your email is correct",
	        },

	        


	    }
	});
});
