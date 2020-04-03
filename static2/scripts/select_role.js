$(document).ready(function() {
	$('.Submit').click(function() {
	if($('input[name=role]:checked', '#select_role').val()==undefined){
		alert('please select a role .');
		
	}else
	{
		document.forms[0].submit();
	}	
	});
});
