$(document).ready(function() {
	$('#demographic').change(function(){
		did= $("#demographic option:selected").attr('value');
		window.location.href='/report/demographic/'+did+'/-1/';
	});
	
	$('#demographic_value').change(function(){
		did= $("#demographic option:selected").attr('value');
		dvid=$("#demographic_value option:selected").attr('value');
		window.location.href='/report/demographic/'+did+'/'+dvid+'/';
	});
	
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
	
});