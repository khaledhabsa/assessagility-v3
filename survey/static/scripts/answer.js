$(document).ready(function() {
	var questions;
	var answers;
	var answerRanges;
	var answermode = 'all';
	var currentQuestionID = 0;
	var firstUnansweredQuestion = -1;
	var macros;
	var totalQuestionHeight = 16;
	var fadeDuration = 400;
	setupClicks();

	function updateUI(mode) {
		close_bubble();
		answermode = mode;
		$('.scroll-pane').data('jsp').scrollTo(0, 0);
		$(".currentQuestion").removeClass("currentQuestion");

		$(".All").removeClass("GlobalButton");
		$(".Answered").removeClass("GlobalButton");
		$(".Unanswered").removeClass("GlobalButton");

		$(".All").addClass("GlobalButtonActive");
		$(".Answered").addClass("GlobalButtonActive");
		$(".Unanswered").addClass("GlobalButtonActive");

		$('.choices').html("")
		switch(mode) {
			case 'unanswered':
				$(".Unanswered").addClass("GlobalButton");
				$(".Unanswered").removeClass("GlobalButtonActive");
				$('.questionTitle').html("You have " + (questions.length - answers.length) + " unanswered questions");
				break;
			case 'answered':
				$(".Answered").addClass("GlobalButton");
				$(".Answered").removeClass("GlobalButtonActive");
				$('.questionTitle').html("You have answered " + answers.length + " questions");
				break;
			case 'all':
			default:
				$(".All").addClass("GlobalButton");
				$(".All").removeClass("GlobalButtonActive");
				$('.questionTitle').html("You have " + questions.length + " questions");
				break;
		}
	}

	function close_bubble() {
		$('.bubble').css({
			'display' : 'none'
		});

	}


	$(document).keyup(function(e) {
		if(e.keyCode == 27) {
			$('.bubble').css({
				'display' : 'none'
			});
		}
	});
	
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

			$('.comment_submission_confirmation').css({
				'left' : ($(window).width() - $('.comment_submission_confirmation').width()) / 2 + 'px'
			});
			$('.comment_submission_confirmation').fadeIn('slow');
			setTimeout(function() {
				$('.comment_submission_confirmation').fadeOut('slow');
			}, 4000);
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

		$(".question").live('click', function(event) {
			selectQuestion($(this).attr('id'));
		});

		$(".question").live("mouseover mouseout", function(event) {
			if(event.type == "mouseover") {
				$(this).addClass("answerdQuestionhover");
			} else {
				$(this).removeClass("answerdQuestionhover");
			}
		});
		$(".submit").click(function() {
			var unanswerd_count = questions.length - answers.length;
			if(unanswerd_count > 0) {
				var showOnlyUnansweredQuestion = confirm("You still have " + unanswerd_count + " questions to answer.\nWould you like to view the remaining questions only?");
				if(showOnlyUnansweredQuestion == true) {
					$(".question").show();
					$(".answerdQuestion").hide();
					updateUI('unanswered');
				}
			} else {
				finishSurvey();
			}
		});

		$(":radio").live('click', function(event) {
			setMyAnswer(event);
		});
		$(".previous").click(function() {
			selectPreviousQuestion();
		});
		$(".show_hide").click(function() {
			$(".questions_list").animate({
				width : 'toggle'
			}, 300, function() {
				$("#questions_list").css("overflow-y", "scroll");
				//$('.scroll-pane').jScrollPane();
			});
		});

		$(".Unanswered").click(function(event) {
			event.preventDefault();
			$(".question").show();
			$(".answerdQuestion").hide();
			updateUI('unanswered');

		});

		$(".All").click(function(event) {
			event.preventDefault();
			$(".answerdQuestion").show();
			$(".question").show();

			updateUI('all');

		});
		$(".Answered").click(function(event) {
			event.preventDefault();
			$(".question").hide();
			$(".answerdQuestion").show();
			updateUI('answered');
		});
	}

	function finishSurvey() {
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
		$.getJSON('/logout/', null);
		
	}

	function updateProgress() {
		$(".progress_text").text((answers.length) + "/" + questions.length);
		$(".progress").animate({
			width : Math.floor((answers.length ) / questions.length * $(".progress_range").width())
		}, 800);
	}

	function selectPreviousQuestion() {
		selectQuestion(currentQuestionID - 1);
		$('.scroll-pane').data('jsp').scrollTo(0, currentQuestionID * totalQuestionHeight);
	}

	function answeredAll() {
		/*
		 var a = confirm('Congratulations! You have answered all questions.\nClick "OK" to submit your survey now, or "Cancel" to review your answers.');
		 if(a == true) {
		 finishSurvey();
		 }
		 */
	}

	function setMyAnswer(event) {
		$(".currentQuestion").addClass("answerdQuestion");

		$.getJSON("/setanswer/" + questions[currentQuestionID]['pk'] + "/" + event.target.id + "/", function(data) {
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

			if(answermode != 'answered') {

				selectNextQuestion();
			}
		});
	}

	function selectNextQuestion() {
		firstUnansweredQuestion = currentQuestionID + 1;
		while($('#' + firstUnansweredQuestion).is('.answerdQuestion')) {
			firstUnansweredQuestion++;
		}

		selectQuestion(firstUnansweredQuestion);

		$('.scroll-pane').data('jsp').scrollTo(0, $('#' + currentQuestionID).position().top - 50);

	}

	function selectQuestion(id) {
		close_bubble();
		$(".question_display").fadeOut(fadeDuration);
		currentQuestionID = parseInt(id);

		$(".currentQuestion").removeClass("currentQuestion");

		$('#' + id).addClass("currentQuestion");

		var items = [];
		ar = answerRanges[questions[currentQuestionID]['fields']['answer_range']];
		for(var i in ar) {

			var newChoice = '<input id="' + ar[i]['pk'] + '" type="radio" value="' + ar[i]['fields']['title'] + '" name="choice" class="choice" ';

			// mark answer as selected
			for(var k in answers) {
				if(answers[k]['fields']['indicator'] == questions[currentQuestionID]['pk'] && answers[k]['fields']['mcqanswer'] == ar[i]['pk']) {
					newChoice += ' checked="true" ';
				}
			}
			newChoice += '/> <label for="' + ar[i]['pk'] + '" >' + ar[i]['fields']['title'] + '</label> <br>';
			items.push(newChoice);
		}

		$('.questionTitle').html(translate(questions[currentQuestionID]['fields']['question']));
		$('.choices').html(items.join(''));
		$('.radioGroup input').ezMark();
		$(".question_display").fadeIn(fadeDuration);
		if(currentQuestionID == 0) {
			$(".previous").css({
				visibility : 'hidden'
			});

		} else {
			$(".previous").css({
				visibility : 'visible'
			});
		}

		/*});*/
		/*})*/
	}

	function isAnswered(questionID) {
		for(var i in answers) {
			if(answers[i]['fields']['indicator'] == questionID)
				return true;
		}
		return false;
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

	function render() {
		var tempDiv = document.createElement("DIV");
		var items = [];
		$.each(questions, function(key, val) {
			tempDiv.innerHTML = val['fields']['question'];
			var newQuestion = '<div class="';
			if(isAnswered(val['pk'])) {
				newQuestion += 'question answerdQuestion';
			} else {
				newQuestion += 'question';
				if(firstUnansweredQuestion == -1)
					firstUnansweredQuestion = key;
			}
			newQuestion += '" id="' + key + '">' + translate(tempDiv.textContent || tempDiv.innerText) + '</div>';
			items.push(newQuestion);
		});
		$('.questions_list').append(items.join(''));
		$('.scroll-pane').jScrollPane({
			animateScroll : true
		});
		if(firstUnansweredQuestion >= 0)
			selectQuestion(firstUnansweredQuestion);
		$('.scroll-pane').data('jsp').scrollTo(0, currentQuestionID * totalQuestionHeight - 50);
		//$('.glossary').removeClass('glossary');
		updateProgress()

	}


	$('.scroll-pane').height($(document).height() - 285);
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
					render();
				});
			});
		});
	});
});
