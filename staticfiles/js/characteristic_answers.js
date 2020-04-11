$(document).ready(function () {
	var macros;
	$('.code').live("mousemove mouseout", function (event) {
		if (event.type == "mousemove") {
			//$(event.target).children().css('top', event.pageY-$('.window').css('top')).css('left', event.pageX-$('.window').css('left'));
			$(event.target).children().show();
		} else {
			$(event.target).children().hide();
		}
	});
	$('.selector').click(function (event) {
		$('.selector').each(function (index) {
			$('.' + $(this).attr('id')).hide();
		});
		//alert(event.target.innerHTML.trim().replace(/ /g, '_').trim());
		$('.' + event.target.id).show();

		$('.selector').removeClass('selected');
		$(this).addClass('selected');

	});

	$('.view').click(function (event) {

		$('.view').each(function (index) {
			$('.' + this.innerHTML.trim().replace(/ /g, '_')).hide();
		});
		$('.' + event.target.innerHTML.trim().replace(/ /g, '_')).show();

		$('.view').removeClass('selected');
		$(this).addClass('selected');

	});
	function translate(input) {
		var re;
		if (input.indexOf("#") > -1) {
			for (var i in macros) {
				if (macros[i]['fields']['place_holder'].indexOf("#") > -1) {
					var key = "\\$" + macros[i]['fields']['place_holder'] + "\\$";
					re = new RegExp(key, "g");
					input = input.replace(re, macros[i]['fields']['place_holder'].replace(/#/g, "$"));
					re = new RegExp(macros[i]['fields']['place_holder'], "g");
					input = input.replace(re, macros[i]['fields']['place_holder'].replace(/#/g, ""));
				}
			}

		}
		for (var i in macros) {
			re = new RegExp(macros[i]['fields']['place_holder'].replace(/\$/g, "\\$"), "g");
			input = input.replace(re, macros[i]['fields']['translation']);
		}
		return input;
	};


	$('.selector').first().addClass('selected');
	$('.view').first().addClass('selected');
	$.getJSON('/macros/', function (data) {
		macros = data;
		$('.report_question').each(function (k, v) {
			v.innerHTML = translate(v.innerHTML);

		});
	});
	$('.ranges_graph').each(function (index, object) {
		graph = '';
		legend = '';
		background_ranges = '';
		answer_max = $(this).find('.answer_max').first().text().split('|');
		maxs = $(this).find('.maxs').first().text().split('|');
		mins = $(this).find('.mins').first().text().split('|');
		labels = $(this).find('.labels').first().text().split('|');
		answer_labels = $(this).find('.answer_labels').first().text().split('|');
		legend += '<div class="legend">';
		if (Number(answer_max[0]) == 100) {
			last_range_max = 0;
			for (i = 0; i < answer_max.length; i++) {
				width = (answer_max[answer_max.length - i - 1] - last_range_max) * 6;
				last_range_max = answer_max[answer_max.length - i - 1];
				background_ranges += '<div class="range_' + (i + 1) + '" style="width:' + width + 'px"></div>';
				legend += '<div class="label"><div class="label_' + (i + 1) + '" ></div><div class="label_title">' + answer_labels[answer_max.length - i - 1] + '</div></div>';
			}
		} else {
			last_range_max = 0;
			for (i = 0; i < answer_max.length; i++) {
				width = (answer_max[i] - last_range_max) * 6;
				last_range_max = answer_max[i];
				background_ranges += '<div class="range_' + (i + 1) + '" style="width:' + width + 'px"></div>';
				legend += '<div class="label"><div class="label_' + (i + 1) + '" ></div><div class="label_title">' + answer_labels[i] + '</div></div>';
			}
		}
		legend += '</div>';
		graph += '<table>';
		for (i = 0; i < labels.length; i++) {
			graph += '<tr>';
			graph += '<td class="graph_label full">';
			graph += labels[i];
			graph += '</td>';
			graph += '<td class="graph_content" style="width:600px;">';
			graph += background_ranges;
			graph += '<div class="graph_range" style="width:' + ((Number(maxs[i]) - Number(mins[i])) * 6) + 'px;left:' + (Number(mins[i]) * 6) + 'px;" ></div>'
			graph += '</td>';
			graph += '</tr>';
		}
		graph += '</table>';
		graph += legend;
		$(this).append(graph);
		//$(this).append(background_ranges);

	});
	$('.content').css({
		'height': 'auto'
	});
});
