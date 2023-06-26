$(document).ready(function()
{
   
    $(".addNewbtn").click(function()
    {
        $("#patient").val("").trigger("change")

        $(".addNewBtnSection").hide();
        $(".XrayPatientDTSection").hide();

        $(".backBtnSection").show();
        $(".XrayPatientSection").show();
    });

    $(".backBtn").click(function()
    {
        $(".backBtnSection").hide();
        $(".XrayPatientSection").hide();

        $(".addNewBtnSection").show();        
        $(".XrayPatientDTSection").show();        
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

            $("#xray_type").val('').trigger('change')
            $("#xray_amount").val('0')
        });

    };


   var xraydata =  $('#xraydata').data('val');

   var xray_select_data = [];

    for (var i = 0; i < xraydata.length; i++) {
        xray_select_data.push({ id: xraydata[i].id, text: xraydata[i].name, amount: xraydata[i].amount })
    }

    $("#xray_type").select2({
        data: xray_select_data,
        placeholder: "Select Xray",
        allowClear: true,
        templateResult: formatXraySelect2
    });

    $("#xray_type").val("").trigger("change")

    function formatXraySelect2(state) {
        if (state.id) {
            var container = $(
                '<ul class="list-unstyled users-list m-0 avatar-group d-flex align-items-center">\
                    <li class="fw-bold">' + state.text + '</li>\
                </ul>'
            )
        }
        return container;

    }
    
    var XrayselecteddataObj = []

    $("#xray_type").change(function()
    {
    var overall_amount = 0
       var xray_id = $(this).val()
       if(xray_id.length != ''){
        for(i=0; i<xray_id.length;i++){
            var xray_amount = xraydata.filter(function (obj) {
                return obj.id ==  parseInt(xray_id[i]) 
            });
             overall_amount += xray_amount[0].amount
            $('#xray_amount').val(overall_amount)
        }

       }
       else{
        $("#xray_amount").val('0').trigger('change')
       }
        XrayselecteddataObj = [];

    })

 
    $("#patient_xray_report_form").submit(function(e)
    {
        e.preventDefault();

        var PatientObj = [];
       
        var xrayObj= $('#xray_type').val()
  
    PatientObj.push({
        patient_id : $("#patientId").val()
    });

    $.ajax({
        type: "POST",
        headers: {
            'X-CSRFToken': $.cookie("csrftoken"),
            'Content-Type': 'application/json',
        },
        url: ".",
        data: JSON.stringify({
            'PatientObj': PatientObj,
            'XrayObj': xrayObj,
            'XrayObj_amount': $('#xray_amount').val(),
            'from_op' : "False"
        }),
        success: function (msg) {
            location.reload()
        }, error: function (exception) {
            console.log(exception)
        }
    });

    })





    var XrayForPatientData = $("#XrayForPatientData").data("val");

    Xray_For_PatientTable(XrayForPatientData);

    function Xray_For_PatientTable(dataObj) {
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(dataObj);

        if ($.fn.dataTable.isDataTable("#xrayPatientListDT")) {
            $("#xrayPatientListDT").DataTable().destroy();
        }

        var patientListDatatable = $("#xrayPatientListDT").DataTable({
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
                            "<a class='btn btn-outline-primary' href = '/xray/patient_xray_report/"+row.id+"'>View</a>"
                        )
                    }
                }
            ]

        })
    };



})