var categoryData;

var colorlist = [
"#ff1000",
"#ff4800",
"#ff8f00",
"#ffd600",
"#fdfe00",
"#d3ff00",
"#9fff00",
"#63fd00",
"#33f100",
"#1dc200"
];

//my_gradient.addColorStop(0, "#");                    
//my_gradient.addColorStop(0.1, "#");
//my_gradient.addColorStop(0.2, "#");
//my_gradient.addColorStop(0.3, "#");
//my_gradient.addColorStop(0.4, "#");

//my_gradient.addColorStop(0.5, "#fbf600");
//my_gradient.addColorStop(0.6, "#ffbc00");
//my_gradient.addColorStop(0.7, "#ff8100");
//my_gradient.addColorStop(0.8, "#ff2e00"); 
var centerX = 50;
var centerY = 400;
var maxR = 200;
var extend = 20;
var displacement = 100;
var dispalce = 0;
var textSpaceing = 30;
var textDisplace = 15;
var rotation = Math.PI / 1.5 * -1;
var horizontalExtend = 50;
var nodeSize = 10;

CanvasRenderingContext2D.prototype.roundedRect = function (x, y, w, h, r) {
    this.lineJoin = "round";
    this.lineWidth = r;
    this.strokeRect(x, y, w, h);
    this.fillRect(x, y, w, h);
}

function GetData() {


    var demographics_values = "";   
    $("select").each(function ()
    {
        var id=$(this).attr('id').toString();        
        if (id.indexOf('demo') == 0)
        { demographics_values += $(this).val() + " "; }
    });
  
   
    $.ajax(
        {
            url: '/report/role/composition/mapping/json/?v=3',
            cache: false,
            data: {
                'demographics_values': SetDemographicsValues(),
                'category': $('#slctcategory :selected').val(),

            },
            dataType: "json",
            success: function (data) {
               
                categoryData = data;
              
                var bc = document.getElementById('Canvassesbackground');
                var bctx = bc.getContext("2d");
                bctx.font = "normal 14px Verdana";             
                bctx.strokeStyle = "#999999";

                var lbc = document.getElementById('labelsbackground');
                var lbctx = lbc.getContext("2d");
                lbctx.font = "normal 14px Verdana";

                lbctx.textAlign = "center";           

                lbctx.strokeStyle = "#999999";
                lbctx.fillStyle = "#777777";

                

                bctx.beginPath();
                lbctx.beginPath();

                bctx.moveTo(centerX, centerY);
                lbctx.moveTo(centerX, centerY);               
                bctx.lineTo(centerX, centerY - 300);
                lbctx.lineTo(centerX, centerY-300);
                                
                bctx.closePath();
                lbctx.closePath();
                bctx.stroke();
                lbctx.stroke();


                bctx.beginPath();
                lbctx.beginPath();

                bctx.moveTo(centerX, centerY);
                lbctx.moveTo(centerX, centerY);
                bctx.lineTo(centerX+900, centerY);
                lbctx.lineTo(centerX+900, centerY);

                bctx.closePath();
                lbctx.closePath();
                bctx.stroke();
                lbctx.stroke();

                
                
               



                for (var i = 0; i < categoryData.length; i++) {

                   
                    $('#labels').append('<canvas class="label" id="l' + i + '" width="1000" height="778" style="position:absolute;left:0px;top:0px;"></canvas>');
                    var lc = document.getElementById('l' + i);
                    var lctx = lc.getContext("2d");

                    lctx.strokeStyle = "#acacac";
                    lctx.fillStyle = "#777777";
                    lctx.font = "bold 12px Verdana";                                                           
                    ave = categoryData[i]['average'];
                    title = categoryData[i]['title'];                  
                    lctx.textAlign = "center";                
                   
                       
                    //ave = i * 10;
                    var shift = 95;                   
                    nodeX = centerX + i * shift+95;
                    nodeY = centerY - 3*ave;
                   

                    //vr line..
                    lctx.fillStyle = "#777";
                    


                    //big circle..
                    var my_gradient = lctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, ave);
                   // var my_gradient = lctx.createLinearGradient(nodeX - ave, nodeY - ave, nodeX + ave, nodeY + ave);                   
                    
                    //var colorstop = 0;
                    //var c = 0;
                    //for ( c = 0; c <= ave; c = c + 10)
                    //{
                       
                    //    my_gradient.addColorStop(colorstop, colorlist[c / 10]);                       
                    //    colorstop = colorstop + 0.1;
                    //}
                    
                   

                    //alert(Math.floor(ave/10));                   
                    //alert(Math.round(ave/10));
                    my_gradient.addColorStop(0, colorlist[Math.floor(ave / 10)]);
                    my_gradient.addColorStop(1, colorlist[Math.floor(ave / 10)]);

                   
                    
                    lctx.fillStyle = my_gradient;
                    lctx.lineWidth = 2;
                    //lctx.setLineDash([5]); 
                    lctx.beginPath();
                    lctx.arc(nodeX, nodeY, ave, 0, 2 * Math.PI);
                    lctx.closePath();
                    lctx.stroke();
                    lctx.fill();

                    //small circles.
                    //lctx.strokeStyle = "#999";
                    //var small_gradient = lctx.createRadialGradient(nodeX, nodeY, 0,nodeX+5, nodeY+5, 16);
                    //small_gradient.addColorStop(0, "red");
                    //small_gradient.addColorStop(0.5, "green");
                    //small_gradient.addColorStop(1, "blue");
                    ////var small_gradient = lctx.createLinearGradient(0, 0, 0, 300);
                    ////small_gradient.addColorStop(0, "red");
                    ////small_gradient.addColorStop(1, "white");
                    //lctx.fillStyle = small_gradient;                    
                    //lctx.beginPath();
                    //lctx.arc(nodeX , nodeY, 14, 0, 2 * Math.PI);                    
                    //lctx.arc(nodeX, nodeY, 16, 0, 2 * Math.PI);                   
                    //lctx.closePath();                  
                    //lctx.stroke();                   
                    //lctx.fill();
                   
                    lctx.font = "bold 14px Verdana";
                    //ave text
                    lctx.fillStyle = "#000";
                    lctx.beginPath();
                    lctx.fillText(ave, nodeX, nodeY + 7);
                    lctx.closePath();                    
                    lctx.fill();
                 

                    lctx.font = "bold 11px Verdana";
                   

                    lctx.lineWidth = 1;
                    //hr text..
                    lctx.save();
                    lctx.translate(centerX, centerY);
                    lctx.rotate(Math.PI / 2);
                    lctx.textAlign = "left";                                        
                    lctx.fillText(title, 15, -i * shift-95);
                    lctx.restore();
                   
                    lctx.closePath();                   
                    //lctx.stroke();
                    lctx.fill();
                   


                   
                }
                for (var i = 0; i <= 100; i=i+10) {                   
                    var lc = document.getElementById('l0');
                    var lctx = lc.getContext("2d");

                    lctx.strokeStyle = "#acacac";
                    lctx.fillStyle = "#777777";
                    lctx.font = "bold 12px Verdana";
                    
                    
                    lctx.textAlign = "right";                                       
                    lctx.fillText(i, centerX - 10, centerY - 3 * i);

                    lctx.lineWidth = 0.1;
                    lctx.beginPath();
                    lctx.moveTo(centerX, centerY - 3 * i);
                    lctx.lineTo(centerX + 900, centerY - 3 * i);
                    lctx.closePath();
                    lctx.stroke();
                    lctx.fill();

                    lctx.lineWidth = 0.1;

                    //lctx.setLineDash([0])
                    lctx.beginPath();
                    lctx.moveTo(centerX + i/10 * shift, centerY);
                    lctx.lineTo(centerX + i/10 * shift, centerY - 320);
                    lctx.closePath();
                    lctx.stroke();
                   

                }

               



            }
        });
}

$(document).ready(function ()
{
    
    GetData();
   

   /* $(document).mousemove(function (event) {
        $('.detail').css({ 'display': 'none' });
        // select range
        var canvas = document.getElementById('myCanvas');
        var context = canvas.getContext('2d');
        var mousePos = getMousePos(canvas, event);
        var message = "Mouse position: " + mousePos.x + "," + mousePos.y;
        // writeMessage(canvas, message);

        var mouseX = mousePos.x; // -centerX;
        var mouseY = mousePos.y; // -centerY;
        //$('#log').text(mouseX + ':' + mouseY);


        var r = Math.sqrt(Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2));
        var rid = Math.floor(r / (maxR / 10));


       
        //-----------------------------

        // check nodes
        var margin = 20;
        var xmarginPlus = 200;
        var dispalce;
        var opsDispalce;
        for (i = 0; i < categoryData.length; i++) {
            var nodeCenterX = centerX + (maxR + extend) * Math.cos(i * -1 / categoryData.length * Math.PI * 2 + rotation);
            var nodeCenterY = centerY + (maxR + extend) * Math.sin(i * -1 / categoryData.length * Math.PI * 2 + rotation);
            if (i < (categoryData.length - 1) / 2) {
                dispalce = 0;
                opsDispalce = 1;
            }
            else {
                dispalce = 1;
                opsDispalce = 0;
            }


            if (
            mouseX > nodeCenterX - margin - (xmarginPlus * opsDispalce) &&
            mouseX < nodeCenterX + margin + (xmarginPlus * dispalce) &&
            mouseY > nodeCenterY - margin &&
            mouseY < nodeCenterY + margin) {

                $('.range').css({ 'display': 'none' });
                $('.label').css({ 'display': 'none' });
                $('.detail').css({ 'display': 'none' });
                $('#l' + i).css({ 'display': 'inline' });
                $('#d' + i).css({ 'display': 'inline' });
                var rid = Math.floor(categoryData[i]['average'] / 10);
                $('#r' + rid).css({ 'display': 'inline' });
            }

        }


        //$('#log').text(r);
    });*/
});





function writeMessage(canvas, message) {
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '18pt Calibri';
    context.fillStyle = 'black';
    context.fillText(message, 10, 25);
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

