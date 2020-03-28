$(document).ready(function() {
	/*
	 $('.practice_title').live("mousemove mouseout", function(event) {
	 if(event.type == "mousemove") {
	 $(event.target).children().css('top', event.pageY).css('left', event.pageX);
	 $(event.target).children().show();
	 } else {
	 $(event.target).children().hide();
	 }
	 });
	 */
	$('.show_practice_details').click(function(event) {
		event.preventDefault();
		$(this).parents('.practice').find('.characteristics').show();
		$(this).parents('.practice').find('.hide_practice_details').show();
		$(this).parents('.practice').find('.show_practice_details').hide();

	});
	$('.hide_practice_details').click(function(event) {
		event.preventDefault();
		$(this).parents('.practice').find('.characteristics').hide();
		$(this).parents('.practice').find('.hide_practice_details').hide();
		$(this).parents('.practice').find('.show_practice_details').show();

	});
	
	
	
	$('.show_all_characteristics').click(function(event) {
		event.preventDefault();
		$('.characteristics').show();
		$('.hide_practice_details').show();
		$('.show_practice_details').hide();
	});
	
	$('.hide_all_characteristics').click(function(event) {
		event.preventDefault();
		$('.characteristics').hide();
		$('.hide_practice_details').hide();
		$('.show_practice_details').show();

	});
	
	$('.characteristic_readiness_range').click(function(event) {
		$.colorbox({href:'/report/characteristic/' + event.target.id + '/'});
		
		//alert('not cached');
		/*
		$('.mask').css({
			'width' : $(window).width() * 2,
			'height' : $(document).height() * 2,

		});
		$('.mask').fadeTo("fast", 0.8);
		//Get the window height and width
		var winH = $(window).height();
		var winW = $(window).width();

		//Set the popup window to center
		$('.window').css('top', $(window).scrollTop() + (winH / 2 - $('.window').height() / 2));
		$('.window').css('left', $(window).scrollLeft() + (winW / 2 - $('.window').width() / 2) - 200);

		//transition effect
		$('.window').fadeIn("fast");

		$('.popup .window .content').load('/report/characteristic/' + event.target.id + '/');
		*/
	});
	$('.popup .window .close').click(function(event) {
		event.preventDefault();
		$('.mask').hide();
		$('.window').hide();
		$('.popup .window .content').html('');
		$('.content').css({
		'height' : '500'
	});

	});
});
