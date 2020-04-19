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

function renderUsers(items)
{
   
	$("#temp").setTemplateElement('rows_template');
	$("#temp").processTemplate(items);
	$('#users_table tbody').append($("#temp").html());
	$("#temp").html('');
    //$("#users_table").tablesorter();
    $("#users_table").bind("sortEnd",function() { 
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
        output += '<div id="' + i + '" class="pageIndex ';
        if (i == currentPageNumber) {
            output += 'currentPageIndex';
        }
        output += '">' + (i + 1) + '</div>'
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



function GetAll(page) {

    $.ajax({
        url: '/survey/getalldemgraphic/',
        cache: false,
        data: {
            'page': page,
        },
        dataType: "json",
        success: function (data) {
            //alert('hello from ajax render');
            

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

   

    $('.selectall').live('click', function() {

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


    $(".pageIndex").live('click', function (event)
    {
        var number = parseInt(event.target.id)+1;       
        GetAll(number);
        selectPage(number);
    });

    
    $('.closeaddform').click(function(){
    $('.addform').hide();
    });
    $('.addone').click(function(){
    $('.addform').show();
    });

	$('.usercheckbox').live('click', function() {
		if($(this).hasClass('checked')) {
			$(this).removeClass('checked');
		} else {
			$(this).addClass('checked');
		}
	});
	$('.addcandidatebutton').click(function() {

	   
	    if ($('#addnewcadidateform').valid())
	    {
	        var viewable = false;
	        var required = false;
	        if ($('#required').is(':checked')) { required = true; }
	        if ($('#viewable').is(':checked')) { viewable = true; }
		    
			$.ajax({
				url : '/survey/adddemographic/',
				type : 'POST',
				data : {
				    'title': $('#title').val(),
				    'required': required ? 1 : 0,
				    'viewable': viewable ? 1 : 0,
					
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
					renderUsers(data);

					$('#title').val('');
					$('#required').attr('checked', false);
					$('#viewable').attr('checked', false);
					
					
					  $('.pageWrapper #display').html('');
                    }
				},
				error : function() {
					//alert('failure');
				}
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
			    url: '/survey/deletedemographic/',
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
	$('.edit').live('click', function() {
		var row = $(this).closest('tr');

		var tdText = row.find('.title .editabletext').text();
		row.find('.title .editabletext').hide();
		row.find('.title').append('<div class="editfiled"><input id="title" name="title" size="25" class="required" minlength="2" value="' + tdText + '" /></div>');

		var tdText = row.find('.chbxrequired .editabletext').text();
		row.find('.chbxrequired .editabletext').hide();
		row.find('.chbxrequired .truechbx').hide();
		row.find('.chbxrequired .falsechbx').hide();

		
		if (tdText == 'false') {
		    
		    row.find('.chbxrequired').append('<div class="editfiled"><input id="required" type="checkbox" name="required"  /></div>');
		} else
		{
		    
		    row.find('.chbxrequired').append('<div class="editfiled"><input id="required" type="checkbox" name="required" checked="checked" /></div>');
		}


		var tdText = row.find('.chbxviewable .editabletext').text();
		row.find('.chbxviewable .editabletext').hide();
		row.find('.chbxviewable .truechbx').hide();
		row.find('.chbxviewable .falsechbx').hide();

		if (tdText == 'false') {

		    row.find('.chbxviewable').append('<div class="editfiled"><input id="viewable" type="checkbox" name="viewable"  /></div>');
		} else {

		    row.find('.chbxviewable').append('<div class="editfiled"><input id="viewable" type="checkbox" name="viewable" checked="checked" /></div>');
		}

		
		

		
		$(this).siblings('.update').show();
		$(this).siblings('.cancel').show();
		$(this).hide();
		$('.edit').each(function() {
			$(this).removeClass('edit');
			$(this).addClass('editdisable');
		});
	});
	$('.cancel').live('click', function ()
	{

	    $(this).closest('tr').find('.editabletext').show();
	    $(this).closest('tr').find('.truechbx').show();
	    $(this).closest('tr').find('.falsechbx').show();	    
	    $(this).closest('tr').find('.nonetxt').show();
	    $(this).closest('tr').find('.nonetxt').removeAttr('style');
	    

	    $(this).closest('tr').find('.editfiled').remove();

		$('.editdisable').each(function() {
			$(this).removeClass('editdisable');
			$(this).addClass('edit');
		});
		$(this).hide();
		$(this).siblings('.update').hide();
		$(this).siblings('.edit').show();
	});
	$('.update').live('click', function() {
	    if ($('#editform').valid())
	    {
	        
			var row = $(this).closest('tr');
			id = row.find('.usercheckbox').attr('id');
			title = row.find('#title').val();
		
			var required = false;
			if (row.find('#required').is(':checked')) { required = true; }
			var viewable = false;
			if (row.find('#viewable').is(':checked')) { viewable = true; }
			

			$.ajax({
			    url: '/survey/updatedemographic/',
				type : 'POST',
				data : {
					'id' : id,
					'title': title,
					'required': required ? 1 : 0,
					'viewable': viewable ? 1 : 0,
					

				},
				dataType : 'json',
				success : function(data) {
					if(data.toString() != 'success') {
						alert('communication failure with the server.');
					}
				},
				error : function() {
					alert('error : communication failure with the server.');
				}
			});

			
			

			row.find('.title>.editabletext').text("");
			row.find('.title>.editabletext').append("<a class='values'  href='/survey/demographic/values?demographic=" + id + "'>" + title + "</a>");
			row.find('.editabletext').show();



			row.find('.chbxviewable').text("");
			
			if (viewable == true)
			{
			    
			    row.find('.chbxviewable').append('<div class="truechbx"> <div class="editabletext nonetxt">true</div></div>');
			} else {

			    row.find('.chbxviewable').append('<div class="falsechbx"> <div class="editabletext nonetxt">false</div></div>');
			}

			row.find('.chbxrequired').text("");
			
			if (required == true) {
			    row.find('.chbxrequired').append('<div class="truechbx"> <div class="editabletext nonetxt">true</div></div>');
			} else {

			    row.find('.chbxrequired').append('<div class="falsechbx"> <div class="editabletext nonetxt">false</div></div>');
			}

			

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
		    document.location.href = "demographic/values";
		})

    
		

    // Change defualt JQuery validation Messages.
		var validator = $("#addnewcadidateform").validate({
		    rules: {
		        title: "required",
		       
		    },
		    messages: {
		        title: "Please provide the title  of your Demographic",
		        


		    }
		});

    

});


	$(document).ready(function() {
	    $('.rounded').corners();
	});


$( document ).ready( function( ) {
            $.fn.qtip.styles.tooltipDefault = {
                background  : '#0088d0',
                color       : '#FFFFFF',
                textAlign   : 'left',
                border      : {
                    width   : 2,
                    radius  : 4,
                    color   : '#0474af'
                },
                width       : 400
            }

            // we are going to run through each element with the classTips class
            $( '.class_tips' ).each( function( ) {
                var contents = $( this ).attr( 'contents' );

                // the element has no rating tag or the rating tag is empty
                if ( contents == undefined || contents == '' ) {
                    contents = 'No data right now';
                }
                else {
                    contents = contents;
                }

                // create the tooltip for the current element
                $( this ).qtip( {
                    content     : contents,
                    position    : {
                        target  : 'mouse'
                    },
                    style       : 'tooltipDefault'
                } );
            } );
        } );


