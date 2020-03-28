$(document).ready(function () {
    
    $('.show_practice_details').click(function(event) {
	event.preventDefault();
	$(this).parents('.practice').find('.characteristics').show();
	$(this).parents('.practice').find('.hide_practice_details').show();
	$(this).parents('.practice').find('.show_practice_details').hide(); 
    });

    $('.hide_practice_details').click(function(event) {
	event.preventDefault();
	$(this).parents('.practice').find('.characteristics').hide();
	$(this).parents('.practice').find('.hide_practice_details').hide();
	$(this).parents('.practice').find('.show_practice_details').show();    
    });
	
    $('.show_all_characteristics').click(function(event) {
	event.preventDefault();
	$('.characteristics').show();
	$('.hide_practice_details').show();
	$('.show_practice_details').hide();
    });
	
    $('.hide_all_characteristics').click(function(event) {
	event.preventDefault();
	$('.characteristics').hide();
	$('.hide_practice_details').hide();
	$('.show_practice_details').show();
        
    });
	
    $('.characteristic_readiness_range').click(function(event) {
	$.colorbox({href:'/report/optimized/characteristic/' + event.currentTarget.id + '/'});
    });


    $(".rang_grid").hover(function() {
        $(this).attr("src","/images/bg_report_rang_grid_over.png");
    }, function() {
        $(this).attr("src","/images/bg_report_rang_grid_nrml.png");
    });

    $(".practice_slider").hover(function() {
        var currli = $(this).parent().children(".practice_bubble_bar_displacement");
        var currli1 = $(this).parent().children(".practice_bubble_bar_width");
        $(currli).show();
        $(currli1).show();
    }, function() {
        $(".practice_bubble_bar_displacement").hide();
        $(".practice_bubble_bar_width").hide();
    });

    $.fn.qtip.styles.tooltipDefault = {
        background: '#0088d0',
        color: '#FFFFFF',
        textAlign: 'left',
        border: {
            width: 2,
            radius: 4,
            color: '#0474af'
        },
        width: 400
    }

    // we are going to run through each element with the classTips class
    $('.class_tips').each(function () {
        var contents = $(this).attr('contents');
        // the element has no rating tag or the rating tag is empty
        if (contents == undefined || contents == '') {
            contents = 'No data right now';
        }
        else {
            contents = contents;
        } 
        // create the tooltip for the current element
        $(this).qtip({
            content: contents,
            position: {
                target: 'mouse'
            },
            style: 'tooltipDefault'
        });
    });

});
