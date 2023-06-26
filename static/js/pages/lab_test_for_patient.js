$(document).ready(function()
{
  
    $(".addNewbtn").click(function()
    {
        $("#patient").val("").trigger("change")

        $(".addNewBtnSection").hide();
        $(".TestedPatientDTSection").hide();

        $(".backBtnSection").show();
        $(".TestingPatientSection").show();
    });

    $(".backBtn").click(function()
    {
        $(".backBtnSection").hide();
        $(".TestingPatientSection").hide();

        $(".addNewBtnSection").show();        
        $(".TestedPatientDTSection").show();        
    })

    function getPatientData()
    {
        var GetPatientDataUrl = $("#GetPatientDataUrl").data('url');

        $.ajax({
            type: "GET",
            url: GetPatientDataUrl,
            success: function(data) {
                displayPatientDetails(data)
            },
            error: function(exception) {
                console.log(exception)
            }
        });
    }

    // Get Patient Data Using Ajax

    getPatientData()

    function displayPatientDetails(PatientData)
    {
        var patient_select_data = [];

        for (var i = 0; i < PatientData.length; i++) {
            patient_select_data.push({ id: PatientData[i].id, text: PatientData[i].name, phone: PatientData[i].phone })
        }

        $("#patient").select2({
            data: patient_select_data,
            placeholder: "Select Patient",
            allowClear: true,
            templateResult: formatPatientSelect2
        });

        $("#patient").val("").trigger("change")

        function formatPatientSelect2(state) {
            if (state.id) {
                var container = $(
                    '<ul class="list-unstyled users-list m-0 avatar-group d-flex align-items-center">\
                        <li class="fw-bold">' + state.text + ' ( id :  ' + state.id + ' )<br><small>' + state.phone + '</small></li>\
                    </ul>'
                )
            }
            return container;
        }

        $("#patient").on("change", function() {

            $("#patient_test_report_form").trigger("reset");
            $(".select").val("").trigger('change');            
            $("#appointedDate").text(moment(new Date()).format("DD-MM-YYYY"));


            var thisVal = $(this).val();
    
            if (thisVal == "" || thisVal == null) {
                $("#patientId").val("0");
                $(".patientDetailsSection").hide();
            } else {
                $("#patientId").val(thisVal);
    
                var thisPatientData = PatientData.filter(function(data) {
                    return data.id == thisVal
                });

                $("#appointedPatientId").text(thisPatientData[0].id);
                $("#appointedPatientName").text(thisPatientData[0].name);
                $("#appointedPatientAge").text(thisPatientData[0].age);
                $("#appointedPatientGender").text(thisPatientData[0].gender);
                $(".patientDetailsSection").show();    
            }
        });

    };

    var LabTestForPatientData = $("#LabTestForPatientData").data("val");
   
    LT_For_PatientTable(LabTestForPatientData);

    function LT_For_PatientTable(dataObj) {
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(dataObj);

        if ($.fn.dataTable.isDataTable("#testedPatientListDT")) {
            $("#testedPatientListDT").DataTable().destroy();
        }

        var patientListDatatable = $("#testedPatientListDT").DataTable({
            data : dataObj,
            responsive: true,
            paging: true,
            "scrollY": false,
            "scrollCollapse": true,
            "order": [0, "desc"],
            "pageLength": 10,
            "bLengthChange": false,
            "scrollX": false,
            columns: [
                {
                    "title": "Id",
                    "data": "id"
                },
                {
                    "title": "Name",
                    "data": "patient_name"
                },
                {
                    "title": "Age",
                    "data": "patient_age"
                },
                {
                    "title": "Phone",
                    "data": "patient_phone"
                },
                {
                    "title": "Address",
                    "data": "patient_address"
                },
            ],
            columnDefs: [
                {
                    "targets" : 0,
                    "visible" : false
                },
                {
                    "targets" : 1,
                    "render" : function(data , type , row)
                    {   
                        var fatherNameText = "";
                        if(row.father_name != ""){
                            if(row.patient_gender == "Male") { fatherNameText = "( S/O "+row.father_name+" )" }
                            else{ fatherNameText = "( D/O "+row.father_name+" )" }
                        }
                        else{
                            fatherNameText = ""
                        }
                        return (
                            '<h2 class="table-avatar">\
                                <a href="javascript:void(0)">' + data + ' <span style="text-align:left"> ' + fatherNameText + '</span> </a>\
                            </h2>'
                        )
                    }
                },
                {
                    "targets" : 2,
                    "render" : function(data , type , row)
                    {
                        return (
                            '<h2 class="table-avatar">\
                                <a href="javascript:void(0)">' + data + ' <span style="text-align:left"> ( ' + row.patient_gender + ' )</span> </a>\
                            </h2>'
                        )
                    }
                },
                {
                    "targets" : 5,
                    "data" : null,
                    "title" : "Action",
                    "render" : function(data , type , row) 
                    {
                        return (
                            "<a class='btn btn-outline-primary' href = '/lab/patient_lt_report/"+row.id+"'>View</a>"
                        )
                    }
                }
            ]

        })
    };


    var LabGroupData = $("#LabGroupData").data("val");
   
    // Group & Test View

    $.each(LabGroupData, function(index, Obj) {

        var SubGroupAction = "";
        var Groupname = Obj.name;

        $.each(Obj.test_data, function(t_index, t_Obj) {


            if (t_Obj.is_radio == 'False') {
                SubGroupAction += '<div class="form-group row summary-row">\
                                    <label class="col-lg-3 col-form-label">' + t_Obj.name + '</label>\
                                    <div class="col-lg-9">\
                                        <div class="input-group">\
                                            <input type="text" data-group_id = "'+Obj.id+'"  data-group="' + Groupname + '"  data-amount = "'+Obj.amount+'"   data-test_id = "'+t_Obj.id+'"   data-name="' + t_Obj.name + '" data-unit="' + t_Obj.unit + '" class="form-control TestValue" placeholder="" aria-label="" aria-describedby="basic-addon2">\
                                            <span class="input-group-text" id="basic-addon2">' + t_Obj.unit + '</span>\
                                        </div>\
                                    </div>\
                                </div>';
            } else {
                SubGroupAction += '<div class="form-group row summary-row">\
                                    <label class="col-lg-3 col-form-label">' + t_Obj.name + '</label>\
                                    <div class="col-lg-9">\
                                        <select class="select TestValue" data-group_id = "'+Obj.id+'"  data-group="' + Groupname + '" data-amount = "'+Obj.amount+'"  data-test_id = "'+t_Obj.id+'"  data-name="' + t_Obj.name + '" data-unit="' + t_Obj.unit + '">\
                                           <option value="Positive">Positive</option><option value="Negative">Negative</option>\
                                        </select>\
                                    </div>\
                                </div>';
            }


        });

        var GroupAction = '<div class="col-xl-6">\
                                <div class="card flex-fill">\
                                    <div class="card-header">\
                                        <h5 class="card-title">' + Groupname + '</h5>\
                                    </div>\
                                    <div class="card-body">' + SubGroupAction + '\
                                    </div>\
                                </div>\
                            </div>';


        $(".select").select2({
            minimumResultsForSearch: -1
        })

        $(".select").val("").trigger('change');

        $("#ReportAction").append(GroupAction);

    });


    $("#patient_test_report_form").submit(function(e)
    {
        e.preventDefault();

        var ReportObj = [];
        var PatientObj = [];
        var OverAllgroupamount = 0;

        $(".summary-row").each(function() {

            if ($(this).find('.TestValue').val() != 0 && $(this).find('.TestValue').val() != null) {
                var GroupId = $(this).find('.TestValue').data("group_id");
                var Groupname = $(this).find('.TestValue').data("group");
                OverAllgroupamount += $(this).find('.TestValue').data("amount");
                var TestId = $(this).find('.TestValue').data("test_id");
                var TestName = $(this).find('.TestValue').data("name");
                var TestValue = $(this).find('.TestValue').val();
                var TestUnit = $(this).find('.TestValue').data("unit");

                ReportObj.push({
                    groupId: GroupId,
                    groupname: Groupname,
                    testId: TestId,
                    testname: TestName,
                    testvalue: TestValue,
                    testunit: TestUnit,
                });

            }

        });
        

        PatientObj.push({
            patient_id : $("#patientId").val()
        });

        if (ReportObj.length != 0) {
      
           $.ajax({
            type: "POST",
            headers: {
                'X-CSRFToken': $.cookie("csrftoken"),
                'Content-Type': 'application/json',
            },
            url: ".",
            data: JSON.stringify({
                'ReportObj': ReportObj,
                'OverAllgroupamount': OverAllgroupamount,
                'PatientObj': PatientObj,
                'from_op' : "False"
            }),
            success: function (msg) {
                location.reload()
            }, error: function (exception) {
                console.log(exception)
            }
        });


        }
    });

})