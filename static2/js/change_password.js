$(document).ready(function() {

	$('#newpassword').keyup(function(){
		$('#result').html(checkStrength($('#newpassword').val()))
	})	
	
	function checkStrength(password){
    
	//initial strength
    var strength = 0
	
    //if the password length is less than 6, return message.
    if (password.length < 6) { 
		$('#result').removeClass()
		$('#result').addClass('label label-danger')
		return 'Too short' 
		
	}
    
    //length is ok, lets continue.
	
	//if length is 8 characters or more, increase strength value
	if (password.length > 7) strength += 1
	
	//if password contains both lower and uppercase characters, increase strength value
	if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/))  strength += 1
	
	//if it has numbers and characters, increase strength value
	if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/))  strength += 1 
	
	//if it has one special character, increase strength value
    if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/))  strength += 1
	
	//if it has two special characters, increase strength value
    if (password.match(/(.*[!,%,&,@,#,$,^,*,?,_,~].*[!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1
	
	//now we have calculated strength value, we can return messages
	
	//if value is less than 2
	if (strength < 2 ) {
		$('#result').removeClass();
		$("#result").removeAttr('class');
		$('#result').addClass('label label-warning');
		return 'Weak'			
	} else if (strength == 2 ) {
		$('#result').removeClass();
		$("#result").removeAttr('class');
		$('#result').addClass('label label-success');
		return 'Good'		
	} else {
		$('#result').removeClass();
		$("#result").removeAttr('class');
		$('#result').addClass('label label-success');
		return 'Strong'
		
	}
}


	



	$('.Submit').click(function (){
		console.log('SUBMIT');
	   
		$('.confirmationerror').html("");
			$('.confirmationerror').hide();
		
			if ($('#oldpassword').val().replace(/^\s+|\s+$/g, "").length < 1) {
			    $('.confirmationerror').html("You have to enter your Old password");
			    $('.confirmationerror').show();
			    return;
			}
			else
			{
			    
			    $('.confirmationerror').html("");
			    $('.confirmationerror').hide();
			}

			if ($('#newpassword').val().replace(/^\s+|\s+$/g, "").length < 1) {
			    $('.confirmationerror').html("You have to enter your New password");
			    $('.confirmationerror').show();
			    return;
			}
			else {

			    $('.confirmationerror').html("");
			    $('.confirmationerror').hide();
			}
		
	/*	if($('#newpassword').val().length<6){
			$('.confirmationerror').html("New password should be at lest 6 characters");
			$('.confirmationerror').show();
			return;
		} else {
		    $('.confirmationerror').html("");
		    $('.confirmationerror').hide();
		}*/
		
		
		
		
		/**/
		if(($('#result').html() != "")){
		    if (($('#result').html() != "Strong"))
		    {
		       
				$('.confirmationerror').html("You have to create a strong password; password should contain letter, number and special characters");
				$('.confirmationerror').show();
				return;
		    } else {
		        $('.confirmationerror').html("");
		        $('.confirmationerror').hide();
		    }
		}
		
		
		if ($('#newpassword').val() == $('#confirmpassword').val())
		{
		    
			document.forms[0].submit();
		}else
		{
			console.log("NOT PASS");
			$('.confirmationerror').html("Password not matched");
			$('.confirmationerror').show();
		}
		
	
	});
});
