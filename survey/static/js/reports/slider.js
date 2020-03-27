var $comp = $comp || {};
$comp.Slider = function(query){
	//var query = $('div[slider]');
	var query = $(query);

	/*
	 <div step='1' value='startValue' min='minimum' max='maximum' out='divID'   ></div>
	 */

	query.each(function(){
		var value = this.getAttribute('value');
		var q = $(this);
		var c = q.children();
		var operation = {target:$(this),
			// scroll position calculations ::
			value:parseFloat(q.attr('value')) || 1,length:parseInt(q.css('width')) ,
			step:parseFloat(q.attr('step')), roundstep: q.attr('roundstep'),
			// text destination and value count
			min:parseFloat(q.attr('min')) || 0,max:parseFloat(q.attr('max')) || 5,
			out:document.getElementById(q.attr('out')),
			// technical params
			width: parseInt(c.eq(2).css('width')),
			barLeft:c.eq(1) ,// barRight:c.eq(0),
			btn:c.eq(2),offset:this.getBoundingClientRect().left + parseInt(c.eq(2).css('width'))
		};
		if(operation.step){
			operation.pstep = operation.step/(operation.max - operation.min);
		}
		operation.position = (operation.length - operation.width) * (operation.value - operation.min) / (operation.max - operation.min);


		operation.update = function(force){
			var newValue = operation.position / (operation.length - operation.width) || 0;
			if(newValue == operation.value && !force){
				return;
			} else {
				operation.value = newValue;
			}
			if(operation.step){
				operation.value = Math.floor(((operation.position)/ operation.length) * operation.max + operation.pstep);
				operation.position = (operation.length - operation.width) * (operation.value - operation.min) / (operation.max - operation.min);
				var pos = Math.round(operation.position);
				console.log(operation.value,operation.pstep);
			} else {
				pos = Math.round(operation.position);
			}

			operation.barLeft.css({width:pos});
			//operation.barRight.css({left:pos ,width:operation.length - pos});
			operation.btn.css({left:pos});
			operation.target.trigger('SliderEvent',newValue);
			// set text ::

			if(operation.out){
				var v = Math.round(operation.min + (operation.max - operation.min) * operation.value);
				operation.out.innerHTML = v.toString();
			}
		};
		operation.move = function(e){
			e.preventDefault();
			operation.position = Math.max(0,Math.min(operation.length - operation.width,e.pageX - operation.offset));
			operation.update();
		};
		operation.end = function(e){
			var qdoc = $(document);
			qdoc.off('mousemove',operation.move);
			qdoc.off('mouseleave',operation.end);
			qdoc.off('mouseup',operation.end);
			$('body').removeClass('noselect');
			operation.target.trigger('complete');
		};

		$(this).on('mousedown',function(evt){
			var qdoc = $(document);
			qdoc.on('mousemove',operation.move);
			qdoc.on('mouseleave',operation.end);
			qdoc.on('mouseup',operation.end);
			// on mouse down update replace and update ::
			var position = Math.max(0,Math.min(operation.length - operation.width,evt.pageX - operation.offset));
			operation.position = position;
			operation.update(true);

			// disable select page ::
			//$('body').addClass('noselect');
		});
		operation.update(true);

		// ie selection fix ::
		$(operation.target).on('selectstart', function(){
			return false;
		});
	});
};