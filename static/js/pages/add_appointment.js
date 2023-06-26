$(document).ready(function()
{

    $(".appointmentInfoSection").hide(); 
    // var GetPendingPaymentForOpDataUrl = $("#GetPendingPaymentForOpData").data('url')
    // $.ajax({
    //     type: "GET",
    //     url: GetPendingPaymentForOpDataUrl,
    //     success: function (data) {
    //     },
    //     error: function (exception) {
    //     }
    // });

    $.ajax({
        type: "GET",
        url: $("#get_doctor_data").data('url'),
        success: function (data) {
            doctor_select2(data.doctordata);
        },
        error: function (exception) {
        }
    });
   
  
    function doctor_select2(DoctorData) {
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

        $("#doctor").on('change', function () {
            var ID = parseInt($(this).val())
            var filtered_health_checkup = DoctorData.filter(function (obj) {
                return (obj.id == ID)
            })
            if (filtered_health_checkup.length != 0) {
                $('.doctor_checkup_master_section').empty()
                var data = filtered_health_checkup[0].health_checkup_master

                for (var i = 0; i < data.length; i++) {

                    var master_html = '<div class="col-md-3">\
                                                <div class="doctor_checkup_master_list">\
                                                    <div class="form-group">\
                                                        <label for="'+ data[i].id + '">' + data[i].name + '</label>\
                                                        <input type="text" class="form-control" name="doctor_checkup_master_fields" data-name="'+ data[i].name + '" data-unit="' + data[i].unit + '"   id="' + data[i].id + '"  placeholder="' + data[i].name + '">\
                                                    </div>\
                                                </div>\
                                            </div>'

                    $('.doctor_checkup_master_section').append(master_html)

                }
            }
            else {
                $('.doctor_checkup_master_section').empty()
            }
        })
    }

    function formatDoctorSelect2(state)
    {
        if (state.id) {
            var container = $(
                '<ul class="list-unstyled users-list m-0 avatar-group d-flex align-items-center">\
                    <li class="fw-bold">' + state.text + ' ( ' + state.specialized + ' )</li>\
                </ul>'
            )
        }
        return container;
    }
    

    // Is Emergency

    $("#is_emergency").on("click" , function(){
        if($(this).is(':checked')){
            $("#is_emergency_val").val("true");
        }
        else{
            $("#is_emergency_val").val("false");
        }
    })




    // @Paul New Patient Modal
    var total_amount, balance_amount;
    var lab_xray_scan_amount = 0;
    var lab_xray_scan_balance_amount = 0;
    var payment_recived_by_lab_xray_scan = 0;

    $("#todayOpBtn, .todayOpBackBtn").click(function()
    {        
        $(".appointmentInfoSection").hide();
        $(".appointment_GetpaymentSection").hide();
        $(".invoicePrintSection").hide();

        $(".todayOpBackBtnSection").hide();
        $(".todayOpPrintBtnSection").hide();

        $(".appointmentListDTSection").show();
        $(".addNewBtnSection").show();
        $(".patient_Select2_Section").hide();
        $(".Lab_Testing_Section").hide();
    });
  

    $("#paymentPendingForOPBtn, .pendingContainerBackBtn").click(function()
    {
        $(".appointmentInfoSection").hide();
        $(".appointment_GetpaymentSection").hide();
        $(".invoicePrintSection").hide();

        $(".pendingContainerBackBtnSection").hide();
        $(".pendingContainerPrintBtnSection").hide();

        $(".paymentPendingAppointmentListDTSection").show();
    })

  
    $("#gender").select2({
        placeholder : "Select Gender",
        allowClear : true,
        minimumResultsForSearch: -1
    });

    $("#refund_type").select2({
        placeholder : "Select Type",
        allowClear : true,
        minimumResultsForSearch: -1
    });
    
    $(".newPatientBtn").click(function()
    {
        $("#newPatientForm").trigger("reset");
        $("#newPatientId").val("0");
        $("#posId").val("0");
    });

    $("#newPatientForm").submit(function(e)
    {
        e.preventDefault();

        var months = ["jan", "feb", 'mar', 'apr', 'may', 'jun', 'jul', "aug", 'sep', 'oct', 'nov', 'dec'];

        var patientAge = $("input[name=age]").val();
        var patientMonth = $("input[name=month]").val();

        var totalmonth = (parseInt(patientAge) * 12) + parseInt(patientMonth);
        let currentdate = new Date();
        let birthDate = new Date(currentdate.setMonth(currentdate.getMonth() - totalmonth));

        $("input[name=dateofbirth]").val(moment(birthDate).format("YYYY-MM-DD"));

        var genderId = "";

        if ($("#gender").val() == 'Male') {
            genderId = '1'
        }
        else {
            genderId = '0'
        }

        var PatientObj = {
            'id': $("#newPatientId").val(),
            'pos_id_no': $("#posId").val(),
            'name': $("#name").val(),
            'gender': $("#gender").val(),
            'genderId': genderId,
            'dob': $("input[name=dateofbirth]").val(),
            'father_name': $("#father_name").val(),
            'phone': $("#phone").val(),
            'address': $("#address").val(),
        };

        var PatientUrl = $("#PatientUrl").data('url');

        $.ajax({
            type: 'POST',
            crossDomain: true,
            data: { patientData: PatientObj },
            //url : "http://192.168.1.200/POS/public/create-patient-api.php",
            url: "http://192.168.1.200/Medical/public/create-patient-api.php",
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            success: function (posId) {
                // location.reload()

                PatientObj['pos_id'] = posId;

                $.ajax({
                    type: "POST",
                    headers: {
                        'X-CSRFToken': $.cookie("csrftoken"),
                        'Content-Type': 'application/json',
                    },
                    url: PatientUrl,
                    data: JSON.stringify({
                        'PatientObj': PatientObj,
                    }),
                    success: function (msg) {
                        location.reload()
                    }, error: function (exception) {
                        console.log(exception)
                    }
                });

            }, error: function (exception) {
                console.log("Exception = ", exception)
            }
        });

    })



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
                    'query': query,
                    'type' : 'all'
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
                '<div class="row"><span class="col-12 col-md-6"><h6>Name: ' + item.name + '</h6></span>'+
                '<span class="col-12 col-md-6 text-end"><h6>(ID : '+item.id+')</h6></span><br>'+
                '<span class="col-12 col-md-6">Ph:' + item.phone + '</span>'+
                '<span class="col-12 col-md-6 text-end">Place: ' + item.address + '</span></<div>'
            )
        },

        updater: function(link) {
            var item = JSON.parse(link);

            $("#patientId").val(item.id);

            $("#appointedPatientId").text(item.id);
            $("#appointedPatientName").text(item.name);
            $("#appointedPatientAge").text(item.age);
            $("#appointedPatientGender").text(item.gender);
            $("#appointedPatientPlace").text(item.place);
            $("#appointedDate").text(moment(new Date()).format("DD-MM-YYYY"));            
            
            $(".patientDetailsSection").show();

            $.ajax({
                type : "GET",
                url : $("#GetPatientBalanceDataUrl").data('url')+"?patient_id="+item.id,
                success : function(data){
                    console.log(data['balance__sum'])

                    if(data['balance__sum'] == 0 || data['balance__sum'] == null)
                    {
                        $("#patientBalanceAmount").css("color" , "green");
                    }
                    else if(data['balance__sum'] > 0)
                    {
                        $("#patientBalanceAmount").css("color" , "red");
                    }

                    $("#patientBalanceAmount").text(data['balance__sum'] == null ? 0 : data['balance__sum'])

                },
                error : function(err){
                    console.log(err.message)
                }
            })
            
        }

    });


    $(".addNewbtn").click(function()
    {
        
        setTimeout(function() {
            $('#patient_typeahead').focus()
        },200)

        
        $("#addAppointmentForm").trigger("reset");
        $("#appointmentId").val("0");
        $("#is_emergency_val").val("false");
        $(".submitBtn").text("Create Appointment");

        $("#patient").val("").trigger("change");

        $("#doctor").attr("disabled" , false);
        $("#doctor").val("").trigger("change");
        
        $(".createAppointmentBtn").text("Create Appointment");

        $("#patientId").val("0");
        $(".patientDetailsSection").hide()

        $(".appointmentListDTSection").hide();
        $(".addNewBtnSection").hide();

        $(".patient_Select2_Section").show();
        $(".todayOpBackBtnSection").show();
        
        $(".appointmentInfoSection").show();        
        $(".submitBtnSection").show();
        $(".todayOpPrintBtnSection").hide();
        $(".op_uploaded_report_section").hide();
        $("#patientBalanceAmount").text(0);

    });


    var pending_amount_id

    /* Today's Appointment DataTable */

    var appointmentListDatatable = $("#appointmentListDT").DataTable({
        ajax:{
            url:$('#GetTodaysAppointmentDataUrl').data("url"),
            dataSrc:"appointmentdata"
        },
        "oLanguage": {
            "sEmptyTable": "No Out-Patient(O.P) Appointments Today..."
        },
        responsive: true,
        paging: true,
        searching: true,
        autoWidth: true,
        "scrollY": false,
        "scrollCollapse": true,
        "order": [0, "desc"],
        "pageLength": 10,
        "bLengthChange": false,
        "scrollX": false,
        columns: [{
            "title": "OP Id",
            "data": "id"
        },
        {
            "title": "Patient",
            "data": "patient_name"
        },
        {
            "title": "Reason",
            "data": "reason"
        },
        {
            "title": "Appointed To",
            "data": "doctor_name"
        },
        {
            "title": "Appointed Time",
            "data": "appointment_date"
        },
        {
            "title": "Checkup",
            "data": "checkup"
        },
        {
            "title": "Total Amount",
            "data": "total_amount"
        },
        {
            "title": "Payment",
            "data": "payment_pending"
        },
        ],
        columnDefs: [{
            "targets": 0,
            "visible": true
        },
        {
            "targets": 1,
            "render": function (data, type, row) {
                return (
                    '<h2 class="table-avatar">\
                        <a href="javascript:void(0)">' + data + ' [ #' + row.patient_id +' ]<span style="text-align:left"> [Ph:  ' + row.patient_phone + '] </span>' + '</a>\
                    </h2>'
                )
            }
        },
        {
            "targets": 4,
            "render": function (data, type, row) {
                return (
                    '<h2 class="table-avatar">\
                        '+moment(new Date(data)).format("DD-MM-YYYY")+' ' + moment(new Date(data)).format("HH:mm A") +'\
                            </h2>'
                )
            }
        },
        {
            "targets": 5,
            "render": function (data, type, row) {
                var checkupHtml = ""
                if (data == 0) {
                    checkupHtml += '<span class="me-1" style="color:green;font-weight: bold;">Waiting</span>'
                } else if (data == 1) {
                    checkupHtml += '<span class="me-1" style="color:#7638ff;font-weight: bold;">Visited</span>'
                } else if (data == 2) {
                    checkupHtml += '<span class="me-1" style="color:red;font-weight: bold;">Not Visited</span>'
                } else if (data == 3) {
                    checkupHtml += '<span class="me-1" style="color:red;font-weight: bold;">Cancelled</span>'
                }
                 else if (data == 4) {
                    checkupHtml += '<span class="me-1" style="color:blue;font-weight: bold;">Transfered to IP</span>'
                }

                return checkupHtml
            }
        },
        {
            "targets": 7,
            "render": function (data, type, row) {
                var paymentHtml = "";

                if (row.checkup == 0) {
                    paymentHtml += '<span class="me-1" style="color:rgb(255 118 0);font-weight: bold;">Not Paid</span>'
                } else if (row.checkup == 1 && row.initially_paid == "False") {
                    paymentHtml += '<span class="me-1" style="color:rgb(255 118 0);font-weight: bold;">Not Paid</span>'                    
                } else if( row.checkup == 1 && row.initially_paid == "True" && data == "True"  ) {
                    paymentHtml += '<span class="me-1" style="color:red;font-weight: bold;">Pending</span>'
                }  else if (row.checkup == 1 && row.initially_paid == "True" && data == "False") {
                    paymentHtml += '<span class="me-1" style="color:rgb(26, 114, 247);font-weight: bold;">Complete</span>'
                }   else if (row.checkup == 3 || row.checkup == 2 ) {
                    paymentHtml += '<span class="me-1 text-center" style="color:black;font-weight: bold;">---</span>'
                }
                 else if (row.checkup == 4) {
                    paymentHtml += '<span class="me-1 text-center" style="color:black;font-weight: bold;">---</span>'
                }


                return paymentHtml
            }
        },
        {
            "targets": 8,
            "title": "Action",
            "data": null,
            "render": function (data, type, row) {
               
                var actionHtml = "";

                if(row.checkup == 0)
                {
                    actionHtml += "<a class='dropdown-item cancelAppointmentBtn' id='cancelAppointmentBtn'\
                                                        data-val='" + JSON.stringify(row) + "' href='javascript:void(0);'><i\
                                                    class='fa fa-ban me-2'></i> Cancel Appointment</a>"
                }
                else if(row.checkup == 1){
                    if (row.initially_paid == "False")
                    {
                        actionHtml += "<a class='dropdown-item getPaymentBtn' id='getPaymentBtn'\
                                                        data-val='" + JSON.stringify(row) + "' href='javascript:void(0);'><i\
                                                    class='fas fa-rupee-sign me-2'></i> Get Payment</a>"
                    }

                    if (row.initially_paid == "True")
                    {
                        if (row.payment_pending == 'True') {
                            actionHtml += "<a class='dropdown-item pendingPaymentBtn' id='pendingPaymentBtn'\
                                                        data-val='" + JSON.stringify(row) + "' href='javascript:void(0);'><i\
                                                    class='fas fa-rupee-sign me-2'></i> Pending Payment</a>"
                        }
                        else{

                            actionHtml += "<a class='dropdown-item refundBtn' id='refundBtn' data-toggle='modal' data-target='#refundModal'\
                                                data-val='" + JSON.stringify(row) + "' href='javascript:void(0);'><i\
                                                class='fas fa-rupee-sign me-2'></i> Refund</a>"
                        }

                        actionHtml += "<a class='dropdown-item viewPaymentBtn' id='viewPaymentBtn'\
                                                    data-val='" + JSON.stringify(row) + "' href='javascript:void(0);'><i\
                                                class='fas fa-rupee-sign me-2'></i> View Payment</a>"


                    }

                        actionHtml += "<a class='dropdown-item TransferBtn' id='TransferBtn' data-toggle='modal' data-target='#TransferFormModal'\
                            data-val='" + JSON.stringify(row) + "' href='javascript:void(0);'><i\
                            class='fas fa-exchange-alt me-2'></i>Transfer</a>"
                }

                return (
                        "<div class='dropdown dropdown-action'>\
                            <a href='javascript:void(0)' class='action-icon dropdown-toggle'\
                                data-bs-toggle='dropdown' aria-expanded='false'>\
                                <i class='fas fa-ellipsis-h'></i>\
                            </a>\
                            <div class='dropdown-menu dropdown-menu-right'>\
                                <a class='dropdown-item infoBtn' id='InfoBtn' data-val='" + JSON.stringify(row) + "'\
                                    href='javascript:void(0);'><i class='fa fa-info-circle me-2'></i>\
                                Info</a>\
                                " + actionHtml + "\
                            </div>\
                        </div>"
                )
            }
        }],drawCallback: function () {
            var api = this.api();
            var sum = 0;
            var formated = 0;

            $(api.column(0).footer()).html('Total');

            //for(var i=2; i<=7;i++){
                sum = api.column(6, {page:'current'}).data().sum();
                formated = parseFloat(sum).toLocaleString(undefined, {minimumFractionDigits:2});
                $(api.column(6).footer()).html('₹ '+formated);
            //}
            
        }     

        

    });

    setInterval(function(){  
        appointmentListDatatable.ajax.reload(null, false);
       
    },15000);


    var byepass_op = 0
    $("#appointmentListDT").on("click" , ".cancelAppointmentBtn" , function(){
        var thisAppointmentData = $(this).data("val");
        var CancelAppointmentUrl = $("#CancelAppointmentUrl").data('url')
        Swal.fire({
            title: '<span class="trashIcon" style="color: red;font-size:45px;"><i class="far fa-question-circle me-1"></i></span>',
            html: '<div class="row" style="margin-top:15px">\
                    <div class="col-md-12">\
                            <div class= "titleSection text-center">\
                                <h4>Are You Sure</h4>\
                            </div>\
                    </div >\
                </div >\
                <div class="row" style="margin-top:15px">\
                    <div class="col-md-12">\
                        <div class="confirmSection text-center">\
                            <p style="line-height:1.5;font-size:25px">Cancel <span style="font-weight : bold;color:#7638ff"> '+thisAppointmentData.patient_name+'</span>`s Appointment</p>\
                        </div>\
                    </div>\
                </div>',
            showCloseButton: false,
            showConfirmButton: true,
            showCancelButton: true,
            cancelButtonText: "No",
            cancelButtonColor: 'grey',
            confirmButtonText: "Yes",
            confirmButtonColor: '#22CC62',
            focusConfirm: false,

        }).then(function (result) {
            if (result.value == true) {
                $.ajax({
                    type : "GET",
                    url: CancelAppointmentUrl+"?appointmentId="+thisAppointmentData.id,
                    success: function(data) {
                    },
                    error: function(exception) {
                        console.log(exception)
                    }
                })
            } 
        })
    })

    
    $("#appointmentListDT").on("click" , ".infoBtn" , function()
    {
        var thisAppointmentData = $(this).data("val");

        displayInfoSection(thisAppointmentData);


        

        $(".appointmentListDTSection").hide();
        $(".addNewBtnSection").hide();
        // $(".submitBtnSection").hide();
        $(".createAppointmentBtn").text("Save Changes");  

        $(".todayOpBackBtnSection").show();
        $(".op_uploaded_report_section").show();
        $('#op_id_for_upload_report').val(thisAppointmentData.id)
        
    });


    $("#appointmentListDT").on("click" , ".getPaymentBtn" , function()
    {
        var thisAppointmentData = $(this).data("val");

        GetPaymentFunc(thisAppointmentData);
        $(".addNewBtnSection").show();
        byepass_op = 0
    });


    $("#appointmentListDT").on("click" , ".pendingPaymentBtn" , function()
    {
        $('#Appointment_PaymentForm').trigger('reset');

        $(".feesAmount").attr("readonly", true);
        $(".feesAmount").prop("disabled", true);

        $("#firstPayment").val("False");
        $("#nowPayingAmountText").text("0");       
        $("#nowPayingAmount").val("0");

        var thisAppointmentData = $(this).data("val");
     
        GetPendingPaymentFunc(thisAppointmentData);

        $(".appointmentListDTSection").hide();
        $(".addNewBtnSection").hide();

        $(".todayOpBackBtnSection").show();

    });

    
    $("#appointmentListDT").on("click", ".viewPaymentBtn", function() {

        $(".containerTitle").text("Payment Information");

        var thisPaymentData = $(this).data("val");
    
        ViewPaymentFunc(thisPaymentData);

        $(".appointmentListDTSection").hide();
        $(".addNewBtnSection").hide();

        $(".todayOpPrintBtnSection").show();
        $(".todayOpBackBtnSection").show();
    });


    $("#appointmentListDT").on("click", ".refundBtn", function() {

        var thisAppointmentData = $(this).data("val");
        $('#op_id_for_refund').val(thisAppointmentData.id)
        pending_amount_id = thisAppointmentData.id
        pendingAmountData()

    });




    $("#appointmentListDT").on("click", ".TransferBtn", function() {

        var thisdata = $(this).data('val')
        console.log(thisdata)
        $('#transfer_OP_id').val(thisdata.id)
        $('#transfer_patient_id').val(thisdata.patient_id)
        GetPaymentFunc(thisdata);
        byepass_op = 1

    });


    // Pending Payment DatatTable

    var paymentPendingOPListDT = $("#paymentPendingAppointmentListDT").DataTable({
        // processing: true,
        // serverSide: true,
        ajax:{
            url:$("#GetPendingPaymentForOpData").data('url'),
            dataSrc:"appointmentdata"
        },
        responsive: true,
        paging: true,
        searching: true,
        autoWidth: true,
        "scrollY": false,
        "scrollCollapse": true,
        "order": [0, "desc"],
        "pageLength": 10,
        "bLengthChange": false,
        "scrollX": false,
        columns: [{
            "title": "OP Id",
            "data": "id"
        },
        {
            "title": "Patient",
            "data": "patient_name"
        },
        {
            "title": "Reason",
            "data": "reason"
        },
        {
            "title": "Appointed To",
            "data": "doctor_name"
        },
        {
            "title": "Appointed Time",
            "data": "appointment_date"
        },
        {
            "title": "Checkup",
            "data": "checkup"
        },
        {
            "title": "Balace",
            "data": "balance_amount"
        },
        {
            "title": "Payment",
            "data": "payment_pending"
        },
        ],
        columnDefs: [{
            "targets": 0,
            "visible": true
        },
        {
            "targets": 1,
            "render": function (data, type, row) {
                return (
                    '<h2 class="table-avatar">\
                        <a href="javascript:void(0)">' + data + ' [ #' + row.patient_id +' ]<span style="text-align:left"> [Ph:  ' + row.patient_phone + '] </span>' + '</a>\
                    </h2>'
                )
            }
        },
        {
            "targets": 4,
            "render": function (data, type, row) {
                return (
                    '<h2 class="table-avatar">\
                        '+moment(new Date(data)).format("DD-MM-YYYY")+' ' + moment(new Date(data)).format("HH:mm A") +'\
                            </h2>'
                )
            }
        },
        {
            "targets": 5,
            "render": function (data, type, row) {
                var checkupHtml = ""
                if (data == 0) {
                    checkupHtml += '<span class="me-1" style="color:green;font-weight: bold;">Waiting</span>'
                } else if (data == 1) {
                    checkupHtml += '<span class="me-1" style="color:#7638ff;font-weight: bold;">Visited</span>'
                } else if (data == 2) {
                    checkupHtml += '<span class="me-1" style="color:red;font-weight: bold;">Not Visited</span>'
                } else if (data == 3) {
                    checkupHtml += '<span class="me-1" style="color:red;font-weight: bold;">Cancelled</span>'
                }

                return checkupHtml
            }
        },
        {
            "targets": 7,
            "render": function (data, type, row) {
                var paymentHtml = "";

                if (row.checkup == 0) {
                    paymentHtml += '<span class="me-1" style="color:rgb(255 118 0);font-weight: bold;">Not Paid</span>'
                } else if (row.checkup == 1 && row.initially_paid == "False") {
                    paymentHtml += '<span class="me-1" style="color:rgb(255 118 0);font-weight: bold;">Not Paid</span>'                    
                } else if( row.checkup == 1 && row.initially_paid == "True" && data == "True"  ) {
                    paymentHtml += '<span class="me-1" style="color:red;font-weight: bold;">Pending</span>'
                }  else if (row.checkup == 1 && row.initially_paid == "True" && data == "False") {
                    paymentHtml += '<span class="me-1" style="color:rgb(26, 114, 247);font-weight: bold;">Complete</span>'
                }   else if (row.checkup == 3 || row.checkup == 2 ) {
                    paymentHtml += '<span class="me-1 text-center" style="color:black;font-weight: bold;">---</span>'
                }


                return paymentHtml
            }
        },
        {
            "targets": 8,
            "title": "Action",
            "data": null,
            "render": function (data, type, row) {
               
                var actionHtml = "";

                if(row.checkup == 0)
                {
                    actionHtml += "<a class='dropdown-item cancelAppointmentBtn' id='cancelAppointmentBtn'\
                                                        data-val='" + JSON.stringify(row) + "' href='javascript:void(0);'><i\
                                                    class='fa fa-ban me-2'></i> Cancel Appointment</a>"
                }
                else if(row.checkup == 1){
                    if (row.initially_paid == "False")
                    {
                        actionHtml += "<a class='dropdown-item getPaymentBtn' id='getPaymentBtn'\
                                                        data-val='" + JSON.stringify(row) + "' href='javascript:void(0);'><i\
                                                    class='fas fa-rupee-sign me-2'></i> Get Payment</a>"
                    }

                    if (row.initially_paid == "True")
                    {
                        if (row.payment_pending == 'True') {
                            actionHtml += "<a class='dropdown-item pendingPaymentBtn' id='pendingPaymentBtn'\
                                                        data-val='" + JSON.stringify(row) + "' href='javascript:void(0);'><i\
                                                    class='fas fa-rupee-sign me-2'></i> Pending Payment</a>"
                        }

                        actionHtml += "<a class='dropdown-item viewPaymentBtn' id='viewPaymentBtn'\
                                                    data-val='" + JSON.stringify(row) + "' href='javascript:void(0);'><i\
                                                class='fas fa-rupee-sign me-2'></i> View Payment</a>"
                    }

                }

                return (
                        "<div class='dropdown dropdown-action'>\
                            <a href='javascript:void(0)' class='action-icon dropdown-toggle'\
                                data-bs-toggle='dropdown' aria-expanded='false'>\
                                <i class='fas fa-ellipsis-h'></i>\
                            </a>\
                            <div class='dropdown-menu dropdown-menu-right'>\
                                <a class='dropdown-item infoBtn' id='InfoBtn' data-val='" + JSON.stringify(row) + "'\
                                    href='javascript:void(0);'><i class='fa fa-info-circle me-2'></i>\
                                Info</a>\
                                " + actionHtml + "\
                            </div>\
                        </div>"
                )
            }
        }
        ],drawCallback: function () {
            var api = this.api();
            var sum = 0;
            var formated = 0;

            $(api.column(0).footer()).html('Total');

            //for(var i=2; i<=7;i++){
                sum = api.column(6, {page:'current'}).data().sum();
                formated = parseFloat(sum).toLocaleString(undefined, {minimumFractionDigits:2});
                $(api.column(6).footer()).html('₹ '+formated);
            //}
            
        }     

            

    });

    setInterval(function(){  paymentPendingOPListDT.ajax.reload(null, false);},15000);


    $("#paymentPendingAppointmentListDT").on("click" , ".infoBtn" , function()
    {
        var thisAppointmentData = $(this).data("val");

        displayInfoSection(thisAppointmentData);

        $(".paymentPendingAppointmentListDTSection").hide();

        $(".pendingContainerBackBtnSection").show();
        $(".op_uploaded_report_section").show();
        $('#op_id_for_upload_report').val(thisAppointmentData.id)
    });


    $("#paymentPendingAppointmentListDT").on("click" , ".getPaymentBtn" , function()
    {
        var thisAppointmentData = $(this).data("val");

        GetPaymentFunc(thisAppointmentData);
        $(".addNewBtnSection").show();
    });
 


    $("#paymentPendingAppointmentListDT").on("click" , ".pendingPaymentBtn" , function()
    {
        $('#Appointment_PaymentForm').trigger('reset');

        $(".feesAmount").attr("readonly", true);
        $(".feesAmount").prop("disabled", true);

        $("#firstPayment").val("False");
        $("#nowPayingAmountText").text("0");       
        $("#nowPayingAmount").val("0");

        var thisAppointmentData = $(this).data("val");
     
        GetPendingPaymentFunc(thisAppointmentData);

        $(".paymentPendingAppointmentListDTSection").hide();

        $(".pendingContainerBackBtnSection").show();

    });

    

    
    $("#paymentPendingAppointmentListDT").on("click", ".viewPaymentBtn", function() {

        $(".containerTitle").text("Payment Information");

        var thisPaymentData = $(this).data("val");
    
        ViewPaymentFunc(thisPaymentData);

        $(".paymentPendingAppointmentListDTSection").hide();

        
        $(".pendingContainerPrintBtnSection").show();
        $(".pendingContainerBackBtnSection").show();
    });


    // Common function

    function displayInfoSection(thisAppointmentData)
    {
        $("#appointmentId").val(thisAppointmentData.id);
        $("#patientId").val(thisAppointmentData.patient_id);
        $(".OPAdmitID").text(thisAppointmentData.id);
        $(".OPAdmitReason").text(thisAppointmentData.reason);

        $(".appointedPatientPlace").text(thisAppointmentData.patient_place);
        $(".appointedPatientPhone").text(thisAppointmentData.patient_phone);
        
        $("#appointedPatientId").text(thisAppointmentData.patient_id);
        $("#appointedPatientName").text(thisAppointmentData.patient_name);
        $("#appointedPatientAge").text(thisAppointmentData.patient_age);
       
        
        
        $("#appointedPatientGender").text(thisAppointmentData.patient_gender);
        $("#appointedDate").text(moment(new Date(thisAppointmentData.appointment_date)).format("DD-MM-YYYY"));

        $("#bp").val(thisAppointmentData.bp);
        $("#pulse").val(thisAppointmentData.pulse);
        $("#temperature").val(thisAppointmentData.temperature);
        $("#rr").val(thisAppointmentData.rr);
        $("#sp_o2").val(thisAppointmentData.sp_o2);
        $("#blood_sugar").val(thisAppointmentData.blood_sugar);
        $("#reason").val(thisAppointmentData.reason);
        $("#doctor").val(thisAppointmentData.doctor_id).trigger("change");

        if((thisAppointmentData.is_emergency) == "True"){
            $("#is_emergency_val").val("true");
            $("#is_emergency").prop("checked" , true)
        }
        else{
            $("#is_emergency_val").val("false");
            $("#is_emergency").prop("checked" , false)
        }

        //$("#addAppointmentForm textarea").attr("readonly" , "readonly");
        $("#doctor").attr("disabled" , true);

        // $(".patient_Select2_Section").hide();

        if(thisAppointmentData.checkup == 1)
        {
            $(".createAppointmentBtnSection").hide();
        }
        else
        {
            $(".createAppointmentBtnSection").show();
        }
       
        $(".createAppointmentBtn").text("Save Changes")
       
        $(".appointmentInfoSection").show();
        $(".patientDetailsSection").show();

        console.log(thisAppointmentData)

        for(var i =0 ; i<thisAppointmentData.health_checkup_details.length ; i++){
            $('#'+thisAppointmentData.health_checkup_details[i].id).val(thisAppointmentData.health_checkup_details[i].value)

        }



    };

    

    function GetPaymentFunc(thisAppointmentData)
    {
        

        function getAmountData()
        {
            var GetAmountDataUrl = $('#GetAmountDataUrl').data('url')
    
            $.ajax({
                type: "GET",
                url: GetAmountDataUrl+"?appointment_id="+thisAppointmentData.id,
                success: function(data) {

                    if(byepass_op == 0){
                        if((parseInt(data['lab_length']) > 0)||(parseInt(data['xray_length']) > 0) || (parseInt(data['scan_length']) > 0) ){


                            Swal.fire({
                                title: '<span class="trashIcon" style="color: #621aff"><i class="fa fa-info-circle me-1"></i></span>',
                                html: '<div class="row" style="margin-top:15px">\
                                        <div class="col-md-12">\
                                                <div class= "titleSection text-center">\
                                                    <h4>A You Have Lab or Xray or Scan Test </h4>\
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
                    else{
                        paymentSection();
                        displayAmount();
                    }
                    }

                    else{
                        displayAmount();

                    }



                    function displayAmount(){
                        
                        $("#outPatientPaymentId").val(data.appointment_amount.op_payment_data.op_payment_id);
                        $('#paymentrecived_by_doctor').text(data.appointment_amount.op_payment_data.payment_recived_by_doctor)
                        $('#doctor_fees').val(data.appointment_amount.op_payment_data.doctor_fees)
                        // $('#dressing').val(data.appointment_amount.op_payment_data.dressing)
                        // $('#neb').val(data.appointment_amount.op_payment_data.neb)
    
                        $('#lab_amount').val(data.appointment_amount.lab_amount)
                        $('.Lab_fees').text(data.appointment_amount.lab_amount)
    
    
                        $('#xray_amount').val(data.appointment_amount.xray_amount)
                        $('.Xray_fees').text(data.appointment_amount.xray_amount)
    
                        $('#scan_amount').val(data.appointment_amount.scan_amount)
                        $('.Scan_fees').text(data.appointment_amount.scan_amount)
    
                        

                        var payment_recived_by_lab = (parseInt(data.appointment_amount.lab_amount ) - parseInt(data.appointment_amount.balance_lab_amount)) 
                        $('#paid_lab_amountText').text(payment_recived_by_lab )
    
    
                        var payment_recived_by_xray = (parseInt(data.appointment_amount.xray_amount ) - parseInt(data.appointment_amount.balance_xray_amount)) 
                        $('#paid_xray_amountText').text(payment_recived_by_xray);
    
                        var payment_recived_by_scan = (parseInt(data.appointment_amount.scan_amount ) - parseInt(data.appointment_amount.balance_scan_amount)) 
                        $('#paid_scan_amountText').text(payment_recived_by_scan);
    
                        payment_recived_by_lab_xray_scan = (payment_recived_by_lab + payment_recived_by_xray + payment_recived_by_scan )
    
                        lab_xray_scan_amount = (parseInt($('#lab_amount').val())+parseInt($('#xray_amount').val())+parseInt($('#scan_amount').val()))
                        
                        lab_xray_scan_balance_amount = (parseInt(data.appointment_amount.balance_lab_amount) + parseInt(data.appointment_amount.balance_xray_amount) + parseInt(data.appointment_amount.balance_scan_amount))

                        total_amount  = (parseInt(data.appointment_amount.op_payment_data.doctor_fees) + parseInt(data.appointment_amount.op_payment_data.dressing) +parseInt(data.appointment_amount.op_payment_data.neb) + lab_xray_scan_amount);

                        $("#OP_Total_Amount").text(total_amount);
                        $("#overall_totaltext").text(total_amount);
                        $("#totalAmount").val(total_amount)

                        balance_amount = parseInt(data.appointment_amount.op_payment_data.doctor_fees + lab_xray_scan_balance_amount ) ;
                        $("#balanceAmountText").text(balance_amount);
                        $("#PrevbalanceAmountText").text(balance_amount);
                        $("#overallBalance").val(balance_amount)
                        $("#existing_balance").val(balance_amount);
                        $("#balanceValue").val(balance_amount)
                        $("#from_op_balance").val(balance_amount)
    

                    }


                    
                },
                error: function(exception) {
                    console.log(exception)
                }
            });
        }
    
        // Get Patient amount Using Ajax
    
        getAmountData()

        function paymentSection(){

            $('#Appointment_PaymentForm').trigger('reset')

            $(".feesAmount").attr("readonly", false);
            $(".feesAmount").prop("disabled", false);


            $("#firstPayment").val("True");


            $("#nowPayingAmount").val("0");
            $("#balanceValue").val("0");
            $("#paymentReceived").val("0");
            $("#existing_balance").val("0");

            $("#totalAmount").val("0");
            $("#overallTotal").val("0");
            $("#totalAmount_after_discount").val("0");
            $("#totalAmount_after_discountText").text("0");
            $("#totalAmount_after_refund").val("0");
            $("#totalAmount_after_refundText").text("0");
            $("#OP_Total_Amount").text("0");
            $("#discount_amount").val(0);
            $("#refund_amount").val(0);
            $("#nowPayingAmountText").text("0");

            // $("#overallBalance").val('0');

            
            $("#patientId").val(thisAppointmentData.patient_id);
            $("#appointmentId").val(thisAppointmentData.id);
            
            $(".OPAdmitID").text(thisAppointmentData.id);
            $(".OPAdmitReason").text(thisAppointmentData.reason);

            $(".appointedPatientPlace").text(thisAppointmentData.patient_place);
            $(".appointedPatientPhone").text(thisAppointmentData.patient_phone);
            
            $(".appointedPatientId").text(thisAppointmentData.patient_id);
            $(".appointedPatientName").text(thisAppointmentData.patient_name);
            $(".appointedPatientAge").text(thisAppointmentData.patient_age);
            $(".appointedPatientGender").text(thisAppointmentData.patient_gender);
            $(".appointedDate").text(moment(new Date(thisAppointmentData.appointment_date)).format("DD-MM-YYYY"));
            $(".doctor_name").text(thisAppointmentData.doctor_name);
    
             
            $(".appointmentInfoSection").hide();
            $(".appointment_GetpaymentSection").show();
            $(".existingPaidAmountView").hide();
            $(".submitBtnSection").show();
            $(".appointmentListDTSection").hide();
            $(".paymentPendingAppointmentListDTSection").hide();
            $(".addNewBtnSection").hide();
            $(".todayOpBackBtnSection").show();
            $(".pendingContainerBackBtnSection").show();
    

    

            $(".feesAmount").on("keyup keydown", function() {
                var sum = 0;
        
                $(".feesAmount").each(function() {
                    if (!isNaN($(this).val()) && ($(this).val()).length != 0) {
                        sum += parseInt(($(this).val()));
        
                        $("#OP_Total_Amount").text(lab_xray_scan_amount+sum);
                        $("#overall_totaltext").text(lab_xray_scan_amount+sum);
                        $("#totalAmount").val(lab_xray_scan_amount+sum);
                        var balance =  (sum - parseInt($("#paymentReceived").val())-parseInt($("#discount_amount").val()) - parseInt($("#refund_amount").val()))
                        $("#balanceValue").val(lab_xray_scan_balance_amount + sum)
                        $("#balanceAmountText").text(lab_xray_scan_balance_amount + balance);
                        $("#totalAmount_after_discountText").text(lab_xray_scan_balance_amount + balance);
                        $("#overallBalance").val(lab_xray_scan_balance_amount + balance);
                        $("#totalAmount_after_discount").val(lab_xray_scan_balance_amount + balance);
                        if ((parseInt($("#discount_amount").val()) > 0 || parseInt($("#refund_amount").val()) > 0)) {

                            $("#OP_Total_Amount").text((lab_xray_scan_amount + sum) - parseInt($("#discount_amount").val()))
                            $("#totalAmount_after_discountText").text((lab_xray_scan_amount + sum) - parseInt($("#discount_amount").val()))
                            $("#totalAmount_after_discount").val((lab_xray_scan_amount + sum) - parseInt($("#discount_amount").val()))

                            $("#totalAmount_after_refundText").text((lab_xray_scan_amount + sum) - parseInt($("#refund_amount").val()))
                            $("#totalAmount_after_refund").val((lab_xray_scan_amount + sum) - parseInt($("#refund_amount").val()))

                        }

                    } else {
                        $(this).val(0)
                    }
                })
            });
        
            $(".feesAmount").click(function() {
                $(this).select()
            })
        
        
            $(".amountCollectionValue").on("keyup", function() {
                var sum = 0;
        
                $(".amountCollectionValue").each(function() {
        
                    if (!isNaN($(this).val()) && ($(this).val()).length != 0) {
                        sum += parseInt(($(this).val()));
        
                        $("#paymentReceived").val(parseInt(sum));
        
                        $("#nowPayingAmountText").text(parseInt(sum));
        
                        $("#nowPayingAmount").val(parseInt(sum));
        
                        var ExistingBalance = parseInt($("#balanceValue").val());
                        if (ExistingBalance > 0) {
                            var CurrentBalance = (ExistingBalance - parseInt(sum)-parseInt($("#discount_amount").val()) - parseInt($("#refund_amount").val()));
                            if (CurrentBalance >= 0) {
                                $("#balanceAmountText").text(CurrentBalance);
                                $("#overallBalance").val(CurrentBalance)
                            } else {
                                $("#balanceAmountText").text(CurrentBalance);
                                $("#overallBalance").val(CurrentBalance)
        
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
                            $("#balanceAmountText").text((lab_xray_scan_balance_amount - sum)-parseInt($("#discount_amount").val())- parseInt($("#refund_amount").val()));
                            $("#overallBalance").val((lab_xray_scan_balance_amount - sum)-parseInt($("#discount_amount").val()) - parseInt($("#refund_amount").val()))
                        }
        
                    } else {
                        $(this).val(0)
                    }
        
                })
            });
        
            $('.amountCollectionValue').click(function() {
                $(this).select();
            });



            $(".discountValue").on("keyup", function () {
                var sum = 0;

                var ExistingBalance = parseInt($("#balanceValue").val());
                if ($(this).val() != '') {
                    sum += parseInt(($(this).val()));
                }
                else {
                    $(this).val(0)
                    $("#discount_amount").val(0)
                }

                if (sum > 0) {

                    $("#discount_amount").val(parseInt(sum));

                    if (ExistingBalance >= sum ) {
                        $("#balanceAmountText").text(ExistingBalance  - parseInt(sum) - parseInt($("#paymentReceived").val()) - parseInt($("#refund_amount").val()));
                        $("#overallBalance").val(ExistingBalance - parseInt(sum) - parseInt($("#paymentReceived").val()) - parseInt($("#refund_amount").val()))
                            $("#OP_Total_Amount").text(ExistingBalance - sum)
                            $("#totalAmount_after_discountText").text(ExistingBalance - sum)
                            $("#totalAmount_after_discount").val(ExistingBalance - sum)
                        } else {
                        $("#balanceAmountText").text(ExistingBalance - parseInt(sum) - parseInt($("#paymentReceived").val()) - parseInt($("#refund_amount").val()));
                        $("#overallBalance").val(ExistingBalance  - parseInt(sum) - parseInt($("#paymentReceived").val()) - parseInt($("#refund_amount").val()))
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
                    $("#balanceAmountText").text(ExistingBalance- parseInt($("#paymentReceived").val()) - parseInt($("#refund_amount").val()));
                    $("#overallBalance").val(ExistingBalance- parseInt($("#paymentReceived").val()) - parseInt($("#refund_amount").val()))
                    $("#OP_Total_Amount").text(ExistingBalance)
                    $("#totalAmount_after_discountText").text(ExistingBalance)
                    $("#totalAmount_after_discount").val(ExistingBalance)
                    $("#discount_amount").val(0)
                }
            });

            $('.discountValue').click(function () {
                $(this).select();
            });



            $(".refundValue").on("keyup key", function () {
                var sum = 0;

                var ExistingBalance = parseInt($("#balanceValue").val());

                if ($(this).val() != '') {
                    sum += parseInt(($(this).val()));
                }
                else {
                    $(this).val(0)
                    $("#refund_amount").val(0)
                }

                if (sum > 0) {

                    $("#refund_amount").val(parseInt(sum));

                    if (ExistingBalance >= sum ) {
                        $("#balanceAmountText").text(ExistingBalance  - parseInt(sum) - parseInt($("#paymentReceived").val()) - parseInt($("#discount_amount").val()));
                        $("#overallBalance").val(ExistingBalance - parseInt(sum) - parseInt($("#paymentReceived").val()) - parseInt($("#discount_amount").val()))
                            $("#totalAmount_after_refundText").text(ExistingBalance - sum)
                            $("#totalAmount_after_refund").val(ExistingBalance - sum)
                        } else {
                        $("#balanceAmountText").text(ExistingBalance - parseInt(sum) - parseInt($("#paymentReceived").val()) - parseInt($("#discount_amount").val()));
                        $("#overallBalance").val(ExistingBalance  - parseInt(sum) - parseInt($("#paymentReceived").val()) - parseInt($("#discount_amount").val()))
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
                        $("#balanceAmountText").text(ExistingBalance- parseInt($("#paymentReceived").val()) - parseInt($("#discount_amount").val()));
                        $("#overallBalance").val(ExistingBalance- parseInt($("#paymentReceived").val()) - parseInt($("#discount_amount").val()))
                        $("#totalAmount_after_refundText").text('0')
                        $("#totalAmount_after_refund").val(ExistingBalance)
                        $("#refund_amount").val(0)
                }
            });

            $('.refundValue').click(function () {
                $(this).select();
            });

            

        }
    }

    function GetPendingPaymentFunc(thisAppointmentData)
    {
        pending_amount_id = thisAppointmentData.id

        $("#patientId").val(thisAppointmentData.patient_id);
        $("#appointmentId").val(thisAppointmentData.id);
        
        $(".OPAdmitID").text(thisAppointmentData.id);
        $(".OPAdmitReason").text(thisAppointmentData.reason);

        

        $(".appointedPatientPlace").text(thisAppointmentData.patient_place);
        $(".appointedPatientPhone").text(thisAppointmentData.patient_phone);

        $(".appointedPatientId").text(thisAppointmentData.patient_id);
        $(".appointedPatientName").text(thisAppointmentData.patient_name);
        $(".appointedPatientAge").text(thisAppointmentData.patient_age);
        $(".appointedPatientGender").text(thisAppointmentData.patient_gender);
        $(".appointedDate").text(moment(new Date(thisAppointmentData.appointment_date)).format("DD-MM-YYYY"));
        $(".doctor_name").text(thisAppointmentData.doctor_name);

       
        $(".appointmentInfoSection").hide();
        $(".appointment_GetpaymentSection").show();
        $(".existingPaidAmountView").show(); 
        $(".submitBtnSection").show();

        pendingAmountData();


        $(".amountCollectionValue").on("keyup", function() {
            var sum = 0;
    
            $(".amountCollectionValue").each(function() {
    
                if (!isNaN($(this).val()) && ($(this).val()).length != 0) {
                    sum += parseInt(($(this).val()));
    
                    $("#paymentReceived").val(parseInt(sum));
    
                    $("#nowPayingAmountText").text(parseInt(sum));
    
                    $("#nowPayingAmount").val(parseInt(sum));
    
                    var ExistingBalance = parseInt($("#balanceValue").val());
    
                    if (ExistingBalance > 0) {
                        var CurrentBalance = ExistingBalance - parseInt(sum);
    
                        if (CurrentBalance >= 0) {
                            $("#balanceAmountText").text(CurrentBalance-parseInt($("#discount_amount").val()) - parseInt($("#refund_amount").val()));
                            $("#overallBalance").val(CurrentBalance-parseInt($("#discount_amount").val()) - parseInt($("#refund_amount").val()))
                        } else {
                            $("#balanceAmountText").text(CurrentBalance-parseInt($("#discount_amount").val()) - parseInt($("#refund_amount").val()));
                            $("#overallBalance").val(CurrentBalance-parseInt($("#discount_amount").val()) - parseInt($("#refund_amount").val()))
    
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
    
        $('.amountCollectionValue').click(function() {
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

            console.log(ExistingBalance)

            if (sum > 0) {

                $("#discount_amount").val(parseInt(sum));
                $("#OP_Total_Amount").text(parseInt($('#totalAmount').val()) - sum);
                $("#totalAmount_after_discountText").text(parseInt($('#totalAmount').val()) - sum);
                $("#totalAmount_after_discount").val(parseInt($('#totalAmount').val()) - existing_discount - sum);
                $("#balanceAmountText").text(ExistingBalance - parseInt($("#paymentReceived").val()) - sum  - parseInt($("#refund_amount").val()));
                $("#overallBalance").val(ExistingBalance - parseInt($("#paymentReceived").val()) - sum  - parseInt($("#refund_amount").val()))


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
                $("#OP_Total_Amount").text($('#totalAmount').val());
                $("#balanceAmountText").text(ExistingBalance - $("#paymentReceived").val()  - parseInt($("#refund_amount").val()));
                $("#overallBalance").val(ExistingBalance - $("#paymentReceived").val()  - parseInt($("#refund_amount").val()))
                $("#totalAmount_after_discountText").text('0')
                $("#totalAmount_after_discount").val(0)
                $("#discount_amount").val(0);
            }
        });

        $('.discountValue').click(function () {
            $(this).select();
        });


        $(".refundValue").on("keyup", function () {
            var sum = 0;
            if ($(this).val() != '') {
                sum += parseInt(($(this).val()));
            }
            else {
                $(this).val(0)
                sum = 0
            }

            var ExistingBalance = parseInt($("#balanceValue").val());
             
            var existing_refund = parseInt($('#existing_refund').val());

            console.log(ExistingBalance)

            if (sum > 0) {

                $("#refund_amount").val(parseInt(sum));
                $("#totalAmount_after_refundText").text(parseInt($('#totalAmount').val()) - sum);
                $("#totalAmount_after_refund").val(parseInt($('#totalAmount').val()) - existing_refund - sum);
                $("#balanceAmountText").text(ExistingBalance - parseInt($("#paymentReceived").val()) - sum - parseInt($("#discount_amount").val()));
                $("#overallBalance").val(ExistingBalance - parseInt($("#paymentReceived").val()) - sum - parseInt($("#discount_amount").val()))


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
                $("#balanceAmountText").text(ExistingBalance - $("#paymentReceived").val() - parseInt($("#discount_amount").val()));
                $("#overallBalance").val(ExistingBalance - $("#paymentReceived").val() - parseInt($("#discount_amount").val()))
                $("#totalAmount_after_refundText").text('0')
                $("#totalAmount_after_refund").val(0)
                $("#refund_amount").val(0);
            }
        });

        $('.refundValue').click(function () {
            $(this).select();
        });




    }

    function ViewPaymentFunc(thisPaymentData)
    {
        pending_amount_id = thisPaymentData.id
        
        $(".existingPaidAmountView").show();
        $(".GoBackBtnView").show();       
        
        $(".invoicePrintSection").show();

        $("#invoice_PatientId").text(thisPaymentData.patient_id);
        $("#invoice_PatientName").text(thisPaymentData.patient_name);
        $("#invoice_PatientAge").text(thisPaymentData.patient_age);
        $("#invoice_PatientGender").text(thisPaymentData.patient_gender);
        $(".invoice_AppointementID").text(thisPaymentData.id);
        $("#invoice_AppointementDate").text(moment(new Date()).format("DD-MM-YYYY"))

        pendingAmountData();
    }

    

    function pendingAmountData()
    {
        var GetAmountDataUrl = $('#GetAmountDataUrl').data('url')

        $.ajax({
            type: "GET",
            url: GetAmountDataUrl+"?appointment_id="+pending_amount_id,
            success: function(data) {

                var DataObj = data['appointment_amount'];

                console.log(DataObj)
                $('#paymentrecived_by_doctor').text(data.appointment_amount.op_payment_data.payment_recived_by_doctor)

                $('#lab_amount ').val(data['appointment_amount'].lab_amount)
                $('.Lab_fees ').text(data['appointment_amount'].lab_amount)
                $('#paid_lab_amountText').text(data.appointment_amount.lab_amount - data.appointment_amount.balance_lab_amount)


                $('#xray_amount ').val(data['appointment_amount'].xray_amount)
                $('.Xray_fees ').text(data['appointment_amount'].xray_amount)
                $('#paid_xray_amountText').text(data.appointment_amount.xray_amount - data.appointment_amount.balance_xray_amount)

                $('#scan_amount ').val(data['appointment_amount'].scan_amount)
                $('.Scan_fees ').text(data['appointment_amount'].scan_amount)
                $('#paid_scan_amountText').text(data.appointment_amount.scan_amount - data.appointment_amount.balance_scan_amount)


                $("#OP_Total_Amount").text(data['appointment_amount'].op_payment_data['total_amount']);
                $("#overall_totaltext").text(data['appointment_amount'].op_payment_data['total_amount']);
                $("#totalAmount").val( data['appointment_amount'].op_payment_data['total_amount']);

                
                $("#balanceAmountText").text(data['appointment_amount'].op_payment_data['balance']);
                $("#PrevbalanceAmountText").text(data['appointment_amount'].op_payment_data['balance']);
                $("#balanceValue").val( data['appointment_amount'].op_payment_data['balance']);
                $("#overallBalance").val(data['appointment_amount'].op_payment_data['balance'])

                $("#existingpaidAmountText").text(data['appointment_amount'].op_payment_data['already_paid']);
                $("#existing_balance").val( parseInt(data['appointment_amount'].op_payment_data['balance']));

                $("#outPatientPaymentId").val( parseInt(data['appointment_amount'].op_payment_data['op_payment_id']));

                $('#totalAmount_after_discountText').text(data['appointment_amount'].op_payment_data['total'])
                // $('#discount').val(data['appointment_amount'].op_payment_data['total_after_discount'])
                $('#existing_discount').val(data['appointment_amount'].op_payment_data['discount'])
                $("#existingDiscountText").text(data['appointment_amount'].op_payment_data['discount']);
                $('#existing_refund').val(data['appointment_amount'].op_payment_data['refund'])
                $("#existingRefundText").text(data['appointment_amount'].op_payment_data['refund']);


                $("#doctor_fees").val( data['appointment_amount'].op_payment_data['doctor_fees'])
                $("#neb").val( data['appointment_amount'].op_payment_data['neb'])
                $("#dressing").val( data['appointment_amount'].op_payment_data['dressing'])


                $("#injection").val( data['appointment_amount'].op_payment_data['injection'])
                $("#one_touch").val( data['appointment_amount'].op_payment_data['one_touch'])
                $("#others").val( data['appointment_amount'].op_payment_data['others'])



                $(".InvoiceSection").empty();

                $.each(DataObj.charge_details, function(feetext, feevalue) {
                    if(parseFloat(feevalue) > 0){

                        var feetext_alter = feetext.replace(/\_/g, ' ');

                        var AppendText = '<tr>\
                                            <td>'+feetext_alter.toUpperCase()+'</td>\
                                            <td class="text-end">'+feevalue+'</td>\
                                        </tr>';
                        $(".OP_Invoice_Section").append(AppendText);
                    }
                });

                $.each(DataObj.payment_data, function(text, value) {
                    if(parseFloat(value) > 0){
                        var text_alter = text.replace(/\_/g, ' ');
                        var AppendText = '<p class="text-capitalize">'+text_alter+'<span class="pull-right">₹ '+value+'</span></p>';
                        $(".OP_Payment_Section").append(AppendText);
                    }                   
                });
               
              
                $(".Invoice_AmountSection").append('<p class="">Sub-Total <span class="Invoice_SubTotal pull-right">₹ ' + DataObj.op_payment_data['total_amount'] +'</span></p>');
                if(DataObj.op_payment_data['discount'] >0){
                    $(".Invoice_AmountSection").append('<p class="mb-0">Discount <span class="Invoice_Discount pull-right">₹ ' + DataObj.op_payment_data['discount'] +'</span></p>');
                }
                $(".Invoice_AmountTotal").append('<h4>Total Amount <span class="Invoice_Total">₹ ' +  (parseInt(DataObj.op_payment_data['total_amount']) - parseInt(DataObj.op_payment_data['discount'])) +'</span></h4>');
                if(DataObj.op_payment_data['already_paid'] > 0) {
                    $(".Invoice_Paid").text('₹ ' + DataObj.op_payment_data['already_paid']);
                    $(".Invoice_Balance").text('₹ ' + DataObj.op_payment_data['balance']);
                } else {
                    $(".Invoice_TransactionSection").hide()
                }
            },
            error: function(exception) {
                console.log(exception)
            }
        });
    }

    // Get Patient pending amount Using Ajax

    
    $("#Appointment_PaymentForm").submit(function (e) {

        e.preventDefault();

        if (parseInt($("#overallBalance").val()) >= 0) {
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

                    var GetPaymentUrl = $("#GetPaymentUrl").data("url");

                    var PaymentData = [{
                        'first_payment': $("#firstPayment").val(),
                        'outPatientPaymentId': parseInt($('#outPatientPaymentId').val()),
                        'appointment_id': parseInt($("#appointmentId").val()),
                        'patient_id': parseInt($("#patientId").val()),
                        'doctor_fees': parseInt($("#doctor_fees").val()),
                        'injection': parseInt($("#injection").val()),
                        'one_touch': parseInt($("#one_touch").val()),
                        'dressing': parseInt($("#dressing").val()),
                        'others': parseInt($("#others").val()),
                        'neb': parseInt($("#neb").val()),
                        'lab': parseInt($("#lab_amount").val()),
                        'xray': parseInt($("#xray_amount").val()),
                        'scan': parseInt($("#scan_amount").val()),

                        'total': parseInt($("#totalAmount").val()),
                        
                        'existing_balance': parseInt($("#existing_balance").val()),
                        'paid': parseInt($("#paymentReceived").val()),
                        'balance': parseInt($("#overallBalance").val()),
                        'cash': parseInt($("#cash").val()),
                        'upi': parseInt($("#upi").val()),
                        'card': parseInt($("#card").val()),
                        'discount': parseInt($("#discount").val()),
                        'totalAmount_after_discount': parseInt($("#totalAmount_after_discount").val()),

                        // 'refund': parseInt($("#refund").val()),
                        'refund': parseInt(0),
                        'totalAmount_after_refund': parseInt($("#totalAmount_after_refund").val()),
                        'refund_type': $("#refund_type").val(),
                        'refund_note': $("#refund_note").val(),
                    }];

                    $.ajax({
                        type: "POST",
                        headers: {
                            'X-CSRFToken': $.cookie("csrftoken"),
                            'Content-Type': 'application/json',
                        },
                        url: GetPaymentUrl,
                        data: JSON.stringify({
                            'PaymentData': PaymentData
                        }),
                        success: function(msg) {
                            location.reload()
                        },
                        error: function(exception) {
                            console.log(exception)
                        }
                    });

                } else if (result.dismiss == 'cancel') {
                    e.preventDefault()
                }
            })
        }
        else
        {
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
            return false
        }
     


    })



    $('#addAppointmentForm').submit(function (e) {
        // e.preventDefault();

        var doctor_checkup_master_Obj = []

            $('.doctor_checkup_master_list').each(function () {


                    var all_data = {
                        id: $(this).find('input[name="doctor_checkup_master_fields"]').attr('id'),
                        name: $(this).find('input[name="doctor_checkup_master_fields"]').data('name'),
                        value: $(this).find('input[name="doctor_checkup_master_fields"]').val(),
                        unit: $(this).find('input[name="doctor_checkup_master_fields"]').data('unit'),
                    }
                    doctor_checkup_master_Obj.push(all_data)

            });

            console.log(doctor_checkup_master_Obj)

        $('#health_checkup_master_created').val(JSON.stringify(doctor_checkup_master_Obj))

    });


    $('#OP_refundForm').submit(function(e){
        if(parseInt($('#refund').val()) >= parseInt($("#totalAmount").val())){
            e.preventDefault();
            iziToast.error({
                timeout: 2000,
                balloon: true,
                overlay: true,
                displayMode: 'once',
                id: 'error',
                title: 'Error',
                zindex: 99999999,
                message: '<b>Amount is high compare to Total&nbsp;&nbsp;'  +parseInt($("#totalAmount").val())+'</b>',
            });
        }

        else if(parseInt($('#existing_refund').val()) >= parseInt($("#totalAmount").val())){
            e.preventDefault();
            iziToast.error({
                timeout: 2000,
                balloon: true,
                overlay: true,
                displayMode: 'once',
                id: 'error',
                title: 'Error',
                zindex: 99999999,
                message: '<b>Reached Maximum Amount of Refund</b>',
            });
            
        }
        
        else{$(this).submit()}

        
    })






    $(".DownloadReport").click(function(e) {
        // getPDF();
        $(".canvas_div_pdf").printThis({
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

    $(".nav-tabs .nav-link").click(function(e) {
    
        if ($('.appointmentInfoSection').is(":visible")){
            $(".appointmentInfoSection").toggle();
        }

        if ($('.appointment_GetpaymentSection').is(":visible")){
            $(".appointment_GetpaymentSection").toggle();
        }

        if ($('.invoicePrintSection').is(":visible")){
            $(".invoicePrintSection").toggle();
        }

        if ($('.appointmentListDTSection').is(":hidden")){
            $(".appointmentListDTSection").toggle();
        }

        if ($('.paymentPendingAppointmentListDTSection').is(":hidden")){
            $(".paymentPendingAppointmentListDTSection").toggle();
        }

        if ($('.todayOpPrintBtnSection').is(":visible")){
            $(".todayOpPrintBtnSection").toggle();
        }

        if ($('.todayOpBackBtnSection').is(":visible")){
            $(".todayOpBackBtnSection").toggle();
        }

        if ($('.addNewBtnSection').is(":hidden")){
            $(".addNewBtnSection").toggle();
        }
        

        if ($('.pendingContainerPrintBtnSection').is(":visible")){
            $(".pendingContainerPrintBtnSection").toggle();
        }

        if ($('.pendingContainerBackBtnSection').is(":visible")){
            $(".pendingContainerBackBtnSection").toggle();
        }


    });






})