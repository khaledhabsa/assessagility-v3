/*
 * Main Code by: CODROPS
 * http://tympanus.net/codrops/2010/12/21/website-tour/
 * 
 * Tranformed into a plugin by Nick Routsong
 * blog.routydevelopment.com
 * 
 * Ver. 1.0
 * 
 * Example Step Object Properties:
 * 
 * "name" 		: "tour_1",
 * "bgcolor"	: "black",
 * "color"		: "white",
 * "position"	: "TL",
 * "text"		: "You can create a tour to explain the functionality of your app",
 * "time" 		: 5000
 * 
 * 
 */

(function($){
		 
	$.tour1 = {};
	
	$.tour1.options = {
		steps: {},
		autoplay: false,
		saveCookie: false,
		current_step: 0,
		showtime: 4000,
		mainTitle: "Take a Tour"
	};
	
	$.tour1.start = function(params){

		try {
			
			return tour1.start(params || {});
			
		} catch(e) {
		
			var err = 'tour1 Error: ' + e;
			(typeof(console) != 'undefined' && console.error) ? 
				console.error(err, params) : 
				alert(err);
				
		}
		
	};
	
	
	var tour1 = {
		 
		//Private
		total_steps: 0,
		step: 0,
			
		start: function(options){
			
			$.extend($.tour1.options,options); 
			tour1.total_steps = $.tour1.options.steps.length;
			tour1.showControls();
		},  
		
		begin: function(){
			$('#activatetour,#latertour').remove();
			$('#endtour,#restarttour,.latertour').show();
			if(!$.tour1.options.autoplay && tour1.total_steps > 1)
				$('#nextstep').show();
			tour1.showOverlay();
			tour1.next();
		},
		
		prev: function(){
			if(!$.tour1.options.autoplay){
				if(tour1.step > 2)
					$('#prevstep').show();
				else
					$('#prevstep').hide();
				if(tour1.step == tour1.total_steps)
					$('#nextstep').show();
			}		
			if(tour1.step <= 1)
				return false;
			--tour1.step;
			tour1.showTooltip();
		},
		
		next: function(){
			
			if(!$.tour1.options.autoplay){
				if(tour1.step > 0){
					$('#prevstep').show();
				} else {
					$('#prevstep').hide();
				}
				if(tour1.step == tour1.total_steps - 1)
					$('#nextstep').hide();
				else
					$('#nextstep').show();	
			}	
			if(tour1.step >= tour1.total_steps){
				//if last step then end tour1
				tour1.end();
				return false;
			}
			++tour1.step;
			tour1.showTooltip();
		},
		
		end: function(remind){
			
			if(typeof remind == 'undefined'){
				remind = false;
			}
			
			tour1.step = 0;
			if($.tour1.options.autoplay){
				clearTimeout($.tour1.options.showtime);
			}
			tour1.hideTooltip();
			tour1.hideControls();
			tour1.hideOverlay();
			if($.tour1.options.saveCookie == true && remind == false){
				jQuery.Storage.set("tour1","true");
			}
		},
		
		restart: function(){
			tour1.step = 0;
			if($.tour1.options.autoplay){
				clearTimeout($.tour1.options.showtime);
			}
			tour1.next();
		},
		
		cancel: function(remind){
			tour1.end(remind);
		},
		
		hideOverlay: function(){
			$('#tour_overlay').remove();
		},
		
		showOverlay: function(){
			$('body').prepend('<div id="tour_overlay" class="overlay"></div>');
		},
		
		hideControls: function(){
			$('#tourcontrols1').remove();
		},
		
		showControls: function(){
			var tourcontrols1  = '<div id="tourcontrols1" class="tourcontrols">';
			tourcontrols1 += '<p>'+$.tour1.options.mainTitle+'</p>';
			tourcontrols1 += '<span class="tour-button" id="activatetour">Start the Tour</span>';
			tourcontrols1 += '<span id="latertour" class="tour-button latertour">Remind me next time</span>';
			if(!$.tour1.options.autoplay){
				tourcontrols1 += '<div class="nav"><span class="tour-button" id="prevstep" style="display:none;">< Previous</span>';
				tourcontrols1 += '<span class="tour-button" id="nextstep" style="display:none;">Next ></span></div>';
			}
			tourcontrols1 += '<a id="restarttour" style="display:none;">Restart the Tour</span>';
			tourcontrols1 += '<a id="endtour" style="display:none;">End the Tour</a>';
			tourcontrols1 += '<a class="latertour" style="display:none;">Remind me next time</a>';
			tourcontrols1 += '<span class="close" id="canceltour"></span>';
			tourcontrols1 += '</div>';
			
			$('body').prepend(tourcontrols1);
			
			$('#tourcontrols1').animate({'right':'30px'},500);
			
			var controls = $('body').find('#tourcontrols1');
			
			controls.find('#activatetour').live('click',function(){
				tour1.begin();
			});
			controls.find('.latertour').live('click',function(){
				tour1.cancel(true);
			});
			controls.find('#canceltour').live('click',function(){
				tour1.cancel(false);
			});
			controls.find('#endtour').live('click',function(){
				tour1.cancel(false);
			});
			controls.find('#restarttour').live('click',function(){
				tour1.restart();
			});
			controls.find('#nextstep').live('click',function(){
				tour1.next();
			});
			controls.find('#prevstep').live('click',function(){
				tour1.prev();
			});
			
		},
		
		hideTooltip: function(){
			$('#tour_tooltip').remove();
		},
		
		showTooltip: function(){
			//remove current tooltip
			tour1.hideTooltip();
			
			var step_config		= $.tour1.options.steps[tour1.step - 1];
			var elem			= $('.' + step_config.name);
			
			if($.tour1.options.autoplay){
				$.tour1.options.showtime = setTimeout(tour1.next(),step_config.time);
			}
			
			var bgcolor  = step_config.bgcolor;
			var color	 = step_config.color;
			
			
			//if ( $.browser.msie ) {   alert("ie");  } else {    alert("not"); }		
			
			
			var tooltip = $('<div>',{
				id			: 'tour_tooltip',
				'class'	 	: 'tooltip',
				html		: '<p>'+step_config.text+'</p><span class="tooltip_arrow"></span>'
			}).css({
				'display'			: 'none',
				'background-color'	: bgcolor,
				'color'				: color
			});
			
			//the css properties the tooltip should have
			var properties		= {};
			var tip_position 	= step_config.position;
			
			//append the tooltip but hide it
			$('body').prepend(tooltip);
			
			//get some info of the element
			var e_w	= elem.outerWidth();
			var e_h	= elem.outerHeight();
			var e_l	= elem.offset().left;
			var e_t	= elem.offset().top;
			
			switch(tip_position){
				case 'TL'	:
					properties = {
						'left'	: e_l,
						'top'	: e_t + e_h + 'px'
					};
					tooltip.find('span.tooltip_arrow').addClass('tooltip_arrow_TL');
					break;
				case 'TR'	:
					properties = {
						'left'	: e_l + e_w - tooltip.width() + 'px',
						'top'	: e_t + e_h + 'px'
					};
					tooltip.find('span.tooltip_arrow').addClass('tooltip_arrow_TR');
					break;
				case 'BL'	:
					properties = {
						'left'	: e_l + 'px',
						'top'	: e_t - tooltip.height() + 'px'
					};
					tooltip.find('span.tooltip_arrow').addClass('tooltip_arrow_BL');
					break;
				case 'BR'	:
					properties = {
						'left'	: e_l + e_w - tooltip.width() + 'px',
						'top'	: e_t - tooltip.height() + 'px'
					};
					tooltip.find('span.tooltip_arrow').addClass('tooltip_arrow_BR');
					break;
				case 'LT'	:
					properties = {
						'left'	: e_l + e_w + 'px',
						'top'	: e_t + 'px'
					};
					tooltip.find('span.tooltip_arrow').addClass('tooltip_arrow_LT');
					break;
				case 'LB'	:
					properties = {
						'left'	: e_l + e_w + 'px',
						'top'	: e_t + e_h - tooltip.height() + 'px'
					};
					tooltip.find('span.tooltip_arrow').addClass('tooltip_arrow_LB');
					break;
				case 'RT'	:
					properties = {
						'left'	: e_l - tooltip.width() + 'px',
						'top'	: e_t + 'px'
					};
					tooltip.find('span.tooltip_arrow').addClass('tooltip_arrow_RT');
					break;
				case 'RB'	:
					properties = {
						'left'	: e_l - tooltip.width() + 'px',
						'top'	: e_t + e_h - tooltip.height() + 'px'
					};
					tooltip.find('span.tooltip_arrow').addClass('tooltip_arrow_RB');
					break;
				case 'T'	:
					properties = {
						'left'	: e_l + e_w/2 - tooltip.width()/2 + 'px',
						'top'	: e_t + e_h + 'px'
					};
					tooltip.find('span.tooltip_arrow').addClass('tooltip_arrow_T');
					break;
				case 'R'	:
					properties = {
						'left'	: e_l - tooltip.width() + 'px',
						'top'	: e_t + e_h/2 - tooltip.height()/2 + 'px'
					};
					tooltip.find('span.tooltip_arrow').addClass('tooltip_arrow_R');
					break;
				case 'B'	:
					properties = {
						'left'	: e_l + e_w/2 - tooltip.width()/2 + 'px',
						'top'	: e_t - tooltip.height() + 'px'
					};
					tooltip.find('span.tooltip_arrow').addClass('tooltip_arrow_B');
					break;
				case 'L'	:
					properties = {
						'left'	: e_l + e_w  + 'px',
						'top'	: e_t + e_h/2 - tooltip.height()/2 + 'px'
					};
					tooltip.find('span.tooltip_arrow').addClass('tooltip_arrow_L');
					break;
			}
			
			/*
				if the element is not in the viewport
				we scroll to it before displaying the tooltip
			 */
			var w_t	= $(window).scrollTop();
			var w_b = $(window).scrollTop() + $(window).height();
			//get the boundaries of the element + tooltip
			var b_t = parseFloat(properties.top,10);
			
			if(e_t < b_t)
				b_t = e_t;
			
			var b_b = parseFloat(properties.top,10) + tooltip.height();
			if((e_t + e_h) > b_b)
				b_b = e_t + e_h;
			
			if((b_t < w_t || b_t > w_b) || (b_b < w_t || b_b > w_b)){
				$('html, body').stop()
				.animate({scrollTop: b_t}, 500, 'easeInOutExpo', function(){
					//need to reset the timeout because of the animation delay
					if($.tour1.options.autoplay){
						clearTimeout($.tour1.options.showtime);
						$.tour1.options.showtime = setTimeout(tour1.next(),step_config.time);
					}
					//show the new tooltip
					tooltip.css(properties).show();
				});
			}
			else
				//show the new tooltip
				tooltip.css(properties).show();
		}
		
	};
	
})(jQuery);