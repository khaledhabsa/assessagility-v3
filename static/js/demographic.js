function check_value(id) {
	var checkBox = document.getElementById(id);
	// var imgDelete = document.getElementById("imgDelete");
	var imgAdd = document.getElementById("imgAdd");

	if (checkBox.checked == true) {
		// imgDelete.style.display = "block";
		imgAdd.style.display = "none";

	} else {
		// imgDelete.style.display = "none";
		imgAdd.style.display = "block";
	}
}
let saveVal = {}

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
function toggle_val(source) {
	$(source).prop("checked")
	$(".bg-warning #values").find(".lastDiv").each(function (i, ob) {
		if ($(source).prop("checked")) {
			$(ob).find(".custom-control-input").prop("checked", true)
			$("#imgDeleteVal").css("display", "block");
			$("#imgAddVal").css("display", "none");
		} else {
			$(ob).find(".custom-control-input").prop("checked", false)
			$("#imgDeleteVal").css("display", "none");
			$("#imgAddVal").css("display", "block");
		}

	})
}
$(document).ready(function () {
	var id = 0
	$("#demoGraph").empty();
	$("#values").empty();
	$.ajax({
		url: '/survey/getalldemgraphic/',
		cache: false,
		dataType: "json",
		cache: true,
		success: function (data) {
			data.forEach(function (e, i) {
				var div = null

				if (i === 0) {
					div = "	<div class='centerDiv'>\
								<div class='row headerContainerRow'>\
									<div class='col-sm-10 col-md-10 col-lg-10'>\
										<div class='custom-control custom-checkbox left'>\
											<input type='checkbox' class='custom-control-input' id='"+ e.id + "'\
												name='example'>\
											<label class='custom-control-label fontNormal' for='" + e.id + "'>&nbsp; &nbsp;&nbsp; &nbsp;\
												"+ e.title + "</label>\
										</div>\
									</div>\
									<div class='col-sm-2 col-md-2 col-lg-2 headertitleContainerCol'>\
										<p class='right'>\
											<img src=\"/static/images/keyboard_arrow_right-24px (1).svg\">\
										</p>\
									</div>\
								</div>\
					  		</div>\
					  	"
					$("#currentDemo").empty()
					$("#currentDemo").append(e.title)
					$.ajax({
						url: '/survey/getalldemgraphicvalue/',
						data: {
							"demographic": e.id,
						},
						cache: true,
						success: function (dt) {
							var data = JSON.parse(dt)
							data.forEach(function (e, i) {

								var d = null
								if (i + 1 === data.length) {

									d = " <div class='lastDiv' style='border-bottom: none'>\
                                          <div class='custom-control custom-checkbox left'>\
                                              <input type='checkbox' class='custom-control-input' id='"+ e.id + "'\
                                                  name='example5'>\
                                              <label class='custom-control-label fontNormal' for='"+ e.id + "'>&nbsp;\
                                                  &nbsp;&nbsp; &nbsp;\
                                                  "+ e.value + "</label>\
                                          </div>\
                                      </div>\
                                  "
								} else {
									d = " <div class='lastDiv'>\
                                          <div class='custom-control custom-checkbox left'>\
                                              <input type='checkbox' class='custom-control-input' id='"+ e.id + "'\
                                                  name='example5'>\
                                              <label class='custom-control-label fontNormal' for='"+ e.id + "'>&nbsp;\
                                                  &nbsp;&nbsp; &nbsp;\
                                                  "+ e.value + "</label>\
                                          </div>\
                                      </div>\
                                  "
								}

								$("#values").append(d);
							})
						},
						error: function (data) {

						}

					})
				} else {
					div = "	<div class='lastDiv'>\
								<div class='row headerContainerRow'>\
									<div class='col-sm-10 col-md-10 col-lg-10'>\
										<div class='custom-control custom-checkbox left'>\
											<input type='checkbox' class='custom-control-input' id='"+ e.id + "'\
												name='example'>\
											<label class='custom-control-label fontNormal' for='" + e.id + "'>&nbsp; &nbsp;&nbsp; &nbsp;\
												"+ e.title + "</label>\
										</div>\
									</div>\
									<div class='col-sm-2 col-md-2 col-lg-2 headertitleContainerCol'>\
										<p class='right'>\
											<img src=\"/static/images/keyboard_arrow_right-24px (1).svg\">\
										</p>\
					  				</div>\
					  			</div>\
					  		</div>\
					  	"
				}
				$("#demoGraph").append(div)
			})

		},
		error: function (error) {

		}
	})


})
$(".bg-info").on("click", ".centerDiv", function (e) {
	if (!$(this).find(".custom-control-input").prop("checked")) {
		$("#imgDelete").css("display", "block");
		$("#imgAdd").css("display", "none");

		$(this).find(".custom-control-input").prop("checked", true)
	}
	else {
		var arr = []
		$(".bg-info .lastDiv").each(function (i, ob) {
			if ($(ob).find(".custom-control-input").prop("checked")) {
				arr.push(true)
			}
		})
		if (arr.length == 0) {
			$("#imgDelete").css("display", "none");
			$("#imgAdd").css("display", "block");
		}
		$(this).find(".custom-control-input").prop("checked", false)
	}

})
$(".bg-warning").on("click", ".centerDiv", function (e) {
	if (!$(this).find(".custom-control-input").prop("checked"))
		$(this).find(".custom-control-input").prop("checked", true)

})

$("#imgDeleteModal").on("click", function (e) {
	$("#myModal").modal("hide");
	var ids = []
	if ($(".bg-info .centerDiv .custom-control-input").prop("checked"))
		ids.push($(".bg-info .centerDiv .custom-control-input").attr("id"))

	$(".bg-info .lastDiv").each(function (i, ob) {
		if ($(ob).find(".custom-control-input").prop("checked"))
			ids.push($(ob).find(".custom-control-input").attr("id"))
	})

	$.ajax({
		url: '/survey/deletedemographic/',
		data: {
			"ids": ids.join(","),
		},
		success: function (data) {
			$.ajax({
				url: '/survey/getalldemgraphic/',
				cache: false,
				dataType: "json",
				cache: true,
				success: function (data) {
					$("#demoGraph").empty();
					$("#values").empty();
					$("#imgDelete").css("display", "none");
					$("#imgAdd").css("display", "block");
					$(".bg-info #-1").prop('checked', false);
					data.forEach(function (e, i) {
						var div = null

						if (i === 0) {
							div = "	<div class='centerDiv'>\
										<div class='row headerContainerRow'>\
											<div class='col-sm-10 col-md-10 col-lg-10'>\
												<div class='custom-control custom-checkbox left'>\
													<input type='checkbox' class='custom-control-input' id='"+ e.id + "'\
														name='example'>\
													<label class='custom-control-label fontNormal' for='" + e.id + "'>&nbsp; &nbsp;&nbsp; &nbsp;\
														"+ e.title + "</label>\
												</div>\
											</div>\
											<div class='col-sm-2 col-md-2 col-lg-2 headertitleContainerCol'>\
												<p class='right'>\
													<img src=\"/static/images/keyboard_arrow_right-24px (1).svg\">\
												</p>\
											</div>\
										</div>\
									</div>\
								"
							$("#currentDemo").empty()
							$("#currentDemo").append(e.title)
							$.ajax({
								url: '/survey/getalldemgraphicvalue/',
								data: {
									"demographic": e.id,
								},
								cache: true,
								success: function (dt) {
									var data = JSON.parse(dt)
									data.forEach(function (e, i) {

										var d = null
										if (i + 1 === data.length) {

											d = " <div class='lastDiv' style='border-bottom: none'>\
												<div class='custom-control custom-checkbox left'>\
													<input type='checkbox' class='custom-control-input' id='"+ e.id + "'\
														name='example5'>\
													<label class='custom-control-label fontNormal' for='"+ e.id + "'>&nbsp;\
														&nbsp;&nbsp; &nbsp;\
														"+ e.value + "</label>\
												</div>\
											</div>\
										"
										} else {
											d = " <div class='lastDiv'>\
												<div class='custom-control custom-checkbox left'>\
													<input type='checkbox' class='custom-control-input' id='"+ e.id + "'\
														name='example5'>\
													<label class='custom-control-label fontNormal' for='"+ e.id + "'>&nbsp;\
														&nbsp;&nbsp; &nbsp;\
														"+ e.value + "</label>\
												</div>\
											</div>\
										"
										}

										$("#values").append(d);
									})
								},
								error: function (data) {

								}

							})
						} else {
							div = "	<div class='lastDiv'>\
										<div class='row headerContainerRow'>\
											<div class='col-sm-10 col-md-10 col-lg-10'>\
												<div class='custom-control custom-checkbox left'>\
													<input type='checkbox' class='custom-control-input' id='"+ e.id + "'\
														name='example'>\
													<label class='custom-control-label fontNormal' for='" + e.id + "'>&nbsp; &nbsp;&nbsp; &nbsp;\
														"+ e.title + "</label>\
												</div>\
											</div>\
											<div class='col-sm-2 col-md-2 col-lg-2 headertitleContainerCol'>\
												<p class='right'>\
													<img src=\"/static/images/keyboard_arrow_right-24px (1).svg\">\
												</p>\
											</div>\
										</div>\
									</div>\
								"
						}
						$("#demoGraph").append(div)
					})

				},
				error: function (error) {

				}
			})
		},
		error: function (data) {

		}

	})
})
$(".bg-info").on("click", "#imgAdd", function (e) {
	var d = "<div class='lastDivs'>\
				  <div class='row headerContainerRow'> <div class='col-sm-9 col-md-10 col-lg-10'>\
				  <div class='custom-control custom-checkbox left'>\
						  <input type='text' class='form-control' id='addDemoInp' placeholder='New Demographic' />\
				  </div></div> \
				  <div class='col-sm-2 col-md-2 col-lg-2 headertitleContainerCol'><p id='actions' class='right'>\
					  <img src='/static/images/multiply.svg' id='closeDemo' style='cursor:pointer;'/>\
				  </p>\
				</div></div></div>"
	$("#demoGraph").append(d)
})
$(".bg-info #demoGraph").on("keyup", "#addDemoInp", function () {
	if ($(".bg-info #addDemoInp").val() === '') {
		$(".bg-info #demoGraph").find("#actions").html("<img src='/static/images/multiply.svg' id='closeDemo' style='cursor:pointer;'/>")
	} else {
		$(".bg-info #demoGraph").find("#actions").html("<img src='/static/images/check.svg' id='addDemo' style='cursor:pointer;'/>")
	}
})
$(".bg-info #demoGraph").on("click", "#closeDemo", function () {

	$(this).parent().parent().parent().parent().remove();

})
$(".bg-info").on("click", "#addDemo", function (e) {

	if ($(".bg-info #addDemoInp").val() === '') {
		console.log("done")
	} else {
		$.ajax({
			url: '/survey/adddemographic/',
			type: 'POST',
			data: {
				'csrfmiddlewaretoken': $("input[type=hidden]").val(),
				'title': $(".bg-info #addDemoInp").val(),
			},
			success: function (data) {
				$.ajax({
					url: '/survey/getalldemgraphic/',
					cache: false,
					dataType: "json",
					cache: true,
					success: function (data) {
						$("#demoGraph").empty();
						$("#values").empty();
						$("#imgDelete").css("display", "none");
						$("#imgAdd").css("display", "block");
						data.forEach(function (e, i) {
							var div = null

							if (i === 0) {
								div = "	<div class='centerDiv'>\
											<div class='row headerContainerRow'>\
												<div class='col-sm-10 col-md-10 col-lg-10'>\
													<div class='custom-control custom-checkbox left'>\
														<input type='checkbox' class='custom-control-input' id='"+ e.id + "'\
															name='example'>\
														<label class='custom-control-label fontNormal' for='" + e.id + "'>&nbsp; &nbsp;&nbsp; &nbsp;\
															"+ e.title + "</label>\
													</div>\
												</div>\
												<div class='col-sm-2 col-md-2 col-lg-2 headertitleContainerCol'>\
													<p class='right'>\
														<img src=\"/static/images/keyboard_arrow_right-24px (1).svg\">\
													</p>\
												</div>\
											</div>\
										</div>\
									"
								$("#currentDemo").empty()
								$("#currentDemo").append(e.title)
								$.ajax({
									url: '/survey/getalldemgraphicvalue/',
									data: {
										"demographic": e.id,
									},
									cache: true,
									success: function (dt) {
										var data = JSON.parse(dt)
										data.forEach(function (e, i) {

											var d = null
											if (i + 1 === data.length) {

												d = " <div class='lastDiv' style='border-bottom: none'>\
												  <div class='custom-control custom-checkbox left'>\
													  <input type='checkbox' class='custom-control-input' id='"+ e.id + "'\
														  name='example5'>\
													  <label class='custom-control-label fontNormal' for='"+ e.id + "'>&nbsp;\
														  &nbsp;&nbsp; &nbsp;\
														  "+ e.value + "</label>\
												  </div>\
											  </div>\
										  "
											} else {
												d = " <div class='lastDiv'>\
												  <div class='custom-control custom-checkbox left'>\
													  <input type='checkbox' class='custom-control-input' id='"+ e.id + "'\
														  name='example5'>\
													  <label class='custom-control-label fontNormal' for='"+ e.id + "'>&nbsp;\
														  &nbsp;&nbsp; &nbsp;\
														  "+ e.value + "</label>\
												  </div>\
											  </div>\
										  "
											}

											$("#values").append(d);
										})
									},
									error: function (data) {

									}

								})
							} else {
								div = "	<div class='lastDiv'>\
											<div class='row headerContainerRow'>\
												<div class='col-sm-10 col-md-10 col-lg-10'>\
													<div class='custom-control custom-checkbox left'>\
														<input type='checkbox' class='custom-control-input' id='"+ e.id + "'\
															name='example'>\
														<label class='custom-control-label fontNormal' for='" + e.id + "'>&nbsp; &nbsp;&nbsp; &nbsp;\
															"+ e.title + "</label>\
													</div>\
												</div>\
												<div class='col-sm-2 col-md-2 col-lg-2 headertitleContainerCol'>\
													<p class='right'>\
														<img src=\"/static/images/keyboard_arrow_right-24px (1).svg\">\
													</p>\
												</div>\
											</div>\
										</div>\
									"
							}
							$("#demoGraph").append(div)
						})

					},
					error: function (error) {

					}
				})
			}
		})
	}


})
$(".bg-info").on("click", ".lastDiv", function (e) {
	if (!$(this).find(".custom-control-input").prop("checked"))
		$(this).find(".custom-control-input").prop("checked", true)
	else
		$(this).find(".custom-control-input").prop("checked", false)
	$(".bg-info .centerDiv").removeClass("centerDiv").addClass("lastDiv");
	$(this).addClass("centerDiv");
	$(this).removeClass("lastDiv");
	var idOb = $(this).find(".custom-control-input").attr("id")
	var id = $(this).find("input[type=checkbox").attr("id")

	$.ajax({
		url: '/survey/getalldemgraphicvalue/',
		data: {
			"demographic": id,
		},
		cache: true,
		success: function (dt) {
			var data = JSON.parse(dt)
			$("#values").empty()
			$("#currentDemo").html($.trim($(".bg-info #demoGraph .centerDiv").find(".custom-control-label").text()))
			data.forEach(function (e, i) {
				var d = null
				var itr = i + 1
				if (i + 1 === data.length) {
					d = " <div class='lastDiv' id='" + itr + "' style='border-bottom: none'>\
							<div class='custom-control custom-checkbox left'>\
								<input type='checkbox' class='custom-control-input' id='"+ e.id + "'\
									name='example5'>\
								<label class='custom-control-label fontNormal' for='"+ e.id + "'>&nbsp;\
									&nbsp;&nbsp; &nbsp;\
									"+ e.value + "</label>\
							</div>\
						</div>\
					"
				} else {

					d = " <div class='lastDiv' id='" + itr + "'>\
							<div class='custom-control custom-checkbox left'>\
								<input type='checkbox' class='custom-control-input' id='"+ e.id + "'\
									name='example5'>\
								<label class='custom-control-label fontNormal' for='"+ e.id + "'>&nbsp;\
									&nbsp;&nbsp; &nbsp;\
									"+ e.value + "</label>\
							</div>\
						</div>\
					"
				}

				$("#values").append(d);
				if (saveVal[idOb]) {
					if (saveVal[idOb].includes($(".bg-warning").find("#" + itr).find(".custom-control-input").attr("id"))) {
						$(".bg-warning #values").find("#" + itr).find(".custom-control-input").prop("checked", true)
					}
				}
			})

		},
		error: function (data) {

		}

	})

})

//---------------//
$(".bg-warning").on("click", ".lastDiv", function (e) {
	if ($(this).find(".custom-control-input").prop("checked")) {
		$(".bg-warning #imgAddVal").css("display", "none");
		$(".bg-warning #imgDeleteVal").css("display", "block");

	} else {
		var arr = []
		$(".bg-warning").find(".lastDiv").each(function (i, ob) {
			if ($(ob).find(".custom-control-input").prop("checked"))
				arr.push(true)

		})
		if (arr.length == 0) {
			$(".bg-warning #imgAddVal").css("display", "block");
			$(".bg-warning #imgDeleteVal").css("display", "none");
		}
	}
	var value = []
	$(".bg-warning .lastDiv").each(function (i, ob) {

		if ($(ob).find(".custom-control-input").prop("checked"))
			value.push($(ob).find(".custom-control-input").attr("id"))
	})

	saveVal[$(".bg-info .centerDiv").find(".custom-control-input").attr("id")] = value

})
$("#imgDeleteValModal").on("click", function (e) {
	$("#myModalVal").modal("hide");
	var ids = []

	$(".bg-warning .lastDiv").each(function (i, ob) {
		if ($(ob).find(".custom-control-input").prop("checked"))
			ids.push($(ob).find(".custom-control-input").attr("id"))
	})
	var demo = $(".bg-info #demoGraph .centerDiv").find(".custom-control-input").attr("id")
	$.ajax({
		url: '/survey/deletedemographicvalue/',
		data: {
			"ids": ids.join(","),
		},
		success: function (data) {
			$(".bg-warning #imgAddVal").css("display", "block");
			$(".bg-warning #imgDeleteVal").css("display", "none");
			$(".bg-warning #0").prop('checked', false);
			$.ajax({
				url: '/survey/getalldemgraphicvalue/',
				data: {
					'demographic': demo,
				},
				cache: true,
				success: function (dt) {
					$("#values").empty();
					var data = JSON.parse(dt)
					data.forEach(function (e, i) {

						var d = null
						if (i + 1 === data.length) {

							d = " <div class='lastDiv' style='border-bottom: none'>\
										<div class='custom-control custom-checkbox left'>\
											<input type='checkbox' class='custom-control-input' id='"+ e.id + "'\
												name='example5'>\
											<label class='custom-control-label fontNormal' for='"+ e.id + "'>&nbsp;\
												&nbsp;&nbsp; &nbsp;\
												"+ e.value + "</label>\
										</div>\
									</div>\
								"
						} else {
							d = " <div class='lastDiv'>\
										<div class='custom-control custom-checkbox left'>\
											<input type='checkbox' class='custom-control-input' id='"+ e.id + "'\
												name='example5'>\
											<label class='custom-control-label fontNormal' for='"+ e.id + "'>&nbsp;\
												&nbsp;&nbsp; &nbsp;\
												"+ e.value + "</label>\
										</div>\
									</div>\
								"
						}

						$("#values").append(d);
					})
				}
			})
		}
	})

})
$(".bg-warning").on("click", "#imgAddVal", function (e) {
	var d = "<div class='lastDivs'>\
				  <div class='row headerContainerRow'> <div class='col-sm-9 col-md-10 col-lg-10'>\
				  <div class='custom-control custom-checkbox left'>\
						  <input type='text' class='form-control' id='addDemoValInp' placeholder='New Demographic Value' />\
				  </div></div> \
				  <div class='col-sm-2 col-md-2 col-lg-2 headertitleContainerCol'><p id='actions' class='right'>\
					  <img src='/static/images/multiply.svg' id='closeDemoVal' style='cursor:pointer;'/>\
				  </p>\
				</div></div></div>"
	$("#values").append(d)
})
$(".bg-warning #values").on("keyup", "#addDemoValInp", function () {
	if ($(".bg-warning #addDemoValInp").val() === '') {
		$(".bg-warning #values").find("#actions").html("<img src='/static/images/multiply.svg' id='closeDemoVal' style='cursor:pointer;'/>")
	} else {
		$(".bg-warning #values").find("#actions").html("<img src='/static/images/check.svg' id='addDemoVal' style='cursor:pointer;'/>")
	}
})
$(".bg-warning #values").on("click", "#closeDemoVal", function () {

	$(this).parent().parent().parent().parent().remove();

})
$(".bg-warning").on("click", "#addDemoVal", function (e) {
	var demo = $(".bg-info #demoGraph .centerDiv").find(".custom-control-input").attr("id")
	$.ajax({
		url: '/survey/adddemographicvalue/',
		type: 'POST',
		data: {
			'csrfmiddlewaretoken': $("input[type=hidden]").val(),
			'value': $(".bg-warning #addDemoValInp").val(),
			'demographic_id': demo,
		},
		success: function (data) {
			$.ajax({
				url: '/survey/getalldemgraphicvalue/',
				data: {
					'demographic': demo,
				},
				cache: true,
				success: function (dt) {
					$("#values").empty();
					var data = JSON.parse(dt)
					data.forEach(function (e, i) {

						var d = null
						if (i + 1 === data.length) {

							d = " <div class='lastDiv' style='border-bottom: none'>\
										<div class='custom-control custom-checkbox left'>\
											<input type='checkbox' class='custom-control-input' id='"+ e.id + "'\
												name='example5'>\
											<label class='custom-control-label fontNormal' for='"+ e.id + "'>&nbsp;\
												&nbsp;&nbsp; &nbsp;\
												"+ e.value + "</label>\
										</div>\
									</div>\
								"
						} else {
							d = " <div class='lastDiv'>\
										<div class='custom-control custom-checkbox left'>\
											<input type='checkbox' class='custom-control-input' id='"+ e.id + "'\
												name='example5'>\
											<label class='custom-control-label fontNormal' for='"+ e.id + "'>&nbsp;\
												&nbsp;&nbsp; &nbsp;\
												"+ e.value + "</label>\
										</div>\
									</div>\
								"
						}

						$("#values").append(d);
					})
				}
			})
		}
	})


})