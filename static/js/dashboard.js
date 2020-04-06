// function check_value(id) {
//   var checkBox = document.getElementById(id);
//   // var imgDelete = document.getElementById("imgDelete");
//   var imgAdd = document.getElementById("imgAdd");

//   if (checkBox.checked == true) {
//     // imgDelete.style.display = "block";
//     imgAdd.style.display = "none";

//   } else {
//     // imgDelete.style.display = "none";
//     imgAdd.style.display = "block";
//   }
// }


function toggle(source) {
  checkboxes = document.getElementsByName('example');
  var imgDelete = document.getElementById("imgDelete");
  var imgAdd = document.getElementById("imgAdd");
  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i] != source) {
      checkboxes[i].checked = source.checked;

      if (checkboxes[i].checked) {

        imgDelete.style.display = "block";
        imgAdd.style.display = "none";

      } else {
        imgDelete.style.display = "none";
        imgAdd.style.display = "block";
      }


    }
  }
}
//enable button assessments after close mode and cange background of other button ,make button of copy enabled
document.getElementById("btnCopyDisabled").disabled = true;
var disabledButton = true;
$('#closemodalandSave').click(function () {

  if ($(".bg-info .centerDiv").find(".custom-control-input").prop("checked") === false) {
    $("#display").empty();
    $("#display").append("<div class='alert alert-danger'>Please Select Demographic!</div>");
    $('#myModal').scrollTop(0);
  } else if ($(".bg-warning .centerDiv").find(".custom-control-input").attr("id") === undefined) {
    $("#display").empty();
    $("#display").append("<div class='alert alert-danger'>Please Select Demographic Value!</div>");
    $('#myModal').scrollTop(0);
  } else {

    $('#myModal').modal('hide');
    document.getElementById("btnCopyDisabled").disabled = false;
    $("#btnassess").empty();
    $("#btnassess").append("<button type='button' id='endAssessment' class='btn btn-start' style='background-color: #bf0000;'>End Assessment</button>")
  }


});

$("#btnassess").on("click", "#endAssessment", function (e) {

  $("#btnassess").empty();
  $("#btnassess").append("<button type='button' id='startAsseement' class='btn btn-start' data-toggle='modal'\
    data-target='#myModal'>Start Assessment</button>");
  document.getElementById("btnCopyDisabled").disabled = true;
  $("#linkedCopiedText").empty();
  $("#myInput").val("https://readyforagile.inet.works/survey/");

})

//function for copy link
function myFunction() {
  var linkedCopy
  var linkContainer = document.getElementsByClassName("linkContainer")[0];
  var copyText = document.getElementById("myInput");

  copyText.select();
  copyText.setSelectionRange(0, 99999)
  document.execCommand("copy");
  linkedCopy = linkedCopy
  linkContainer.style.border = "2px solid #3b86ff";
  document.getElementById("linkedCopiedText").innerHTML = "Link copied";


}
// end function for copy link
//function for make dashbord activated in onload
// function activeLink() {
//   var dashboard = document.getElementById('dashboard');
//   dashboard.classList.add('active');

// }
//activited current page in side menu
var dashboard = document.getElementById('dashboard');
var participants = document.getElementById('participants');
var reports = document.getElementById('reports');


dashboard.addEventListener('click', function () {
  this.classList.add('active');
  reports.classList.remove('active');

  participants.classList.remove('active');

});

participants.addEventListener('click', function () {
  this.classList.add('active');
  reports.classList.remove('active');
  dashboard.classList.remove('active');

});
reports.addEventListener('click', function () {
  this.classList.add('active');
  participants.classList.remove('active');
  dashboard.classList.remove('active');

});