function applyValues(data){
	var max = 275;
	data = data || [['text',0.05, 0.12] , ['text',0 , 0.9]];

	$('.chartbarcomponent').each(function(i){
		var t = $(this).children();
		var d = data[i];
		var width = (d[2] - d[1]) * max;
		t.eq(0).css({'left':max * d[1],width:width});

		// set text :: through parent ?
		$(this).parent().parent().children().eq(0).text(d[0]);

		// position differential :>:

		// to finish - when close to border ; font change
		// and truncate ::
		if(width>50){
			t.eq(1).css({'left':max * d[1] + 4 }).text(parseInt(d[1] * 100));
			t.eq(2).css({'left':max * d[2] -20}).text(parseInt(d[2] * 100));
		} else {
			if(width < 25){
				t.eq(1).css({'left':max * d[1] - 20 }).text(parseInt(d[1] * 100));
				t.eq(2).css({'left':max * d[2] + 4}).text(parseInt(d[2] * 100));
			} else {
				if(d[0] < (100 - d[1])){
					t.eq(1).css({'left':max * d[1] - 20 }).text(parseInt(d[1] * 100));
					t.eq(2).css({'left':max * d[2] - 20}).text(parseInt(d[2] * 100));
				} else {
					t.eq(1).css({'left':max * d[1] + 4 }).text(parseInt(d[1] * 100));
					t.eq(2).css({'left':max * d[2] +4}).text(parseInt(d[2] * 100));
				}
			}
		}

	});
}