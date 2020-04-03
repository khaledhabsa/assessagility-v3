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

var oldvalue = '';

function renderUsers(items) {

    $("#temp").setTemplateElement('rows_template');
    $("#temp").processTemplate(items);
    $('#users_table tbody').append($("#temp").html());
    $("#temp").html('');
    //$("#users_table").tablesorter();
    $("#users_table").bind("sortEnd", function () {
        refreshDisplay();
    });

    refreshDisplay();
}


function refreshDisplay() {
    //$('.result').html($('.result').html());
    $("tr:visible:even").css("background-color", "#fff");
    $("tr:visible:odd").css("background-color", "#eee");
   



}

function render(items) {

    // attach the template
    jQuery.jTemplatesDebugMode(true);

    $(".result").setTemplateElement("table_template");

    $(".result").processTemplate(items);
    renderUsers(items);

}


function renderpager(candidates) {
	
		if(candidates[0]['num_pages'] >= 2){
	   		$(".footerpagination").show();
	   	}else{
		   	$(".footerpagination").hide();
	   	}  
   
    $("#current").text(candidates[0]['number']);
    $("#num_pages").text(candidates[0]['num_pages']);  
  
    selectPage(candidates[0]['number']);
}


function selectPage(pageNumber) {
   
    currentPageNumber = parseInt(pageNumber);

    renderPagesIndex(currentPageNumber-1);
}


function renderPagesIndex(currentPageNumber)
{
    var num_pages = parseInt($("#num_pages").text());
    var output = "";
    x = 0;
    y = 10;

    if (num_pages > 10)
    {
        x = currentPageNumber - 5;
        y = currentPageNumber + 5;

        for (var i = 0; i < 6; i++)
        {
            if (y > num_pages)
            {
                y = y - 1;
                x = x - 1;
            }

            if (x <0) {
                y = y + 1;
                x = x + 1;
            }
        }

    } else
    {
        y = num_pages;
    }


    for (var i = x; i < y; i++) {
        output += '<span id="' + i + '" class="pageIndex btn btn-default btn-sm ';
        if (i == currentPageNumber) {
            output += 'currentPageIndex';
        }
        output += '">' + (i + 1) + '</span>'
    }

    if (currentPageNumber + 1 == 1) {
        $("#previous").addClass('disabled');
    } else
    {
        $("#previous").removeClass('disabled');
    }
    if (num_pages == currentPageNumber + 1) {
        $("#next").addClass('disabled');

    } else {
        $("#next").removeClass('disabled');
    }

    $(".pagesIndex").html(output);
}



function GetAll(page) {
   
  
    $.ajax({
        url: '/survey/getalldemgraphicvalue/',
        cache: false,
        data: {
            'page': page,
            'demographic': $('#demographic').val(),
        },
        dataType: "json",
        success: function (data) {
           // alert('hello from ajax render');
            

            render(data['users']);
            renderpager(data['paginatordata']);
            
        },
        error: function (request, status, error) { alert(status + ", " + error); }
    });

}



function UpdateSelectall() {
    if ($('.selectall').hasClass('checked')) {

        $('.selectall').removeClass('checked');
        $('.selectall').parents('table').find('.usercheckbox').removeClass('checked');

    }
}

function PrepareSelectall() {
    $('.selectall').live('click', function () {
        if ($(this).hasClass('checked')) {
            $(this).removeClass('checked');
            $(this).parents('table').find('.usercheckbox').removeClass('checked');

        } else {
            $(this).addClass('checked');
            $(this).parents('table').find('.usercheckbox').addClass('checked');

        }
    });
}




$(document).ready(function() {

	$(document).on('click', '.selectall', function(){
		    if($(this).hasClass('checked')) {
			    $(this).removeClass('checked');
                $('.usercheckbox').removeClass('checked');
            
		    } else {
			    $(this).addClass('checked');
                $('.usercheckbox').addClass('checked');
            
		    }
	    });

    jQuery.expr.filters.icontains = function(elem, i, m) {
        return (elem.innerText || elem.textContent || "").toLowerCase().indexOf(m[3].toLowerCase()) > -1;
    }

    GetAll(1);

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
        if (number > 1) {

            number = (number - 1);


            $("#current").text(number);

            GetAll(number);
            selectPage(number);
        }

    });


	$(document).on('click', '.pageIndex', function(event){
        var number = parseInt(event.target.id)+1;       
        GetAll(number);
        selectPage(number);
    });

    
    $('.closeaddform').click(function ()
    {
        $('.addform').hide();
        $('#value').val('');       
        $('.pageWrapper #display').html('');
    });
    $('.addone').click(function(){
    $('.addform').show();
    });


	$(document).on('click', '.usercheckbox', function(){
		if($(this).hasClass('checked')) {
			$(this).removeClass('checked');
		} else {
			$(this).addClass('checked');
		}
	});
	$('.addcandidatebutton').click(function() {
	    
	   
	    if ($('#addnewcadidateform').valid())
	    {
	        var demographic_id = $('select[name="slctdemographicssname"]').val()
	       
			$.ajax({
				url : '/survey/adddemographicvalue/',
				type : 'POST',
				data : {
				    'demographic_id': demographic_id,
				    'value': $('#value').val(),
					
				},
				dataType : 'json',
				success: function (data)
				{
				    
				    if (data['error'] != undefined)
				    {
              
				        $('.pageWrapper #display').append('<div class="submit_form_message"><div class="confirmationerror2">Data is duplicated. Please check</div></div>');
                    }
                    else
                    {
					
				    GetAll(1);
				    $('#value').val('');
				    $('.addform').hide();
				    $('.pageWrapper #display').html('');
					GetAll(parseInt($("#current").text()));
					
					
					 
                    }
				},
				error: function (request, status, error) { alert(status + ", " + error); }
			});
		}
		
	});
	$('.delete').click(function () {
	   
		ids = [];
		var todelete = $('.usercheckbox.checked');

		//$('.checked').parent().parent().remove();

		for (i = 0; i < todelete.length; i++) {
			id = $(todelete[i]).attr('id');
			ids.push(id);

		}
		if(ids.length > 0) {

			$.ajax({
			    url: '/survey/deletedemographicvalue/',
			    cache: false,
				type : 'POST',
				data : {
					'ids' : ids.toString()
				},
				dataType : 'json',
				success: function (data)
				{
				   
				    UpdateSelectall();
				    todelete.parent().parent().remove();
					GetAll(parseInt($("#current").text()));
				    //render(data);
				    //alert(data);
				},
				error : function() {
					//alert('failure');
				}
			});

			refreshDisplay();
		}
	});
	$('.searchbox').keyup(function() {
		var keyword = $('.searchbox').val().toLowerCase();
		$('tr').hide();
		$('.header').show();
		$('tr:icontains("' + keyword + '")').show();
		refreshDisplay();

	});
	$(document).on('click', '.edit', function(){
		var row = $(this).closest('tr');

		var tdText = row.find('.value .editabletext').text();
		oldvalue = tdText;
		row.find('.value .editabletext').hide();
		row.find('.value').append('<div class="editfiled"><input id="value" name="value" size="25" class="required" minlength="2" value="' + tdText + '" /></div>');

		
		
		$(this).siblings('.update').show();
		$(this).siblings('.cancel').show();
		$(this).hide();
		$('.edit').each(function() {
			$(this).removeClass('edit');
			$(this).addClass('editdisable');
		});
	});
	$(document).on('click', '.cancel', function(){
		$(this).closest('tr').find('.editabletext').show();

		$(this).closest('tr').find('.editfiled').remove();
		$('.editdisable').each(function() {
			$(this).removeClass('editdisable');
			$(this).addClass('edit');
		});
		$(this).hide();
		$(this).siblings('.update').hide();
		$(this).siblings('.edit').show();
	});
	$(document).on('click', '.update', function(){
	    if ($('#editform').valid())
	    {
	        
			var row = $(this).closest('tr');
			id = row.find('.usercheckbox').attr('id');
			value = row.find('#value').val();
			
			if (oldvalue.trim() != value.trim()) {

			    var demographic_id = $('select[name="slctdemographicssname"]').val()

			    $.ajax({
			        url: '/survey/updatedemographicvalue/',
			        type: 'POST',
			        data: {
			            'id': id,
			            'value': value,
			            'demographic_id': demographic_id,


			        },
			        dataType: 'json',
			        success: function (data) {
			            switch (data.toString()) {
			                case 'duplicate':
			                    alert('Data is duplicated. Please check.');
			                    break;
			                case 'success':
			                    row.find('.value>.editabletext').text(value);
			                    break;
			                default:
			                    alert('communication failure with the server.');
			            }


			        },
			        error: function (request, status, error) { alert(status + ", " + error); }
			    });



			}
					

			row.find('.editabletext').show();
			$('.editdisable').each(function ()
			{
				$(this).removeClass('editdisable');
				$(this).addClass('edit');
			});
			$(this).hide();
			$(this).siblings('.cancel').hide();
			$(this).siblings('.edit').show();
			row.find('.editfiled').remove();
		}

	});

	

		// Redirect to manage page after click submit
		$(".Submit").click(function(){
			document.location.href ="manage";
		})

    
		

    // Change defualt JQuery validation Messages.
		var validator = $("#addnewcadidateform").validate({
		    rules: {
		        value: "required",
		       
		    },
		    messages: {
		        value: "Please provide the value  of your Demographic Value",
		        


		    }
		});

    

});
