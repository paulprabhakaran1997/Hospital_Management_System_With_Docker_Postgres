$(document).ready(function()
{

    function ScanData_AJAX() {

        $.ajax({
            type: "GET",
            url: $('#ScanTest_Data_Url').data('url'),
            success: function (data) {

                var Direct_Patients_Scan = data.scan_from_appointmentdata_direct;
                var Out_Patients_Scan = data.scan_from_appointmentdata_out;
                var In_Patients_Scan = data.scan_from_appointmentdata_in;
                var Ward_Patients_Scan = data.scan_from_appointmentdata_ward;
              
                $(".Scan-Test-List").empty();

                BuildTestPatientList(Direct_Patients_Scan,"Direct Patient");      //Direct
                BuildTestPatientList(Out_Patients_Scan,"Out Patient");      //OP
                BuildTestPatientList(In_Patients_Scan,"In Patient");         //IP
                BuildTestPatientList(Ward_Patients_Scan,"Ward Patient");     //Ward
              
                var GeneralScanObj = data.scanforpatientdata;
                var DirectScanObj = data.scanfordirectpatientdata;

                var PatientData_Scan = $.merge(DirectScanObj,GeneralScanObj);
                PatientData_Scan_DT(PatientData_Scan);
            
                //Build TestPatient List
                function BuildTestPatientList(DataObj, PatientType ){
                    
                    $.each(DataObj , function(index , obj){

                        var AppendScanList = "",StyleClass ="", AdmitID ="";
                        
                        $.each(obj.scan_details , function(Group_Index, Group_Obj) {
                            AppendScanList += '<li class="mt-1"><i class="fa fa-caret-right"></i> '+Group_Obj.scan_name+'</li>' 
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

                        else{
                            StyleClass = 'warning';
                            AdmitID = "Direct ID #-"+obj.admission_id;
                        }
                        
                        Payment_status = "<span class='badge bg-danger-light text-bold'>Due</span>"
                        Payment_Btn = "<a href='javascript:void(0);' data-val='"+ JSON.stringify(obj) + "' data-patienttype='"+PatientType+"' class='btn btn-light btn-sm rounded-pill circle-btn Generate-Sacnbtn   Initial_Scan_Payment_Btn'>\
                                            <i class='fa fa-tags'></i>\
                                        </a>"
                        if(obj.payment_complete == 1){
                            Payment_status = "<span class='badge bg-warning-light text-bold'>Partially Paid</span>"
                        }
                        else if(obj.payment_complete == 2){
                            Payment_status = "<span class='badge bg-success-light text-bold'>Paid</span>"
                            Payment_Btn = ''
                        }


                        $('.Scan-Test-List').append("<div class='col-md-3 d-flex'>\
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
                                                                <h6 class='text-danger'><i class='fa fa-exclamation-circle'></i> Suggested Scan</h6>\
                                                                <ul style='padding-left:0px;font-style: oblique;'>\
                                                                    "+ AppendScanList + "\
                                                                </ul>\
                                                            </div>\
                                                        </div>\
                                                    </div>\
                                                    <div class='card-footer'>\
                                                        <div class='row align-items-center'>\
                                                            <div class='col-auto'>"+Payment_status+"\
                                                            </div>\
                                                            <div class='col d-flex justify-content-end'>\
                                                                <a href='javascript:void(0);' data-val='"+ JSON.stringify(obj) + "' data-patienttype='"+PatientType+"' class='btn btn-light btn-sm me-2 rounded-pill circle-btn Cancel-Scanbtn'>\
                                                                    <i class='fa fa-times'></i>\
                                                                </a>\
                                                                    "+Payment_Btn+"\
                                                                <a href='javascript:void(0);' data-val='"+ JSON.stringify(obj) + "' data-patienttype='"+PatientType+"' class='btn btn-light btn-sm rounded-pill circle-btn View-Scanbtn'>\
                                                                    <i class='fa fa-edit'></i>\
                                                                </a>\
                                                            </div>\
                                                        </div>\
                                                    </div>\
                                                </div>\
                                            </div>");

                    });

                }

                //Build Datatable List
                function PatientData_Scan_DT(dataObj) {
                    (function rec(d) {
                        $.each(d, function (k, v) {
                            if (typeof v === 'object') return rec(v)
                            if (isNaN(v) && typeof v === 'number') d[k] = '---';
                        })
                    })(dataObj);
            
                    if ($.fn.dataTable.isDataTable("#scanPatientListDT")) {
                        $("#scanPatientListDT").DataTable().destroy();
                    }
            
                    var PatientData_Scan_DT = $("#scanPatientListDT").DataTable({
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
            
                                    actionHtml += "<a class='' href = '/scan/patient_scan_report/"+Type+"/"+row.id+"'>\
                                                    <i class='fa fa-sticky-note me-2'></i></i></a>"
            
                                    actionHtml += "<a class=' edit_scan' href = 'javascript:void(0);' data-val='" + JSON.stringify(row) + "'>\
                                                     <i class='fas fa-edit me-2'></i></a>"
            
                                    if (row.status == 1) {
                                        actionHtml += ""
                                    }else {
                                        if (row.balance != 0) {
                                            actionHtml += "<a class=' scan_payment'\
                                                                data-val='" + JSON.stringify(row) + "' href='javascript:void(0);' data-toggle='modal' data-target='#Scan_Payment_modal'>\
                                                                <i class='fas fa-rupee-sign me-2'></i>\
                                                            </a>";
                                        }
                                    }
            
                                    actionHtml += "<a class='' href = '/scan/patient_scan_payment_report/"+Type+"/"+row.id+"'>\
                                                    <i class='fas fa-rupee-sign me-2'></i></a>";
            
                                    return actionHtml;
                                }
                            }
                        ]
            
                    })
                };


            },
            error: function (exception) {
                console.log("EXception:"+exception);
            }
        });

    }

    ScanData_AJAX();

    setInterval(function () { ScanData_AJAX(); }, 30000)

    var patient_type;

    var ScanTestList = $("#scandata").data("val");

    var Scan_Select2_Obj = [];
 
    $.each(ScanTestList , function(index , obj){
        Scan_Select2_Obj.push({ 
                id: obj.id, 
                text: obj.name, 
                amount: obj.amount
        })
    });

    function formatScanSelect2(state) {
        if (state.id) {
            var container = $('<ul class="list-unstyled users-list m-0 avatar-group d-flex align-items-center">\
                                    <li class="fw-bold">' + state.text + '</li>\
                                </ul>')
        }
        return container;
    }
  
    $("#scan_select2").select2({
        data: Scan_Select2_Obj,
        placeholder: "Select Scan Type",
        allowClear: true,
        templateResult: formatScanSelect2,
    });

    $("#scan_select2").val("").trigger("change")    

    $(".Scan-Test-List").on('click' , '.View-Scanbtn', function(){
        
        var thisData = $(this).data("val");
        $("#ReportAction").empty();
        $('#Scan-FeeAmount').val(0)
        patient_type = $(this).data("patienttype");
        var BuildScanList = "";

        var ScanArray = thisData.scan_details.map((obj) => obj.id)
        $.each(thisData.scan_details , function(index , Obj) {
            if(index == 0) {
                BuildScanList += ' ' + Obj.scan_name;
            }else{
                BuildScanList += ', ' + Obj.scan_name;
            } 
            console.log(Obj)
            var GetSelectedscan = ScanTestList.filter(function(scan) { return scan.id == Obj.id});

            BuildScan(GetSelectedscan , 'ReportAction'); 
            $("#scan_select2").val(ScanArray).trigger("change") 
        });


        $(".SuggestedScan span").text(BuildScanList); //Doctor Suggestion List
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
        
        $("#returnScanTestPatient_Id").val(thisData.id);
        $("#appointedPatientId").text(thisData.patient_id);
        $("#appointedPatientName").text(thisData.patient_name);
        $("#appointedPatientAge").text(thisData.patient_age);
        $("#appointedPatientGender").text(thisData.patient_gender);
        $("#appointedDate").text(moment(new Date()).format("DD-MM-YYYY"));
        $("#appointedDocter").text(thisData.doctor_name);

        $(".addNewBtnSection").hide();        
        $(".Pending-Scan-Test-Section").hide();
        $(".backBtnSection").show();
        $(".Scan_Section").show();

        $(".direct_scanSection").hide();
        $(".patient_data").show();
        $(".scan_shoud_take").show();
        $(".typeaheadSection").hide();
        $("#patient_typeahead").prop('required',false);
        $(".doctor_direct_scan").hide();
        $("#doctor_direct_scan").prop('required',false);

        $('.direct_scan_GetpaymentSection').hide()


    });


    $(".Scan-Test-List").on('click' , '.Cancel-Scanbtn', function(){


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
                    url: $('#canceling_scan_url').data('url'),
                    data: JSON.stringify({
                        'patient_type': patient_type,
                        'canceling_scan': thisData.id,
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


    $(".backBtn").click(function(){
        $(".backBtnSection").hide();
        $(".Scan_Section").hide();
        $(".addNewBtnSection").show();
        $(".direct_scanSection").show();
        $(".Pending-Scan-Test-Section").show();
    });
      
    $("#scan_select2").change(function(){
        var TotalAmount = 0;
        var SelctedScanList = $(this).val();
        if(SelctedScanList.length != ''){
            $.each(SelctedScanList , function(index , Obj){ 
                var Scan_Fee = ScanTestList.filter(function (obj) {
                    return obj.id ==  parseInt(Obj) 
                });
                TotalAmount += Scan_Fee[0].amount
                $('#Scan-FeeAmount').val(TotalAmount);
            });        
        }
        else{
            $("#Scan-FeeAmount").val('0').trigger('change');
        }       
    });



    $('#scan_select2').on('select2:select', function(e) {
        var GetSelectedscan = ScanTestList.filter(function(obj) { return obj.id == e.params.data.id });
        if (patient_type != 'Direct Patient'){
            BuildScan(GetSelectedscan , 'ReportAction');
        }
    })


    $('#scan_select2').on('select2:unselect', function(e) {
        $(".TestScan-"+e.params.data.id).remove();
    })


    function BuildScan(ScanData , append_div){

        console.log('data data',ScanData)

        $.each(ScanData, function(index, Obj) {
            var ScanAction = '<div class="col-xl-12 TestScanData TestScan-'+Obj.id+'" data-amount="'+Obj.amount+'">\
                                    <div class="card flex-fill">\
                                        <div class="card-header">\
                                            <h6 class="card-title">\
                                                <input class="form-check-input mt-0" type="checkbox" checked> ' + Obj.name + '\
                                            </h6>\
                                        </div>\
                                        <div class="card-body">\
                                            <div class="form-group row summary-row">\
                                                    <div class="col-md-12">\
                                                            <textarea type="text" data-amount = "'+Obj.amount+'"  data-test_id = "'+Obj.id+'"  data-name="'+Obj.name+'" data-scan_taken="'+Obj.scan_taken_id+'" class="form-control TestValue scan_taken-'+Obj.scan_taken_id+' " rows="4" ></textarea>\
                                                    </div>\
                                            </div>\
                                        </div>\
                                    </div>\
                                </div>';

                $("#"+append_div).append(ScanAction);
        
        });



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
                '<div class="row"><span class="col-12 col-md-6"><h6>Name: ' + item.name + '</h6></span>'+
                '<span class="col-12 col-md-6 text-end"><h6>(ID : '+item.id+')</h6></span><br>'+
                '<span class="col-12 col-md-6">Ph:' + item.phone + '</span>'+
                '<span class="col-12 col-md-6 text-end">Place: ' + item.address + '</span></<div>'
            )
        },

        updater: function(link) {
            var item = JSON.parse(link);

            $("#patient_typeahead").prop('required',false);

            $("#patientId").val(item.id);

            $("#appointedPatientId").text(item.id);
            $("#appointedPatientName").text(item.name);
            $("#appointedPatientAge").text(item.age);
            $("#appointedPatientGender").text(item.gender);
            $("#appointedPatientPlace").text(item.address);
            $("#appointedPatientPhone").text(item.phone);

            $("#appointedDate").text(moment(new Date()).format("DD-MM-YYYY"));            
            
            $(".patient_data").show();

        }

    });


    $('#direct_scan').click(function(){

        $("#scan_select2").val([]).change();
        $("#ReportAction").empty();

        setTimeout(function() {
            $('#patient_typeahead').focus()
        },200)

        $("#patient_typeahead").prop('required',true);
        $("#doctor_direct_scan").prop('required',true);

        patient_type = 'Direct Patient'

        $(".direct_scanSection").hide();
        $(".SuggestedScan").hide();

        $(".Scan_Section").show();
        $(".typeaheadSection").show();
        $(".backBtnSection").show();

        $(".Pending-Scan-Test-Section").hide();
        $(".patient_data").hide();
        $(".AppointmentDetails").hide();
        $(".scan_shoud_take").show();
        $(".doctor_direct_scan").show();

        $('.direct_scan_GetpaymentSection').show()
        $('#Scan_Report_Form').trigger('reset')

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
        $("#returnScanTestPatient_Id").val(0);




        var selected_scan_amount = 0

        $('#scan_select2').on('select2:select', function(e) {
            ScanTestList.map(function(obj) { 
                if (obj.id == e.params.data.id){
                    selected_scan_amount += obj.amount
                } 
            });
            direct_patinet_amount(selected_scan_amount);
        })

        $('#scan_select2').on('select2:unselect', function(e) {
            ScanTestList.map(function(obj) { 
                if (obj.id == e.params.data.id){
                    selected_scan_amount = (selected_scan_amount - obj.amount)
                } 
            });
            direct_patinet_amount(selected_scan_amount);
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










// Scan History Tab



    $('#scanPatientListDT').on('click', ".edit_scan" , function(){
        thisdata = $(this).data('val')
        show_patient_info(thisdata);

        $('.history_backBtnSection').show()
        $('.printBtnSection').hide()
        $('.edit_scan_section').show()
        $('.ScanPatientDTSection').hide()
        $('#SubView').empty()

        var Scan_Result_Url = $('#Scan_Result_Url').data('url')
        $.ajax({
            type: "GET",
            url: Scan_Result_Url+"?scan_id="+thisdata.id+"&patient_type="+thisdata.patient_type,
            success: function (data) {

                console.log(data)
                
                var result_data = data.scan_result_data;

                if (result_data.length != 0) {
                    BuildScan(result_data , 'SubView');
                    $.each(result_data, function (i, itm) {
                        $('.scan_taken-'+itm.scan_taken_id).val(itm.scan_value)
                    });
                } 
            },
            error: function (exception) {
                console.log(exception)
            }

        })


        

    })



    $('#scanPatientListDT').on('click', ".scan_payment" , function(){

        thisdata = $(this).data('val')
        show_patient_info(thisdata);


        $('#Scan_PaymentForm').trigger('reset')
        $("#nowPayingAmountText").text('0');

        $('.discount_section').hide()
            
        $("#totalAmount").val(0);
        $("#balanceValue").val(0);
        $("#nowPayingAmount").val(0);
        $("#paymentReceived").val(0);
        $("#overallBalance").val(0);
        $("#discount_amount").val(0);
        $("#total_after_discount").val(0);


        patient_type = thisdata.patient_type

        if (thisdata.total_amount == thisdata.balance) {
            $('.existingPaidAmountView').hide();
        }
        else if (thisdata.balance > 0) {
            $('.existingPaidAmountView').show();
        }


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

        $("#ScanTestId").val(thisdata.id);

        $('#totalAmountText').text(thisdata.total_amount)
        $('#balanceAmountText').text(thisdata.balance)
        $('#existingpaidAmountText').text(parseInt(thisdata.total_amount - thisdata.balance))
        $('#existingdiscountAmountText').text(thisdata.discount)

        $('#totalAmount').val(thisdata.total_amount)
        $('#balanceValue').val(thisdata.balance)

        $('#existingpaidAmountText').text(parseInt(thisdata.total_amount - thisdata.balance))

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
        else if (patient_type == "Direct Patient") {
            $('#direct_scan_Id').val(thisdata.id)
            $("#patient_appointment_Id").val(0);
            $("#patient_IP_assignid").val(0);
            $("#patient_Ward_assignid").val(0);
            $('.discount_section').show()
            $('#existingpaidAmountText').text(parseInt(thisdata.paid))

        }

        paymentsection();

    
    })

    $(".Scan-Test-List").on('click' , '.Initial_Scan_Payment_Btn', function(){
        $("#Scan_Payment_modal").modal('show');

        var thisdata = $(this).data('val')
        var Patinet_Type = $(this).data('patienttype')
        show_patient_info(thisdata);

        console.log(Patinet_Type)
        console.log(thisdata)

        $("#totalAmount").val(0);
        $("#balanceValue").val(0);
        $("#nowPayingAmount").val(0);
        $("#paymentReceived").val(0);
        $("#overallBalance").val(0);
        $("#discount_amount").val(0);
        $("#total_after_discount").val(0);

        $('#Scan_PaymentForm').trigger('reset')
        $("#nowPayingAmountText").text('0');
        $('.discount_section').hide()


        $.ajax({
            type: "GET",
            url: $('#get_initial_payment_data_scan').data('url')+"?suggested_scan_id="+thisdata.id+"&patient_type="+Patinet_Type,
            success: function (data) {

                var dataobj = data.initial_scan_payment_data;
                console.log(dataobj)

                if (dataobj.length != 0){

                    if (dataobj[0].total_amount == dataobj[0].balance) {
                        $('.existingPaidAmountView').hide();
                    }
                    else if (dataobj[0].balance> 0) {
                        $('.existingPaidAmountView').show();
                    }
                    $("#ScanTestId").val(dataobj[0].ScanTestForPatient_id);
                    $('#totalAmountText').text(dataobj[0].total_amount)
                    $('#balanceAmountText').text(dataobj[0].balance)
                    $('#existingpaidAmountText').text(parseInt(dataobj[0].paid))
                    $('#existingdiscountAmountText').text(dataobj[0].discount)
                    $('#totalAmount').val(dataobj[0].total_amount)
                    $('#balanceValue').val(dataobj[0].balance)

                }
                else{
                    var scan_amount = 0
                    $.each(thisdata.scan_details, function(index, itm) {
                        ScanTestList.map(function(obj) { 
                            if (parseInt(obj.id)  == parseInt(itm.id)){
                                scan_amount += obj.amount
                            }
                        });
                    });

                    console.log(scan_amount)
                    $('.existingPaidAmountView').hide();
                    $("#ScanTestId").val(0);
                    $('#totalAmountText').text(scan_amount)
                    $('#balanceAmountText').text(scan_amount)
                    $('#existingpaidAmountText').text(0)
                    $('#existingdiscountAmountText').text(0)
                    $('#totalAmount').val(scan_amount)
                    $('#balanceValue').val(scan_amount)
                    $('#existingpaidAmountText').text(parseInt(0))

                }
            },
            error: function (exception) {
                console.log(exception)
            }

        })


        patient_type = Patinet_Type

        $("#patientId").val(thisdata.patient_id);
        $(".AppointmentDetails").show();

        if (patient_type == "Out Patient") {
            $("#patient_appointment_Id").val(thisdata.admission_id);
            $("#patient_IP_assignid").val(0);
            $("#patient_Ward_assignid").val(0);
            $(".admission_id").text("OP ID-"+thisdata.admission_id);

        } else if (patient_type == "In Patient") {
            $("#patient_appointment_Id").val(0);
            $("#patient_IP_assignid").val(thisdata.admission_id);
            $("#patient_Ward_assignid").val(0);
            $(".admission_id").text("IP ID-"+thisdata.admission_id);

        } else if (patient_type == "Ward Patient") {
            $("#patient_appointment_Id").val(0);
            $("#patient_IP_assignid").val(0);
            $("#patient_Ward_assignid").val(thisdata.admission_id);
            $(".admission_id").text("WP ID-"+thisdata.admission_id);
        }
        else if (patient_type == "Direct Patient") {
            $('#direct_scantest_Id').val(thisdata.id)
            $("#patient_appointment_Id").val(0);
            $("#patient_IP_assignid").val(0);
            $("#patient_Ward_assignid").val(0);
            $('.discount_section').show()
            $('#existingpaidAmountText').text(parseInt(thisdata.paid))

        }
        $("#returnScanTestPatient_Id").val(thisdata.id);


        paymentsection();

    })

    function show_patient_info(thisdata){
        $('.patient_info_section').show()
        $(".appointedPatientId").text(thisdata.patient_id);
        $(".appointedPatientName").text(thisdata.patient_name);
        $(".appointedPatientAge").text(thisdata.patient_age);
        $(".appointedPatientGender").text(thisdata.patient_gender);
        $(".appointedPatientPlace").text(thisdata.patient_address);
        $(".appointedPatientPhone").text(thisdata.phone);
        $(".appointedDoctor").text(thisdata.doctor_name);
        $(".appointedDate").text(moment(new Date(thisdata.appointed_date)).format("DD-MM-YYYY"))
    }

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
        $('.scan_GetpaymentSection').hide()
        $('.ScanPatientDTSection').show()
        $('.invoicePrintSection').hide()
        $('.patient_info_section').hide()
        $('.edit_scan_section').hide()


    })





    $('#Scan_PaymentForm').submit(function(e){
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

                    var scan_payment_data = []

                    var scan_payment_data= [{
                        'ScanTestId' : $("#ScanTestId").val(),
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
                        'card': parseInt($("#card").val()),
                        'returnScanTestPatient_Id': parseInt($("#returnScanTestPatient_Id").val()) ,

                    }];
        
        
                    $.ajax({
                        type: "POST",
                        headers: {
                            'X-CSRFToken': $.cookie("csrftoken"),
                            'Content-Type': 'application/json',
                        },
                        url: $('#scan_payment').data('url'),
                        data: JSON.stringify({
                            'scan_payment_data': scan_payment_data,
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
    $("#Scan_Report_Form").submit(function(e){
        e.preventDefault();

        var PatientObj = [];
        var ReportObj = []

        PatientObj.push({
            patient_id : $("#patientId").val(),
            appointment_id: $('#patient_appointment_Id').val(),
            IP_assignid: $('#patient_IP_assignid').val(),
            ward_assignid: $('#patient_Ward_assignid').val(),
            returnScanTestPatient_Id: $('#returnScanTestPatient_Id').val()
        });

        $(".summary-row").each(function() {
                ReportObj.push({
                    scan_Id: $(this).find('.TestValue').data("test_id"),
                    scan_name: $(this).find('.TestValue').data("name"),
                    scan_amount: $(this).find('.TestValue').data("amount"),
                    scan_value: $(this).find('.TestValue').val(),
                });
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


        else if(ReportObj){

            console.log(direct_payment_data)
            var scanObj = $("#scan_select2").select2("val");
            console.log(scanObj)

            $.ajax({
                type: "POST",
                headers: {
                    'X-CSRFToken': $.cookie("csrftoken"),
                    'Content-Type': 'application/json',
                },
                url: ".",
                data: JSON.stringify({
                    'PatientObj': PatientObj,
                    'ReportObj': ReportObj,
                    'ScanObj_amount': $('#Scan-FeeAmount').val(),
                    'patient_type' : patient_type,
                    'doctor_direct_scan' : $('#doctor_direct_scan').val(),
                    'direct_payment_data' : direct_payment_data,
                    'ScanObj' : $("#scan_select2").select2("val")
                }),
                success: function (msg) {
                    location.reload()
                }, error: function (exception) {
                    console.log(exception)
                }
            });

        }
   


    })

    $("#Edit_Scan_Report_Form").submit(function(e)
    {
        e.preventDefault();

        var ReportObj = [];

        $(".summary-row").each(function() {

                ReportObj.push({
                    scan_taken_id: $(this).find('.TestValue').data("scan_taken"),
                    scan_value: $(this).find('.TestValue').val(),
                });
        });

        if (ReportObj.length != 0) {
            $.ajax({
                type: "POST",
                headers: {
                    'X-CSRFToken': $.cookie("csrftoken"),
                    'Content-Type': 'application/json',
                },
                url: $('#post_edit_scan_result_data').data('url'),
                data: JSON.stringify({
                    'ReportObj': ReportObj,
                }),
                success: function (msg) {
                    location.reload()
                }, error: function (exception) {
                    console.log(exception)
                }
            });
        }
    });

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