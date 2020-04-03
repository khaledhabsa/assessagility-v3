$(document).ready(function() {

	var questions;
	var answers;
	var answerRanges;
	var currentPageNumber = 0;
	var pageQuestionsCount = 10;
	var pageCount = 0;
	var totalQuestionHeight = 45;
	var currentQuestionNumber = 0;
	var scroller;

	var scrollTargetx;
	var scrollTargety;
	var scrollCurrenty = 0.0;

	var currentQuestionHeight;
	var myScroll;
	
		function updateProgress() {
		$(".progress_text").text((answers.length) + "/" + questions.length);
		$(".progress").animate({
			width : Math.floor((answers.length ) / questions.length * $(".progress_range").width())
		}, 800);
	}

	function setupscreen() {

		//var scrollNode = document.querySelector(".questions"), options = {};
		//scroller = new TouchScroll(scrollNode, options);

		setTimeout(function() {
			updateOrientation();
			updateProgress();
			myScroll = new iScroll('wrapper');
		}, 200);
	}


	window.onorientationchange = function() {
		updateOrientation();
	};
	function updateOrientation() {
		//alert(screen.width);

		switch(window.orientation) {

			case -90:
			case 90:
				$('.question').width(screen.height - 5);

				$('.question').height(screen.width);
				currentQuestionHeight = screen.width;
				$('.questions').width(screen.height);
				break;

			case 180:
			case 0:
			default:

				$('.question').width(screen.width - 5);
				$('.question').height(screen.height);
				currentQuestionHeight = screen.height;
				$('.questions').width(screen.width);

				break;

		}
		//alert(currentQuestionHeight * questions.length);
		$('.questions').height(currentQuestionHeight * questions.length);
		updateLocation();

	}



	function updateLocation() {
		//alert('updateLocation');
		$("html, body").animate({
			scrollTop : 1
		}, 'slow');
		//animateScroll(0,currentQuestionHeight*currentQuestionNumber +10)

		//	scroller.scrollTo(0, currentQuestionHeight * currentQuestionNumber + 10,300);
		/*
		d = '';
		for(var i in scroller._currentOffset) {
		d += i + ':' + scroller._currentOffset[i] + '\n';
		}
		alert(d);
		*/
		//scroller.scrollTo(0,$("#" + currentQuestionNumber).offset().top);
		/*$(".scroller").animate({
		 scrollTo : $("#" + currentQuestionNumber).offset().top
		 }, 'slow');
		 */
	}

	setupClicks();

	function setupClicks() {
		
		$('li').live('click', function(event) {
			$(this).parent().children().removeClass('selected');
			$(this).addClass('selected');
			var ids = $(this).attr('id').split('_');
			
			id=1+parseInt($(this).parents('.question').attr('id'));
			//alert(id*currentQuestionHeight);
			myScroll.scrollTo(0,id*currentQuestionHeight*-1-10,500);
			setMyAnswer(ids[0], ids[1]);
		});

		
	}

	function setMyAnswer(q, a) {
		currentQuestionNumber++;
		updateLocation();
		$.getJSON("/setanswer/" + q + "/" + a + "/", function(data) {

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

		});
	}

	function translate(input) {
		for(var i in macros) {
			input = input.replace(macros[i]['fields']['place_holder'], macros[i]['fields']['translation']);
		}
		return input;
	};

	function renderPages(mode) {
		output = "";
		for(var i = 0; i < questions.length; i++) {
			output += '<div id="' + i + '" class="question">';
			output += '<div class="question_body">' + translate(questions[i]['fields']['question']) + '</div>';
			
			output +='<div class="slider"><span><ul>';
			
			var items = [];
			ar = answerRanges[questions[i]['fields']['answer_range']];
			for(var j in ar) {

				var newChoice = '<li id="' + questions[i]['pk'] + '_' + ar[j]['pk'] + '" class="';

				// mark answer as selected
				for(var k in answers) {
					if(answers[k]['fields']['indicator'] == questions[i]['pk'] && answers[k]['fields']['mcqanswer'] == ar[j]['pk']) {
						newChoice += 'selected';
					}
				}
				newChoice += '"><a>' + ar[j]['fields']['title'] + '</a></li>';
				items.push(newChoice);
			}
			output += items.join('');
			output+='</ul></span></div>'
			
			output += '</div>';
		}

		$(".questions").html(output);

	};

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
					//selectPage(0);
					renderPages();
					//$('.radioGroup input').ezMark();
					setTimeout(function() {setupscreen();
					}, 100);
				});
			});
		});
	});
});
