var labelsdata;
var lasti;
function highlight(id) {

    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    
    var graphLeft = 0;
    var graphTop = 0;
    var graphWidth = 1000;
    var graphHeight = 900;
    var gaaphNodeStartY = 357;
    var garphEdge = 659;
    var nodeValue = 735 - graphTop - labelsdata[id]['average'] * 5.75; 
    var nodePosition =158+id*28;
    var nodeHeight = 23;
    var barWidth = 333;
    var lineWidth = 2.5;
    var barEdge = 5;
    var barBack = 50;
    var barSlope = 3;

    ctx.clearRect(0, 0, graphWidth, graphHeight);
    ctx.beginPath();
    ctx.moveTo(gaaphNodeStartY, graphTop + nodePosition - lineWidth);
    ctx.lineTo(gaaphNodeStartY, graphTop + nodePosition - (nodeHeight / 2));
    ctx.lineTo(graphLeft, graphTop + nodePosition - (nodeHeight / 2));
    ctx.lineTo(graphLeft, graphTop);

    ctx.lineTo(graphWidth, graphTop);
    ctx.lineTo(graphWidth, graphHeight);
    ctx.lineTo(graphLeft, graphHeight);
    ctx.lineTo(graphLeft, graphTop + nodePosition + (nodeHeight / 2));
    ctx.lineTo(gaaphNodeStartY, graphTop + nodePosition + (nodeHeight / 2));
    ctx.lineTo(gaaphNodeStartY, graphTop + nodePosition + lineWidth);
    ctx.lineTo(graphWidth - barWidth, graphTop + nodeValue + lineWidth);

    // ctx.lineTo(graphWidth - barWidth + barEdge, graphTop + nodeValue + lineWidth);

    ctx.lineTo(graphWidth - barWidth + barEdge, graphTop + nodeValue + lineWidth + barSlope);

    ctx.lineTo(graphWidth - barWidth + barEdge + barBack, graphTop + nodeValue + lineWidth + barSlope);
    ctx.lineTo(graphWidth - barWidth + barEdge + barBack, graphTop + nodeValue - lineWidth + barSlope);
    ctx.lineTo(graphWidth - barWidth + barEdge, graphTop + nodeValue - lineWidth + barSlope);

    ctx.lineTo(graphWidth - barWidth, graphTop + nodeValue - lineWidth);



    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.fill();
   // $('#myCanvas').stop();
    $('#myCanvas').fadeIn();
}

$(document).ready(function ()
{   

    $.ajax(
        {
            url: '/report/practice/spectrum/json/',
            cache: false,
            data: {
                'demographics_values': SetDemographicsValues(),
                'role': $('#slctRolesid :selected').val(),

            },
            dataType: "json",
            success: function (data)
            {
                
                labelsdata = data;
                var bc = document.getElementById('Canvassesbackground');
                var bctx = bc.getContext("2d");
                bctx.font = "normal 14px Verdana";

                bctx.textAlign = "end";

                bctx.strokeStyle = "#cccccc";
                bctx.fillStyle = "#cccccc";
                

                for (i = 0; i < labelsdata.length; i++)
                {
                    
                    $('.Canvasses').append('<canvas class="details" id="d' + i + '" width="1000" height="778" style="position:absolute"></canvas>')
                    $('.Canvasses').append('<canvas class="practice" id="' + i + '" width="1000" height="778" style="position:absolute"></canvas>')

                   
                    var dc = document.getElementById('d' + i);
                    var dctx = dc.getContext("2d");

                    var c = document.getElementById(i);                    
                    var ctx = c.getContext("2d");
                    ctx.font = "normal 14px Verdana";

                    ctx.textAlign = "end";

                    ctx.strokeStyle = "#777777";

                    ctx.fillStyle = "#000000";
                    ctx.fillText(labelsdata[i]['title'], 330, 44 + 28 * i);
                    bctx.fillText(labelsdata[i]['title'], 330, 44 + 28 * i);

                    ctx.fillStyle = "#777777";
                    ctx.beginPath();
                    ctx.arc(348, 40 + 28 * i, 9, 0, 2 * Math.PI);
                    ctx.stroke();

                    bctx.beginPath();
                    bctx.arc(348, 40 + 28 * i, 9, 0, 2 * Math.PI);
                    bctx.stroke();



                    ctx.beginPath();
                    ctx.arc(348, 40 + 28 * i, 5, 0, 2 * Math.PI);
                    ctx.fill();

                    bctx.beginPath();
                    bctx.arc(348, 40 + 28 * i, 5, 0, 2 * Math.PI);
                    bctx.fill();


                    ctx.beginPath();
                    ctx.arc(590, 625 - labelsdata[i]['average'] * 5.75, 2, 0, 2 * Math.PI);
                    ctx.fill();

                    bctx.beginPath();
                    bctx.arc(590, 625 - labelsdata[i]['average'] * 5.75, 2, 0, 2 * Math.PI);
                    bctx.fill();

                    ctx.moveTo(357, 40 + 28 * i);
                    ctx.lineTo(590, 625 - labelsdata[i]['average'] * 5.75);
                    ctx.stroke();


                    bctx.moveTo(357, 40 + 28 * i);
                    bctx.lineTo(590, 625 - labelsdata[i]['average'] * 5.75);
                    bctx.stroke();


                    // details 

                    dctx.strokeStyle = "#999999";
                    dctx.fillStyle = "#ffffff";
                    dctx.font = "normal 12px Verdana";

                    dctx.moveTo(590 + 7 + 51, 626 + 7 - 3 - labelsdata[i]['average'] * 5.75);
                    dctx.lineTo(590 + 7, 626 + 7 - 3 - labelsdata[i]['average'] * 5.75);

                    dctx.lineTo(591 - 7, 626 - 7 - 3 - labelsdata[i]['average'] * 5.75);
                    dctx.lineTo(591 - 7, 626 - 7 + 3 - labelsdata[i]['average'] * 5.75);

                    dctx.lineTo(590 + 7, 626 + 7 + 3 - labelsdata[i]['average'] * 5.75);
                    dctx.lineTo(590 + 7 + 51, 626 + 7 + 3 - labelsdata[i]['average'] * 5.75);

                    var dshift = labelsdata[i]['average'] * 5.75;
                   
                    var endy = 750;
                    dctx.quadraticCurveTo(590 + 7 + 51 + 20, 626 + 7 + 3 - dshift + 10, 590 + 7 + 51 + 20, endy);

                    dctx.arcTo(590 + 7 + 51 + 20, endy + 20, 750 + 20, endy + 20, 20);
                    dctx.lineTo(700 + 20 + 200, endy + 20);
                    dctx.arcTo(700 + 20 + 200 + 20, endy + 20, 700 + 20 + 200 + 20, endy + 20 - 20, 20);

                    dctx.lineTo(700 + 20 + 200 + 20, 50 + 20 - 20);
                    dctx.arcTo(700 + 20 + 200 + 20, 50 + 20 - 20 - 20, 700 + 20 + 200 + 20 - 20, 50 + 20 - 20 - 20, 20);
                    dctx.lineTo(668 + 20 + 200 + 20 - 20 - 200, 50 + 20 - 20 - 20);
                    dctx.arcTo(668 + 20 + 200 + 20 - 20 - 200 - 20, 50 + 20 - 20 - 20, 668 + 20 + 200 + 20 - 20 - 200 - 20, 50 + 20 - 20 - 20 + 20, 20);
                    dctx.quadraticCurveTo(690 + 20 + 200 + 20 - 20 - 200 - 20 - 10, 626 + 7 - 3 - dshift - 10, 590 + 7 + 51, 626 + 7 - 3 - dshift);
                    
                    dctx.stroke();
                    
                    dctx.fill();
                    dctx.fillStyle = "#838383";
                    for (var char = 0; char < labelsdata[i]['characteristics'].length; char++) {

                        dctx.fillStyle = "#838383";
                        dctx.font = "normal 12px Verdana";
                        var img = document.getElementById("imgbackground");
                        var bottomright = document.getElementById("imgbottomright");
                        
                        var shift = 60;
                        dctx.drawImage(img, 680, 50 + shift * char - 15);
                        dctx.drawImage(bottomright, 680, 50 + shift * char + 30);
                        
                        var title = labelsdata[i]['characteristics'][char]['title'];                        
                        wrapText(dctx, title,740, 50 + shift * char + 3,200,20);

                        var average = parseInt(labelsdata[i]['characteristics'][char]['average']);
                        dctx.font = "bold 10px Verdana";
                        dctx.textAlign = 'center';
                        dctx.strokeStyle = "#000000";

                        //average = 0;
                        dctx.fillText(average, 705, 70 + shift * char - 3, 220);
                        dctx.textAlign = 'left';
                                               
                      
                        var x = 705;
                        var y = 50 + shift * char + 3;

                        var x2 = x-20;
                        var y2 = y-25;

                        x2 = x2 + (average * 0.4)
                        
                        if (average <= 50)
                        {
                            average = 100 - average;                            
                            
                        }

                        y2 = y2 + (average * 0.25)
                        
                        dctx.strokeStyle = "#999999";
                       
                        canvas_arrow(dctx, x, y, x2, y2);
                        
                       
                    }
                   

                }

            }
        });

    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    
    $(document).mousemove(function (event)
    {
        
        var canvas = document.getElementById('Canvassesbackground');
        var context = canvas.getContext('2d');
        var mousePos = getMousePos(canvas, event);
        var message = "Mouse position: " + mousePos.x + "," + mousePos.y;
       

        var mouseX = mousePos.x; 
        var mouseY = mousePos.y; 
    


      i=Math.floor((mouseY-30)/28);
      if(i>-1 && i< labelsdata.length)
      {
        if(i!=lasti && mouseX<360)
        {
            $('.practice').css({'display':'none'});
            $('.details').css({'display':'none'});
      
       
            $('#'+i).css({'display':'inline'});
            $('#d'+i).css({'display':'inline'});
        }
      }else{
            $('.practice').css({'display':'inline'});
            $('.details').css({'display':'none'});
        }
      lasti=i;
    
    });
    
});

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    var words = text.split(" ");
    var line = "";
    for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + " ";
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth) {
            context.fillText(line, x, y);
            line = words[n] + " ";
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
}

function canvas_arrow(context, fromx, fromy, tox, toy) {
    var headlen = 6;   // length of head in pixels
    var angle = Math.atan2(toy - fromy, tox - fromx);
    //alert(angle);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    context.stroke();
}


function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(), root = document.documentElement;

    // return relative mouse position
    var mouseX = evt.clientX - rect.left - root.scrollLeft;
    var mouseY = evt.clientY - rect.top - root.scrollTop;
    return {
        x: mouseX,
        y: mouseY
    };
}

function writeMessage(canvas, message) {
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '18pt Calibri';
    context.fillStyle = 'black';
    context.fillText(message, 10, 25);
}