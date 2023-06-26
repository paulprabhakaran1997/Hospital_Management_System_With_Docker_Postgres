$(document).ready(function () {

    var DoctorData = $("#DoctorData").data("val");

    var doctor_selecet2_data = [];

    for (var i = 0; i < DoctorData.length; i++) {
        doctor_selecet2_data.push({ id: DoctorData[i].id, text: DoctorData[i].name, specialized: DoctorData[i].specialized })
    }


    $("#doctor").select2({
        data: doctor_selecet2_data,
        placeholder: "Select Doctor",
        allowClear: true,
        templateResult: formatDoctorSelect2
    });

    $("#consultant").select2({
        data: doctor_selecet2_data,
        placeholder: "Select Consultant",
        allowClear: true,
        templateResult: formatDoctorSelect2
    });

    function formatDoctorSelect2(state) {
        if (state.id) {
            var container = $(
                '<ul class="list-unstyled users-list m-0 avatar-group d-flex align-items-center">\
                    <li class="fw-bold">' + state.text + ' ( ' + state.specialized + ' )</li>\
                </ul>'
            )
        }
        return container;
    }

    function assignedward_data() {
        $.ajax({
        type: "GET",
        url: $('#get_assigned_ward_data_url').data('url'),
        success: function (data) {

            assignwardTable(data['Assigned_WardData']);

            function assignwardTable(roomObj) {
                (function rec(d) {
                    $.each(d, function (k, v) {
                        if (typeof v === 'object') return rec(v)
                        if (isNaN(v) && typeof v === 'number') d[k] = '---';
                    })
                })(roomObj);

                if ($.fn.dataTable.isDataTable("#assignedWardListDT")) {
                    $("#assignedWardListDT").DataTable().destroy();
                }

                var roomListDatatable = $("#assignedWardListDT").DataTable({
                    "data": roomObj,
                    responsive: true,
                    paging: true,
                    searching: true,
                    "scrollY": false,
                    "scrollCollapse": true,
                    "order": [0, "desc"],
                    "pageLength": 10,
                    "bLengthChange": false,
                    "scrollX": false,
                    columns: [
                        {
                            "title": "IP ID",
                            "data": "id",
                        },
                        {
                            "title": "Patient ",
                            "data": "patient_name",
                        },
                        {
                            "title": "Reason",
                            "data": "reason",
                        },

                        {
                            "title": "Ward Name ",
                            "data": "ward_mame",
                        },
                        {
                            "title": "Bed No",
                            "data": "bed_no",
                        },
                        {
                            "title": " Assigned Date ",
                            "data": "assigned_date",
                        },
                      
                        {
                            "title": " Discharge Date ",
                            "data": "discharged_date",
                        },
                        {
                            "title": " Status ",
                            "data": "status",
                        },
                        {
                            "title": " Payment ",
                            "data": "payment_pending"
                        },

                    ],
                    columnDefs: [
                        {
                            "targets": [4],
                            "visible": false
                        },
                        {
                            "targets": 1,
                            "render": function (data, type, row) {
                                return (
                                    "<h2 class='table-avatar'>\
                                        <a href='javascript:void(0)' class='ActionBtn' data-val='" + JSON.stringify(row) + "' > " + data + " [ #" + row.patient_id +" ]<span style='text-align:left'> [Ph:  " + row.patient_phone + "] </span>" + "</a>\
                                    </h2>"
                                )
                            }
                        },
                        {
                            "targets": 3,
                            "render": function (data, type, row) {
                                return (
                                    '<h2 class="table-avatar">\
                                        <a href="javascript:void(0)">Bed No.: ' + row.bed_no + ' <span style="text-align:left">[ ' + data +' Ward ] </span></a>\
                                    </h2>'
                                )
                            }
                        },
                        {
                            "targets": 5,
                            "render": function (data, type, row) {
                                return ('<h2 class="table-avatar">\
                                <a href="javascript:void(0)">' + moment.utc(new Date(data)).format("DD-MM-YYYY") + ' <span style="text-align:center"> ( ' + moment.utc(new Date(data)).format("HH:mm A") + ' )</span></a>\
                            </h2>')
                            }
                        },
                        {
                            "targets": 6,
                            "render": function (data, type, row) {
                                if (data != null) {
                                    return ('<h2 class="table-avatar">\
                                    <a href="javascript:void(0)">' + moment.utc(new Date(data)).format("DD-MM-YYYY") + ' <span style="text-align:center"> ( ' + moment.utc(new Date(data)).format("HH:mm A") + ' )</span></a>\
                                </h2>')
                                } else {
                                    return "Not discharged"
                                }
                            }
                        },
                        {
                            "targets": 7,
                            "render": function (data, type, row) {
                                var checkupHtml = ""
                                if (data == 0) {
                                    checkupHtml += '<span class="me-1" style="color:green;font-weight: bold;">Admitted</span>'
                                } else if (data == 1) {
                                    checkupHtml += '<span class="me-1" style="color:#7638ff;font-weight: bold;">Discharged</span>'
                                }
                                return checkupHtml
                            }
                        },
                        {
                            "targets": 8,
                            "render": function (data, type, row) {
                                var paymentHtml = "";

                                if (row.status == 0) {
                                    paymentHtml += '<span class="me-1" style="color:rgb(255 118 0);font-weight: bold;">Not Paid</span>'
                                } else if (row.status == 1 && row.initially_paid == false) {
                                    paymentHtml += '<span class="me-1" style="color:rgb(255 118 0);font-weight: bold;">Not Paid</span>'
                                } else if (row.status == 1 && row.initially_paid == true && data == true) {
                                    paymentHtml += '<span class="me-1" style="color:red;font-weight: bold;">Pending</span>'
                                } else if (row.status == 1 && row.initially_paid == true && data == false) {
                                    paymentHtml += '<span class="me-1" style="color:rgb(26, 114, 247);font-weight: bold;">Complete</span>'
                                }

                                return paymentHtml
                            }
                        },
                        {
                            "title": "Action",
                            "targets": 9,
                            "data": null,
                            "render": function (data, type, row) {
                                var container = "<a type='button' class=' ActionBtn' style='color:638ff'; data-val='" + JSON.stringify(row) + "' >\
                                <i class='fas fa-user-plus'></i></button>"

                                return container
                            }
                        }

                    ]

                })
            };
        },
        error: function (exception) {
            console.log(exception)
        }
    });  
  }

    assignedward_data();

    setInterval(function () {
        assignedward_data()
    }, 30000);


    $('#patient_typeahead').typeahead({

        source: function(query, process) {
            
            $.ajax({
                type: "POST",
                headers: {
                    'X-CSRFToken': $.cookie("csrftoken"),
                    'Content-Type': 'application/json',
                },
                url: $("#GetPatientDataOnSearch").data('url'),                
                data: JSON.stringify({
                    'query': query
                }),
                dataType: 'JSON',
                async: true,
                success: function(data) {              
                    var resultList = data.map(function(item) {
                        var link = {
                            id: item.id,
                            name: item.name,
                            father_name : item.father_name,
                            phone: item.phone,
                            address: item.address,
                            age: item.age,
                            month : item.month,
                            gender: item.gender,
                        };
                        return JSON.stringify(link);
                    });
                    return process(resultList);
                }
            })
        },

        highlighter: function(link) {
            var item = JSON.parse(link);
            return (
                '<span>' + item.name + ' ( Id : '+item.id+' )</span><br>'+
                '<span>' + item.phone + '</span><br>'+
                '<span>' + item.address + '</span><br>'
            )
        },

        updater: function(link) {
            var item = JSON.parse(link);

            $("#patient").val(item.id);

            $("#appointed_PatientId").text(item.id);
            $("#appointed_PatientName").text(item.name);
            $("#appointed_PatientAge").text(item.age);
            $("#appointed_PatientGender").text(item.gender);
            $("#assigned_date").val(moment(new Date()).format("YYYY-MM-DDTkk:mm"))
            $(".patientDetailsSection").show();
        }

    });


    function getWardData() {

        $.ajax({
            type: "GET",
            url: $('#get_ward_data_url').data('url'),
            success: function (data) {
                displayWardDetails(data['Ward_Data'])
            },
            error: function (exception) {
                console.log(exception)
            }
        });

    }

    getWardData();

    function displayWardDetails(Ward_data) {
        var ward_select_data = [];

        for (var i = 0; i < Ward_data.length; i++) {
            ward_select_data.push({ id: Ward_data[i].id, text: Ward_data[i].ward_name, })
        }

        $("#ward").select2({
            data: ward_select_data,
            placeholder: "Select Ward",
            allowClear: true,
            templateResult: formatWardSelect2
        });

        $("#ward").val("").trigger("change")

        function formatWardSelect2(state) {
            if (state.id) {
                var container = $(
                    '<ul class="list-unstyled users-list m-0 avatar-group d-flex align-items-center">\
                        <li class="fw-bold">' + state.text + '</li>\
                    </ul>'
                )
            }
            return container;
        }

    }



    var bed_select_data = [];

    function getBedData() {

        $.ajax({
            type: "GET",
            url: $('#get_ward_bed_data_url').data('url'),
            success: function (data) {
               
                for (var i = 0; i < data.Ward_bed_data.length; i++) {
                    bed_select_data.push({ id: data.Ward_bed_data[i].id, text: data.Ward_bed_data[i].bed_no, ward_id: data.Ward_bed_data[i].ward_id, vacancy_status: data.Ward_bed_data[i].vacancy_status })
                }
            },
            error: function (exception) {
                console.log(exception)
            }
        });

    }

    getBedData();




    $('#ward').on('change', function () {

        var thisval = $(this).val()
        var filter_bed = bed_select_data.filter(function (obj) {
            return obj.ward_id == thisval && obj.vacancy_status == 0
        })

        $("#bed_no").empty()

        $("#bed_no").select2({
            data: filter_bed,
            placeholder: "Select Bed No",
            allowClear: true,
            templateResult: formatBedSelect2
        });

        $("#bed_no").val("").trigger("change")

        function formatBedSelect2(state) {
            if (state.id) {
                var container = $(
                    '<ul class="list-unstyled users-list m-0 avatar-group d-flex align-items-center">\
                        <li class="fw-bold">' + state.text + '</li>\
                    </ul>'
                )
            }
            return container;
        }

    })



    $("#dressing").click(function () {
        $(this).select()
    })


    $(".backBtn").click(function () {
        $('.AssignWard').hide()
        $('.backBtnSection').hide()
        $('.addNewBtnSection').show()
        $('.AssignedWardListDTSection').show()

        $('.Doctor_Prescription_Section').hide()
        $('.Doctor_test_Section').hide()
        $('.Genarate_Bill_section').hide()
        $('.dischargeSummary_section').hide()
        $('.patient_history_section').hide()
        $('.invoicePrintSection').hide()

        $('.DischargeSummary_List_CardSection').hide()
        $('.dischargeSummary_Print_section').hide()


    });



    $(".addNewbtn").click(function () {
        setTimeout(function() {
            $('#patient_typeahead').focus()
        },200)
        $('.AssignWard').show()
        $('.backBtnSection').show()
        $('.addNewBtnSection').hide()
        $('.AssignedWardListDTSection').hide()

        

        $('#addAssignWardForm').trigger('reset');
        $('#assignWardId').val(0);
        $('#patient').val(0);
        $(".patientDetailsSection").hide();

        // $('#patient').val("").trigger('change')
        $("#ward").val("").trigger("change")
        $("#bed_no").val("").trigger("change")

        // $("#assigned_date").val(moment(new Date()).format("YYYY-MM-DDTkk:mm"))

    })


    $('#assignedWardListDT').on('click', '.ActionBtn', function () {

        $('.History_Details').empty()


        $('.AssignWard').hide()
        $('.backBtnSection').show()
        $('.addNewBtnSection').hide()
        $('.AssignedWardListDTSection').hide()
        $('.Doctor_Prescription_Section').show()

        $('#Discharge_PaymentForm').trigger('reset')

        $('#discharge_SummaryForm').trigger('reset')
        $("#consultant").val('').trigger('change')

        $('#doctor_report').trigger('click')


        var thisData = $(this).data('val')

        if (thisData.status == 1) {
            $('.doctorCheckupBtn').hide()
            $('.discharge_summaryBtn').show()
        }
        else {
            $('.doctorCheckupBtn').show()
            $('.discharge_summaryBtn').hide()
        }
        if (thisData.payment_pending == true) {
            $('.genarateBill_btn').show()
        }
        else {
            $('.genarateBill_btn').hide()
        }

        if (thisData.initially_paid == true) {
            $('.view_payment_Btn_section').show()
        }
        else {
            $('.view_payment_Btn_section').hide()
        }


        $('#patientId').val(thisData.patient_id)
        $('#ward_assignid').val(thisData.id)
        $('#ward_id').val(thisData.ward_id)

        $('#pos_id').val(thisData.pos_id)
        
        $('#bed_id').val(thisData.bed_id)
        $('#initially_paid').val(thisData.initially_paid)

        $("#appointedPatientName").text(thisData.patient_name);
        $("#appointedPatientAge").text(thisData.patient_age);
        $("#appointedPatientGender").text(thisData.patient_gender);
        $("#appointedPatientReason").text(thisData.reason);

        // Discharge Details   
        $(".appointedPatientId").text(thisData.patient_id);
        $(".appointedPatientName").text(thisData.patient_name);
        $(".appointedPatientAge").text(thisData.patient_age);
        $(".appointedPatientGender").text(thisData.patient_gender);
        $(".appointedDate").text(moment(new Date(thisData.assigned_date)).format("DD-MM-YYYY"));
        $("#appointedDate_value").val(thisData.assigned_date);

        $("#invoice_PatientId").text(thisData.patient_id);
        $("#invoice_PatientName").text(thisData.patient_name);
        $("#invoice_PatientAge").text(thisData.patient_age);
        $("#invoice_PatientGender").text(thisData.patient_gender);
        $("#invoice_AppointementDate").text(moment(new Date()).format("DD-MM-YYYY"))


        // Discharge Summary Section
        $('#patient_name').val(thisData.patient_name)
        $('#patient_age').val(thisData.patient_age)
        $('#patient_gender').val(thisData.patient_gender)
        $('#ip_number').val(thisData.id)
        $('#bed_number').val(thisData.bed_no)
        $('#address').val(thisData.patient_address)
        $('#dof_admission').val(moment(new Date(thisData.assigned_date)).format("YYYY-MM-DD"))
        $('#dof_discharge').val(moment(new Date(thisData.discharged_date)).format("YYYY-MM-DD"))
        $('#dof_surgery').val(moment(new Date()).format("YYYY-MM-DD"))


        $('.Medicine_Details').empty()
        $('.Injection_Details').empty()
        $('.LabTest_Details').empty()
        $('.Xray_Details').empty()



        var patient_history = $('#get_ward_patient_checkup_history_url').data('url')

        $.ajax({
            type: "GET",
            url: patient_history + "?ward_assignid=" + thisData.id,
            success: function (data) {

                if (data.history.length > 0) {
                    var doc
                    var checkup_date
                    var drs
                    var med
                    var inj
                    var lab
                    var xray
                    var pricp
                    var checkup_history

                    for (var i = 0; i < data.history.length; i++) {
                        drs = ''
                        med = ''
                        inj = ''
                        lab = ''
                        xray = ''
                        pricp = ''
                        checkup_history = ''

                        doc = data.history[i].doctor_name
                        checkup_date = data.history[i].checkup_date


                        if (data.history[i].doctor_prescription != '') {
                            pricp = "<h4>Prescription :</h4>\
                             <h6>"+ data.history[i].doctor_prescription +"</h6><hr>"
                        }

                        if (data.history[i].dressing.length > 0) {
                            var dressing = ''
                            for (var d = 0; d < data.history[i].dressing.length; d++) {

                                dressing += "<h6>Total : &nbsp;" + data.history[i].dressing[d].dressing_list + "<h6>"
                            }
                            drs = "<h4>Dressing :</h4>" + dressing + "<hr>"
                        }

                        if (data.history[i].medicine.length > 0) {
                            var medicine = ''
                            for (var m = 0; m < data.history[i].medicine.length; m++) {

                                var total_med = 0

                                for (var ml = 0; ml < data.history[i].medicine[m].medicine_list.length; ml++) {

                                    total_med = (parseInt(data.history[i].medicine[m].medicine_list[ml].morning) + parseInt(data.history[i].medicine[m].medicine_list[ml].afternoon) + parseInt(data.history[i].medicine[m].medicine_list[ml].night))* parseInt(data.history[i].medicine[m].medicine_list[ml].days) 

                                    medicine += "<h6>Name : &nbsp;" + data.history[i].medicine[m].medicine_list[ml].medicinename + "  &nbsp;  &nbsp; Mor: " + data.history[i].medicine[m].medicine_list[ml].morning + " &nbsp; &nbsp; aft :" + data.history[i].medicine[m].medicine_list[ml].afternoon + " &nbsp; &nbsp; Nit :" + data.history[i].medicine[m].medicine_list[ml].night + " &nbsp; &nbsp; Days :" + data.history[i].medicine[m].medicine_list[ml].days + "  &nbsp; &nbsp;Total  " + total_med + ":<h6>"
                                }
                            }
                            med = "<h4>Medicines :</h4>" + medicine + "<hr>"
                        }

                        if (data.history[i].injection.length > 0) {
                            var injection = ''
                            for (var ij = 0; ij < data.history[i].injection.length; ij++) {
                                for (var il = 0; il < data.history[i].injection[ij].injection_list.length; il++) {
                                    injection += "<h6>Name : &nbsp;" + data.history[i].injection[ij].injection_list[il].injection_name + " &nbsp;  &nbsp; " + data.history[i].injection[ij].injection_list[il].ml + " ml<h6>"
                                }
                            }
                            inj = "<h4>Injections :</h4>" + injection + "<hr>"
                        }

                        if (data.history[i].has_lab == true) {
                            var lab_tests = ''
                            if (data.history[i].lab.length > 0) {
                                for (var l = 0; l < data.history[i].lab.length; l++) {
                                    lab_tests += "<h6>" + data.history[i].lab[l].group_name + "</h6>\
                                 <span style='margin-bottom: 15px;'> "+ data.history[i].lab[l].test_name + " &nbsp; &nbsp; " + data.history[i].lab[l].testvalue + "&nbsp; " + data.history[i].lab[l].testunit + " &nbsp; &nbsp; " + data.history[i].lab[l].normal_range + " " + data.history[i].lab[l].testunit + "</span>"
                                }
                                lab = "<h4>Lab Tests :</h4>" + lab_tests + "<hr>"
                            }
                            else {
                                lab = "<h4>Lab Tests :</h4><br><h6>lab Test is Pending<h6><hr>"
                            }
                        }


                        if (data.history[i].has_xray == true) {
                            var xray_tests = ''
                            if (data.history[i].xray.length > 0) {
                                for (var l = 0; l < data.history[i].xray.length; l++) {
                                    xray_tests += "<h6>" + data.history[i].xray[l].xray_name + "<h6>"
                                }
                                xray = "<h4>Xray Tests :</h4>" + xray_tests + "<hr>"
                            }

                            else {
                                xray = "<h4>Xray Tests :</h4><br><h6>Xray Test is Pending<h6><hr>"
                            }
                        }

                        checkup_history = "<div class='col-md-12'>\
                            <div class='card' style='border:1px solid #e7ebef'>\
                                <div class='card-header'>\
                                    <div class = 'row'>\
                                        <div class = 'col-md-4'>\
                                            <h4 class='card-title'> "+ moment(checkup_date).format('MM/DD/YYYY h:mm a') + " </h4>\
                                        </div>\
                                        <div class = 'col-md-4'>\
                                            <h4 class='card-title'>Bed No :"+ data.ward_data[0].bed_no + "<span class = 'text-muted' style = 'font-size: 13px;'>(" + data.ward_data[0].ward_name + ")</span></h4>\
                                        </div>\
                                        <div class = 'col-md-4'>\
                                            <h4 class='card-title'>"+ doc + "</h4>\
                                        </div>\
                                    </div>\
                                </div>\
                                <div class='card-body'>\
                                    <div class='row align-items-center '>\
                                    "+ med + " " + inj + " " + drs + "  " + lab + "   " + xray + " "+ pricp+"\
                                        </div>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>"

                        $('.History_Details').append(checkup_history)
                    }
                }

                else {
                    $('.History_Details').append('<h4>No Records</h4>')

                }

            }, error: function (exception) {
                console.log(exception)
            }
        });


    })



    var M_Row;
    var I_Row;
    $('#assign_doctorCheckupBtn').on('click', function () {

        M_Row = 1;

        I_Row = 1;

        $('.Doctor_test_Section').show()

        $('.Allmedicine').show()
        $('.patient_history_section').hide()
        $('.Genarate_Bill_section').hide()
        $('.dischargeSummary_section').hide()
        $('.invoicePrintSection').hide()




        $("#DoctorPrescriptionForm").trigger("reset");


        $("#lab").val("").trigger("change");
        $("#xray").val("").trigger("change");

        $("#doctor").val("").trigger("change");

        $("#medicine").val("").trigger("change");

        $(".additional_ml").empty();   // Empty Additional Medicine List
        $(".add_medicine_btn").trigger("click");
        $(".ml-row-1").find('.removeMedicineBtn').hide();
        // $(".medicine_select2" ).attr('required','required');

        $(".additional_Il").empty();   // Empty Additional injection List
        $(".add_injection_btn").trigger("click");
        $(".il-row-1").find('.removeInjectionBtn').hide();



    })



    $("#lab").select2({
        allowClear: true,
        placeholder: "Select Lab",
    });

    $("#lab").val("").trigger("change");

    $("#xray").select2({
        allowClear: true,
        placeholder: "Select Xray",
    });

    $("#xray").val("").trigger("change");

    var medicine_select2_data = [];
    var injection_select2_data = [];

    // var medicine_select2_data = [
    //     {
    //         id: 1, text: 'Dolo'
    //     },
    //     {
    //         id: 2, text: 'Solo'
    //     },
    //     {
    //         id: 3, text: 'Polo'
    //     }
    // ]

    $.ajax({
        type: 'POST',
        crossDomain: true,
        data: 'json',
        //url: "http://192.168.100.200/POS/public/get-medicine-api.php",
        url: "http://192.168.1.200/Medical/public/get-medicine-api.php",
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        //dataType: 'json',
        success: function (data) {
            var MedicalData = JSON.parse(data);
            var Medicine_Obj = MedicalData.filter(function (obj) { return (obj.category != "Inj"); });
            var Injection_Obj = MedicalData.filter(function (obj) { return (obj.category == "Inj"); });
          
            medicine_select2_data = Medicine_Obj;
            injection_select2_data = Injection_Obj;

        }, error: function (exception) {
            console.log("Exception = ", exception)
        }
    });

    $(".add_medicine_btn").click(function()
    {
        var MedicineContainer = '<div class="row form-group ml-row-'+M_Row+' medicine-row" data-row="'+M_Row+'">\
                                    <div class="col-md-4">\
                                        <label for="medicine">Medicine</label>\
                                        <div class="col-sm-12">\
                                            <select name="medicine" id="medicine-'+M_Row+'" class="form-control medicine_select2" data-row="'+M_Row+'" >\
                                            </select>\
                                        </div>\
                                    </div>\
                                    <div class="col-md-2">\
                                        <label for="morning">Morning</label>\
                                        <div class="col-sm-12">\
                                            <input type="number" name="morning" autocomplete = "off" id="morning-'+M_Row+'" value="0"  class="form-control medicine_num_ip morning_total  keyup_medicine">\
                                        </div>\
                                    </div>\
                                    <div class="col-md-2">\
                                        <label for="afternoon">AfterNoon</label>\
                                        <div class="col-sm-12">\
                                            <input type="number" name="afternoon" autocomplete = "off" id="afternoon-'+M_Row+'" value="0"  class="form-control medicine_num_ip afternoon_total keyup_medicine">\
                                        </div>\
                                    </div>\
                                    <div class="col-md-2">\
                                        <label for="night">Night</label>\
                                        <div class="col-sm-12">\
                                            <input type="number" name="night" autocomplete = "off" id="night-'+M_Row+'" value="0"  class="form-control medicine_num_ip night_total  keyup_medicine">\
                                        </div>\
                                    </div>\
                                    <div class="col-md-1">\
                                        <label for="days">Days</label>\
                                        <div class="col-sm-12">\
                                            <input type="text" name="days" autocomplete = "off" id="days-'+M_Row+'"  class="form-control medicine_num_ip days_total">\
                                        </div>\
                                    </div>\
                                    <div class="col-md-1">\
                                        <label>Action</label>\
                                        <div class="col-sm-12">\
                                            <a href="javascript:void(0);" data-row = ml-row-'+M_Row+' style="border: none;color:red"  class="removeMedicineBtn form-control">\
                                                <i class="fa fa-trash-alt"></i>\
                                            </a>\
                                        </div>\
                                    </div>\
                                    <div class="col-md-2 mt-3">\
                                        <label for="befor_meal">Befor Meal</label>\
                                        <div class="col-sm-12">\
                                        <input type="checkbox" id="befor_meal" name="befor_meal"  checked style="width: 30px; height:30px">\
                                        </div>\
                                    </div>\
                                    <div class="col-md-3 mt-3">\
                                        <label for="sos">SOS</label>\
                                        <div class="col-sm-12">\
                                        <input type="text" id="sos" name="sos" value="0" class="form-control medicine_num_ip keyup_medicine " >\
                                        </div>\
                                    </div>\
                                    <div class="col-md-3 mt-3">\
                                        <label for="stat">STAT</label>\
                                        <div class="col-sm-12">\
                                        <input type="text" id="stat" name="stat" value="0" class="form-control medicine_num_ip keyup_medicine " >\
                                        </div>\
                                    </div>\
                                    <div class="col-md-3 mt-3">\
                                        <label for="qid">QID</label>\
                                        <div class="col-sm-12">\
                                        <input type="text" id="qid" name="qid" value="0" class="form-control medicine_num_ip keyup_medicine " >\
                                        </div>\
                                    </div>\
                                </div>'
        
        $(".additional_ml").append(MedicineContainer);

        const $focus = $("#medicine-" + M_Row).select2({
            data: medicine_select2_data,
            allowClear: true,
            placeholder: "Select Medicine",
        });

        $focus.on('select2:open', () => {
            const searchInput = $focus.data('select2').$dropdown.find('.select2-search__field')[0];
            if (searchInput) searchInput.focus();
        })
        $("#medicine-"+M_Row).val("").trigger("change");

        M_Row ++;

        call();
    });


    $("#MedicineListSection").on("click" , ".removeMedicineBtn" , function()
    {
        var thisRow = $(this).data("row");

        $("."+thisRow).remove()
    });

    $("#MedicineListSection").on("click" , ".keyup_medicine" , function()
    {
        $(this).select()
    });

    function call(){
        
        $('.medicine_select2').on("change", function (e){
         
            var rowid = $(this).closest(".medicine-row").data('row');

            if ($(this).val() != null){
                $('#days-'+rowid).attr('required','required');
            }
            else{
                
                $('#days-'+rowid).removeAttr('required');
            }
        });

    
        $(".keyup_medicine").on("keyup keydown", function () {

            $(".keyup_medicine").each(function () {
                if (!isNaN($(this).val()) && ($(this).val()).length != 0) {
                   
                } else {
                    $(this).val(0)
                }
            })
        });

    }


    $(".add_injection_btn").click(function()
    {
        /* <input type="text" name="injection" autocomplete = "off" id="injection-'+I_Row+'" placeholder = "Injection Name"  class="form-control injection_num_ip">\ */
        var InjectionContainer = '<div class="row form-group il-row-'+I_Row+' injection-row">\
                                    <div class="col-md-6">\
                                        <label for="injection">Injection</label>\
                                        <select name="injection" id="injection-'+I_Row+'" class="form-control injection_select2 injection_num_ip" data-row="'+I_Row+'" >\
                                        </select>\
                                        \
                                    </div>\
                                    <div class="col-md-5">\
                                        <label for="ml">Ml</label>\
                                            <input type="text" name="ml" autocomplete = "off" id="ml-'+I_Row+'" placeholder = "Ml" value="0"  class="form-control injection_num_ip keyup_injection">\
                                    </div>\
                                    <div class="col-md-1">\
                                    <label>Action</label>\
                                        <a href="javascript:void(0);" data-row = il-row-'+I_Row+' style="border: none;color:red"  class="removeInjectionBtn form-control">\
                                            <i class="fa fa-trash-alt"></i>\
                                        </a>\
                                </div>\
                                </div>'
        
        $(".additional_Il").append(InjectionContainer);

       const $focus = $('#injection-'+I_Row).select2({
            placeholder : "Select Injection",
            data : injection_select2_data,
            allowClear : true,
        });

        $focus.on('select2:open', () => {
            const searchInput = $focus.data('select2').$dropdown.find('.select2-search__field')[0];
            if (searchInput) searchInput.focus();
        })

        $("#injection-"+I_Row).val("").trigger("change");
        
        I_Row ++;

       
        $(".keyup_injection").on("keyup keydown", function () {

            $(".keyup_injection").each(function () {
                if (!isNaN($(this).val()) && ($(this).val()).length != 0) {
                   
                } else {
                    $(this).val(0)
                }
            })
        });
    });

    $("#InjectioListSection").on("click" , ".removeInjectionBtn" , function()
    {
        var thisRow = $(this).data("row");

        $("."+thisRow).remove()
    });

    $("#InjectioListSection").on("click" , ".keyup_injection" , function()
    {
        $(this).select()
    });


    $('#genarate_billBtn').click(function () {


        $("#nowPayingAmountText").text("0");
    if ($('#initially_paid').val() == 'false') {


            $('#Discharge_PaymentForm').trigger('reset')

            $(".feesAmount").attr("readonly", false);
            $(".feesAmount").prop("disabled", false);

            $('#ward_PatientPaymentId').val(0)

            $("#nowPayingAmount").val("0");
            $("#balanceValue").val("0");
            $("#paymentReceived").val("0");
            $("#overallBalance").val("0");
            $("#existing_balance").val("0");

            $("#overallTotal").val("0");
            $("#totalAmount_after_discount").val("0");
            $("#totalAmount_after_discountText").text("0");
            $("#discount_amount").val(0);

            $(".existingPaidAmountView").hide();

            var total_amount

            getAmountData()

            function getAmountData() {

                $.ajax({
                    type: "GET",
                    url: $('#get_amount_ward_patient_url').data('url') + "?ward_assignid=" + $('#ward_assignid').val(),
                    success: function (data) {

                    
                        if ((parseInt(data['lab_length']) > 0) || (parseInt(data['xray_length']) > 0)) {

                            Swal.fire({
                                title: '<span class="trashIcon" style="color: #621aff"><i class="fa fa-info-circle me-1"></i></span>',
                                html: '<div class="row" style="margin-top:15px">\
                                        <div class="col-md-12">\
                                                <div class= "titleSection text-center">\
                                                    <h4>A You Have Lab or Xray Test </h4>\
                                                </div>\
                                        </div >\
                                    </div >\
                                    <div class="row" style="margin-top:15px">\
                                        <div class="col-md-12">\
                                            <div class="confirmSection text-center">\
                                                <p style="line-height:1.5;font-size:25px"><span style="font-weight : bold"> Continiue Without Take Test</span></p>\
                                            </div>\
                                        </div>\
                                    </div>',
                                showCloseButton: false,
                                showConfirmButton: true,
                                showCancelButton: true,
                                cancelButtonText: "Cancel",
                                cancelButtonColor: 'grey',
                                confirmButtonText: "Continiue",
                                confirmButtonColor: '#22CC62',
                                focusConfirm: false,

                            }).then(function (result) {
                                if (result.value == true) {
                                    paymentSection();


                                } else if (result.dismiss == 'cancel') {
                                    // e.preventDefault()
                                }
                            })

                        }
                        else {
                            paymentSection();
                        }

                        $('#ward_amount').val(data['ward_assigned_amount'].ward_amount)
                        $('.Ward_fees ').text(data['ward_assigned_amount'].ward_amount)

                        $('#lab_amount ').val(data['ward_assigned_amount'].lab_amount)
                        $('.Lab_fees ').text(data['ward_assigned_amount'].lab_amount)

                        $('#xray_amount ').val(data['ward_assigned_amount'].xray_amount)
                        $('.Xray_fees ').text(data['ward_assigned_amount'].xray_amount)

                        total_amount = parseInt($('#lab_amount ').val()) + parseInt($('#xray_amount ').val())
                        $("#overallTotal").val(total_amount)
                        $("#overall_totaltext").text(total_amount);
                        $("#balanceAmountText").text(total_amount);

                        datecalculation();

                    },
                    error: function (exception) {
                        console.log(exception)
                    }
                });
            }


            function datecalculation() {

                function treatAsUTC(date) {
                    var result = new Date(date);
                    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
                    return result;
                }

                function daysBetween(startDate, endDate) {
                    var millisecondsPerDay = 24 * 60 * 60 * 1000;
                    return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
                }

                var s_date = moment($('#appointedDate_value').val()).format("YYYY-MM-DD")
                var e_date = moment(new Date).format("YYYY-MM-DD")

                var date_result = parseInt(daysBetween(s_date, e_date))

                if (date_result == 0) {
                
                    date_result = 1
                }

                var totalday = date_result * parseInt($('#ward_amount').val())
               
                $('.ward_chargeText ').text(totalday.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))


            }


            // paymentSection()

            function paymentSection() {

                $('.Genarate_Bill_section').show()

                $('.Doctor_test_Section').hide()
                $('.Allmedicine').hide()
                $('.patient_history_section').hide()
                $('.dischargeSummary_section').hide()
                $('.invoicePrintSection').hide()

                $('.DischargeSummary_List_CardSection').hide()
                $('.dischargeSummary_Print_section').hide()

                $(".feesAmount").on("keyup keydown", function () {
                    var sum = 0;

                    $(".feesAmount").each(function () {
                        if (!isNaN($(this).val()) && ($(this).val()).length != 0) {
                            sum += parseInt(($(this).val()));

                            $("#overall_totaltext").text(total_amount + sum);
                            $("#overallTotal").val(total_amount + sum);
                            var balance = total_amount + sum - parseInt($("#paymentReceived").val()) - parseInt($("#discount_amount").val())
                            $("#balanceAmountText").text(balance);
                            $("#overallBalance").val(balance);
                            $("#balanceValue").val(sum)

                            if (parseInt($("#discount_amount").val()) > 0) {
                                $("#totalAmount_after_discountText").text(total_amount + sum - parseInt($("#discount_amount").val()))
                                $("#totalAmount_after_discount").val(total_amount + sum - parseInt($("#discount_amount").val()))

                            }
                        } else {
                            $(this).val(0)
                        }
                    })
                });

                $(".feesAmount").click(function () {
                    $(this).select()
                })


                $(".amountCollectionValue").on("keyup", function () {
                    var sum = 0;

                    $(".amountCollectionValue").each(function () {

                        if (!isNaN($(this).val()) && ($(this).val()).length != 0) {
                            sum += parseInt(($(this).val()));

                            $("#paymentReceived").val(parseInt(sum));

                            $("#nowPayingAmountText").text(parseInt(sum));

                            $("#nowPayingAmount").val(parseInt(sum));

                            var ExistingBalance = parseInt($("#balanceValue").val());
                            var totalAmount = parseInt($("#overallTotal").val());

                       

                            if (ExistingBalance > 0) {
                                var CurrentBalance = totalAmount - parseInt(sum);

                                if (CurrentBalance >= 0) {
                                    $("#balanceAmountText").text(CurrentBalance - parseInt($("#discount_amount").val()));
                                    $("#overallBalance").val(CurrentBalance - parseInt($("#discount_amount").val()))
                                } else {
                                    $("#balanceAmountText").text(CurrentBalance - parseInt($("#discount_amount").val()))
                                    $("#overallBalance").val(CurrentBalance - parseInt($("#discount_amount").val()))

                                    iziToast.error({
                                        timeout: 700,
                                        balloon: true,
                                        overlay: true,
                                        displayMode: 'once',
                                        id: 'error',
                                        title: 'Error',
                                        zindex: 99999999,
                                        message: '<b>Balance Limit is 0</b>',
                                    });
                                }

                            } else {
                                $("#balanceAmountText").text(total_amount - sum - parseInt($("#discount_amount").val()));
                                $("#overallBalance").val(total_amount - $("#paymentReceived").val() - parseInt($("#discount_amount").val()))
                               
                            }

                        } else {
                            $(this).val(0)
                        }

                    })
                });

                $('.amountCollectionValue').click(function () {
                    $(this).select();
                });


                $(".discountValue").on("keyup", function () {
                    var sum = 0;

                    $(".discountValue").each(function () {

                        if (!isNaN($(this).val()) && ($(this).val()).length != 0) {
                            sum += parseInt(($(this).val()));

                            $("#discount_amount").val(parseInt(sum));
                            var ExistingBalance = parseInt($("#balanceValue").val());
                            var totalAmount = parseInt($("#overallTotal").val());

                    
                            if (ExistingBalance > 0) {
                                var CurrentBalance = totalAmount - parseInt(sum);

                                if (CurrentBalance >= 0) {
                                    $("#balanceAmountText").text(CurrentBalance - parseInt($("#paymentReceived").val()));
                                    $("#overallBalance").val(CurrentBalance - parseInt($("#paymentReceived").val()))
                                    $("#totalAmount_after_discountText").text(totalAmount - sum)
                                    $("#totalAmount_after_discount").val(totalAmount - sum)
                                } else {
                                    $("#balanceAmountText").text(CurrentBalance - parseInt($("#paymentReceived").val()));
                                    $("#overallBalance").val(CurrentBalance - parseInt($("#paymentReceived").val()))
                                    $("#totalAmount_after_discountText").text(totalAmount - sum)
                                    $("#totalAmount_after_discount").val(totalAmount - sum)

                                    iziToast.error({
                                        timeout: 700,
                                        balloon: true,
                                        overlay: true,
                                        displayMode: 'once',
                                        id: 'error',
                                        title: 'Error',
                                        zindex: 99999999,
                                        message: '<b>Balance Limit is 0</b>',
                                    });
                                }

                            }
                            else {
                                $("#balanceAmountText").text(total_amount - sum - $("#paymentReceived").val());
                                $("#overallBalance").val(total_amount - sum - $("#paymentReceived").val())
                                $("#totalAmount_after_discountText").text(total_amount - sum)
                                $("#totalAmount_after_discount").val(total_amount - sum)

                            }

                            if (parseInt($("#overallBalance").val()) <= 0 && parseInt($("#paymentReceived").val()) == 0) {

                                iziToast.info({
                                    timeout: 700,
                                    balloon: true,
                                    overlay: true,
                                    displayMode: 'once',
                                    id: 'error',
                                    title: 'Error',
                                    zindex: 99999999,
                                    message: '<b>Balance Limit is High</b>',
                                });
                            }

                        }
                        else {

                            $(this).val(0)
                            $("#discount_amount").val(parseInt(sum));
                            var ExistingBalance = parseInt($("#balanceValue").val());
                            var totalAmount = parseInt($("#overallTotal").val());

                       
                            if (ExistingBalance > 0) {
                                var CurrentBalance = totalAmount - parseInt(sum);

                                if (CurrentBalance >= 0) {
                                    $("#balanceAmountText").text(CurrentBalance - parseInt($("#paymentReceived").val()));
                                    $("#overallBalance").val(CurrentBalance - parseInt($("#paymentReceived").val()))
                                    $("#totalAmount_after_discountText").text(sum)
                                    $("#totalAmount_after_discount").val(sum)
                                } else {
                                    $("#balanceAmountText").text(CurrentBalance - parseInt($("#paymentReceived").val()));
                                    $("#overallBalance").val(CurrentBalance - parseInt($("#paymentReceived").val()))
                                    $("#totalAmount_after_discountText").text(sum)
                                    $("#totalAmount_after_discount").val(sum)
                                    iziToast.error({
                                        timeout: 700,
                                        balloon: true,
                                        overlay: true,
                                        displayMode: 'once',
                                        id: 'error',
                                        title: 'Error',
                                        zindex: 99999999,
                                        message: '<b>Balance Limit is 0</b>',
                                    });
                                }

                            }
                            else {
                                $("#balanceAmountText").text(total_amount - sum - $("#paymentReceived").val());
                                $("#overallBalance").val(total_amount - sum - $("#paymentReceived").val())
                                $("#totalAmount_after_discountText").text(sum)
                                $("#totalAmount_after_discount").val(sum)

                            }

                            if (parseInt($("#overallBalance").val()) <= 0 && parseInt($("#paymentReceived").val()) == 0) {

                                iziToast.info({
                                    timeout: 700,
                                    balloon: true,
                                    overlay: true,
                                    displayMode: 'once',
                                    id: 'error',
                                    title: 'Error',
                                    zindex: 99999999,
                                    message: '<b>Balance Limit is High</b>',
                                });
                            }
                        }

                    })
                });

                $('.discountValue').click(function () {
                    $(this).select();
                });


            }

        }

        else {

            $('.Genarate_Bill_section').show()

            $('.Doctor_test_Section').hide()
            $('.Allmedicine').hide()
            $('.patient_history_section').hide()
            $('.dischargeSummary_section').hide()
            $('.invoicePrintSection').hide()

            $('.DischargeSummary_List_CardSection').hide()
            $('.dischargeSummary_Print_section').hide()

            $(".feesAmount").attr("readonly", true);
            $(".feesAmount").prop("disabled", true);

            $(".existingPaidAmountView").show();

            $("#nowPayingAmount").val(0);
            $("#balanceValue").val(0);
            $("#paymentReceived").val(0);
            $("#overallBalance").val(0);
            $("#existing_balance").val(0);

            $("#overallTotal").val(0);
            $("#totalAmount_after_discount").val(0);
            $("#totalAmount_after_discountText").text("0");
            $("#discount_amount").val(0);


            pendingAmountData()


            $(".amountCollectionValue").on("keyup", function () {
                var sum = 0;

                $(".amountCollectionValue").each(function () {

                    if (!isNaN($(this).val()) && ($(this).val()).length != 0) {
                        sum += parseInt(($(this).val()));

                        $("#paymentReceived").val(parseInt(sum));

                        $("#nowPayingAmountText").text(parseInt(sum));

                        $("#nowPayingAmount").val(parseInt(sum));

                        var ExistingBalance = parseInt($("#balanceValue").val());

                        if (ExistingBalance > 0) {
                            var CurrentBalance = ExistingBalance - parseInt(sum);

                            if (CurrentBalance >= 0) {
                                $("#balanceAmountText").text(CurrentBalance - parseInt($("#discount_amount").val()));
                                $("#overallBalance").val(CurrentBalance - parseInt($("#discount_amount").val()))
                            } else {
                                $("#balanceAmountText").text(CurrentBalance - parseInt($("#discount_amount").val()));
                                $("#overallBalance").val(CurrentBalance - parseInt($("#discount_amount").val()))

                                iziToast.error({
                                    timeout: 700,
                                    balloon: true,
                                    overlay: true,
                                    displayMode: 'once',
                                    id: 'error',
                                    title: 'Error',
                                    zindex: 99999999,
                                    message: '<b>Balance Limit is 0</b>',
                                });
                            }

                        } else {
                            $("#balanceAmountText").text(total_amount - sum);
                            $("#overallBalance").val(ExistingBalance - $("#paymentReceived").val())
                        }

                    } else {
                        $(this).val(0)
                    }

                })
            });

            $('.amountCollectionValue').click(function () {
                $(this).select();
            });


            $(".discountValue").on("keyup", function () {
                var sum = 0;

                $(".discountValue").each(function () {

                    if (!isNaN($(this).val()) && ($(this).val()).length != 0) {
                        sum += parseInt(($(this).val()));

                        $("#discount_amount").val(parseInt(sum));

                        var ExistingBalance = parseInt($("#balanceValue").val());
                        var existing_discount = parseInt($('#existing_discount').val());

                        $("#totalAmount_after_discountText").text(parseInt($('#overallTotal').val()) - sum);
                        $("#totalAmount_after_discount").val(parseInt($('#overallTotal').val()) - existing_discount - sum);
                        $("#balanceAmountText").text(ExistingBalance - parseInt($("#paymentReceived").val()) - sum);
                        $("#overallBalance").val(ExistingBalance - parseInt($("#paymentReceived").val()) - sum)


                        if (parseInt($("#overallBalance").val()) <= 0 && parseInt($("#paymentReceived").val()) == 0) {

                            iziToast.info({
                                timeout: 700,
                                balloon: true,
                                overlay: true,
                                displayMode: 'once',
                                id: 'error',
                                title: 'Error',
                                zindex: 99999999,
                                message: '<b>Balance Limit is High</b>',
                            });
                        }

                    }
                    else {

                        $(this).val(0)
                        var ExistingBalance = parseInt($("#balanceValue").val());
                        console.log(ExistingBalance)
                        var existing_discount = parseInt($('#existing_discount').val());

                        $("#discount_amount").val(parseInt(sum));

                        $("#totalAmount_after_discountText").text(sum);
                        $("#totalAmount_after_discount").val(parseInt($('#overallTotal').val()) - existing_discount);
                        $("#balanceAmountText").text(ExistingBalance - parseInt($("#paymentReceived").val()) - sum);
                        $("#overallBalance").val(ExistingBalance - parseInt($("#paymentReceived").val()) - sum)

                        if (parseInt($("#overallBalance").val()) <= 0 && parseInt($("#paymentReceived").val()) == 0) {

                            iziToast.info({
                                timeout: 700,
                                balloon: true,
                                overlay: true,
                                displayMode: 'once',
                                id: 'error',
                                title: 'Error',
                                zindex: 99999999,
                                message: '<b>Balance Limit is High</b>',
                            });
                        }
                    }

                })
            });

            $('.discountValue').click(function () {
                $(this).select();
            });


        }

    });


    $('.view_payment_Btn').click(function () {

        pendingAmountData();

        $('.invoicePrintSection').show()

        $('.Genarate_Bill_section').hide()
        $('.Doctor_test_Section').hide()
        $('.Allmedicine').hide()
        $('.patient_history_section').hide()
        $('.dischargeSummary_section').hide()

        $('.DischargeSummary_List_CardSection').hide()
        $('.dischargeSummary_Print_section').hide()


    })


    function pendingAmountData() {

        $.ajax({
            type: "GET",
            url: $('#get_amount_ward_patient_url').data('url') + "?ward_assignid=" + $('#ward_assignid').val(),
            success: function (data) {

                $('#ward_amount ').val(data['ward_assigned_amount'].ward_amount)
                $('.Ward_fees ').text(data['ward_assigned_amount'].ward_amount)

                $('#lab_amount ').val(data['ward_assigned_amount'].lab_amount)
                $('.Lab_fees ').text(data['ward_assigned_amount'].lab_amount)

                $('#xray_amount ').val(data['ward_assigned_amount'].xray_amount)
                $('.Xray_fees ').text(data['ward_assigned_amount'].xray_amount)

                $("#overallTotal").val(data['ward_assigned_amount'].ward_payment_data['overall_total']);
                $("#overall_totaltext").text(data['ward_assigned_amount'].ward_payment_data['overall_total']);
                $("#existing_discount").val(data['ward_assigned_amount'].ward_payment_data['discount']);
                $("#existingDiscountText").text(data['ward_assigned_amount'].ward_payment_data['discount']);



                $("#balanceAmountText").text(data['ward_assigned_amount'].ward_payment_data['balance']);
                $("#balanceValue").val(data['ward_assigned_amount'].ward_payment_data['balance']);
                $("#existingpaidAmountText").text(data['ward_assigned_amount'].ward_payment_data['already_paid']);
                $("#existing_balance").val(parseInt(data['ward_assigned_amount'].ward_payment_data['balance']));
                $("#ward_PatientPaymentId").val(parseInt(data['ward_assigned_amount'].ward_payment_data['id']));

                $("#doctor_fees").val(data['ward_assigned_amount'].ward_payment_data['doctor_fees'])
                $("#injection").val(data['ward_assigned_amount'].ward_payment_data['injection'])
                $("#service").val(data['ward_assigned_amount'].ward_payment_data['service'])
                $("#others").val(data['ward_assigned_amount'].ward_payment_data['others'])
                $("#ward_charge").val(data['ward_assigned_amount'].ward_payment_data['ward_charge'])




                $("#invoice_doctor_fees").text(data['ward_assigned_amount'].ward_payment_data['doctor_fees'])
                $("#invoice_injection").text(data['ward_assigned_amount'].ward_payment_data['injection'])
                $("#invoice_service").text(data['ward_assigned_amount'].ward_payment_data['service'])
                $("#invoice_others").text(data['ward_assigned_amount'].ward_payment_data['others'])
                $("#invoice_lab").text(data['ward_assigned_amount'].lab_amount);
                $("#invoice_xray").text(data['ward_assigned_amount'].xray_amount);
                $("#invoice_ward").text(data['ward_assigned_amount'].ward_payment_data['ward_charge']);

                $("#invoice_Payment_Total").text('₹ ' + data['ward_assigned_amount'].ward_payment_data['overall_total']);
                $("#invoice_Payment_Discount").text('₹ ' + data['ward_assigned_amount'].ward_payment_data['discount']);
                $("#invoice_Payment_Paid").text('₹ ' + data['ward_assigned_amount'].ward_payment_data['already_paid']);
                $("#invoice_Payment_Balance").text('₹ ' + data['ward_assigned_amount'].ward_payment_data['balance']);
                $("#invoice_Cash_Amount").text('₹ ' + data['ward_assigned_amount'].ward_payment_data['cash']);
                $("#invoice_UPI_Amount").text('₹ ' + data['ward_assigned_amount'].ward_payment_data['upi']);
                $("#invoice_Card_Amount").text('₹ ' + data['ward_assigned_amount'].ward_payment_data['card']);


            },
            error: function (exception) {
                console.log(exception)
            }
        });
    }


    $('#discharge_summary_Btn').click(function () {
        $('.dischargeSummary_section').show()

        $('.Doctor_test_Section').hide()
        $('.Allmedicine').hide()
        $('.patient_history_section').hide()
        $('.Genarate_Bill_section').hide()
        $('.invoicePrintSection').hide()

        $('.DischargeSummary_List_CardSection').hide()
        $('.dischargeSummary_Print_section').hide()

        $.ajax({
            type: 'GET',
            url: $('#get_discharge_summary_data_ward_url').data('url') + "?ward_assignid=" + $('#ward_assignid').val(),
            success: function (data) {
              
                if (data.discharge_summary_data.length > 0) {
                    $('.dischargeSummary_section').hide()
                    $('.DischargeSummary_List_CardSection').show()

                    $('#discharge_summary_id').val(data.discharge_summary_data[0].id)

                    $('.dsm_patient_name').text(data.discharge_summary_data[0].patient_name)
                    $('.dsm_patient_age').text(data.discharge_summary_data[0].patient_age)
                    $('.dsm_patient_gender').text(data.discharge_summary_data[0].patient_gender)
                    $('.dsm_address').text(data.discharge_summary_data[0].patient_address)

                    $('.dsm_ward_no').text(data.discharge_summary_data[0].ward_no)
                    $('.dsm_bed_no').text(data.discharge_summary_data[0].bed_no)
                    $('.dsm_consultant').text(data.discharge_summary_data[0].consultant)
                    $('.dsm_dof_admission').text(moment(data.discharge_summary_data[0].date_of_admission).format("DD-MM-YYYY"))
                    $('.dsm_dof_discharge').text(moment(data.discharge_summary_data[0].date_of_discharge).format("DD-MM-YYYY"))
                    $('.dsm_dof_surgery').text(moment(data.discharge_summary_data[0].date_of_surgery).format("DD-MM-YYYY"))

                    $('.dsm_allergies').text(data.discharge_summary_data[0].allergies)
                    $('.dsm_diagnosis').text(data.discharge_summary_data[0].diagnosis)
                    $('.dsm_investigation').text(data.discharge_summary_data[0].investigation)
                    $('.dsm_treatment').text(data.discharge_summary_data[0].treatment)
                    $('.dsm_advice').text(data.discharge_summary_data[0].advice_on_discharge)


                    $('.Dsm_Edit_Btn').click(function () {

                        $('.dischargeSummary_section').show()
                        $('.dsm_submitBtn').text('Save Changes')

                        $('.DischargeSummary_List_CardSection').hide()
                        $('.dischargeSummary_Print_section').hide()

                        $("#consultant").val(data.discharge_summary_data[0].consultant_id).trigger('change')
                        $("#allergies").val(data.discharge_summary_data[0].allergies)
                        $("#diagnosis").val(data.discharge_summary_data[0].diagnosis)
                        $("#investigation").val(data.discharge_summary_data[0].investigation)
                        $("#treatment").val(data.discharge_summary_data[0].treatment)
                        $("#advice_discharge").val(data.discharge_summary_data[0].advice_on_discharge)

                    })
                }
                else {
                    $('.dischargeSummary_section').show()
                    $('.DischargeSummary_List_CardSection').hide()
                }



            },
            error: function (exception) {
                console.log(exception)

            }
        })


        $('.Dsm_View_Btn').click(function () {
            $('.DischargeSummary_List_CardSection').hide()
            $('.dischargeSummary_Print_section').show()

        })



    })


    $('#doctor_report').click(function () {
        $('.patient_history_section').show()

        $('.Doctor_test_Section').show()
        $('.Allmedicine').hide()
        $('.dischargeSummary_section').hide()
        $('.Genarate_Bill_section').hide()
        $('.invoicePrintSection').hide()

        $('.DischargeSummary_List_CardSection').hide()
        $('.dischargeSummary_Print_section').hide()

    })








    $('#addAssignWardForm').submit(function (e) {

        e.preventDefault();

        var AssignWardData = [{
            'patient_id': parseInt($('#patient').val()),
            'ward_id': parseInt($('#ward').val()),
            'bed_no': parseInt($('#bed_no').val()),
            'assigned_date': $("#assigned_date").val(),
            'reason': $('#reason').val()
        }];

        $.ajax({
            type: "POST",
            headers: {
                'X-CSRFToken': $.cookie("csrftoken"),
                'Content-Type': 'application/json',
            },
            url: '.',
            data: JSON.stringify({
                'AssignWardData': AssignWardData
            }),
            success: function (msg) {
                location.reload()
            },
            error: function (exception) {
                console.log(exception)
            }
        });


    })



    $("#DoctorPrescriptionForm").submit(function (e) {
        e.preventDefault();
        var MedicineObj = [];
        var InjectionObj = [];

        var PatientObj = {
            IP_assignid: $("#IP_assignid").val(),
            patient_id: $("#patientId").val(),
            room_id: $("#roomId").val(),
            doctor: $('#doctor').val(),
            patient_name: $("#appointedPatientName").text(),
            patient_age: $("#appointedPatientAge").text(),
            patient_gender: $("#appointedPatientGender").text(),
        }

        var medicine_value = ''
        var medicinename
        var morning
        var afternoon
        var night
        var days
        var sos
        var stat
        var qid
        var meal ='After Meal'

        $('.medicine-row').each(function () {

            var medicineid = $(this).find('select[name="medicine"]').val();

            if($(this).find('select[name="medicine"]').select2('data').length > 0){

                medicine_value +=  $(this).find('select[name="medicine"]').select2('data')[0].text;

                medicinename = $(this).find('select[name="medicine"]').select2('data')[0].text;
                morning = $(this).find('input[name="morning"]').val();
                afternoon = $(this).find('input[name="afternoon"]').val();
                night = $(this).find('input[name="night"]').val();
                days = $(this).find('input[name="days"]').val();
                sos = $(this).find('input[name="sos"]').val();befor_meal
                stat = $(this).find('input[name="stat"]').val();
                qid = $(this).find('input[name="qid"]').val();

               
                    if($('#befor_meal').is(':checked')) {  
                        meal = 'After Meal'
                    } else {
                        meal = 'Befor Meal'
                    }
                    var newObj = {
                        medicineid: medicineid,
                        medicinename: medicinename,
                        morning: morning,
                        afternoon: afternoon,
                        night: night,
                        days: days,
                        meal: meal,
                        sos: sos,
                        stat: stat,
                        qid: qid,
                    }
                    MedicineObj.push(newObj);
            }

        });

        $('.injection-row').each(function () {
            var injectionid = $(this).find('select[name="injection"]').val();

            if($(this).find('select[name="injection"]').select2('data').length > 0){

                var injection_name = $(this).find('select[name="injection"]').select2('data')[0].text;
                var ml = $(this).find('input[name="ml"]').val();

                var newObj = {
                    injectionid: injectionid,
                    injection_name: injection_name,
                    ml: ml,
                }
                InjectionObj.push(newObj);
            }
        });

        var LabObj = $(".labtest").select2("val");
        var XrayObj = $(".XrayTest").select2("val");
        var Prescription = $("#prescription").val()
        var Medical_Prescription = $("#medical_prescription").val()


        var for_api = []

        for (var r = 0; r < InjectionObj.length; r++) {
            apiInjection_obj = {
                no: r + 1,
                id: InjectionObj[r].injectionid,
                qty:1
            }
            for_api.push(apiInjection_obj)
        }

        for (var r = 0; r < MedicineObj.length; r++) {
            var total = (parseInt(MedicineObj[r].morning) + parseInt(MedicineObj[r].afternoon) + parseInt(MedicineObj[r].night) + parseInt(MedicineObj[r].sos) + parseInt(MedicineObj[r].stat) + parseInt(MedicineObj[r].qid)) * parseInt(MedicineObj[r].days)
            apiMedicine_obj = {
                no: r + 1,
                id: MedicineObj[r].medicineid,
                qty: total,                
            }
            for_api.push(apiMedicine_obj)
        }

        console.log(for_api)
      
        if (medicine_value != '' && ((parseInt(morning) == 0) && (parseInt(afternoon) == 0) && (parseInt(night) == 0) && (parseInt(sos) == 0) && (parseInt(stat) == 0) && (parseInt(qid) == 0))) {
            iziToast.info({
                timeout: 700,
                balloon: true,
                overlay: true,
                displayMode: 'once',
                id: 'error',
                title: 'Error',
                zindex: 99999999,
                message: '<b>Enter Medicine Details Properly</b>',
            });
        }
        else if ((LabObj.length == 0) && (XrayObj.length == 0) && (MedicineObj.length == 0) && (InjectionObj.length == 0)) {

            iziToast.info({
                timeout: 700,
                balloon: true,
                overlay: true,
                displayMode: 'once',
                id: 'error',
                title: 'Error',
                zindex: 99999999,
                message: '<b>Nothing is Selected</b>',
            });
        }

        else {
            
            $.ajax({
                type: "POST",
                headers: {
                    'X-CSRFToken': $.cookie("csrftoken"),
                    'Content-Type': 'application/json',
                },
                url: $('#assignward_doctor_checkup_url').data('url'),
                data: JSON.stringify({
                    'PatientObj': PatientObj,
                    'InjectionObj': InjectionObj,
                    'MedicineObj': MedicineObj,
                    'Dressing': $('#dressing').val(),
                    'LabObj': LabObj,
                    'XrayObj': XrayObj,
                    'Prescription': Prescription,
                    'Medical_Prescription': Medical_Prescription

                }),
                success: function (msg) {
                    location.reload()
                }, error: function (exception) {
                    console.log(exception)
                }
            });

            if(for_api){

                var JsonData = JSON.stringify(for_api);
                $.ajax({
                    type: 'POST',
                    crossDomain: true,
                    data: { myData: JsonData ,doctor_name: $('#Doctor_Name').val() ,prescription: $('#medical_prescription').val() , pos_id : parseInt($('#pos_id').val()) },
                    //url: "http://192.168.100.200/POS/public/set-medicine-api.php",
                    url: "http://192.168.1.200/Medical/public/set-medicine-api.php",
                    headers: {
                        'Access-Control-Allow-Origin': '*'
                    },
                    success: function (msg) {
                       location.reload()
                    }, error: function (exception) {
                        console.log("Exception = ", exception)
                    }
                });

            }
        }

    })



    $("#Discharge_PaymentForm").submit(function (e) {

        e.preventDefault()

        if ($("#initially_paid").val() == 'false') {
            if (0 >= parseInt($('#doctor_fees').val())) {

                iziToast.info({
                    timeout: 700,
                    balloon: true,
                    overlay: true,
                    displayMode: 'once',
                    id: 'error',
                    title: 'Error',
                    zindex: 99999999,
                    message: '<b>Please Get Docter Fees</b>',
                });
                return false

            }

            if (0 >= parseInt($('#ward_charge').val())) {

                iziToast.info({
                    timeout: 700,
                    balloon: true,
                    overlay: true,
                    displayMode: 'once',
                    id: 'error',
                    title: 'Error',
                    zindex: 99999999,
                    message: '<b>Please Get Ward Fees</b>',
                });
                return false

            }
        }

        if (parseInt($("#overallBalance").val()) >= 0) {
            if (parseInt($("#nowPayingAmount").val()) <= 0) {
                iziToast.error({
                    timeout: 700,
                    balloon: true,
                    overlay: true,
                    displayMode: 'once',
                    id: 'error',
                    title: 'Error',
                    zindex: 99999999,
                    message: '<b>Please Get Fees First</b>',
                });
                return false
            }

            else {
                Swal.fire({
                    title: '<span class="trashIcon" style="color: #621aff"><i class="fa fa-info-circle me-1"></i></span>',
                    html: '<div class="row" style="margin-top:15px">\
                            <div class="col-md-12">\
                                    <div class= "titleSection text-center">\
                                        <h4>Are You Sure to Process</h4>\
                                    </div>\
                            </div >\
                        </div >\
                        <div class="row" style="margin-top:15px">\
                            <div class="col-md-12">\
                                <div class="confirmSection text-center">\
                                    <p style="line-height:1.5;font-size:25px">Now Paying : <span style="font-weight : bold"> ₹ ' + parseInt($("#paymentReceived").val()) + '</span></p>\
                                    <p style="line-height:1.5;font-size:25px">Balance : <span style="font-weight : bold"> ₹ ' + parseInt($("#overallBalance").val()) + '</span></p>\
                                </div>\
                            </div>\
                        </div>',
                    showCloseButton: false,
                    showConfirmButton: true,
                    showCancelButton: true,
                    cancelButtonText: "Cancel",
                    cancelButtonColor: 'grey',
                    confirmButtonText: "Confirm",
                    confirmButtonColor: '#22CC62',
                    focusConfirm: false,

                }).then(function (result) {
                    if (result.value == true) {


                        var PaymentData = [{
                            'initially_paid': $("#initially_paid").val(),
                            'ward_PatientPaymentId': parseInt($('#ward_PatientPaymentId').val()),
                            'ward_assign_id': parseInt($("#ward_assignid").val()),
                            'bed_id': parseInt($("#bed_id").val()),
                            'patient_id': parseInt($("#patientId").val()),
                            'doctor_fees': parseInt($("#doctor_fees").val()),
                            'injection': parseInt($("#injection").val()),
                            'service': parseInt($("#service").val()),
                            'others': parseInt($("#others").val()),
                            'ward': parseInt($("#ward_charge").val()),
                            'lab': parseInt($("#lab_amount").val()),
                            'xray': parseInt($("#xray_amount").val()),
                            'overall_total': parseInt($("#overallTotal").val()),
                            'totalAmount_after_discount': parseInt($("#totalAmount_after_discount").val()),
                            'existing_balance': parseInt($("#existing_balance").val()),
                            'paid': parseInt($("#paymentReceived").val()),
                            'balance': parseInt($("#overallBalance").val()),
                            'cash': parseInt($("#cash").val()),
                            'upi': parseInt($("#upi").val()),
                            'card': parseInt($("#card").val()),
                            'discount': parseInt($("#discount").val())
                        }];

                        $.ajax({
                            type: "POST",
                            headers: {
                                'X-CSRFToken': $.cookie("csrftoken"),
                                'Content-Type': 'application/json',
                            },
                            url: $('#ward_patient_payment_url').data('url'),
                            data: JSON.stringify({
                                'PaymentData': PaymentData
                            }),
                            success: function (msg) {
                                location.reload()
                            },
                            error: function (exception) {
                                console.log(exception)
                            }
                        });

                    } else if (result.dismiss == 'cancel') {
                        e.preventDefault()
                    }
                })
            }

        }
        else {

            iziToast.error({
                timeout: 700,
                balloon: true,
                overlay: true,
                displayMode: 'once',
                id: 'error',
                title: 'Error',
                zindex: 99999999,
                message: '<b>Balance Limit is 0</b>',
            });

        }


    })


    $("#discharge_SummaryForm").submit(function (e) {

        e.preventDefault()

        var DischargeSummary_Data = {
            'discharge_summary_id': parseInt($("#discharge_summary_id").val()),
            'patient_id': parseInt($("#patientId").val()),
            'ward_no': parseInt($("#ward_assignid").val()),
            'bed_id': parseInt($("#bed_id").val()),
            'dof_surgery': $("#dof_surgery").val(),
            'consultant': parseInt($("#consultant").val()),
            'allergies': $("#allergies").val(),
            'diagnosis': $("#diagnosis").val(),
            'investigation': $("#investigation").val(),
            'treatment': $("#treatment").val(),
            'advice_discharge': $("#advice_discharge").val(),


        };

        $.ajax({
            type: "POST",
            headers: {
                'X-CSRFToken': $.cookie("csrftoken"),
                'Content-Type': 'application/json',
            },
            url: $('#discharge_summary_ward_url').data('url'),
            data: JSON.stringify({
                'DischargeSummary_Data': DischargeSummary_Data
            }),
            success: function (msg) {
                location.reload()
            },
            error: function (exception) {
                console.log(exception)
            }
        });



    })


    $(".Payment_DownloadReport").click(function (e) {
        // getPDF();
        $(".Payment_canvas_div_pdf").printThis({
            debug: false, // show the iframe for debugging
            importCSS: true, // import parent page css
            importStyle: true, // import style tags
            printContainer: true, // print outer container/$.selector
            loadCSS: "", // path to additional css file - use an array [] for multiple
            pageTitle: "", // add title to print page
            removeInline: false,
        });
    });


    $(".Dsm_DownloadReport").click(function (e) {
        // getPDF();
        $(".Dsm_canvas_div_pdf").printThis({
            debug: false, // show the iframe for debugging
            importCSS: true, // import parent page css
            importStyle: true, // import style tags
            printContainer: true, // print outer container/$.selector
            loadCSS: "", // path to additional css file - use an array [] for multiple
            pageTitle: "", // add title to print page
            removeInline: false,
        });
    });


})