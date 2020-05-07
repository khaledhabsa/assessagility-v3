//var myVar;
    
function startLoading() {
	console.log('startLoading')
  //myVar = setTimeout(showPage, 100000);
}

function showPage() {

  document.getElementById("cover-spin").style.display = "none";
  console.log(document.getElementById("cover-spin"));
}
var reports = reports || {};
$(document).ready(function () {
	reports.GetRadarData();
	reports.redrawRequest = reports.GetRadarData;
})

reports.GetRadarData = function () {
	if (reports.flags.googlechart != 1) {
		return;
	}
	// clean up
	if (reports.flags.isredraw == 1) {
		var q = $('.chartdescriptions').children();
		q.eq(0).text('');
		q.eq(1).html('');
	}
	startLoading();
	$.ajax({
		type: "POST",
		url: '/report/category/radar/json/?v=3',
		cache: false,
		data: {
			'demographics_values': SetDemographicsValues(),
			'role': $('#slctRolesid :selected').val(),
			"csrfmiddlewaretoken": $("input[type=hidden").val(),
		},
		dataType: "json",
		success: function (data) {
			reports.flags.chartdata = 1;
			reports.data = data;
			reports.drawRadarChart();
		},
		error: function (data) {
			reports.flags.chartdata = 1;
			reports.drawComplete(1);
		},
		complete:showPage()

	})
}

reports.drawRadarChart = function () {
	// parse data::
	var data = reports.data;
	var cfg = [["Element", "Density", { role: "style" }, { role: 'annotation' }]];
	for (var i = 0; i < data.length; i++) {
		var s = data[i];
		cfg.push([s.title, s.average, 'color:#' + reports.colors.getColor(s.average), s.average + '/100']);
	}
	// create data table
	reports.dataarray = google.visualization.arrayToDataTable(cfg);

	if (reports.chart == null) {
		reports.chart = reports.ColumnChart(document.getElementById('chart_div'), reports.dataarray);
	} else {
		reports.chart.redraw(reports.dataarray);
	}
	google.visualization.events.addListener(reports.chart, 'select', function () {
		$('#tabnfo').hide();
		var selected = reports.data[reports.chart.getSelection()[0].row];
		var q = $('.chartdescriptions').children();

		q.eq(0).text(selected.title);
		var node = '';

		for (var i = 0; i < selected.characteristicTitles.length; i++) {
			var cur = selected.characteristicTitles[i];
			var item = '<a href="/report/optimized/characteristic/' + cur.id + '/" target="_blank">' + cur.title + '</a><br/>';
			node += item;
		};
		q.eq(1).html(node);// to format
	});


	$(window).resize(function () {
		reports.chart.redraw(reports.dataarray);
	})

	reports.drawComplete();
}



