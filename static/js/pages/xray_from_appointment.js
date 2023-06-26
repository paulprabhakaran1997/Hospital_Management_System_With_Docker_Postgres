$(document).ready(function()
{

    function XrayData_AJAX() {

        $.ajax({
            type: "GET",
            url: $('#XrayTest_Data_Url').data('url'),
            success: function (data) {

                var Out_Patients_Xray = data.xray_from_appointmentdata_out;
                var In_Patients_Xray = data.xray_from_appointmentdata_in;
                var Ward_Patients_Xray = data.xray_from_appointmentdata_ward;
              
                $(".XRay-Test-List").empty();

                BuildTestPatientList(Out_Patients_Xray, "cardViewBtn_out", "Out Patient");      //OP
                BuildTestPatientList(In_Patients_Xray, "cardViewBtn_in", "In Patient");         //IP
                BuildTestPatientList(Ward_Patients_Xray, "cardViewBtn_ward", "Ward Patient");     //Ward
              
                var PatientData_Xray = data.xrayforpatientdata;
            
                PatientData_Xray_DT(PatientData_Xray);
            
                //Build TestPatient List
                function BuildTestPatientList(DataObj, testing, PatientType ){
                    
                    $.each(DataObj , function(index , obj){

                        var AppendXrayList = "",StyleClass ="", AdmitID ="";
                        
                        $.each(obj.xray_details , function(Group_Index, Group_Obj) {
                            AppendXrayList += '<li class="mt-1"><i class="fa fa-caret-right"></i> '+Group_Obj.xray_name+'</li>' 
                        });

                        if(PatientType == "Out Patient"){
                            StyleClass = 'secondary';
                            AdmitID = "O.P ID #"+obj.admission_id;
                        }else if(PatientType == "In Patient"){
                            StyleClass = 'primary';
                            AdmitID = "I.P ID #R-"+obj.admission_id;
                        }else if(PatientType == "Ward Patient"){
                            StyleClass = 'success';
                            AdmitID = "I.P ID #W-"+obj.admission_id;
                        }

                        $('.XRay-Test-List').append("<div class='col-md-3 d-flex'>\
                                                    <div class='card invoices-grid-card w-100'>\
                                                        <div class='card-header d-flex'>\
                                                            <div class='ribbon ribbon-"+StyleClass+" ribbon-right'>"+PatientType+"</div>\
                                                            <a href='javascript:void(0);' class='invoice-grid-link'>\
                                                                <h5 class='mb-0'><strong><span class='text-"+StyleClass+"'>"+ AdmitID+"</span></a></strong></h5>\
                                                        </div>\
                                                        <div class='card-middle'>\
                                                            <h2 class='card-middle-avatar row w-100'>\
                                                                <div class='col-md-2 p-0'>\
                                                                    <a href='javascript:void(0);'><img class='avatar avatar-sm me-2 avatar-img rounded-circle' src='../../static/img/patient-icon.png' alt='User Image'>\
                                                                    </a>\
                                                                </div>\
                                                                <div class='col-md-10 row'>\
                                                                    <div class='col-md-12'>\
                                                                        <h5 class='mb-0'>"+ obj.patient_name + "</h5>\
                                                                    </div>\
                                                                    <div class='col-md-12 mt-2'>\
                                                                        <small>"+ obj.patient_age + " Yrs / "+ obj.patient_gender + "</small>\
                                                                    </div>\
                                                            </div>\
                                                            </h2>\
                                                        </div>\
                                                        <div class='card-body'>\
                                                            <div class='row align-items-center'>\
                                                                <div class='col-12'>\
                                                                    <h6 class='text-danger'><i class='fa fa-exclamation-circle'></i> Suggested X-Ray Tests</h6>\
                                                                    <ul style='padding-left:0px;font-style: oblique;'>\
                                                                        "+ AppendXrayList + "\
                                                                    </ul>\
                                                                </div>\
                                                            </div>\
                                                        </div>\
                                                        <div class='card-footer'>\
                                                        <div class='row'>\
                                                        <div class='col-md-6'>\
                                                            <button type='button' class='btn btn-outline-danger Cancel-Xraybtn' data-val='"+ JSON.stringify(obj) + "'  data-patienttype='"+PatientType+"' >Cancel</>\
                                                        </div>\
                                                        <div class='col-md-6'>\
                                                            <a class='card-link View-Xraybtn badge bg-primary-dark ' data-val='"+ JSON.stringify(obj) + "' data-patienttype='"+PatientType+"' href='javascript:void(0)'>\
                                                                <span class='badge'>View</span>\
                                                            </a>\
                                                        </div>\
                                                    </div>\
                                                        </div>\
                                                    </div>\
                                                </div>");

                    });

                }

                //Build Datatable List
                function PatientData_Xray_DT(dataObj) {
                    (function rec(d) {
                        $.each(d, function (k, v) {
                            if (typeof v === 'object') return rec(v)
                            if (isNaN(v) && typeof v === 'number') d[k] = '---';
                        })
                    })(dataObj);
            
                    if ($.fn.dataTable.isDataTable("#xrayPatientListDT")) {
                        $("#xrayPatientListDT").DataTable().destroy();
                    }
            
                    var PatientData_Xray_DT = $("#xrayPatientListDT").DataTable({
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
                                "targets" : 0,
                                "visible" : true
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
                                "targets" : 2,
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
                                "targets" : 4,
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
                                "targets": 7,
                                "data": null,
                                "title": "Status",
                                "render": function (data, type, row) {
            
                                    var paymentHtml = ''
            
                                    if (row.status == 1) {
            
                                        paymentHtml += '<span class="me-1" style="color:#40b134;font-weight: bold;">Paid @ Reception </span>'
                                    }
                                    else {
                                        var viewpayment = ''
            
                                        if (row.complete == true) {
                                            paymentHtml += '<span class="me-1" style="color:#0d6efd;font-weight: bold;">Complete</span>'
            
                                        }
            
                                        else if (row.total_amount == row.balance) {
                                            paymentHtml += '<span class="me-1" style="color:#ffbf00;font-weight: bold;">Not Paid</span>'
            
                                        }
                                        else if (row.balance > 0) {
                                            paymentHtml += '<span class="me-1" style="color:#e54343;font-weight: bold;">Pending</span>'
            
                                        }
                                        else if (row.balance == 0) {
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
            
                                    actionHtml += "<a class='dropdown-item' href = '/xray/patient_xray_report/"+row.id+"'>\
                                    <i class='fa fa-address-book me-2'></i>   Results</a>"
            
                                    if(row.status == 1){
            
                                            actionHtml += ""
                                    }
                                        else 
                                        {
                                            var viewpayment = ''
            
                                            if(row.balance != 0){
                                                actionHtml += "<a class='dropdown-item xray_payment'\
                                                data-val='" + JSON.stringify(row) + "' href='javascript:void(0);'>\
                                                <i class='fas fa-rupee-sign me-2'></i> Pay</a>"
                                            }
                                            viewpayment +=  "<a class='dropdown-item' href = '/xray/patient_xray_payment_report/"+row.id+"'>\
                                            <i class='fas fa-rupee-sign me-2'></i> View Payment</a>"

                                            actionHtml += viewpayment
            
                                        }
                                    return (
                                            "<div class='dropdown dropdown-action'>\
                                                <a href='javascript:void(0)' class='action-icon dropdown-toggle'\
                                                    data-bs-toggle='dropdown' aria-expanded='false'>\
                                                    <i class='fas fa-ellipsis-h'></i>\
                                                </a>\
                                                <div class='dropdown-menu dropdown-menu-right'>\
                                                    " + actionHtml + "\
                                                </div>\
                                            </div>"
                                    )
                                }
                            },
                        ]
            
                    })
                };


            },
            error: function (exception) {
                console.log("EXception:"+exception);
            }
        });

    }

    XrayData_AJAX();

    setInterval(function () { XrayData_AJAX(); }, 30000)

    var patient_type;

    $(".XRay-Test-List").on('click' , '.View-Xraybtn', function(){
        
        var thisData = $(this).data("val"); 
        patient_type = $(this).data("patienttype");
        var BuildXrayList = "";

        $.each(thisData.xray_details , function(index , Obj) {
            if(index == 0) {
                BuildXrayList += ' ' + Obj.xray_name;
            }else{
                BuildXrayList += ', ' + Obj.xray_name;
            }            
        });

        $("#SuggestedXray").text(BuildXrayList); //Doctor Suggestion List
        $("#admission_id").text(thisData.admission_id);
        $("#patientId").val(thisData.patient_id);

        if(patient_type == "Out Patient"){
            $("#patient_appointment_Id").val(thisData.admission_id);
            $("#patient_IP_assignid").val(0);
            $("#patient_Ward_assignid").val(0);
            $("#admission_id").text("OP ID-"+thisData.admission_id);
        }else if(patient_type == "In Patient"){
            $("#patient_appointment_Id").val(0);
            $("#patient_IP_assignid").val(thisData.admission_id);
            $("#patient_Ward_assignid").val(0);
            $("#admission_id").text("IP ID-"+thisData.admission_id);
        }else if(patient_type == "Ward Patient"){
            $("#patient_appointment_Id").val(0);
            $("#patient_IP_assignid").val(0);
            $("#patient_Ward_assignid").val(thisData.admission_id);
            $("#admission_id").text("WP ID-"+thisData.admission_id);
        }
        
        $("#returnXrayTestPatient_Id").val(thisData.id);
        $("#appointedPatientId").text(thisData.patient_id);
        $("#appointedPatientName").text(thisData.patient_name);
        $("#appointedPatientAge").text(thisData.patient_age);
        $("#appointedPatientGender").text(thisData.patient_gender);
        $("#appointedDate").text(moment(new Date()).format("DD-MM-YYYY"));
        $("#appointedDocter").text(thisData.doctor_name);

        $(".addNewBtnSection").hide();        
        $(".Pending-Xray-Test-Section").hide();
        $(".backBtnSection").show();
        $(".Xray_Section").show();

        $("#XrayTest").val('').trigger('change')
        $("#xray_amount").val('0')

    });


    $(".XRay-Test-List").on('click' , '.Cancel-Xraybtn', function(){


        var thisData = $(this).data("val"); 
        patient_type = $(this).data("patienttype");

        console.log(thisData)

        Swal.fire({
            title: '<span class="trashIcon" style="color: #621aff"><i class="fa fa-info-circle me-1"></i></span>',
            html: '<div class="row" style="margin-top:15px">\
                    <div class="col-md-12">\
                            <div class= "titleSection text-center">\
                                <h4>Are You Sure to Cancel the Test</h4>\
                            </div>\
                    </div >\
                </div >',
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
                    type: "POST",
                    headers: {
                        'X-CSRFToken': $.cookie("csrftoken"),
                        'Content-Type': 'application/json',
                    },
                    url: $('#canceling_xray_url').data('url'),
                    data: JSON.stringify({
                        'patient_type': patient_type,
                        'canceling_xray': thisData.id,
                    }),
                    success: function (msg) {
                        location.reload()
                    }, error: function (exception) {
                        console.log(exception)
                    }
                });

            } else if (result.dismiss == 'cancel') {
                // e.preventDefault()
            }
        })



    });

    var XrayTestList = $("#xraydata").data("val");

    var Xray_Select2_Obj = [];
 
    $.each(XrayTestList , function(index , obj){
        Xray_Select2_Obj.push({ 
                id: obj.id, 
                text: obj.name, 
                amount: obj.amount
        })
    });

    function formatXraySelect2(state) {
        if (state.id) {
            var container = $('<ul class="list-unstyled users-list m-0 avatar-group d-flex align-items-center">\
                                    <li class="fw-bold">' + state.text + '</li>\
                                </ul>')
        }
        return container;
    }
  
    $("#XrayTest").select2({
        data: Xray_Select2_Obj,
        placeholder: "Select X-Ray Type",
        allowClear: true,
        templateResult: formatXraySelect2,
    });

    $("#XrayTest").val("").trigger("change")    
      
    $("#XrayTest").change(function(){

        var TotalAmount = 0;
        var SelctedXrayList = $(this).val();

        if(SelctedXrayList.length != ''){

            $.each(SelctedXrayList , function(index , Obj){ 

                var Xray_Fee = XrayTestList.filter(function (obj) {
                    return obj.id ==  parseInt(Obj) 
                });
                
                TotalAmount += Xray_Fee[0].amount
                $('#Xray-FeeAmount').val(TotalAmount);
            });        

        }
        else{
            $("#Xray-FeeAmount").val('0').trigger('change');
        }       

    });

    $(".backBtn").click(function(){
        $(".backBtnSection").hide();
        $(".Xray_Section").hide();
        $(".addNewBtnSection").show();
        $(".Pending-Xray-Test-Section").show();
    });



    $('#xrayPatientListDT').on('click', ".xray_payment" , function(){

   

        thisdata = $(this).data('val')
        console.log(thisdata)

        
        $('.history_backBtnSection').show()
        $('.printBtnSection').hide()


            $('#Xray_PaymentForm').trigger('reset')
            $("#nowPayingAmountText").text('0');
            $('.xray_GetpaymentSection').show()
            $('.XrayPatientDTSection').hide()

            patient_type = thisdata.patient_type



            if (patient_type == "Out Patient") {
                $("#patient_appointment_Id").val(thisdata.op_appointment_id);
                $("#patient_IP_assignid").val(0);
                $("#patient_Ward_assignid").val(0);
                $(".admission_id").text("OP ID-"+thisdata.op_appointment_id);
            } else if (patient_type == "In Patient") {
                $("#patient_appointment_Id").val(0);
                $("#patient_IP_assignid").val(thisdata.IP_assignid);
                $("#patient_Ward_assignid").val(0);
                $(".admission_id").text("IP ID-"+thisdata.IP_assignid);

            } else if (patient_type == "Ward Patient") {
                $("#patient_appointment_Id").val(0);
                $("#patient_IP_assignid").val(0);
                $("#patient_Ward_assignid").val(thisdata.ward_assignid);
                $(".admission_id").text("WP ID-"+thisdata.ward_assignid);
            }


            $("#patientId").val(thisdata.patient_id);

            $("#XrayTestId").val(thisdata.id);

            $('.patient_info_section').show()
            $(".appointedPatientId").text(thisdata.patient_id);
            $(".appointedPatientName").text(thisdata.patient_name);
            $(".appointedPatientAge").text(thisdata.patient_age);
            $(".appointedPatientGender").text(thisdata.patient_gender);
            $(".appointedPatientPlace").text(thisdata.patient_address);
            $(".appointedPatientPhone").text(thisdata.phone);
            $(".appointedDoctor").text(thisdata.doctor_name);
            $(".appointedDate").text(moment(new Date(thisdata.appointed_date)).format("DD-MM-YYYY"))

            $('#totalAmountText').text(thisdata.total_amount)
            $('#balanceAmountText').text(thisdata.balance)

            $('#totalAmount').val(thisdata.total_amount)
            $('#balanceValue').val(thisdata.balance)

            paymentsection();

        

    })


    function paymentsection(){

        $(".amountCollectionValue").on("keyup", function() {
            var sum = 0;
    
            $(".amountCollectionValue").each(function() {
    
                if (!isNaN($(this).val()) && ($(this).val()).length != 0) {
                    sum += parseInt(($(this).val()));
    
                    $("#paymentReceived").val(parseInt(sum));
    
                    $("#nowPayingAmountText").text(parseInt(sum));
    
                    $("#nowPayingAmount").val(parseInt(sum));
                    var balance_amount = parseInt($('#balanceValue').val())  
                    var total_amount =   parseInt($('#totalAmount').val()) 
    
                        $("#balanceAmountText").text(balance_amount - sum);
                        $("#overallBalance").val(balance_amount - sum)

                        if(parseInt($("#overallBalance").val()) < 0 ){

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
    
        $('.amountCollectionValue').click(function() {
            $(this).select();
        });

    }





    $('.history_backBtn').click(function(){
        $('.history_backBtnSection').hide()
        $('.printBtnSection').hide()
        $('.xray_GetpaymentSection').hide()
        $('.XrayPatientDTSection').show()
        $('.invoicePrintSection').hide()
    })





    $('#Xray_PaymentForm').submit(function(e){
        e.preventDefault();


        if((parseInt($('#balanceValue').val()) < parseInt($("#paymentReceived").val())) || parseInt($("#paymentReceived").val()) <= 0 ){

            e.preventDefault();

            iziToast.info({
                timeout: 1000,
                balloon: true,
                overlay: true,
                displayMode: 'once',
                id: 'error',
                title: 'Error',
                zindex: 99999999,
                message: '<b>Enter Amount Properly</b>',
            });
        }


        else{

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

                    var xray_payment_data = []

                    var xray_payment_data= [{
                        'XrayTestId' : $("#XrayTestId").val(),
                        'patient_id' : $("#patientId").val(),
                        'patient_type' : patient_type,
                        'OP_appointmentid': $('#patient_appointment_Id').val(),
                        'IP_assignid': $('#patient_IP_assignid').val(),
                        'Ward_assignid': $('#patient_Ward_assignid').val(),
                        'total': parseInt($('#totalAmount').val()),
                        'paid': parseInt($("#paymentReceived").val()),
                        'balance': parseInt($("#overallBalance").val()),
                        'cash': parseInt($("#cash").val()),
                        'upi': parseInt($("#upi").val()),
                        'card': parseInt($("#card").val())
                    }];
        
        
                    $.ajax({
                        type: "POST",
                        headers: {
                            'X-CSRFToken': $.cookie("csrftoken"),
                            'Content-Type': 'application/json',
                        },
                        url: $('#xray_payment').data('url'),
                        data: JSON.stringify({
                            'xray_payment_data': xray_payment_data,
                        }),
                        success: function (msg) {
                            location.reload()
                        }, error: function (exception) {
                            console.log(exception)
                        }
                    });

                } else if (result.dismiss == 'cancel') {
                    e.preventDefault()
                }
            })

        }

     })

    /* Submit Function */
    $("#Xray_Report_Form").submit(function(e){
        e.preventDefault();

        var PatientObj = [];
        var xrayObj= $('#XrayTest').val();

        PatientObj.push({
            patient_id : $("#patientId").val(),
            appointment_id: $('#patient_appointment_Id').val(),
            IP_assignid: $('#patient_IP_assignid').val(),
            ward_assignid: $('#patient_Ward_assignid').val(),
            returnXrayTestPatient_Id: $('#returnXrayTestPatient_Id').val()
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
                'XrayObj_amount': $('#Xray-FeeAmount').val(),
                'patient_type' : patient_type
            }),
            success: function (msg) {
                location.reload()
            }, error: function (exception) {
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

})