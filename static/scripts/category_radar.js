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

var centerX = 480;
var centerY = 300;
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
CanvasRenderingContext2D.prototype.polygon = function (x, y, r, n, thickness) {
    this.beginPath();
    this.moveTo(x + r - thickness, y);
    this.lineTo(x + r, y);
    
        for (i = 0; i <= n; i++) {
            this.lineTo(x + Math.cos(Math.PI * 2 / n * i) * r , y + Math.sin(Math.PI * 2 / n * i) * r);
        }
    //this.lineTo(x + r-thickness, y);
    for (i = n; i >=0 ; i--) {
        this.lineTo(x + Math.cos(Math.PI * 2 / n * i) * (r - thickness), y + Math.sin(Math.PI * 2 / n * i) * (r - thickness));
    }
    
    this.closePath();

   // this.fill();
};


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
            url: '/report/category/radar/json/?v=3',
            cache: false,
            data: {
                'demographics_values': SetDemographicsValues(),
                'role': $('#slctRolesid :selected').val(),

            },
            dataType: "json",
            success: function (data)
            {
               
                categoryData = data;

                var bc = document.getElementById('Canvassesbackground');
                var bctx = bc.getContext("2d");
                bctx.font = "normal 14px Verdana";

                bctx.textAlign = "end";


                bctx.strokeStyle = "#999999";

                var lbc = document.getElementById('labelsbackground');
                var lbctx = lbc.getContext("2d");
                lbctx.font = "normal 14px Verdana";

                lbctx.textAlign = "end";


                lbctx.strokeStyle = "#999999";


                for (var i = 100; i >= 0; i -= 10)
                {
                    index = i / 10 - 1;
                    $('#ranges').append('<canvas class="range" id="r' + index + '" width="1000" height="778" style="position:absolute;left:0px;top:0px;"></canvas>');
                    var rgc = document.getElementById('r' + index);
                    var rgctx = rgc.getContext("2d");

                   rgctx.fillStyle = colorlist[i / 10 - 1];
                    rgctx.beginPath();

                    
                    
                    if (i > 0)
                        rgctx.polygon(centerX, centerY, maxR * i / 100, categoryData.length, 20);
                    

                    //Srgctx.lineTo(centerX + 60 * index, centerY - maxR * i / 100);
                    rgctx.closePath();
                    //rgctx.stroke();
                    rgctx.fill();
 

                    bctx.fillStyle = colorlist[i / 10 - 1];

                    bctx.beginPath();
                    // bctx.arc(centerX, centerY, maxR * i / 100, 0, 2 * Math.PI);
                    bctx.polygon(centerX, centerY, maxR * i / 100, categoryData.length, 20);
                    bctx.fill();

                }
                lbctx.strokeStyle = "#999999";
                lbctx.fillStyle = "#777777";
                for (var i = 0; i < categoryData.length; i++) {

                    
                    $('#labels').append('<canvas class="label" id="l' + i + '" width="1000" height="778" style="position:absolute;left:0px;top:0px;"></canvas>');
                    var lc = document.getElementById('l' + i);
                    var lctx = lc.getContext("2d");

                    lctx.strokeStyle = "#999999";
                    lctx.fillStyle = "#777777";
                    lctx.font = "normal 14px Verdana";


                    if (i < (categoryData.length - 1) / 2)
                        dispalce = 0;
                    else
                        dispalce = 1;

                   
                    lbctx.moveTo(centerX + maxR * categoryData[i]['average'] / 100 * Math.cos(i * -1 / categoryData.length * Math.PI * 2 + rotation), centerY + maxR * categoryData[i]['average'] / 100 * Math.sin(i * -1 / categoryData.length * Math.PI * 2 + rotation));
                    lbctx.lineTo(centerX + (maxR + extend) * Math.cos(i * -1 / categoryData.length * Math.PI * 2 + rotation), centerY + (maxR + extend) * Math.sin(i * -1 / categoryData.length * Math.PI * 2 + rotation));
                    lbctx.lineTo(centerX - maxR - horizontalExtend + ((maxR + horizontalExtend) * 2 * dispalce), centerY + (maxR + extend) * Math.sin(i * -1 / categoryData.length * Math.PI * 2 + rotation));


                    
                    lctx.moveTo(centerX + maxR * categoryData[i]['average'] / 100 * Math.cos(i * -1 / categoryData.length * Math.PI * 2 + rotation), centerY + maxR * categoryData[i]['average'] / 100 * Math.sin(i * -1 / categoryData.length * Math.PI * 2 + rotation));
                    lctx.lineTo(centerX + (maxR + extend) * Math.cos(i * -1 / categoryData.length * Math.PI * 2 + rotation), centerY + (maxR + extend) * Math.sin(i * -1 / categoryData.length * Math.PI * 2 + rotation));
                    lctx.lineTo(centerX - maxR - horizontalExtend + ((maxR + horizontalExtend) * 2 * dispalce), centerY + (maxR + extend) * Math.sin(i * -1 / categoryData.length * Math.PI * 2 + rotation));

                    


                    lbctx.textAlign = "end";
                    lctx.textAlign = "end";
                    if (dispalce == 1) {
                        lbctx.textAlign = "start";
                        lctx.textAlign = "start";
                    }




                    
                    lctx.beginPath();
                    lbctx.beginPath();
                    lctx.arc(centerX + maxR * categoryData[i]['average'] / 100 * Math.cos(i * -1 / categoryData.length * Math.PI * 2 + rotation), centerY + maxR * categoryData[i]['average'] / 100 * Math.sin(i * -1 / categoryData.length * Math.PI * 2 + rotation), 4, 0, 2 * Math.PI);
                    lbctx.arc(centerX + maxR * categoryData[i]['average'] / 100 * Math.cos(i * -1 / categoryData.length * Math.PI * 2 + rotation), centerY + maxR * categoryData[i]['average'] / 100 * Math.sin(i * -1 / categoryData.length * Math.PI * 2 + rotation), 4, 0, 2 * Math.PI);
                    lctx.fill();
                    lbctx.fill();




                    //------------------------

                    var nodeCenterX = centerX + (maxR + extend) * Math.cos(i * -1 / categoryData.length * Math.PI * 2 + rotation);
                    var nodeCenterY = centerY + (maxR + extend) * Math.sin(i * -1 / categoryData.length * Math.PI * 2 + rotation);
                  
                    


                    lctx.beginPath();
                    lbctx.beginPath();

                    lctx.moveTo(centerX + maxR * categoryData[i]['average'] / 100 * Math.cos(i * -1 / categoryData.length * Math.PI * 2 + rotation), centerY + maxR * categoryData[i]['average'] / 100 * Math.sin(i * -1 / categoryData.length * Math.PI * 2 + rotation));
                    lbctx.moveTo(centerX + maxR * categoryData[i]['average'] / 100 * Math.cos(i * -1 / categoryData.length * Math.PI * 2 + rotation), centerY + maxR * categoryData[i]['average'] / 100 * Math.sin(i * -1 / categoryData.length * Math.PI * 2 + rotation));

                    lctx.lineTo(nodeCenterX, nodeCenterY);
                    lbctx.lineTo(nodeCenterX, nodeCenterY);
                  
                    lctx.stroke();
                    lbctx.stroke();


                    // circle line on edge
                    lctx.beginPath();
                    lbctx.beginPath();
                    lctx.arc(nodeCenterX, nodeCenterY, 5, 0, 2 * Math.PI, true);
                    lbctx.arc(nodeCenterX, nodeCenterY, 5, 0, 2 * Math.PI, true);
                    
                    //lbctx.lineTo(centerX + (maxR + extend) * Math.cos(i * -1 / categoryData.length * Math.PI * 2 + rotation), centerY + (maxR + extend) * Math.sin(i * -1 / categoryData.length * Math.PI * 2 + rotation));
                    lctx.fill();
                    lbctx.fill();



                    lctx.beginPath();
                    lbctx.beginPath();

                    lbctx.arc(nodeCenterX, nodeCenterY, 10, 0, 2 * Math.PI, true);
                    lctx.arc(nodeCenterX, nodeCenterY, 10, 0, 2 * Math.PI, true);


                    //----details------
                    $('#details').append('<canvas class="detail" id="d' + i + '" width="1000" height="778" style="position:absolute;left:0px;top:0px;display:none;"></canvas>');
                    var dc = document.getElementById('d' + i);
                    var dctx = dc.getContext("2d");



                    dctx.strokeStyle = "#cccccc";
                    dctx.fillStyle = "#cccccc";
                    dctx.font = "normal 14px Verdana";

                    var rectWidth = 250;
                    var rectHeight = 150;
                    var detailsPadding = 10;


                    //text
                    if (dispalce == 1) {
                        lbctx.fillText(categoryData[i]['title'], nodeCenterX + 20, nodeCenterY + 5);
                        lctx.fillText(categoryData[i]['title'], nodeCenterX + 20, nodeCenterY + 5);

                        //--details to the right
                        dctx.roundedRect(nodeCenterX - detailsPadding, nodeCenterY - detailsPadding, rectWidth, rectHeight, 20);
                        dctx.fillStyle = "#000000";
                        dctx.textAlign = "start";
                        dctx.fillText(categoryData[i]['title'], nodeCenterX + 20, nodeCenterY + 5);
                    } else {
                        lbctx.fillText(categoryData[i]['title'], nodeCenterX - 20, nodeCenterY + 5);
                        lctx.fillText(categoryData[i]['title'], nodeCenterX - 20, nodeCenterY + 5);

                        //--details to the left
                        dctx.roundedRect(nodeCenterX - rectWidth + detailsPadding, nodeCenterY - detailsPadding, rectWidth, rectHeight, 20);
                        dctx.fillStyle = "#000000";
                        dctx.textAlign = "end";


                        dctx.fillText(categoryData[i]['title'], nodeCenterX - 20, nodeCenterY + 5);
                    }
                    dctx.fillStyle = "#777777";
                    dctx.strokeStyle = "#777777";
                    dctx.beginPath();
                    dctx.arc(nodeCenterX, nodeCenterY, 12, 0, 2 * Math.PI, true);

                    dctx.fill();
                    dctx.fillStyle = "#ffffff";
                    dctx.textAlign = "center";
                    dctx.fillText(categoryData[i]['average'], nodeCenterX, nodeCenterY + 5);
                    var characteristicTitles = categoryData[i]['characteristicTitles'][0];
                    for (var ci = 1; ci < categoryData[i]['characteristicTitles'].length; ci++) {
                        characteristicTitles += ', ' + categoryData[i]['characteristicTitles'][ci];

                    }
                    characteristicTitles += ' .';
                    // dctx.fillText(characteristicTitles, nodeCenterX, nodeCenterY + 5);
                    dctx.textAlign = "start";
                    dctx.font = "normal 10px Verdana";

                    //dctx.fillStyle = "#777777";

                    if (dispalce == 1) {
                        wrapText(dctx, characteristicTitles, nodeCenterX - 5, nodeCenterY + 25, rectWidth, 9);
                    } else {
                        wrapText(dctx, characteristicTitles, nodeCenterX + 10 - rectWidth, nodeCenterY + 25, rectWidth, 9);
                    }


                    //----------------------

                    lctx.stroke();
                    lbctx.stroke();




                    //---------------

                }






                var rc = document.getElementById('Result');
                var rctx = rc.getContext("2d");

                for (var i = 0; i < categoryData.length; i++) {

                    if (i == 0) 
                        rctx.moveTo(centerX + maxR * categoryData[i]['average'] / 100 * Math.cos(i * -1 / categoryData.length * Math.PI * 2 + rotation), centerY + maxR * categoryData[i]['average'] / 100 * Math.sin(i * -1 / categoryData.length * Math.PI * 2 + rotation));
                        rctx.lineTo(centerX + maxR * categoryData[i]['average'] / 100 * Math.cos(i * -1 / categoryData.length * Math.PI * 2 + rotation), centerY + maxR * categoryData[i]['average'] / 100 * Math.sin(i * -1 / categoryData.length * Math.PI * 2 + rotation));
                    


                    


                }
                rctx.closePath();

                rctx.stroke();

                
            }
        });
}

$(document).ready(function (){
    
    GetData();
   

    $(document).mousemove(function (event) {
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


        if (rid <= 10) {
            $('.range').css({ 'display': 'none' });
            $('.label').css({ 'display': 'none' });
            $('.detail').css({ 'display': 'none' });
            $('#r' + rid).css({ 'display': 'inline' });

            for (var i = 0; i < categoryData.length; i++) {
                if (rid == Math.floor(categoryData[i]['average'] / 10)) {
                    $('#l' + i).css({ 'display': 'inline' });

                }
            }
        } else {
            $('.range').css({ 'display': 'inline' });
            $('.label').css({ 'display': 'inline' });
        }
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
    });
});

$('#submit.rounded').click(function () {
        
       
    //GetData();
   

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

