$(document).ready(function() {
	$('.Submit').click(function() {
		var valid = true;
		$('.requiredDemographics').each(function(elment) {

			if(this.value == -1) {
				$(this).addClass('required');
				valid = false;
				$('.confirmationerror').show();
			}
		});
		if(valid){
			document.forms[0].submit();
		}
			
		
	});
});
