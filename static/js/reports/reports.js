var reports = reports || {};
reports.flags = {googlechart:0 , chartdata:0 , document:0 , loading:0 , isredraw:0 , error:0};
// init chart ::
google.setOnLoadCallback(function(){
	reports.flags.googlechart = 1;
	if(reports.redrawRequest){
		reports.redrawRequest();
	}
});
google.load('visualization', '1', {packages: ['corechart']});



function SetDemographicsValues() {
	var demographics_values = "";
	$("select").each(function () {
		var id = $(this).attr('id').toString();
		if (id.indexOf('demo') == 0)
		{ demographics_values += $(this).val() + " "; }
	});
	return demographics_values;
}

// color box
reports.colors = new color.ColorBox([['#ff3d3d',0],['#ff3d3d',45],['#edc240',25],['#44dc44',20],['#4da74d',10]]);


reports.drawComplete = function(code){
	if(code){
		reports.flags.error = code;
		$('#chart_div').animate({opacity:0.5});
	} else {
		$('#chart_div').animate({opacity:1});
	}

	reports.flags.isredraw = 1;
	reports.flags.loading = 0;
}

$(document).ready(function(){
	$(window).resize(function(){
		if(reports.chart && reports.dataarray){
			reports.chart.redraw(reports.dataarray);
		}
	})
	/* selects :: demographic values */
	$('.reportupdatebtn').click(function(){
		if(reports.flags.loading == 0){
			$('#chart_div').animate({opacity:0.8},100);
			reports.flags.loading = 1;
			reports.delayRequest = null;
			reports.redrawRequest();
		}
	})

	$('.reportpdfbtn').click(function(){
		if(reports.flags.error || reports.flags.isredraw == 0 || reports.chart == null) {
			return;
		}
		var data = $.param({
			'demographics_values': SetDemographicsValues(),
			'role': $('#slctRolesid :selected').val(),
			'image':reports.chart.getImageURI(),
			'data':JSON.stringify(reports.data)
		});
		var inputs = '';
		$.each(data.split('&'), function(){
			var pair = this.split('=');
			inputs+='<input type="hidden" name="'+ pair[0] +'" value="'+ pair[1] +'" />';
		});
		var csrf = $('[name="csrfmiddlewaretoken"]');// add csrf token ::
		inputs += '<input type="hidden" name="'+ csrf.attr('name') +'" value="'+ csrf.attr('value') +'" />';
		$('<form action="" method="post" >'+inputs+'</form>').appendTo('body').submit().remove();
	})


});