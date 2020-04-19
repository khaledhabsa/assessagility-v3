/*
 * SimpleModal Confirm Modal Dialog
 * http://simplemodal.com
 *
 * Copyright (c) 2013 Eric Martin - http://ericmmartin.com
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */

jQuery(function ($) {
	$('#confirm-dialog input.confirm, #a-confirm-dialog').click(function (e) {
	    e.preventDefault();
	   
		if (Checkusedinvitations()) {
		    // example of calling the confirm function
		    // you must use a callback function to perform the "yes" action
		    confirm("You are about to invite these individuals to ReadyForAgile. They will receive this <a href='/client/admin/preview/emailtemplate/Invitee Welcome Email/' > email </a>. If you are <b><i>OK </i></b>with this communication proceed. Please confirm your invitees.", function () {
		        //window.location.href = '';
		    });
		} else
		{
		    quota = parseInt($('#quota').text());
		    diff = quota - usedinvitations;

		    var msg = "Oops! You've met your quota. Please upgrade for a Team or Professional Edition. ";
		    if (diff > 0)
		    {
		        msg = 'Oops!, You are exceed your invites quota. you should only invite (' + diff + ') from your Participants';
		    }
		    confirmerror(msg, function () { });
		}
	});
});

function confirm(message, callback) {
	$('#confirm').modal({
		position: ["20%",],
		overlayId: 'confirm-overlay',
		containerId: 'confirm-container', 
		onShow: function (dialog) {
			var modal = this;

			$('.message', dialog.data[0]).append(message);


			// if the user clicks "yes"
			$('.yes', dialog.data[0]).click(function () {
				// call the callback
				if ($.isFunction(callback)) {
					callback.apply();
				}
				// close the dialog
				modal.close(); // or $.modal.close();
			});
		}
	});
	
	
}


function confirmerror(message, callback) {
    $('#confirm').modal({
        position: ["20%", ],
        overlayId: 'confirm-overlay',
        containerId: 'confirm-container',
        onShow: function (dialog) {
            var modal = this;

            $('.message', dialog.data[0]).append(message);
            $('.header', dialog.data[0]).html('<span>Error</span>');
            $('.buttons', dialog.data[0]).html("");
            
            
            
            $('.no', dialog.data[0]).click(function () {               
                modal.close(); 
            });
            // if the user clicks "yes"
            $('.yes', dialog.data[0]).click(function ()
            {
                // call the callback
                if ($.isFunction(callback)) {
                    callback.apply();
                }
                // close the dialog
                modal.close(); // or $.modal.close();
            });
        }
    });


}

/////////////////

jQuery(function ($) {
	$('#confirm1-dialog input.confirm1, #confirm1-dialog a.confirm1').click(function (e) {
		e.preventDefault();

		// example of calling the confirm function
		// you must use a callback function to perform the "yes" action
		confirm1("You are about to re-invite these individuals to take the ReadyForAgile. They will receive this <a href='/client/admin/preview/emailtemplate/Invitee Welcome Email/' > email </a>. If you are <b><i>OK </i></b>with this communication proceed.", function () {
			//window.location.href = '';
		});
	});
});

function confirm1(message, callback) {
	$('#confirm1').modal({
		position: ["20%",],
		overlayId: 'confirm-overlay1',
		containerId: 'confirm-container1', 
		onShow: function (dialog) {
			var modal = this;

			$('.message', dialog.data[0]).append(message);
            $('.no', dialog.data[0]).click(function () {               
                modal.close(); 
            });
			// if the user clicks "yes"
			$('.yes', dialog.data[0]).click(function () {
				// call the callback
				if ($.isFunction(callback)) {
					callback.apply();
				}
				// close the dialog
				modal.close(); // or $.modal.close();
			});
		}
	});
	
	
}

/////////////////

jQuery(function ($) {
    $('#confirm2-dialog input.confirm2, #confirm2-dialog a.confirm2').click(function (e) {
        e.preventDefault();

        // example of calling the confirm function
        // you must use a callback function to perform the "yes" action
        confirm2("You are about to re-invite these individuals to take the ReadyForAgile Assessment. They will receive this email (provide link to email preview). If you are <b><i>OK </i></b>with this communication proceed.", function () {
            //window.location.href = '';
        });
    });
});

function confirm2(message, callback) {
    $('#confirm2').modal({
        position: ["20%", ],
        overlayId: 'confirm-overlay2',
        containerId: 'confirm-container2',
        onShow: function (dialog) {
            var modal = this;

            $('.message', dialog.data[0]).append(message);
			$('.no', dialog.data[0]).click(function () {               
                modal.close(); 
            });
            // if the user clicks "yes"
            $('.yes', dialog.data[0]).click(function () {
                // call the callback
                if ($.isFunction(callback)) {
                    callback.apply();
                }
                // close the dialog
                modal.close(); // or $.modal.close();
            });
        }
    });


}


/////////////////

jQuery(function ($) {
    $('#confirm3-dialog input.confirm3, #confirm3-dialog a.confirm3').click(function (e) {
        e.preventDefault();

        // example of calling the confirm function
        // you must use a callback function to perform the "yes" action
        confirm3("You are about to re-invite these individuals to take the ReadyForAgile Assessment. They will receive this email (provide link to email preview). If you are <b><i>OK </i></b>with this communication proceed.", function () {
            //window.location.href = '';
        });
    });
});

function confirm3(message, callback) {
    $('#confirm3').modal({
        position: ["20%", ],
        overlayId: 'confirm-overlay3',
        containerId: 'confirm-container3',
        onShow: function (dialog) {
            var modal = this;

            $('.message', dialog.data[0]).append(message);
            $('.no', dialog.data[0]).click(function () {               
                modal.close(); 
            });
            // if the user clicks "yes"
            $('.yes', dialog.data[0]).click(function () {
                // call the callback
                if ($.isFunction(callback)) {
                    callback.apply();
                }
                // close the dialog
                modal.close(); // or $.modal.close();
            });
        }
    });
}


	//////////////



jQuery(function ($) {
				 
	$('#confirm4-dialog input.confirm4, #confirm4-dialog a.confirm4').click(function (e) {
		e.preventDefault();
		
		// example of calling the confirm function
	    // you must use a callback function to perform the "yes" action
		var numofinvitees = $("#numofinvitees").text();
		confirm4("Are you sure you would like to send this email <link to email preview> to your " + numofinvitees + " invitees?", function ()
		{
		   // alert('hello');
		    //$(this).click();
		    $('#submit').click();
		    //alert('helloffffffffffffffff');
		   
			
		});
		
		
	
	});

});

function confirm4(message, callback) {
	$('#confirm4').modal({
		position: ["20%",],
		overlayId: 'confirm-overlay4',
		containerId: 'confirm-container4', 
		onShow: function (dialog) {
			var modal = this;

			$('.message', dialog.data[0]).append(message);
            $('.no', dialog.data[0]).click(function () {               
                modal.close(); 
            });
			// if the user clicks "yes"
			$('.yes', dialog.data[0]).click(function () {
				// call the callback
				//alert('confirmed');
				
				if ($.isFunction(callback)) {
				
					callback.apply();
				
									
				}
				
				// close the dialog
				modal.close(); // or $.modal.close();
	
				// example of calling the confirm function
					
				
				});
		
		}
	});
	
	
	
	
}

/////////

jQuery(function ($) {
				 
	$('#confirm5-dialog input.confirm5, #confirm5-dialog a.confirm5').click(function (e) {
		e.preventDefault();
		
		var message = "      <form class='cmxform'  method='post' action=''>\
                            <fieldset>  <div>  <table width='100%' cellpadding='2' cellspacing='2'>\
                            <tr>  <td> <label for='to'>To</label><em>*</em></td> <td> <input id='to' name='to' size='25' class='required email' minlength='2' maxlength='30' /></td>    </tr>\
                            <tr>  <td> <label for='from'>From</label><em>*</em></td> <td> <input id='from' name='from' size='25' class='required email' minlength='2' maxlength='30' /></td>    </tr>\
                            <tr>     <td><label for='emailbody'>Body</label><em>*</em></td>  <td><textarea id='emailbody' name='emailbody' size='25' class='required' minlength='2' maxlength='30' /></td>  </tr> </table>  </div>      </fieldset> </form> ";
		confirm5(message, function ()
		{
		   // alert('he43');
		   // $('#submit').click();
		   
		   
			
		});
		
		
	
	});

});

function confirm5(message, callback) {
	$('#confirm5').modal({
		position: ["20%",],
		overlayId: 'confirm-overlay5',
		containerId: 'confirm-container5', 
		onShow: function (dialog) {
			var modal = this;

			$('.message', dialog.data[0]).append(message);
			$('.no', dialog.data[0]).click(function () {               
                modal.close(); 
            });
			// if the user clicks "yes"
			$('.yes', dialog.data[0]).click(function ()
			{
				// call the callback		    				
			    if (NotifyAdmin($('#from').val(), $('#to').val(), $('#emailbody').val())) {

			        if ($.isFunction(callback)) {

			            callback.apply();

			        }

			        // close the dialog
			        modal.close(); // or $.modal.close();
			    }
				// example of calling the confirm function
					
				
				});
		
		}
	});
	
	
	
	
}
