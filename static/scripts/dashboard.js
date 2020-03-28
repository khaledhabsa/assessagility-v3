$(document).ready(function() {
	$('.Send_Complete_Reminders').click(function() {
		$('.Send_Complete_Reminders').hide();
		$('.Complete_Reminders_Sent').show();
		$.getJSON('/dashboard/send_reminder/complete/', null);
	});

	$('.Send_Start_Reminders').click(function() {
		$('.Send_Start_Reminders').hide();
		$('.Start_Reminders_Sent').show();
		$.getJSON('/dashboard/send_reminder/start/', null);
	});
})