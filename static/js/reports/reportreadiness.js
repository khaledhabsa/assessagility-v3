//reports.drawComplete();

var reports = reports || {};

$(document).ready(function () {
    reports.GetReadingsData();
    reports.redrawRequest = reports.GetReadingsData;
})

reports.GetReadingsData = function () {
    if (reports.flags.googlechart != 1) {
        return;
    }

    // clean up::
    if (reports.flags.isredraw == 1) {
        $('.chartbarstable').html('');
    }


    $.ajax({
        type: "POST",
        url: '',
        cache: false,
        data: {
            "csrfmiddlewaretoken": $("input[type=hidden]").val(),
            'demographics_values': SetDemographicsValues(),
            'role': $('#slctRolesid :selected').val()
        },
        dataType: "json",
        success: function (data) {
            reports.flags.chartdata = 1;
            reports.data = data.practices;
            reports.drawReadingsChart();
        },
        error: function (data) {
            console.log('server error:', data, reports.chart);
            reports.flags.chartdata = 1;
            reports.drawComplete(1);
        }
    })
}

reports.drawReadingsChart = function () {
    var data = reports.data;
    var cfg = [['title',
        'offset',
        { role: 'annotation' },
        'value',
        { role: "style" },
        'annotationvalue',
        { role: 'annotation' },
    ]];
    for (var i = 0; i < data.length; i++) {
        var s = data[i];

        cfg.push([s.title,
        s.display_min,
        Math.round(s.display_min),
        s.display_max - s.display_min,
        'color:#' + reports.colors.getColor((s.display_max - s.display_min) / 2 + s.display_min),
            8,
        Math.round(s.display_max)]);
    }
    // create data table
    reports.dataarray = google.visualization.arrayToDataTable(cfg);
    // scale table depends on content length ::
    $('#chart_div').css('height', 100 + data.length * 40);
    //	create chart
    if (reports.chart == null) {
        reports.chart = reports.CandleChart(document.getElementById('chart_div'), reports.dataarray);
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

            var v = parseFloat(src[i].display_min);
            var v2 = parseFloat(src[i].display_max);
            var w = parseFloat(src[i].bar_width);

            var side1 = v > 3;
            var side2 = w + v > 93;

            if (w != 0 && v2 != 0) {
                q.append('<tr><td>' + src[i].title + '</td><td>' +
                    '<div class="chartbarcomponent">' +
                    '<div onclick="reports.requestPopup(' + src[i].id + ')" style="left:' + v + '%;width: ' + w + '%;"></div>' +
                    '<div style="color:' + (side1 ? '#2371ad' : '#ffffff') + ';left:' + Math.max(2, (275 * v / 100 + (side1 ? -24 : 5))) + 'px">' + Math.round(v) + '</div>' +
                    '<div style="color:' + (side2 ? '#ffffff' : '#2371ad') + ';left:' + (275 * v2 / 100 + (side2 ? -24 : 4)) + 'px">' + Math.round(v2) + '</div></div></div></td></tr>');
            } else {
                q.append('<tr><td>' + src[i].title + '</td><td>No data</td></tr>');
            }


        }

        $('html,body').animate({
            scrollTop: q.offset().top
        }, 500);
    });
    reports.drawComplete();
}

reports.requestPopup = function (id) {
    window.open('/report/optimized/characteristic/' + id + '/', "_blank");
    /*
      $('body').append('<div style="position: fixed;top:0px;left:0px;z-index: 12000;background-color: #161616" class="poop" onclick="removepopup(event)">popup</div>');
      $('.poop').load('/report/optimized/characteristic/' + id + '/');*/
    //function removepopup(e){ $(e.currentTarget).remove() };
}
