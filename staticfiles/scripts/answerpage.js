$(document).ready(function() {
    var questions;
    var answers;
    var answerRanges;
    var currentPageNumber = 0;
    var pageQuestionsCount = 10;
    var pageCount = 0;
    var totalQuestionHeight = 45;

    setupClicks();

    function close_bubble() {
	$('.bubble').css({
	    'display' : 'none'
	});

    }
    // checkpoint
    function setupClicks() {
	$('.SubmitCommnet').live('click', function(event) {
	    event.preventDefault();
	    if($('.commenttext').val() != '') {
		$.getJSON('/comment/add/' + $('.commenttext').val(), null);
	    }
	    $('.commenttext').val('');
	    $(".panel").toggle("fast");
	    $(this).toggleClass("active");
	    
	    $('.comment_submission_confirmation').css({'left':($(window).width()-$('.comment_submission_confirmation').width())/2+'px'});
	    $('.comment_submission_confirmation').fadeIn('slow');
	    setTimeout(function(){
		$('.comment_submission_confirmation').fadeOut('slow');
	    },4000);
	});

	$('.bubble_close').live('click', function(event) {
	    close_bubble();

	});
	$('.glossary').live('click', function(event) {

	    $('.bubble_text').text($(this).children('.info').text());

	    var t = $(this).offset().top - $('.bubble').height();
	    var l = $(this).offset().left;

	    $('.bubble').css({
		'display' : 'inline'
	    });
	    $('.bubble').css({
		'top' : t
	    });
	    $('.bubble').css({
		'left' : l
	    });

	});

	$(":radio").live('click', function(event) {
	    setMyAnswer(event);
	});
	$(".previous_page").click(function() {
	    selectPreviousPage();
	});
	$(".next_page").click(function() {
	    selectNextPage();
	});
	$(".submit").click(function() {
	    var unanswerd_count = questions.length - answers.length;
	    if(unanswerd_count > 0) {
		var showOnlyUnansweredQuestion = confirm("You still have " + unanswerd_count + " questions to answer.\nWould you like to view the remaining questions only?");
		if(showOnlyUnansweredQuestion == true) {
		    renderPages('unanswered');
		}
	    } else {

		finishSurvey();

		//window.location ='/survey/finished/';
	    }
	});
	$(".pageIndex").live('click', function(event) {
	    selectPage(event.target.id);
	});

	$(".Unanswered").click(function(event) {
	    event.preventDefault();
	    renderPages('unanswered');

	});
	$(".All").click(function(event) {
	    event.preventDefault();
	    renderPages('all');

	});
	$(".Answered").click(function(event) {
	    event.preventDefault();
	    renderPages('answered');

	});
    }

    function finishSurvey()
    {
	
	var $form = $(".submit_form_message");
	$(".popupMessage").colorbox({
	    inline : true,
	    href : $form,
	    escKey : false,
	    height: "180px",
	    width: "550px",
	    overlayClose : false
	});
	$.getJSON('/survey/finished/', null);
	//$.getJSON('/logout/', null);
	
	
	

    }

    function answeredAll() {
	/*
	  var a = confirm('Congratulations! You have answered all questions.\nClick "OK" to submit your survey now, or "Cancel" to review your answers.');
	  if(a == true) {
	  finishSurvey();
	  }
	*/
    }

    function selectPreviousPage() {
	if(currentPageNumber > 0)
	    selectPage(currentPageNumber - 1);
    }

    function selectNextPage() {
	if(currentPageNumber < pageCount - 1)

	    selectPage(currentPageNumber + 1);

    }

    function selectPage(pageNumber) {
	close_bubble();
	currentPageNumber = parseInt(pageNumber);
	$('.questions_pages').animate({
	    scrollLeft : currentPageNumber * $('.page').width()
	}, 800);

	updateProgress();
	renderPagesIndex();
    }

    function setMyAnswer(event) {
	var ids = event.target.id.split('_');
	$.getJSON("/setanswer/" + ids[0] + "/" + ids[1] + "/", function(data) {

	    var answerUpdate = false;
	    for(var i in answers) {
		if(answers[i]['pk'] == data[0]['pk']) {
		    answers[i] == data[0];
		    answerUpdate = true;
		    break;
		}
	    }
	    if(answerUpdate == false) {
		answers.push(data[0]);

	    }
	    if(answers.length == questions.length) {
		answeredAll();
	    }
	    updateProgress();
	});
    }

    function translate(input) {
	var re;
	if(input.indexOf("#") > -1) {
	    for(var i in macros) {
		if(macros[i]['fields']['place_holder'].indexOf("#") > -1) {
		    var key = "\\$" + macros[i]['fields']['place_holder'] + "\\$";
		    re = new RegExp(key, "g");
		    input = input.replace(re, '<label class="glossary">' + macros[i]['fields']['place_holder'].replace(/#/g, "$") + '<label class="info">' + macros[i]['fields']['translation'] + '</label></label>');
		    re = new RegExp(macros[i]['fields']['place_holder'], "g");
		    input = input.replace(re, '<label class="glossary">' + macros[i]['fields']['place_holder'].replace(/#/g, "") + '<label class="info">' + macros[i]['fields']['translation'] + '</label></label>');
		}
	    }

	}
	for(var i in macros) {
	    re = new RegExp(macros[i]['fields']['place_holder'].replace(/\$/g, "\\$"), "g");
	    input = input.replace(re, macros[i]['fields']['translation']);
	}
	return input;
    };

    function renderPages(mode) {
	currentQuestionNumber = 0;
	currentPageNumber = 0;
	currentAnswerRangeIndex = 0;
	pageCount = 0;
	var output = "<div class='pages'>";

	$(".All").removeClass("GlobalButton");
	$(".Answered").removeClass("GlobalButton");
	$(".Unanswered").removeClass("GlobalButton");

	$(".All").addClass("GlobalButtonActive");
	$(".Answered").addClass("GlobalButtonActive");
	$(".Unanswered").addClass("GlobalButtonActive");

	switch(mode) {
	case 'unanswered':
	    $(".Unanswered").addClass("GlobalButton");
	    $(".Unanswered").removeClass("GlobalButtonActive");
	    break;
	case 'answered':
	    $(".Answered").addClass("GlobalButton");
	    $(".Answered").removeClass("GlobalButtonActive");
	    break;
	case 'all':
	default:
	    $(".All").addClass("GlobalButton");
	    $(".All").removeClass("GlobalButtonActive");
	    break;
	}

	while(currentQuestionNumber < questions.length) {
	    var rowIndicator = 0;
	    // start new page
	    output += "<div class='page'>";
	    pageCount++;
	    // table
	    output += "<table width='100%'>";
	    output += "<tr>";
	    output += "<td>";
	    output += "</td>";

	    // table header
	    currentAnswerRangeIndex = questions[currentQuestionNumber]['fields']['answer_range'];

	    for(var i = 0; i < answerRanges[currentAnswerRangeIndex].length; i++) {
		output += '<td class="answer_header">';
		output += '<div class="answer_title">' + answerRanges[currentAnswerRangeIndex][i]['fields']['title'] + '</div>';
		output += "</td>";
	    }

	    // questions
	    var i;
	    var displayedQuestionsCount = 0;
	    for( i = currentQuestionNumber; displayedQuestionsCount < pageQuestionsCount && i < questions.length; i++) {

		if(mode == 'unanswered') {
		    var answerd = false;
		    for(var j = 0; j < answerRanges[currentAnswerRangeIndex].length; j++) {
			for(var k in answers) {
			    if(answers[k]['fields']['indicator'] == questions[i]['pk'] && answers[k]['fields']['mcqanswer'] == answerRanges[currentAnswerRangeIndex][j]['pk']) {
				answerd = true;
			    }
			}
		    }
		    if(answerd == true) {
			continue;
		    }

		}

		if(mode == 'answered') {
		    var answerd = false;
		    for(var j = 0; j < answerRanges[currentAnswerRangeIndex].length; j++) {
			for(var k in answers) {
			    if(answers[k]['fields']['indicator'] == questions[i]['pk'] && answers[k]['fields']['mcqanswer'] == answerRanges[currentAnswerRangeIndex][j]['pk']) {
				answerd = true;
			    }
			}
		    }
		    if(answerd == false) {
			continue;
		    }

		}

		if(questions[i]['fields']['answer_range'] != currentAnswerRangeIndex) {
		    currentAnswerRangeIndex = questions[i]['fields']['answer_range'];
		    currentQuestionNumber = i;

		    break;

		}
		output += "<tr ";
		rowIndicator = (rowIndicator + 1) % 2;
		if(rowIndicator == 0) {
		    output += 'class="even_row"';
		} else {
		    output += 'class="odd_row"';
		}
		output += ">";
		output += "<td>";
		output += '<div class="question_body" id="' + i + '">' + translate(questions[i]['fields']['question']) + '</div>';
		output += "</td>";

		for(var j = 0; j < answerRanges[currentAnswerRangeIndex].length; j++) {
		    output += '<td class="choice_cell">';
		    output += '<div><input type="radio" name="q' + i + 'choice" id="' + questions[i]['pk'] + '_' + answerRanges[currentAnswerRangeIndex][j]['pk'] + '"';

		    // mark answer as selected
		    for(var k in answers) {
			if(answers[k]['fields']['indicator'] == questions[i]['pk'] && answers[k]['fields']['mcqanswer'] == answerRanges[currentAnswerRangeIndex][j]['pk']) {
			    output += ' checked="true" ';
			}
		    }
		    output += ' /></div>';
		    output += "</td>";

		}
		output += "</tr>";
		displayedQuestionsCount++;
	    }
	    output += "</table>";
	    //end new page
	    output += "</div>";

	    if(displayedQuestionsCount == 0) {
		output = output.substr(0, output.lastIndexOf("<div class='page'>"));
		pageCount--;
	    }
	    currentQuestionNumber = i;

	}
	output += "</div>";

	$(".current_page").html(output);
	$(".current_page").css({
	    'width' : $('.page').width() * (pageCount + 1)
	});
	$('.radioGroup input').ezMark();
	selectPage(0);

    };

    function updateProgress() {
	$(".progress_text").text((answers.length) + "/" + questions.length);
	$(".progress").animate({
	    width : Math.floor((answers.length ) / questions.length * $(".progress_range").width())
	}, 800);
    }

    function renderPagesIndex() {
	var output = "";
	for(var i = 0; i < pageCount; i++) {
	    output += '<div id="' + i + '" class="pageIndex ';
	    if(i == currentPageNumber) {
		output += 'currentPageIndex';
	    }
	    output += '">' + (i + 1) + '</div>'
	}

	$(".pagesIndex").html(output);
    }

    //$('.questions_pages').height($(document).height() - 268);
    pageQuestionsCount = Math.floor(($(document).height() - 268) / totalQuestionHeight);
    $.getJSON('/macros/', function(data) {
	macros = data;
	$.getJSON('/answerranges/', function(data) {
	    answerRanges = [];
	    for(var i in data) {
		index = data[i]['fields']['answerrange'];
		if(answerRanges[index] == undefined)
		    answerRanges[index] = [];

		answerRanges[index].push(data[i])

	    }
	    $.getJSON('/myanswers/', function(data) {
		answers = data;
		$.getJSON('/myquestions/', function(data) {
		    questions = data;
		    renderPages();
		});
	    });
	});
    });
});
