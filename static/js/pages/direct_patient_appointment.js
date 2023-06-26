$(document).ready(function(){




    function get_lab_data() {

        $.ajax({
            type: "GET",
            url: $('#LabTest_Data_Url').data('url'),
            success: function (data) {
                var DirectLabObj = data.labtestfordirectpatientdata;
                // var PatientData_Lab = $.merge(DirectLabObj);
                PatientData_Lab_Scan_DT(DirectLabObj);
            },
            error: function (exception) {
                console.log(exception)
            }

        })

    }

    get_lab_data();

    /* setInterval(function () {
        get_lab_data();
    }, 30000) */




    function PatientData_Lab_Scan_DT(dataObj) {

        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(dataObj);

        if ($.fn.dataTable.isDataTable("#direct_lab_sacn_dt")) {
            $("#direct_lab_sacn_dt").DataTable().destroy();
        }

        var patientListDatatable = $("#direct_lab_sacn_dt").DataTable({
            data: dataObj,
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
                    "title": "Date",
                    "data": "created_time"
                },
                {
                    "title": "Name",
                    "data": "patient_name"
                },
                {
                    "title": "Patient Type",
                    "data": "patient_type"
                },
                {
                    "title": "Age",
                    "data": "patient_age"
                },
                {
                    "title": "Phone",
                    "data": "phone"
                },
                {
                    "title": "Address",
                    "data": "patient_address"
                },
            ],
            columnDefs: [
                {
                    "targets": 0,
                    "visible": true
                },
                {
                    "targets": 1,
                    "render": function (data, type, row) {
                        return (
                            '<h2 class="table-avatar">\
                                '+moment(new Date(data)).format("DD-MM-YYYY")+' ' + moment(new Date(data)).format("HH:mm A") +'\
                                    </h2>'
                        )
                    }
                },
                {
                    "targets": 2,
                    "render": function (data, type, row) {
                        var fatherNameText = "";
                        if (row.father_name != "") {
                            if (row.patient_gender == "Male") { fatherNameText = "( S/O " + row.father_name + " )" }
                            else { fatherNameText = "( D/O " + row.father_name + " )" }
                        }
                        else {
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
                    "targets": 4,
                    "render": function (data, type, row) {
                        return (
                            '<h2 class="table-avatar">\
                                <a href="javascript:void(0)">' + data + ' <span style="text-align:left"> ( ' + row.patient_gender + ' )</span> </a>\
                            </h2>'
                        )
                    }
                },
                {
                    "targets": 7,
                    "data": null,
                    "title": "Status",
                    "render": function (data, type, row) {

                        var paymentHtml = ''

                        if (row.status == 1) {
                            paymentHtml += '<span class="me-1" style="color:#40b134;font-weight: bold;">Paid @ Reception </span>'
                        }else {
                            var viewpayment = '';
                           
                            if(row.complete == true) {
                                paymentHtml += '<span class="me-1" style="color:#0d6efd;font-weight: bold;">Complete</span>'
                            }else if (row.total_amount == row.balance) {
                                paymentHtml += '<span class="me-1" style="color:#ffbf00;font-weight: bold;">Not Paid</span>'
                            }else if (row.balance > 0) {
                                paymentHtml += '<span class="me-1" style="color:#e54343;font-weight: bold;">Pending</span>'
                            }else if (row.balance == 0) {
                                paymentHtml += '<span class="me-1" style="color:#0d6efd;font-weight: bold;">Compleate</span>'
                            }

                        }
                        return paymentHtml

                    }
                },
                {
                    "targets": 8,
                    "data": null,
                    "title": "Action",
                    "render": function (data, type, row) {
                        
                        var actionHtml = "";
                        var Type = '';
                        if (row.patient_type == 'Out Patient'){
                            Type = 'out_patient';
                        }  
                        if (row.patient_type == 'In Patient'){
                            Type = 'in_patient';
                        }  
                        if (row.patient_type == 'Direct Patient'){
                            Type = 'direct_patient';
                        }  

                        var return_url = 'appointment'

                        actionHtml += "<a class='' href = '/lab/patient_lt_report/"+Type+"/"+row.id+"/"+return_url+"'>\
                                        <i class='fa fa-sticky-note me-2'></i></i></a>"


                        if (row.status == 1) {
                            actionHtml += ""
                        }else {
                            if (row.balance != 0) {
                                actionHtml += "<a class='lab_payment'\
                                                    data-val='" + JSON.stringify(row) + "' href='javascript:void(0);'>\
                                                    <i class='fas fa-rupee-sign me-2'></i>\
                                                </a>";
                            }
                        }

                        actionHtml += "<a class='' href = '/lab/patient_lab_payment_report/"+Type+"/"+row.id+"/"+return_url+"'>\
                                        <i class='fas fa-rupee-sign me-2'></i></a>";

                        return actionHtml;
                    }
                }
            ]

        })
    };


    var POST_URL = ''
    var initial_pay = false

    $('#direct_lab_sacn_dt').on('click', ".lab_payment" , function(){

        thisdata = $(this).data('val')
        console.log(thisdata)
        POST_URL = $('#lab_payment').data('url')
        initial_pay = true
        $("#lab_select2").prop('required', false)
        

        $(".addNewBtnSection").hide();
        $(".patientDetailsSection").show();
        $(".test_shoud_take").hide();
        $(".show_patient_details").show();

        $("#patientId").val(thisdata.patient_id);
        $("#appointmentId").val(thisdata.id);
        
        $(".OPAdmitID").text(thisdata.id);
        $(".OPAdmitReason").text(thisdata.reason);

        $(".appointedPatientPlace").text(thisdata.patient_address);
        $(".appointedPatientPhone").text(thisdata.patient_phone);
        
        $(".appointedPatientId").text(thisdata.patient_id);
        $(".appointedPatientName").text(thisdata.patient_name);
        $(".appointedPatientAge").text(thisdata.patient_age);
        $(".appointedPatientGender").text(thisdata.patient_gender);
        $(".appointedDate").text(moment(new Date(thisdata.appointed_date)).format("DD-MM-YYYY"));
        $(".doctor_name").text(thisdata.doctor_name);


        $(".direct_testSection").hide();
        $(".Lab_Testing_Section").show();
        $(".todayOpBackBtnSection").show();
        $(".appointmentListDTSection").hide();


        $('.direct_lab_GetpaymentSection').show()
        $('#Lab_Report_Form').trigger('reset')

            patient_type = thisdata.patient_type


            if (thisdata.total_amount == thisdata.balance) {
                $('.direct_existingPaidAmountView').hide();
            }
            else if (thisdata.balance > 0) {
                $('.direct_existingPaidAmountView').show();
            }

            $("#patientId").val(thisdata.patient_id);

            $("#LabTestId").val(thisdata.id);

            $('#direct_totalAmountText').text(thisdata.total_amount)
            $('#direct_balanceAmountText').text(thisdata.balance)
            $('#direct_existingpaidAmountText').text(parseInt(thisdata.total_amount - thisdata.balance))
            $('#direct_existingdiscountAmountText').text(thisdata.discount)

            $('#direct_totalAmount').val(thisdata.total_amount)
            $('#direct_balanceValue').val(thisdata.balance)

            $('#direct_existingpaidAmountText').text(parseInt(thisdata.total_amount - thisdata.balance))


             if (patient_type == "Direct Patient") {
                $('#direct_labtest_Id').val(thisdata.id)
                $("#patient_appointment_Id").val(0);
                $("#patient_IP_assignid").val(0);
                $("#patient_Ward_assignid").val(0);
                $('.discount_section').show()
                $('#direct_existingpaidAmountText').text(parseInt(thisdata.paid))

            }


            paymentsection();

        

    })


    function paymentsection(){

        $(".direct_amountCollectionValue").on("keyup", function() {
            var sum = 0;
    
            $(".direct_amountCollectionValue").each(function() {
    
                if (!isNaN($(this).val()) && ($(this).val()).length != 0) {
                    sum += parseInt(($(this).val()));
    
                    $("#direct_paymentReceived").val(parseInt(sum));
    
                    $("#direct_nowPayingAmountText").text(parseInt(sum));
    
                    $("#direct_nowPayingAmount").val(parseInt(sum));
                    var balance_amount = (parseInt($('#direct_balanceValue').val()- sum) - $("#direct_discount_amount").val())  
                    var total_amount =   parseInt($('#direct_totalAmount').val()) 
                    console.log(balance_amount)
                        $("#direct_balanceAmountText").text(balance_amount);
                        $("#direct_overallBalance").val(balance_amount)

                        if(parseInt($("#direct_overallBalance").val()) < 0 ){

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
    
        $('.direct_amountCollectionValue').click(function() {
            $(this).select();
        });


        $(".direct_discountValue").on("keyup", function () {
            var sum = 0;

            if ($(this).val() != '') {
                sum += parseInt(($(this).val()));
            }
            else {
                $(this).val(0)
                $("#direct_discount_amount").val(0)
            }

            if (sum > 0) {

                $("#direct_discount_amount").val(parseInt(sum));

                $("#direct_nowPayingAmount").val(parseInt(sum));
                var balance_amount = (parseInt($('#direct_balanceValue').val()- sum) - $("#direct_paymentReceived").val())  
                var total_amount =   parseInt($('#direct_totalAmount').val()) 

                

                    $("#direct_balanceAmountText").text(balance_amount);
                    $("#direct_overallBalance").val(balance_amount)
                    $("#direct_totalAmount_after_discountText").text(total_amount - sum)
                    $("#direct_total_after_discount").val(total_amount - sum)


                    if(parseInt($("#direct_overallBalance").val()) < 0 ){

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

                    var balance_amount = parseInt($('#direct_balanceValue').val() - $("#direct_paymentReceived").val())

                    $("#direct_balanceAmountText").text(balance_amount);
                    $("#direct_overallBalance").val(balance_amount)
                    $("#direct_totalAmount_after_discountText").text('0')
                    $("#direct_total_after_discount").val(0)
            }
        });

        $('.direct_discountValue').click(function () {
            $(this).select();
        });

    }


    var LabGroupData = $("#LabGroupData").data("val");

            
    // Group & Test View

   var  patient_type = 'Direct Patient'
   
    $.each(LabGroupData, function(index, Obj) {           
        var AllGroupName = []

        var select2obj = {
            id: Obj.id,
            text : Obj.name
        }

        AllGroupName.push(select2obj);

        $('#lab_select2').select2({
            data: AllGroupName,
            allowClear: true,
            placeholder: "Select Test",
        })
    });

    $('#direct_test').click(function(){

        setTimeout(function() {
            $('#patient_typeahead').focus()
        },200)

        POST_URL = $('#lt_from_appointment').data('url')
        initial_pay = false

        $("#lab_select2").prop('required', true)

        $(".addNewBtnSection").hide();
        $(".show_patient_details").hide();
        $(".patientDetailsSection").hide();
        $(".test_shoud_take").show();
        $(".patient_Select2_Section").show();
        $("#lab_select2").val([]).change();
        $("#patient_typeahead").prop('required',true);
        $("#doctor_direct_test").prop('required',true);

        patient_type = 'Direct Patient'

        $(".direct_testSection").hide();
        $(".Lab_Testing_Section").show();
        $(".todayOpBackBtnSection").show();
        $(".appointmentListDTSection").hide();

        $(".doctor_direct_test").show();
        $('.direct_lab_GetpaymentSection').show()
        $('#Lab_Report_Form').trigger('reset')

        $("#direct_totalAmount").val(0)
        $("#direct_nowPayingAmount").val(0)
        $("#direct_paymentReceived").val(0)
        $("#direct_overallBalance").val(0)
        $("#direct_discount_amount").val(0)
        $("#direct_total_after_discount").val(0)

        $("#direct_totalAmountText").text(0)
        $("#direct_nowPayingAmountText").text(0)
        $("#direct_balanceAmountText").text(0)
        $("#direct_totalAmount_after_discountText").text(0)




        var selected_group_amount = 0
        $('#lab_select2').on('select2:select', function(e) {
            LabGroupData.map(function(obj) { 
                if (obj.id == e.params.data.id){
                    selected_group_amount += obj.amount
                } 
            });
            direct_patinet_amount(selected_group_amount);
        })

        $('#lab_select2').on('select2:unselect', function(e) {
            LabGroupData.map(function(obj) { 
                if (obj.id == e.params.data.id){
                    selected_group_amount = (selected_group_amount - obj.amount)
                } 
            });
            direct_patinet_amount(selected_group_amount);
        })



    })


    function direct_patinet_amount(selected_group_amount){

        $('#direct_totalAmount').val(selected_group_amount);
        $('#direct_balanceValue').val(parseInt( selected_group_amount - $("#direct_paymentReceived").val()-$("#direct_discount_amount").val()))
        $('#direct_totalAmountText').text(selected_group_amount);
        $('#direct_balanceAmountText').text(parseInt( selected_group_amount - $("#direct_paymentReceived").val()-$("#direct_discount_amount").val()))
        $("#direct_total_after_discount").val(parseInt( selected_group_amount - $("#direct_discount_amount").val()))
        $("#direct_overallBalance").val( selected_group_amount - $("#direct_paymentReceived").val()-$("#direct_discount_amount").val())

        $(".direct_amountCollectionValue").on("keyup", function() {
            var sum = 0;
    
            $(".direct_amountCollectionValue").each(function() {
    
                if (!isNaN($(this).val()) && ($(this).val()).length != 0) {
                    sum += parseInt(($(this).val()));
    
                    $("#direct_paymentReceived").val(parseInt(sum));
    
                    $("#direct_nowPayingAmountText").text(parseInt(sum));
    
                    $("#direct_nowPayingAmount").val(parseInt(sum));
                    var balance_amount = (parseInt($('#direct_totalAmount').val()- sum) - $("#direct_discount_amount").val())  
                    var total_amount =   parseInt($('#direct_totalAmount').val()) 

                        $("#direct_balanceAmountText").text(balance_amount);
                        $("#direct_overallBalance").val(balance_amount)

                        if(parseInt($("#direct_overallBalance").val()) < 0 ){

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
    
        $('.direct_amountCollectionValue').click(function() {
            $(this).select();
        });


        $(".direct_discountValue").on("keyup", function () {
            var sum = 0;

            if ($(this).val() != '') {
                sum += parseInt(($(this).val()));
            }
            else {
                $(this).val(0)
                $("#direct_discount_amount").val(0)
            }

            if (sum > 0) {

                $("#direct_discount_amount").val(parseInt(sum));

                $("#direct_nowPayingAmount").val(parseInt(sum));
                var balance_amount = (parseInt($('#direct_totalAmount').val()- sum) - $("#direct_paymentReceived").val())  
                var total_amount =   parseInt($('#direct_totalAmount').val()) 

                

                    $("#direct_balanceAmountText").text(balance_amount);
                    $("#direct_overallBalance").val(balance_amount)
                    $("#direct_totalAmount_after_discountText").text(total_amount - sum)
                    $("#direct_total_after_discount").val(total_amount - sum)


                    if(parseInt($("#direct_overallBalance").val()) < 0 ){

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

                    var balance_amount = parseInt($('#direct_totalAmount').val() - $("#direct_paymentReceived").val())

                    $("#direct_balanceAmountText").text(balance_amount);
                    $("#direct_overallBalance").val(balance_amount)
                    $("#direct_totalAmount_after_discountText").text('0')
                    $("#direct_total_after_discount").val(0)
            }
        });

        $('.direct_discountValue').click(function () {
            $(this).select();
        });
                
    }


    $("#Lab_Report_Form").submit(function(e)
    {
        e.preventDefault();

        var ReportObj = [],
            PatientObj = [],
            OverAllgroupamount = 0;
        PatientObj.push({
            patient_id : $("#patientId").val(),
        });

        var direct_payment_data= [{
            'patient_id' : $("#patientId").val(),
            'patient_type' : patient_type,
            'total': parseInt($('#direct_totalAmount').val()),
            'discount': parseInt($('#direct_discount_amount').val()),
            'total_after_discount': parseInt($('#direct_total_after_discount').val()),
            'paid': parseInt($("#direct_paymentReceived").val()),
            'balance': parseInt($("#direct_overallBalance").val()),
            'cash': parseInt($("#direct_cash").val()),
            'upi': parseInt($("#direct_upi").val()),
            'card': parseInt($("#direct_card").val()),
        }];

        var lab_payment_data= [{
            'LabTestId' : $("#LabTestId").val(),
            'patient_type' : patient_type,
            'Direct_labtest_Id': $('#direct_labtest_Id').val(),
            'OP_appointmentid':0,
            'IP_assignid': 0,
            'Ward_assignid': 0,
            'patient_id' : $("#patientId").val(),
            'patient_type' : patient_type,
            'total': parseInt($('#direct_totalAmount').val()),
            'discount': parseInt($('#direct_discount_amount').val()),
            'total_after_discount': parseInt($('#direct_total_after_discount').val()),
            'paid': parseInt($("#direct_paymentReceived").val()),
            'balance': parseInt($("#direct_overallBalance").val()),
            'cash': parseInt($("#direct_cash").val()),
            'upi': parseInt($("#direct_upi").val()),
            'card': parseInt($("#direct_card").val()),
            'returnLabTestPatient_Id': parseInt($("#returnLabTestPatient_Id").val()) ,
        }];

        if (initial_pay == false){
            if( (patient_type == 'Direct Patient') &&  ((parseInt($('#direct_overallBalance').val()) < 0 )) ){

                e.preventDefault();
    
                iziToast.info({
                    timeout: 1000,
                    balloon: true,
                    overlay: true,
                    displayMode: 'once',
                    id: 'error',
                    title: 'Error',
                    zindex: 99999999,
                    message: '<b>Enter Amount Properly </b>',
                });
            }

            else{
                post_form();
            }
        }

        else{

            if ((patient_type != 'Direct Patient') && ((parseInt($('#direct_overallBalance').val()) < 0) || parseInt($("#direct_paymentReceived").val()) <= 0)) {

                e.preventDefault();

                iziToast.info({
                    timeout: 1000,
                    balloon: true,
                    overlay: true,
                    displayMode: 'once',
                    id: 'error',
                    title: 'Error',
                    zindex: 99999999,
                    message: '<b>Enter Amount Properly </b>',
                });
            }

            else if ((patient_type == 'Direct Patient') && ((parseInt($('#direct_overallBalance').val()) < 0) || (parseInt($('#direct_discount_amount').val()) <= 0 && parseInt($("#direct_paymentReceived").val()) <= 0))) {

                e.preventDefault();

                iziToast.info({
                    timeout: 1000,
                    balloon: true,
                    overlay: true,
                    displayMode: 'once',
                    id: 'error',
                    title: 'Error',
                    zindex: 99999999,
                    message: '<b>Enter Amount Properly </b>',
                });

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
                                <p style="line-height:1.5;font-size:25px">Now Paying : <span style="font-weight : bold"> ₹ ' + parseInt($("#direct_paymentReceived").val()) + '</span></p>\
                                <p style="line-height:1.5;font-size:25px">Balance : <span style="font-weight : bold"> ₹ ' + parseInt($("#direct_overallBalance").val()) + '</span></p>\
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


                        post_form();


                    } else if (result.dismiss == 'cancel') {
                        // e.preventDefault()
                    }
                })

            }

        }


        
        function post_form(){

             if (ReportObj) {
                console.log(direct_payment_data)
                var LabObj = $("#lab_select2").select2("val");
                console.log(lab_payment_data)
    
                $.ajax({
                    type: "POST",
                    headers: {
                        'X-CSRFToken': $.cookie("csrftoken"),
                        'Content-Type': 'application/json',
                    },
                    url: POST_URL,
                    data: JSON.stringify({
                        'ReportObj': ReportObj,
                        'OverAllgroupamount': OverAllgroupamount,
                        'PatientObj': PatientObj,
                        'patient_type' : patient_type,
                        'doctor_direct_test' : $('#doctor_direct_test').val(),
                        'direct_payment_data' : direct_payment_data,
                        'LabObj' : $("#lab_select2").select2("val"),
                        'lab_payment_data': lab_payment_data,
                    }),
                    success: function (msg) {
                        location.reload()
                    }, error: function (exception) {
                        console.log(exception)
                    }
                });
    
            }
        }

    });

    $('.nav-item').click(function(){
        $('.patient_Select2_Section').hide()
        $('.Lab_Testing_Section').hide()
    })

})



