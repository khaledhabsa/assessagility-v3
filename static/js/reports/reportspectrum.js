
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
	reports.GetSpectrumData();
	reports.redrawRequest = reports.GetSpectrumData;
})

reports.GetSpectrumData = function () {
	if (reports.flags.googlechart != 1) {
		return;
	}

	// clean up::
	if (reports.flags.isredraw == 1) {
		$('.chartbarstable').html('');
	}
	startLoading()
	$.ajax({
		type: "POST",
		url: '/report/practice/spectrum/json/',
		cache: false,
		data: {
			"csrfmiddlewaretoken": $("input[type=hidden]").val(),
			'demographics_values': SetDemographicsValues(),
			'role': $('#slctRolesid :selected').val()
		},
		dataType: "json",
		success: function (data) {
			reports.flags.chartdata = 1;
			reports.data = data;
			reports.drawSpectrumChart();
		},
		error: function (data) {
			console.log('server error:', data, reports.chart);
			reports.flags.chartdata = 1;
			reports.drawComplete(1);
		},
		complete:showPage()
	})
}


reports.drawSpectrumChart = function () {

	var data = reports.data;
	var cfg = [['title', 'average', { role: 'annotation' }, { role: 'style' }]];
	for (var i = 0; i < data.length; i++) {
		var s = data[i];
		var p = s.average / 100;
		cfg.push([s.title, s.average, s.average, 'color:' + reports.colors.getColor(s.average)]);
	}
	// create data table
	reports.dataarray = google.visualization.arrayToDataTable(cfg);
	// scale table depends on content length ::
	$('#chart_div').css('height', 100 + data.length * 40);
	//	create chart
	if (reports.chart == null) {
		var options = {
			vAxis: { textStyle: { fontSize: 9.5 } },
			legend: 'none',
			chartArea: { right: 10, height: '100%', left: 180 },
		}
		reports.chart = reports.BarChart(document.getElementById('chart_div'));
		reports.chart.draw(reports.dataarray, options);
	} else {
		reports.chart.redraw(reports.dataarray);
	}

	google.visualization.events.addListener(reports.chart, 'select', function () {
		$('#tabnfo').hide();
		var selected = reports.data[reports.chart.getSelection()[0].row];
		var q = $('.chartdescriptions').children();
		q.eq(0).text(selected.title);
		q = q.find('.chartbarstable');
		q.html('<tr class="chartbarfirstrow"><td>Characteristic</td><td>Assessment Level</td></tr>');
		var src = selected.characteristics;
		for (var i = 0; i < src.length; i++) {
			var v = parseFloat(src[i].average);
			var side = v > 20;
			q.append('<tr><td>' + src[i].title + '</td><td>' +
				'<div class="chartbarline">' +
				'<div onclick="reports.requestPopup(' + src[i].id + ')" style="width: ' + v + '%;"></div>' +
				'<div style="color:' + (side ? '#ffffff' : '#2371ad') + ';left:' + (275 * v / 100 + (side ? -24 : 5)) + 'px">' + Math.round(v) + '</div>' +
				'</div></td></tr>');
		}
		$('html,body').animate({
			scrollTop: q.offset().top
		}, 1500);
	});

	$(window).resize(function () {
		reports.chart.redraw(reports.dataarray);
	})

	reports.drawComplete();
}


reports.requestPopup = function (id) {
	window.open('/report/optimized/characteristic/' + id + '/', "_blank");
}
