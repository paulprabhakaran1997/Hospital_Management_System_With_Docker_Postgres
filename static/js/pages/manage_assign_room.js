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

    function assignedroom_data(){
        $.ajax({
            type: "GET",
            url: 'get_assigned_room_data',
            success: function (data) {

                assignroomTable(data['Assigned_Roomdata']);

                function assignroomTable(roomObj) {
                    (function rec(d) {
                        $.each(d, function (k, v) {
                            if (typeof v === 'object') return rec(v)
                            if (isNaN(v) && typeof v === 'number') d[k] = '---';
                        })
                    })(roomObj);

                    if ($.fn.dataTable.isDataTable("#assignedRoomListDT")) {
                        $("#assignedRoomListDT").DataTable().destroy();
                    }

                    var roomListDatatable = $("#assignedRoomListDT").DataTable({
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
                                "title": " Reason ",
                                "data": "reason",
                            },
                            {
                                "title": "Room No ",
                                "data": "room_no",
                            },
                            {
                                "title": "Room Type ",
                                "data": "room_type",
                            },
                            {
                                "title": " Admit Date ",
                                "data": "assigned_date",
                            },
                            {
                                "title": " Discharge Date ",
                                "data": "discharged_date",
                                'className':"text-center",
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
                                "targets": [3,4],
                                "visible": false
                            },
                            {
                                "targets": 0,
                                "render": function (data, type, row) {
                                    return (
                                        '<h2 class="table-avatar">\
                                            <a href="javascript:void(0)">IP ID: #' + data + '<br> [Room No: '+row.room_no+'] <span style="text-align:left"></span></a>\
                                        </h2>'
                                    );
                                    
                                }
                            },
                            {
                                "targets": 1,
                                "render": function (data, type, row) {
                                    return (
                                        "<h2 class='table-avatar'>\
                                            <a href='javascript:void(0)' class='ActionBtn' data-val='" + JSON.stringify(row) + "' > " + data + " [ #" + row.patient_id +" ]<span style='text-align:left'> [Ph:  " + row.patient_phone + "] </span>" + "</a>\
                                        </h2>"
                                    );
                                    
                                }
                            },{
                                "targets": 3,
                                "render": function (data, type, row) {
                                    return (
                                        '<h2 class="table-avatar">\
                                            <a href="javascript:void(0)">' + data + ' <span style="text-align:left">[ ' + row.room_type +' Room ] </span></a>\
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
                                        return "-"
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

                                    if (row.initially_paid == false) {
                                        paymentHtml += '<span class="me-1" style="color:rgb(255 118 0);font-weight: bold;">Not Paid</span>'
                                    } 
                                    else if (row.initially_paid == true && data == false) {
                                        paymentHtml += '<span class="me-1" style="color:rgb(26, 114, 247);font-weight: bold;">Complete</span>'
                                    }
                                    else{
                                        paymentHtml += '<span class="me-1" style="color:red;font-weight: bold;">Pending</span>'
                                    }
                                    return paymentHtml
                                }
                            },
                            {
                                "title": "Action",
                                "targets": 9,
                                "data": null,
                                "render": function (data, type, row) {
                                    var container = "<button class='badge bg-success-light ActionBtn border-0 border-success' data-val='" + JSON.stringify(row) + "' >\
                                    <i class='fa fa-expand'></i> View</button>"

                                    return container;
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

    assignedroom_data();

    setInterval(function () {
        assignedroom_data()
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
            $("#appointed_PatientAge").text(item.age+" Yrs");
            $("#appointed_PatientGender").text(item.gender);
            $("#appointed_PatientPlace").text(item.address);
            $("#appointed_PatientMobile").text(item.phone);
            
            $("#assigned_date").val(moment(new Date()).format("YYYY-MM-DDTkk:mm"))
            $(".patientDetailsSection").show();
        }

    });



    function getRoomData() {

        $.ajax({
            type: "GET",
            url: $('#get_room_data_url').data('url'),
            success: function (data) {
                displayRoomDetails(data['Roomdata'])
            },
            error: function (exception) {
                console.log(exception)
            }
        });

    }

    getRoomData();

    function displayRoomDetails(RoomData) {

        var room_filterd = RoomData.filter(function (obj) {
            return (obj.vacancy_status == 0)
        });

        var room_select_data = [];

        for (var i = 0; i < room_filterd.length; i++) {
            room_select_data.push({ id: room_filterd[i].id, text: room_filterd[i].room_no, type: room_filterd[i].room_type })
        }



        $(".room").select2({
            data: room_select_data,
            placeholder: "Select Room",
            allowClear: true,
            templateResult: formatRoomSelect2
        });

        $(".room").val("").trigger("change")

        function formatRoomSelect2(state) {
            if (state.id) {
                var container = $(
                    '<ul class="list-unstyled users-list m-0 avatar-group d-flex align-items-center">\
                        <li class="fw-bold">' + state.text + '<br><small>[Type: ' + state.type + ']</small></li>\
                    </ul>'
                )
            }
            return container;
        }

    }



    $("#dressing").click(function () {
        $(this).select()
    })



    $(".backBtn").click(function () {
        $('.AssignRoom').hide()
        $('.backBtnSection').hide()
        $('.addNewBtnSection').show()
        $('.AssignedRoomListDTSection').show()

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
        $('.AssignRoom').show()
        $('.backBtnSection').show()
        $('.addNewBtnSection').hide()
        $('.AssignedRoomListDTSection').hide();

        $('#addAssignRoomsForm').trigger('reset');
        $('#assignroomId').val(0);
        $('#patient').val(0);
        $(".patientDetailsSection").hide()
        $('.dischargeSummary_Print_section').hide()

        // $('#patient').val("").trigger('change')
        $(".room").val("").trigger("change")        

    })

    var user_status = 0;
    $('#assignedRoomListDT').on('click', '.ActionBtn', function () {

        $('.History_Details').empty()

        $('.AssignRoom').hide()
        $('.backBtnSection').show()
        $('.addNewBtnSection').hide()
        $('.AssignedRoomListDTSection').hide()
        $('.Doctor_Prescription_Section').show()
        $('#doctor_report').trigger('click')

        $('#Discharge_PaymentForm').trigger('reset')
        $('#discharge_SummaryForm').trigger('reset')
        $("#consultant").val('').trigger('change')

        var thisData = $(this).data('val');
        user_status = thisData.status


        if (thisData.status == 1) {
            $('.doctorCheckupBtn').hide()
            $('.Discharge_Btn_section').hide()
            //$('.discharge_summaryBtn').show()
            $('.genarateBill_btn').hide()
            $('.Transfer_Btn_section').hide()
        } else {
            $('.doctorCheckupBtn').show()
            $('.Discharge_Btn_section').show()
            //$('.discharge_summaryBtn').hide()
            $('.genarateBill_btn').show()
            $('.Transfer_Btn_section').show()
        }

        if (thisData.payment_pending == true && thisData.status == 1) {
            $('.genarateBill_btn').show()
        }

        if (thisData.initially_paid == true) {
            $('.view_payment_Btn_section').show()
        } else {
            $('.view_payment_Btn_section').hide()
        }
       
        $('#patientId').val(thisData.patient_id)
        $('#IP_assignid').val(thisData.id)

        $('#pos_id').val(thisData.pos_id);

        $(".IPAdmitID").text(thisData.id);
        $(".IPAdmitDate").text(moment(new Date(thisData.assigned_date)).format("DD-MM-YYYY"));
        $(".IPRoomNo").text(thisData.room_no);
        $(".IPAdmitReason").text(thisData.reason);

        $(".appointedPatientId").text(thisData.patient_id);
        $(".appointedPatientName").text(thisData.patient_name);
        $(".appointedPatientAge").text(thisData.patient_age);
        $(".appointedPatientGender").text(thisData.patient_gender);
        $(".appointedPatientPlace").text(thisData.address);

        $('#roomId').val(thisData.room_id)
        $('#initially_paid').val(thisData.initially_paid)

        // Discharge Details   
        $(".appointedDate").text(moment(new Date(thisData.assigned_date)).format("DD-MM-YYYY"));
        $("#appointedDate_value").val(thisData.assigned_date);

        // View Payment Sec
        $("#invoice_AppointementDate").text(moment(new Date()).format("DD-MM-YYYY"))

        // Discharge Summary Section
        $('#patient_name').val(thisData.patient_name)
        $('#patient_age').val(thisData.patient_age)
        $('#patient_gender').val(thisData.patient_gender)
        $('#ip_number').val(thisData.id)
        $('#room_number').val(thisData.room_no)
        
        $('#address').val(thisData.address)
        $('#dof_admission').val(moment(new Date(thisData.assigned_date)).format("YYYY-MM-DD"))
        $('#dof_discharge').val(moment(new Date(thisData.discharged_date)).format("YYYY-MM-DD"))
        $('#dof_surgery').val(moment(new Date()).format("YYYY-MM-DD"))

        $('.Medicine_Details').empty();
        $('.Injection_Details').empty();
        $('.LabTest_Details').empty();
        $('.Xray_Details').empty();
        $('.Scan_Details').empty();

        var patient_history = 'get_IN_patient_checkup_history';

        $.ajax({
            type: "GET",
            url: patient_history + "?IP_assignid=" + thisData.id,
            success: function (data) {

                console.log(data)

                if (data.history.length > 0) {

                    $.each(data.history, function(i, DataObj) {

                        var drs = '', med = '', inj = '', lab = '', xray = '', scan = '' ,pricp = '', checkup_history = '', MedicalPresc ='';

                        DoctorName = DataObj.doctor_name;
                        CheckupDate = moment(DataObj.checkup_date).format('MM/DD/YYYY h:mm A') ;                      
                        //Medicine   
                        if (DataObj.medicine.length > 0) {

                            var medicine = "<div class='row MedicineRow Head'><div class='col-4'>Name</div><div class='col-1'>Mng</div>\
                                            <div class='col-1'>Aftn</div><div class='col-1'>Nit</div><div class='col-1'>QID</div><div class='col-1'>SOS</div>\
                                            <div class='col-1'>STAT</div><div class='col-2'>Days</div></div>";

                            $.each(DataObj.medicine, function(i, Obj) {

                                var total_med = (parseInt(Obj.morning) + parseInt(Obj.afternoon) + parseInt(Obj.night) )* parseInt(Obj.days);
                                
                                medicine += "<div class='row MedicineRow'><div class='col-4'>" + Obj.medicinename + "</div>"+
                                            "<div class='col-1'>" + Obj.morning + "</div>"+ 
                                            "<div class='col-1'>" + Obj.afternoon + "</div>"+ 
                                            "<div class='col-1'>" + Obj.night + "</div>"+ 
                                            "<div class='col-1'>" + Obj.qid + "</div>"+ 
                                            "<div class='col-1'>" + Obj.sos + "</div>"+ 
                                            "<div class='col-1'>" + Obj.stat + "</div>"+ 
                                            "<div class='col-2'>" + Obj.days + "</div></div>";

                            });
                            med = '<div class="col-12 card"><div class="card-body"><h5 class="mb-4">\
                                    <i class="fas fa-pills"></i> Medicine Details</h5>' + medicine + '</div></div>';
                           
                        }

                        //Injection   
                        if (DataObj.injection.length > 0) {

                            var injection = '';

                            $.each(DataObj.injection, function(i, Obj) {
                                injection += "<h6>" + Obj.injection_name + " -  " + Obj.ml + " ml<h6>"
                            });
                            
                            inj = '<div class="col-6 card"><div class="card-body"><h5 class="mb-4">\
                                    <i class="fas fa-syringe"></i> Injection Details</h5>' + injection + '</div></div>';
                        }

                        //Dressing                        
                        if (DataObj.dressing.length > 0) {
                            drs = '<div class="col-6 card"><div class="card-body"><h5 class="mb-4">\
                                    <i class="fa fa-wheelchair"></i> Dressing</h5><h6>' + DataObj.dressing + '</h6></div></div>'
                        }

                        //Lab
                        if (DataObj.has_lab == true) {
                            var lab_tests = "<div class='row LabRow Head'><div class='col-4'>Test Name</div><div class='col-3'>Value</div><div class='col-5'>Reference</div></div>";

                            if (DataObj.lab.length > 0) {

                                
                                var FilterIDObj = DataObj.lab.map(function(item) { return item["group_id"]; })
                        
                                var uniqueGroups = FilterIDObj.filter(function(item, i, FilterIDObj) {
                                    return i == FilterIDObj.indexOf(item);
                                });
        
                                $.each(uniqueGroups, function(i, obj) {
                                    var GroupwiseData = DataObj.lab.filter(function(Obj) { return Obj.group_id == obj });

                                    lab_tests += "<div class='row LabRow'><div class='col-12 text-center'><b>" + GroupwiseData[0].group_name + "</b></div></div>";
                                    
                                    $.each(GroupwiseData, function(i, Obj) {
                                        lab_tests += "<div class='row LabRow'><div class='col-4'>"+ Obj.test_name + "</div><div class='col-3'>\
                                                    " + Obj.testvalue + "&nbsp; " + Obj.testunit + "</div><div class='col-5'>" + Obj.normal_range + "</div></div>";
                                    });
                                });

                                lab = '<div class="col-6 card"><div class="card-body"><h5 class="mb-4"><i class="fa fa-thermometer-three-quarters"></i> Lab Test Details</h5>' + lab_tests + '</div></div>';
                            }
                            else {
                                lab = '<div class="col-6 card"><div class="card-body"><h5 class="mb-4"><i class="fa fa-thermometer-three-quarters"></i> Lab Test Details</h5><br><h6>lab Test is Pending<h6></div></div>';
                            }
                        }

                        //X-Ray
                        if (DataObj.has_xray == true) {
                            var xray_tests = '';
                            if (DataObj.xray.length > 0) {

                                $.each(DataObj.xray, function(i, Obj) {
                                    xray_tests += "<h6>" + Obj.xray_name + "<h6>"
                                });
                           
                                xray = '<div class="card-body mb-3"><h5 class="mb-4"><i class="fa fa-universal-access"></i> X-Ray Test Details</h5>' + xray_tests + '</div>';
                            }else {
                                xray = '<div class="card-body mb-3"><h5 class="mb-4"><i class="fa fa-universal-access"></i> X-Ray Test Details</h5><br><h6>Xray Test is Pending<h6></div>'
                            }
                        }

                        //Scan
                        if (DataObj.has_scan == true) {
                            var scan_tests = '';
                            if (DataObj.scan.length > 0) {

                                $.each(DataObj.scan, function(i, Obj) {
                                    scan_tests += "<h6>" + Obj.scan_name + "<h6>"
                                });
                           
                                scan = '<div class="card-body mb-3"><h5 class="mb-4"><i class="fa fa-universal-access"></i> Scan Test Details</h5>' + scan_tests + '</div>';
                            }else {
                                scan = '<div class="card-body mb-3"><h5 class="mb-4"><i class="fa fa-universal-access"></i> Scan Test Details</h5><br><h6>Scan Test is Pending<h6></div>'
                            }
                        }

                        //Doctor Prescription
                        if (DataObj.doctor_prescription != '') {
                            pricp = '<div class="card-body mb-3"><h4>Doctor Prescription :</h4><h6>\
                                    '+ DataObj.doctor_prescription +'</h6></div>';
                        }

                        //Medical Prescription
                        if (DataObj.medical_prescription != '') {
                            MedicalPresc = '<div class="card-body mb-3"><h4>Medical Prescription :</h4><h6>\
                                        '+ DataObj.medical_prescription +'</h6></div>';
                        }

                        //Total History
                        checkup_history = "<div class='col-md-12'>\
                                                <div class='card' style='border:1px solid #e7ebef'>\
                                                    <div class='card-header'>\
                                                        <div class = 'row'>\
                                                            <div class = 'col-md-6'>\
                                                                <h5 class='card-title'> Date: "+ CheckupDate + " </h5>\
                                                            </div>\
                                                            <div class = 'col-md-6 text-end'>\
                                                                <h5 class='card-title text-primary'>Doctor: "+ DoctorName + "</h5>\
                                                            </div>\
                                                        </div>\
                                                    </div>\
                                                    <div class='card-body Doctor-History-Section'>\
                                                        <div class='row'>\
                                                            "+ med + "" + inj + "" + drs + "" + lab + "\
                                                            <div class='col-6 card'><div class='row m-0'>\
                                                            " + xray + " "+ scan +" " + pricp + "" + MedicalPresc + "\
                                                            </div></div>\
                                                        </div>\
                                                    </div>\
                                                </div>\
                                            </div>"

                        $('.History_Details').append(checkup_history)


                    });

                }else {
                    $('.History_Details').append("<div class='col-md-12'>\
                                                    <div class='card' style='border:1px solid #e7ebef'>\
                                                        <div class='card-header'>\
                                                            <h4>No Records</h4>\
                                                        </div>\
                                                    </div>\
                                                 </div>")
                }

            }, error: function (exception) {
                console.log(exception)
            }
        });


    })



    var M_Row;
    var I_Row;



    $('#assign_doctorCheckupBtn').on('click', function () {

        $(".multipleSelection").removeClass('active');
        $(this).find(".multipleSelection").addClass('active');

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
        $("#scan").val("").trigger("change");

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

    $("#scan").select2({
        allowClear: true,
        placeholder: "Select Scan",
    });

    $("#scan").val("").trigger("change");

    var medicine_select2_data = [];
    var injection_select2_data = [];

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
        var MedicineContainer = '<div class="row form-group px-2 ml-row-'+M_Row+' medicine-row" data-row="'+M_Row+'">\
                                    <div class="col-md-3">\
                                        <label for="medicine">Medicine</label>\
                                        <div class="col-sm-12">\
                                            <select name="medicine" id="medicine-'+M_Row+'" class="form-control medicine_select2" data-row="'+M_Row+'" >\
                                            </select>\
                                        </div>\
                                    </div>\
                                    <div class="col-md-1 text-center">\
                                        <label for="morning">Mng</label>\
                                        <div class="col-sm-12">\
                                            <input type="number" name="morning" autocomplete = "off" id="morning-'+M_Row+'" value="0"  class="form-control medicine_num_ip morning_total  keyup_medicine">\
                                        </div>\
                                    </div>\
                                    <div class="col-md-1 text-center">\
                                        <label for="afternoon">Aftn</label>\
                                        <div class="col-sm-12">\
                                            <input type="number" name="afternoon" autocomplete = "off" id="afternoon-'+M_Row+'" value="0"  class="form-control medicine_num_ip afternoon_total keyup_medicine">\
                                        </div>\
                                    </div>\
                                    <div class="col-md-1 text-center">\
                                        <label for="night">Nit</label>\
                                        <div class="col-sm-12">\
                                            <input type="number" name="night" autocomplete = "off" id="night-'+M_Row+'" value="0"  class="form-control medicine_num_ip night_total  keyup_medicine">\
                                        </div>\
                                    </div>\
                                    <div class="col-md-1 text-center">\
                                        <label for="sos">SOS</label>\
                                        <div class="col-sm-12">\
                                        <input type="text" id="sos" name="sos" value="0" class="form-control medicine_num_ip keyup_medicine " >\
                                        </div>\
                                    </div>\
                                    <div class="col-md-1 text-center">\
                                        <label for="stat">STAT</label>\
                                        <div class="col-sm-12">\
                                        <input type="text" id="stat" name="stat" value="0" class="form-control medicine_num_ip keyup_medicine " >\
                                        </div>\
                                    </div>\
                                    <div class="col-md-1 text-center">\
                                        <label for="qid">QID</label>\
                                        <div class="col-sm-12">\
                                        <input type="text" id="qid" name="qid" value="0" class="form-control medicine_num_ip keyup_medicine " >\
                                        </div>\
                                    </div>\
                                    <div class="col-md-1 text-center">\
                                        <label for="befor_meal">B-Meal</label>\
                                        <div class="col-sm-12 pt-2">\
                                        <input type="checkbox" id="befor_meal" name="befor_meal"  checked style="width: 25px; height:25px">\
                                        </div>\
                                    </div>\
                                    <div class="col-md-1 text-center">\
                                        <label for="days">Days</label>\
                                        <div class="col-sm-12">\
                                            <input type="text" name="days" autocomplete = "off" id="days-'+M_Row+'"  class="form-control medicine_num_ip days_total">\
                                        </div>\
                                    </div>\
                                    <div class="col-md-1 text-center">\
                                        <label>Action</label>\
                                        <div class="col-sm-12">\
                                            <a href="javascript:void(0);" data-row = ml-row-'+M_Row+' style="border: none;color:red"  class="removeMedicineBtn form-control">\
                                                <i class="fa fa-trash-alt"></i>\
                                            </a>\
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

        $(".multipleSelection").removeClass('active');
        $(this).find(".multipleSelection").addClass('active');


        $("#nowPayingAmountText").text("0");

        if (parseInt(user_status) == 0 ) {


            $('#Discharge_PaymentForm').trigger('reset')

            $(".feesAmount").attr("readonly", false);
            $(".feesAmount").prop("disabled", false);

            $('#in_PatientPaymentId').val(0)

            $("#nowPayingAmount").val("0");
            $("#balanceValue").val("0");
            $("#paymentReceived").val("0");
            $("#overallBalance").val("0");
            $("#existing_balance").val("0");

            $("#overallTotal").val("0");
            $("#totalAmount_after_discount").val("0");
            $("#totalAmount_after_discountText").text("0");
            $("#IP_Total_Amount").text("0");
            $("#discount_amount").val(0);

            $(".existingPaidAmountView").hide();

            var total_amount = 0
            getAmountData()

            function getAmountData() {

                $.ajax({
                    type: "GET",
                    url: 'get_amount_in_patient' + "?ip_assignid=" + $('#IP_assignid').val(),
                    success: function (data) {

                        if ((parseInt(data['lab_length']) > 0) || (parseInt(data['xray_length']) > 0) || (parseInt(data['scan_length']) > 0) ) {

                            Swal.fire({
                                title: '<span class="trashIcon" style="color: #621aff"><i class="fa fa-info-circle me-1"></i></span>',
                                html: '<div class="row" style="margin-top:15px">\
                                        <div class="col-md-12">\
                                                <div class= "titleSection text-center">\
                                                    <h4>A You Have Lab or Xray or ScanTest </h4>\
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
                                    displayAmount();


                                } else if (result.dismiss == 'cancel') {
                                    // e.preventDefault()
                                    
                                }
                            })

                        }
                        else {
                            paymentSection();
                            displayAmount();
                        }


                        function displayAmount(){

                            $('#room_amount').val(data['ip_assigned_amount'].room_amount)
                            $('.Room_fees ').text(data['ip_assigned_amount'].room_amount)
    
                            $('#lab_amount').val(data['ip_assigned_amount'].lab_amount)
                            $('.Lab_fees').text(data['ip_assigned_amount'].lab_amount)
    
                            $('#xray_amount').val(data['ip_assigned_amount'].xray_amount)
                            $('.Xray_fees').text(data['ip_assigned_amount'].xray_amount)
    
                            $('#scan_amount').val(data['ip_assigned_amount'].scan_amount)
                            $('.Scan_fees').text(data['ip_assigned_amount'].scan_amount)
                             if(parseInt(data['ip_assigned_amount'].balance_from_op) > 0){
                                $('.OP_charges').show()
                                $('#OP_chargesText').text(data['ip_assigned_amount'].balance_from_op)
                             }
                             else{
                                $('.OP_charges').hide()
                             }
    
                            var  payment_recived_by_lab = (parseInt(data['ip_assigned_amount'].lab_amount)  - parseInt(data['ip_assigned_amount'].balance_lab_amount)) 
                            $('#paid_lab_amountText').text(payment_recived_by_lab)

                            var payment_recived_by_xray = (parseInt(data['ip_assigned_amount'].xray_amount)  - parseInt(data['ip_assigned_amount'].balance_xray_amount)) 
                            $('#paid_xray_amountText').text(payment_recived_by_xray)
    
                            var payment_recived_by_scan = (parseInt(data['ip_assigned_amount'].scan_amount)  - parseInt(data['ip_assigned_amount'].balance_scan_amount)) 
                            $('#paid_scan_amountText').text(payment_recived_by_scan)
    
                            total_amount = parseInt(data['ip_assigned_amount'].main_total);
                            // total_amount = parseInt($('#xray_amount').val() + $('#lab_amount').val() + parseInt($('#scan_amount').val());
                            main_balance = parseInt(data['ip_assigned_amount'].main_balance) 
    
                            $("#overallTotal").val(total_amount)
                            $("#overall_totaltext").text(total_amount);
                            $("#IP_Total_Amount").text(total_amount);
                            $("#balanceAmountText").text(main_balance);
                            $("#overallBalance").val(main_balance)
                            datecalculation();
                        }


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

                var totalday = date_result * parseInt($('#room_amount').val())
               
                $('.room_chargeText ').text(totalday.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))


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
                            $("#IP_Total_Amount").text(total_amount + sum);
                            $("#overallTotal").val(total_amount + sum);
                            var balance = (main_balance + sum - parseInt($("#paymentReceived").val()) - parseInt($("#discount_amount").val()))
                            $("#balanceAmountText").text(balance);
                            $("#overallBalance").val(balance);
                            $("#balanceValue").val(sum)

                            if (parseInt($("#discount_amount").val()) > 0) {
                                $("#IP_Total_Amount").text(total_amount + sum - parseInt($("#discount_amount").val()))
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
                                if (ExistingBalance + main_balance >= sum) {
                                    $("#balanceAmountText").text((ExistingBalance + main_balance) - parseInt(sum) - parseInt($("#discount_amount").val()));
                                    $("#overallBalance").val((ExistingBalance + main_balance) - parseInt(sum) - parseInt($("#discount_amount").val()))
                                } else {
                                    $("#balanceAmountText").text((ExistingBalance + main_balance) - parseInt(sum) - parseInt($("#discount_amount").val()));
                                    $("#overallBalance").val((ExistingBalance + main_balance) - parseInt(sum) - parseInt($("#discount_amount").val()))
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
                            $(this).val(0)
                        }

                    })
                });

                $('.amountCollectionValue').click(function () {
                    $(this).select();
                });


                $(".discountValue").on("keyup", function () {
                    var sum = 0;

                    var ExistingBalance = parseInt($("#balanceValue").val());
                    var totalAmount = parseInt($("#overallTotal").val());

                    if ($(this).val() != '') {
                        sum += parseInt(($(this).val()));
                    }
                    else {
                        $(this).val(0)
                        $("#discount_amount").val(0)
                    }

                    if (sum > 0) {

                        $("#discount_amount").val(parseInt(sum));



                        if (ExistingBalance + main_balance >= sum ) {
                            $("#balanceAmountText").text((ExistingBalance + main_balance) - parseInt(sum) - parseInt($("#paymentReceived").val()));
                            $("#overallBalance").val((ExistingBalance + main_balance) - parseInt(sum) - parseInt($("#paymentReceived").val()))
                                $("#IP_Total_Amount").text(totalAmount - sum)
                                $("#totalAmount_after_discountText").text(totalAmount - sum)
                                $("#totalAmount_after_discount").val(totalAmount - sum)
                            } else {
                            $("#balanceAmountText").text((ExistingBalance + main_balance) - parseInt(sum) - parseInt($("#paymentReceived").val()));
                            $("#overallBalance").val((ExistingBalance + main_balance) - parseInt(sum) - parseInt($("#paymentReceived").val()))
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
                        $("#balanceAmountText").text((ExistingBalance + main_balance) - parseInt($("#paymentReceived").val()));
                        $("#overallBalance").val((ExistingBalance + main_balance) - parseInt($("#paymentReceived").val()))
                        $("#IP_Total_Amount").text(totalAmount)
                        $("#totalAmount_after_discountText").text(totalAmount)
                        $("#totalAmount_after_discount").val(totalAmount)
                        $("#discount_amount").val(0)
                    }
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
            $("#IP_Total_Amount").text("0");
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
                if ($(this).val() != '') {
                    sum += parseInt(($(this).val()));
                }
                else {
                    $(this).val(0)
                    sum = 0
                }

                var ExistingBalance = parseInt($("#balanceValue").val());
                 
                var existing_discount = parseInt($('#existing_discount').val());

                if (sum > 0) {

                    $("#discount_amount").val(parseInt(sum));
                    $("#IP_Total_Amount").text(parseInt($('#overallTotal').val()) - sum);
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
                    $("#IP_Total_Amount").text($('#overallTotal').val());
                    $("#balanceAmountText").text(ExistingBalance - $("#paymentReceived").val());
                    $("#overallBalance").val(ExistingBalance - $("#paymentReceived").val())
                    $("#totalAmount_after_discountText").text('0')
                    $("#totalAmount_after_discount").val(0)
                    $("#discount_amount").val(0);
                }
            });

            $('.discountValue').click(function () {
                $(this).select();
            });


        }

    });


    $('.view_payment_Btn').click(function () {

        $(".multipleSelection").removeClass('active');
        $(this).find(".multipleSelection").addClass('active');
        
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
            url: 'get_amount_in_patient' + "?ip_assignid=" + $('#IP_assignid').val(),
            success: function (data) {

                var DataObj = data['ip_assigned_amount'];

                var IPPayment = DataObj.ip_payment_data;
                
                $('#physiotherapy_charges').val(DataObj.ip_payment_data.physiotherapy_charges);
                $('#nursing_charge').val(DataObj.ip_payment_data.nursing_charge);
                $('#establishment_charges').val(DataObj.ip_payment_data.establishment_charges);
                $('#iv_fluid_charges').val(DataObj.ip_payment_data.iv_fluid_charges);
                $('#icu_charges').val(DataObj.ip_payment_data.icu_charges);
                $('#physiotherapy_charges').val(DataObj.ip_payment_data.physiotherapy_charges);
                $('#surgery_charges').val(DataObj.ip_payment_data.surgery_charges);
                $('#dressing_charges').val(DataObj.ip_payment_data.dressing_charges);
                $('#miscellaneous_charges').val(DataObj.ip_payment_data.miscellaneous_charges);
                $('#consultant_charges').val(DataObj.ip_payment_data.consultant_charges);
                
                
                $('#room_amount').val(DataObj.room_charge)
                $('.Room_fees').text(DataObj.room_charge)

                $('#room_charge').val(DataObj.ip_payment_data['room_charge'])

                $('#lab_amount').val(DataObj.lab_amount)
                $('.Lab_fees').text(DataObj.lab_amount)
                $('#paid_lab_amountText').text(DataObj.lab_amount - DataObj.balance_lab_amount )


                $('#xray_amount').val(DataObj.xray_amount)
                $('.Xray_fees').text(DataObj.xray_amount)
                $('#paid_xray_amountText').text(DataObj.xray_amount - DataObj.balance_xray_amount )

                $('#scan_amount').val(DataObj.scan_amount)
                $('.Scan_fees').text(DataObj.scan_amount)
                $('#paid_scan_amountText').text(DataObj.scan_amount - DataObj.balance_scan_amount )

                $('#overallTotal').val(DataObj.ip_payment_data['overall_total'])

                $('#overall_totaltext').text(DataObj.ip_payment_data['overall_total']);
                $('#IP_Total_Amount').text(DataObj.ip_payment_data['overall_total']);
                $('#totalAmount_after_discountText').text(DataObj.ip_payment_data['overall_total'])
                // $('#discount').val(DataObj.ip_payment_data['total_after_discount'])
                

                $('#existing_discount').val(DataObj.ip_payment_data['discount'])
                $("#existingDiscountText").text(DataObj.ip_payment_data['discount']);

                $("#balanceAmountText").text(DataObj.ip_payment_data['balance']);
                $("#balanceValue").val(DataObj.ip_payment_data['balance']);
                $("#existingpaidAmountText").text(DataObj.ip_payment_data['already_paid']);
                $("#existing_balance").val(parseInt(DataObj.ip_payment_data['balance']));
                $("#in_PatientPaymentId").val(parseInt(DataObj.ip_payment_data['id']));

                $("#doctor_fees").val(DataObj.ip_payment_data['doctor_fees'])
                $("#injection").val(DataObj.ip_payment_data['injection'])
                $("#service").val(DataObj.ip_payment_data['service'])
                $("#others").val(DataObj.ip_payment_data['others'])

                
                $(".InvoiceSection").empty();

                $.each(DataObj.charge_details, function(feetext, feevalue) {
                    if(parseFloat(feevalue) > 0){

                        var feetext_alter = feetext.replace(/\_/g, ' ');

                        var AppendText = '<tr>\
                                            <td>'+feetext_alter.toUpperCase()+'</td>\
                                            <td class="text-end">'+feevalue+'</td>\
                                        </tr>';

                        $(".IP_Invoice_Section").append(AppendText);
                    }
                   
                });

                $.each(DataObj.payment_data, function(text, value) {
                    if(parseFloat(value) > 0){

                        var text_alter = text.replace(/\_/g, ' ');
                        
                        var AppendText = '<p class="text-capitalize">'+text_alter+'<span class="pull-right">₹ '+value+'</span></p>';

                        $(".IP_Payment_Section").append(AppendText);
                    }
                   
                });
               
              
                $(".Invoice_AmountSection").append('<p class="">Sub-Total <span class="Invoice_SubTotal pull-right">₹ ' + DataObj.main_total +'</span></p>');

                if(DataObj.ip_payment_data['discount'] >0){
                    $(".Invoice_AmountSection").append('<p class="mb-0">Discount <span class="Invoice_Discount pull-right">₹ ' + DataObj.ip_payment_data['discount'] +'</span></p>');
                }

                $(".Invoice_AmountTotal").append('<h4>Total Amount <span class="Invoice_Total">₹ ' +  (parseInt(DataObj.main_total) - parseInt(DataObj.ip_payment_data['discount'])) +'</span></h4>');

                // $(".Invoice_AmountTotal").append('<h4>Total Amount <span class="Invoice_Total">₹ ' + DataObj.ip_payment_data['total_after_discount']+'</span></h4>');
                
                if(DataObj.ip_payment_data['already_paid'] > 0) {
                    $(".Invoice_Paid").text('₹ ' + DataObj.ip_payment_data['already_paid']);
                    $(".Invoice_Balance").text('₹ ' + DataObj.main_balance);
                } else {
                    $(".Invoice_TransactionSection").hide()
                }

            },
            error: function (exception) {
                console.log(exception)
            }
        });
    }



    $('#discharge_summary_Btn').click(function () {

        $(".multipleSelection").removeClass('active');
        $(this).find(".multipleSelection").addClass('active');

        $('.dischargeSummary_section').show()
        $('.dischargeSummary_Print_section').hide()

        $('.Doctor_test_Section').hide()
        $('.Allmedicine').hide()
        $('.patient_history_section').hide()
        $('.Genarate_Bill_section').hide()
        $('.invoicePrintSection').hide()

        $.ajax({
            type: 'GET',
            url: 'get_discharge_summary_data_in' + "?ip_assignid=" + $('#IP_assignid').val(),
            success: function (data) {
             
                if (data.discharge_summary_data.length > 0) {
                    $('.dischargeSummary_section').hide();

                    $('.DischargeSummary_List_CardSection').show();

                    $('.Dsm_View_Btn').trigger('click')
                    $('.Edit-Summary').removeClass('hide');
                    $('.View-Summary').addClass('hide');  

                    $('#discharge_summary_id').val(data.discharge_summary_data[0].id)

                    $('.dsm_patient_id').text(data.discharge_summary_data[0].patient_id)
                    $('.dsm_patient_name').text(data.discharge_summary_data[0].patient_name)
                    $('.dsm_patient_age').text(data.discharge_summary_data[0].patient_age)
                    $('.dsm_patient_gender').text(data.discharge_summary_data[0].patient_gender)
                    $('.dsm_address').text(data.discharge_summary_data[0].patient_address)

                    $('.dsm_ip_no').text(data.discharge_summary_data[0].ip_no)
                    $('.dsm_room_no').text(data.discharge_summary_data[0].room_no)
                    $('.dsm_consultant').text(data.discharge_summary_data[0].consultant)
                    $('.dsm_dof_admission').text(moment(data.discharge_summary_data[0].date_of_admission).format("DD-MM-YYYY"))
                    $('.dsm_dof_discharge').text(moment(data.discharge_summary_data[0].date_of_discharge).format("DD-MM-YYYY"))
                    $('.dsm_dof_surgery').text(moment(data.discharge_summary_data[0].date_of_surgery).format("DD-MM-YYYY"))

                    $('.dsm_allergies').text(data.discharge_summary_data[0].allergies)
                    $('.dsm_diagnosis').text(data.discharge_summary_data[0].diagnosis)
                    $('.dsm_investigation').text(data.discharge_summary_data[0].investigation)
                    $('.dsm_treatment').text(data.discharge_summary_data[0].treatment)
                    $('.dsm_advice').text(data.discharge_summary_data[0].advice_on_discharge)


                    $('.Edit-Summary').click(function () {
                        $('.Dsm_Edit_Btn').trigger('click');
                    });

                    

                    $('.Dsm_Edit_Btn').click(function () {

                        $('.Edit-Summary').addClass('hide');  
                        $('.View-Summary').removeClass('hide'); 

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

        $('.View-Summary').click(function () {
            $('.Dsm_View_Btn').trigger('click');
            $('.Edit-Summary').removeClass('hide'); 
        });

        $('.Dsm_View_Btn').click(function () {
            $('.DischargeSummary_List_CardSection').hide()
            $('.dischargeSummary_Print_section').show()
            $(".dischargeSummary_section").hide();
        });


    })



    $('#doctor_report').click(function () {
        
        $(".multipleSelection").removeClass('active');
        $(this).find(".multipleSelection").addClass('active');

        $('.patient_history_section').show()

        $('.Doctor_test_Section').hide()
        $('.Allmedicine').hide()
        $('.dischargeSummary_section').hide()
        $('.Genarate_Bill_section').hide()
        $('.invoicePrintSection').hide()

        $('.DischargeSummary_List_CardSection').hide()
        $('.dischargeSummary_Print_section').hide()

    })


    $('#transfer_Btn').click(function(){

        $('#transfer_IP_id').val(0)
        $('#transfer_room_id').val(0)
        $('#TransferForm').trigger('reset')
        $(".room").val('').trigger('change')

        $('#transfer_IP_id').val($('#IP_assignid').val())
        $("#transfer_room_id").val($("#roomId").val())
    })



    $('#discharge_Btn').click(function () {
        

        Swal.fire({
            title: '<span class="trashIcon" style="color: #621aff"><i class="fa fa-info-circle me-1"></i></span>',
            html: '<div class="row" style="margin-top:15px">\
                    <div class="col-md-12">\
                            <div class= "titleSection text-center">\
                                <h4>Are You Sure to Discharge The Patient</h4>\
                            </div>\
                    </div >\
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
                $.ajax({
                    type : 'GET',
                    url: $('#discharge_patient').data('url') + "?ip_assignid=" + $('#IP_assignid').val()+"&ip_roomid=" + $("#roomId").val(),
                    success : function(){
                        location.reload()
                    },
                    error: function (exception) {
                        console.log(exception)
                    }            
                })

            } else if (result.dismiss == 'cancel') {
                // e.preventDefault()
            }
        })

    })







    // Submit Sections---------------------------------------->



    $('#addAssignRoomsForm').submit(function (e) {

        e.preventDefault();

        var AssignRoomData = [{
            'patient_id': parseInt($('#patient').val()),
            'room_id': parseInt($(".room").val()),
            'assigned_date': $("#assigned_date").val(),
            'reason': $('#reason').val()
        }];

        $.ajax({
            type: "POST",
            headers: {
                'X-CSRFToken': $.cookie("csrftoken"),
                'Content-Type': 'application/json',
            },
            url: 'assign_room',
            data: JSON.stringify({
                'AssignRoomData': AssignRoomData
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
        var ScanObj = $(".ScanTest").select2("val");
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
        else if ((LabObj.length == 0) && (XrayObj.length == 0) && (ScanObj.length == 0) && (MedicineObj.length == 0) && (InjectionObj.length == 0)) {

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

            var sale_id = 0

            if(for_api){
                post_checkup();

                var JsonData = JSON.stringify(for_api);
                
                var Prescription = $('#medical_prescription').val()+';'+$('#Doctor_Name').val()

                $.ajax({
                    type: 'POST',
                    crossDomain: true,
                    data: { myData: JsonData ,doctor_name: $('#doctor').select2('data')[0].text ,prescription: Prescription , pos_id : parseInt($('#pos_id').val()) },
                    //url: "http://192.168.100.200/POS/public/set-medicine-api.php",
                    url: "http://192.168.1.200/Medical/public/set-medicine-api.php",
                    headers: {
                        'Access-Control-Allow-Origin': '*'
                    },
                    success: function (data) {
                    //    location.reload()
                    console.log(data)
                    sale_id = data;
                    post_checkup();

                    }, error: function (exception) {
                        console.log("Exception = ", exception)
                    }
                });

            }

            else{
                sale_id = 0;
                post_checkup();
            }

            function post_checkup(){
                console.log('inside')

                $.ajax({
                    type: "POST",
                    headers: {
                        'X-CSRFToken': $.cookie("csrftoken"),
                        'Content-Type': 'application/json',
                    },
                    url: $('#assignroom_doctor_checkup').data('url'),
                    data: JSON.stringify({
                        'PatientObj': PatientObj,
                        'InjectionObj': InjectionObj,
                        'MedicineObj': MedicineObj,
                        'Dressing': $('#dressing').val(),
                        'LabObj': LabObj,
                        'XrayObj': XrayObj,
                        'ScanObj': ScanObj,
                        'Prescription': Prescription,
                        'Medical_Prescription': Medical_Prescription,
                        'sale_id' : sale_id
    
                    }),
                    success: function (msg) {
                        location.reload()
                        $('.ActionBtn').trigger('click')
    
                    }, error: function (exception) {
                        console.log(exception)
                    }
                });

            }

        }

    })



    $("#Discharge_PaymentForm").submit(function (e) {

        e.preventDefault()


        // var sum = 0
        // $('.feesAmount').each(function () {
        //     sum += parseInt($(this).val())
        // });
        // if (sum <= 0) {
        //     iziToast.info({
        //         timeout: 700,
        //         balloon: true,
        //         overlay: true,
        //         displayMode: 'once',
        //         id: 'error',
        //         title: 'Error',
        //         zindex: 99999999,
        //         message: '<b>Please Get Fees</b>',
        //     });
        //     return false
        // }

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
                    message: '<b>Enter Amount First</b>',
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
                            'in_PatientPaymentId': parseInt($('#in_PatientPaymentId').val()),
                            'ip_assign_id': parseInt($("#IP_assignid").val()),
                            'room_id': parseInt($("#roomId").val()),
                            'patient_id': parseInt($("#patientId").val()),

                            'room': parseInt($("#room_charge").val()),
                            'doctor_fees': parseInt($("#doctor_fees").val()),
                            'nursing_charge': parseInt($("#nursing_charge").val()),
                            'establishment_charges': parseInt($("#establishment_charges").val()),
                            'iv_fluid_charges': parseInt($("#iv_fluid_charges").val()),
                            'icu_charges': parseInt($("#icu_charges").val()),
                            'physiotherapy_charges': parseInt($("#physiotherapy_charges").val()),
                            'surgery_charges': parseInt($("#surgery_charges").val()),
                            'consultant_charges': parseInt($("#consultant_charges").val()),
                            'dressing_charges': parseInt($("#dressing_charges").val()),
                            'miscellaneous_charges': parseInt($("#miscellaneous_charges").val()),
                            'lab': parseInt($("#lab_amount").val()),
                            'xray': parseInt($("#xray_amount").val()),
                            'scan': parseInt($("#scan_amount").val()),
                            'injection': parseInt($("#injection").val()),


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
                            url: 'in_patient_payment',
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
                        // e.preventDefault()
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
            'ip_no': parseInt($("#IP_assignid").val()),
            'room_id': parseInt($("#roomId").val()),
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
            url: 'discharge_summary_in',
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

    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
        $($.fn.dataTable.tables(true)).DataTable()
            .columns.adjust();
    });


})