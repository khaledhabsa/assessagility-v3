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
	CandidateCount = $(".status:contains('Participant')").length;
	$(".CandidateCount").text(CandidateCount);
	InvitedCount = $(".status:contains('Invited')").length;
	$(".InvitedCount").text(InvitedCount);
	StartedCount = $(".status:contains('Started')").length;
	$(".StartedCount").text(StartedCount);
	FinishedCount = $(".status:contains('Finished')").length;
	$(".FinishedCount").text(FinishedCount);
	UsedQuota = InvitedCount + StartedCount + FinishedCount;
	$(".UsedQuota").text(UsedQuota);


}

function render(items) {

	// attach the template
	jQuery.jTemplatesDebugMode(true);

	$(".result").setTemplateElement("table_template");

	$(".result").processTemplate(items);
	renderUsers(items);

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


function GetAll(page) {

	$.ajax({
		url: '/usermanagement/getallcandidate/',
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




$(document).ready(function () {

	//$('.selectall').live('click', function() {
	$(document).on('click', '.selectall', function () {

		if ($(this).hasClass('checked')) {
			$(this).removeClass('checked');
			$('.usercheckbox').removeClass('checked');

		} else {
			$(this).addClass('checked');
			$('.usercheckbox').addClass('checked');

		}
	});

	jQuery.expr.filters.icontains = function (elem, i, m) {
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


	//$(".pageIndex").live('click', function (event)
	$(document).on('click', '.pageIndex', function (event) {
		var number = parseInt(event.target.id) + 1;
		GetAll(number);
		selectPage(number);
	});


	/*
		$('.closeaddform').click(function(){
		$('.addform').hide();
		});
		$('#addone').click(function(){
		$('.addform').show();
		});*/

	//$('.usercheckbox').live('click', function() {
	$(document).on('click', '.usercheckbox', function (event) {
		if ($(this).hasClass('checked')) {
			$(this).removeClass('checked');
		} else {
			$(this).addClass('checked');
		}
	});
	$('.addcandidatebutton').click(function () {


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
					$('#display').empty();

					if (data['error'] != undefined) {
						//   alert(data['error']);
						$('#display').append('<div class="alert alert-danger">This Email is duplicated. Please check</div>');
					} else {
						renderUsers(data);
						$('#firstname').val('');
						$('#lastname').val('');
						$('#email').val('');
						// $('.pageWrapper #display').css('display','none');
						$('.pageWrapper #display').html('');

						GetAll(parseInt($("#current").text()));
						$('#display').html('<div class="alert alert-success">Successfully added!</div>');
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
		var todelete = $('.usercheckbox.checked');

		//$('.checked').parent().parent().remove();

		for (i = 0; i < todelete.length; i++) {
			id = $(todelete[i]).attr('id');
			ids.push(id);

		}
		if (ids.length > 0) {

			$.ajax({
				url: 'deletecandidate/',
				cache: false,
				type: 'POST',
				data: {
					'ids': ids.toString()
				},
				dataType: 'json',
				success: function (data) {

					UpdateSelectall();
					todelete.parent().parent().remove();
					GetAll(parseInt($("#current").text()));
					//render(data);
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
	//$('.edit').live('click', function() {
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
		row.find('.email').append('<div class="editfiled"><input id="email" name="email" class="form-control required" minlength="2" value="' + tdText + '" /></div>');


		$(this).siblings('.update').show();
		$(this).siblings('.cancel').show();
		$(this).hide();
		$('.edit').each(function () {
			$(this).removeClass('edit');
			$(this).addClass('editdisable');
		});
	});
	//$('.cancel').live('click', function() {
	$(document).on('click', '.cancel', function () {
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
	//$('.update').live('click', function() {
	$(document).on('click', '.update', function () {
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

			row.find('.firstname>.editabletext').text(firstname);
			row.find('.lastname>.editabletext').text(lastname);
			row.find('.email>.editabletext').text(email);

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




	//$('.test').live('click', function() {
	$(document).on('click', '.test', function () {
		$('#editform').valid();
	});

	// Redirect to manage page after click submit
	$(".Submit").click(function () {
		document.location.href = "manage";
	})




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
