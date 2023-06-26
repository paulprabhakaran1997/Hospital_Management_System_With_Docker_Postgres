$(document).ready(function()
{


    function get_lab_data() {

        $.ajax({
            type: "GET",
            url: $('#LabTest_Data_Url').data('url'),
            success: function (data) {
                var direct_Patients_Lab = data.labtest_from_appointmentdata_direct;
                var Out_Patients_Lab = data.labtest_from_appointmentdata_out;
                var In_Patients_Lab = data.labtest_from_appointmentdata_in;
                var Ward_Patients_Lab = data.labtest_from_appointmentdata_ward;
             
                $(".Lab-Test-List").empty();

                BuildTestPatientList(direct_Patients_Lab,"Direct Patient",data.user_group_id);
                BuildTestPatientList(Out_Patients_Lab,"Out Patient",data.user_group_id);
                BuildTestPatientList(In_Patients_Lab,"In Patient",data.user_group_id);
                BuildTestPatientList(Ward_Patients_Lab,"Ward Patient",data.user_group_id);
               
                var DirectLabObj = data.labtestfordirectpatientdata;
                var GeneralLabObj = data.labtestforpatientdata;

                var PatientData_Lab = $.merge(DirectLabObj,GeneralLabObj);
                PatientData_Lab_DT(PatientData_Lab);
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

    var patient_type;

    function BuildTestPatientList(DataObj,PatientType,user_group_id ){

        $.each(DataObj , function(index , obj){

            var AppendLabList = "";

            $.each(obj.test_details , function(Group_Index, Group_Obj) {
                AppendLabList += '<li class="mt-1"><i class="fa fa-caret-right"></i> '+Object.keys(Group_Obj)+'</li>' 
            });

            if(PatientType == "Out Patient"){
                StyleClass = 'secondary';
                AdmitID = "O.P ID #"+obj.admission_id;
            }else if(PatientType == "In Patient"){
                StyleClass = 'primary';
                AdmitID = "I.P ID #-"+obj.admission_id;
            }
            else{
                StyleClass = 'warning';
                AdmitID = "Direct ID #-"+obj.admission_id;
            }

            if(user_group_id != 3){
                cancel_btn = "<a href='javascript:void(0);' data-val='"+ JSON.stringify(obj) + "' data-patienttype='"+PatientType+"' class='btn btn-light btn-sm me-2 rounded-pill circle-btn Cancel-Labbtn'>\
                                <i class='fa fa-times'></i>\
                            </a>"
                edit_btn = "<a href='javascript:void(0);' data-val='"+ JSON.stringify(obj) + "' data-patienttype='"+PatientType+"' class='btn btn-light btn-sm rounded-pill circle-btn View-Labbtn'>\
                                <i class='fa fa-edit'></i>\
                            </a>"
            }
            else{
                cancel_btn = "";
                edit_btn = ""
            }


            
            Payment_status = "<span class='badge bg-danger-light text-bold'>Due</span>"
            Payment_Btn = "<a href='javascript:void(0);' data-val='"+ JSON.stringify(obj) + "' data-patienttype='"+PatientType+"' class='btn btn-light btn-sm rounded-pill circle-btn Generate-Labbtn   Initial_Lab_Payment_Btn'>\
                                <i class='fa fa-tags'></i>\
                            </a>"
            if(obj.payment_complete == 1){
                Payment_status = "<span class='badge bg-warning-light text-bold'>Partially Paid</span>"
            }
            else if(obj.payment_complete == 2){
                Payment_status = "<span class='badge bg-success-light text-bold'>Paid</span>"
                Payment_Btn = ''
            }


            $('.Lab-Test-List').append("<div class='col-md-3 d-flex'>\
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
                                                            <h6 class='text-danger'><i class='fa fa-exclamation-circle'></i> Suggested Lab Tests</h6>\
                                                            <ul style='padding-left:0px;font-style: oblique;'>\
                                                                "+ AppendLabList + "\
                                                            </ul>\
                                                        </div>\
                                                    </div>\
                                                </div>\
                                                <div class='card-footer'>\
                                                    <div class='row align-items-center'>\
                                                        <div class='col-auto'>"+Payment_status+"\
                                                        </div>\
                                                        <div class='col d-flex justify-content-end'>\
                                                             "+cancel_btn+"\
                                                                "+Payment_Btn+"\
                                                                "+edit_btn+"\
                                                        </div>\
                                                    </div>\
                                                </div>\
                                            </div>\
                                        </div>");

        });

    }

    function PatientData_Lab_DT(dataObj) {

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

                        var return_url = 'lt_from_appointment'

                        actionHtml += "<a class='' href = '/lab/patient_lt_report/"+Type+"/"+row.id+"/"+return_url+"'>\
                                        <i class='fa fa-sticky-note me-2'></i></i></a>"

                        actionHtml += "<a class=' edit_lab' href = 'javascript:void(0);' data-val='" + JSON.stringify(row) + "'>\
                                         <i class='fas fa-edit me-2'></i></a>"

                        if (row.status == 1) {
                            actionHtml += ""
                        }else {
                            if (row.balance != 0) {
                                actionHtml += "<a class=' lab_payment'\
                                                    data-val='" + JSON.stringify(row) + "' href='javascript:void(0);' data-toggle='modal' data-target='#Lab_Payment_modal'>\
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

    BuildLabTestData();

    function BuildLabTestData(){
        
        var LabGroupData = $("#LabGroupData").data("val");
            
        // Group & Test View
       
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


        $('#lab_select2').on('select2:select', function(e) {
            var LabGroupData = $("#LabGroupData").data("val");
            var GetSelectedLab = LabGroupData.filter(function(obj) { return obj.id == e.params.data.id });
            if (patient_type != 'Direct Patient'){
                BuildLabTest(GetSelectedLab , 'ReportAction');
            }
        })


        $('#lab_select2').on('select2:unselect', function(e) {
            $(".TestGroup-"+e.params.data.id).remove();
        })

    }

    function BuildLabTest(GroupID , append_div){

        console.log('data data',GroupID)
          
        var SubGroupAction = "";
        var GroupData = GroupID[0];
        
        $.each(GroupData.test_data, function(index, Obj) {
            
            if (Obj.is_radio == 'False') {

                if(Obj.unit != ""){
                    AddOn = '<span class="input-group-text" id="basic-addon2">' + Obj.unit + '</span>';
                }else{
                    AddOn = '';
                }

                SubGroupAction += '<div class="form-group row summary-row">\
                                    <label class="col-lg-2 col-form-label">' + Obj.name + '</label>\
                                    <div class="col-lg-7">\
                                        <div class="input-group">\
                                            <input type="text" data-group_id = "'+GroupData.id+'"  data-group="' + GroupData.name + '" data-amount = "'+GroupData.amount+'"  data-test_id = "'+Obj.id+'"  data-name="' + Obj.name + '" data-unit="' + Obj.unit + '" data-test_taken="'+Obj.test_taken_id+'" class="form-control TestValue test_taken-'+Obj.test_taken_id+'  edit_lab_values">\
                                            '+AddOn+'\
                                        </div>\
                                    </div>\
                                    <div class="col-lg-3 col-form-label">\
                                        <span style="white-space: pre;">Normal Range: '+Obj.normal_range+'</span>\
                                    </div>\
                                </div>';
            } else {
                SubGroupAction += '<div class="form-group row summary-row">\
                                    <label class="col-lg-2 col-form-label">' + Obj.name + '</label>\
                                    <div class="col-lg-7">\
                                        <select class="selecting TestValue radio_select2 form-control edit_lab_values test_taken-'+Obj.test_taken_id+'" data-group_id = "'+GroupData.id+'"  data-group="' + GroupData.name + '" data-amount = "'+GroupData.amount+'"  data-test_id = "'+Obj.id+'"  data-name="' + Obj.name + '" data-unit="' + Obj.unit + '" data-test_taken="'+Obj.test_taken_id+'" >\
                                            <option></option><option value="Positive">Positive</option><option value="Negative">Negative</option>\
                                        </select>\
                                    </div>\
                                    <div class="col-lg-3 col-form-label">\
                                        <span style="white-space: pre;">Normal Range: '+Obj.normal_range+'</span>\
                                    </div>\
                                </div>';
            }

        });

        var GroupAction = '<div class="col-xl-12 TestGroupData TestGroup-'+GroupData.id+'" data-amount="'+GroupData.amount+'">\
                                <div class="card flex-fill">\
                                    <div class="card-header">\
                                        <h6 class="card-title">\
                                            <input class="form-check-input mt-0" type="checkbox" checked> ' + GroupData.name + '\
                                        </h6>\
                                    </div>\
                                    <div class="card-body">' + SubGroupAction + '\
                                    </div>\
                                </div>\
                            </div>';
        
        $("#"+append_div).append(GroupAction);

        $('.radio_select2').select2({
            placeholder: 'Select',
            allowClear: true,
            minimumResultsForSearch: -1
        })

    }


    

    $(".Lab-Test-List").on('click' , '.View-Labbtn', function(){
        console.log("lab inside")
        $("#lab_select2").val([]).change();
        $("#ReportAction").empty();

        $('.TestValue').val("");
        $('.selecting').val("").trigger("change");
       
        var thisData = $(this).data("val"); 
        patient_type = $(this).data("patienttype");

        var BuildLabList = "";
       
        var LabArray = Object.values(thisData.suggestedLabObj);

        $.each(thisData.suggestedLabObj, function(index, Obj) {
            var LabGroupData = $("#LabGroupData").data("val");
            var GetSelectedLab = LabGroupData.filter(function(obj) { return parseInt(obj.id)  == parseInt(Obj)});
            BuildLabTest(GetSelectedLab , 'ReportAction');
        });

        console.log('LabArray', LabArray)
        $("#lab_select2").val(LabArray).change();


        $.each(thisData.test_details , function(index , Obj) {
            if(index == 0) {
                BuildLabList += ' ' + Object.keys(Obj);
            }else{
                BuildLabList += ', ' + Object.keys(Obj);
            }            
        });

        if(BuildLabList != ""){
            $(".SuggestedLab span").text(BuildLabList); //Doctor Suggestion List
        }else{
            $(".SuggestedLab").hide();
        }

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
     

        $("#returnLabTestPatient_Id").val(thisData.id);

        $("#appointedPatientId").text(thisData.patient_id);
        $("#appointedPatientName").text(thisData.patient_name);
        $("#appointedPatientAge").text(thisData.patient_age);
        $("#appointedPatientGender").text(thisData.patient_gender);
        $("#appointedPatientPhone").text(thisData.phone);
        $("#appointedDocter").text(thisData.doctor_name);
        $("#appointedPatientPlace").text(thisData.address);
        $("#appointedDate").text(moment(new Date()).format("DD-MM-YYYY"));
       
        $(".addNewBtnSection").hide();
        $(".Pending-Lab-Test-Section").hide();

        $(".backBtnSection").show();
        $(".Lab_Testing_Section").show();
        $(".direct_testSection").hide();
        $(".patient_data").show();
        $(".test_shoud_take").show();
        $(".typeaheadSection").hide();
        $("#patient_typeahead").prop('required',false);
        $(".doctor_direct_test").hide();
        $("#doctor_direct_test").prop('required',false);
        $('.direct_lab_GetpaymentSection').hide()


    });


    $(".Lab-Test-List").on('click' , '.Cancel-Labbtn', function(){


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
                    url: $('#canceling_lab_url').data('url'),
                    data: JSON.stringify({
                        'patient_type': patient_type,
                        'canceling_lab': thisData.id,
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


    $(".backBtn").click(function()
    {
        $(".backBtnSection").hide();
        $(".Lab_Testing_Section").hide();

        $(".addNewBtnSection").show();
        $(".Pending-Lab-Test-Section").show();
        $(".direct_testSection").show();
        $(".typeaheadSection").hide();

    })


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


    $('#direct_test').click(function(){

        $("#lab_select2").val([]).change();
        $("#ReportAction").empty();
        console.log("direct inside")
        setTimeout(function() {
            $('#patient_typeahead').focus()
        },200)

        $("#patient_typeahead").prop('required',true);
        $("#doctor_direct_test").prop('required',true);

        patient_type = 'Direct Patient'

        $(".direct_testSection").hide();
        $(".SuggestedLab").hide();

        $(".Lab_Testing_Section").show();
        $(".typeaheadSection").show();
        $(".backBtnSection").show();

        $(".Pending-Lab-Test-Section").hide();
        $(".patient_data").hide();
        $(".AppointmentDetails").hide();
        

        $(".test_shoud_take").show();
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
        $("#returnLabTestPatient_Id").val(0);




        var selected_group_amount = 0
        var LabGroupData = $("#LabGroupData").data("val");

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


    $('#testedPatientListDT').on('click', ".edit_lab" , function(){
        thisdata = $(this).data('val')
        $('.patient_info_section').show()
        show_patient_info(thisdata);

        $('.history_backBtnSection').show()
        $('.printBtnSection').hide()
        $('.edit_lab_section').show()
        $('.TestedPatientDTSection').hide()
        $('#SubView').empty()

        var LabTest_Result_Url = $('#LabTest_Result_Url').data('url')

        $.ajax({
            type: "GET",
            url: LabTest_Result_Url+"?lab_test_id="+thisdata.id+"&patient_type="+thisdata.patient_type,
            success: function (data) {

                console.log(data)
                
                var result_data = data.lab_result_data;

                 if (result_data.length != 0) {
                    let mymap = new Map();
                    var unique = result_data.filter(el => {
                        const val = mymap.get(el.group_name);
                        if(val) {
                            if(el.id < val) {
                                mymap.delete(el.group_name);
                                mymap.set(el.group_name, el.id);
                                return true;
                            } else {
                                return false;
                            }
                        }
                        mymap.set(el.group_name, el.id);
                        return true;
                    });
                     
                    $.each(unique, function (i, itm) {

                        var final_data = []
                        var test_data =  result_data.filter(function(obj){
                        return obj.group_id == itm.group_id
                        })
                        
                       final_data.push({
                            'id' : itm.group_id,
                            'name' : itm.group_name,
                            'test_data' : test_data
                       })
                       BuildLabTest(final_data , 'SubView');
                    });


                    $.each(result_data, function (i, itm) {
                        if(itm.is_radio == 'False'){
                            $('.test_taken-'+itm.test_taken_id).val(itm.test_value)
                        }
                        else{
                            $('.test_taken-'+itm.test_taken_id).val(itm.test_value).trigger('change')
                        }
                    });
                  } 
            },
            error: function (exception) {
                console.log(exception)
            }

        })

    
    })

    $('#testedPatientListDT').on('click', ".lab_payment" , function(){

        thisdata = $(this).data('val')
        console.log(thisdata)
        show_patient_info(thisdata);
        



            $('#Lab_PaymentForm').trigger('reset')
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

            $("#patientId").val(thisdata.patient_id);

            $("#LabTestId").val(thisdata.id);

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
                $('#direct_labtest_Id').val(thisdata.id)
                $("#patient_appointment_Id").val(0);
                $("#patient_IP_assignid").val(0);
                $("#patient_Ward_assignid").val(0);
                $('.discount_section').show()
                $('#existingpaidAmountText').text(parseInt(thisdata.paid))

            }


            paymentsection();

        

    })

    $(".Lab-Test-List").on('click' , '.Initial_Lab_Payment_Btn', function(){
        $("#Lab_Payment_modal").modal('show');

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

        $('#Lab_PaymentForm').trigger('reset')
        $("#nowPayingAmountText").text('0');
        $('.discount_section').hide()


        $.ajax({
            type: "GET",
            url: $('#get_initial_payment_data_lab').data('url')+"?suggested_lab_id="+thisdata.id+"&patient_type="+Patinet_Type,
            success: function (data) {

                var dataobj = data.initial_lab_payment_data;
                console.log(dataobj)

                if (dataobj.length != 0){

                    if (dataobj[0].total_amount == dataobj[0].balance) {
                        $('.existingPaidAmountView').hide();
                    }
                    else if (dataobj[0].balance> 0) {
                        $('.existingPaidAmountView').show();
                    }
                    $("#LabTestId").val(dataobj[0].LabTestForPatient_id);
                    $('#totalAmountText').text(dataobj[0].total_amount)
                    $('#balanceAmountText').text(dataobj[0].balance)
                    $('#existingpaidAmountText').text(parseInt(dataobj[0].paid))
                    $('#existingdiscountAmountText').text(dataobj[0].discount)
                    $('#totalAmount').val(dataobj[0].total_amount)
                    $('#balanceValue').val(dataobj[0].balance)

                }
                else{
                    var group_amount = 0
                    $.each(thisdata.suggestedLabObj, function(index, itm) {
                        var LabGroupData = $("#LabGroupData").data("val");
                        LabGroupData.map(function(obj) { 
                            if (parseInt(obj.id)  == parseInt(itm)){
                                group_amount += obj.amount
                            }
                        });
                    });
                    $('.existingPaidAmountView').hide();
                    $("#LabTestId").val(0);
                    $('#totalAmountText').text(group_amount)
                    $('#balanceAmountText').text(group_amount)
                    $('#existingpaidAmountText').text(0)
                    $('#existingdiscountAmountText').text(0)
                    $('#totalAmount').val(group_amount)
                    $('#balanceValue').val(group_amount)
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
            $('#direct_labtest_Id').val(thisdata.id)
            $("#patient_appointment_Id").val(0);
            $("#patient_IP_assignid").val(0);
            $("#patient_Ward_assignid").val(0);
            $('.discount_section').show()
            $('#existingpaidAmountText').text(parseInt(thisdata.paid))

        }
        $("#returnLabTestPatient_Id").val(thisdata.id);


        paymentsection();

    })
    








    function show_patient_info(thisdata){
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
                    var balance_amount = (parseInt($('#balanceValue').val()- sum) - $("#discount_amount").val())  
                    var total_amount =   parseInt($('#totalAmount').val()) 
                        $("#balanceAmountText").text(balance_amount);
                        $("#overallBalance").val(balance_amount)

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


        $(".discountValue").on("keyup", function () {
            var sum = 0;

            if ($(this).val() != '') {
                sum += parseInt(($(this).val()));
            }
            else {
                $(this).val(0)
                $("#discount_amount").val(0)
            }

            if (sum > 0) {

                $("#discount_amount").val(parseInt(sum));

                $("#nowPayingAmount").val(parseInt(sum));
                var balance_amount = (parseInt($('#balanceValue').val()- sum) - $("#paymentReceived").val())  
                var total_amount =   parseInt($('#totalAmount').val()) 

                

                    $("#balanceAmountText").text(balance_amount);
                    $("#overallBalance").val(balance_amount)
                    $("#totalAmount_after_discountText").text(total_amount - sum)
                    $("#total_after_discount").val(total_amount - sum)


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

                }
                else {

                    var balance_amount = parseInt($('#balanceValue').val() - $("#paymentReceived").val())

                    $("#balanceAmountText").text(balance_amount);
                    $("#overallBalance").val(balance_amount)
                    $("#totalAmount_after_discountText").text('0')
                    $("#total_after_discount").val(0)
            }
        });

        $('.discountValue').click(function () {
            $(this).select();
        });

    }






    $('.history_backBtn').click(function(){
        $('.history_backBtnSection').hide()
        $('.printBtnSection').hide()
        $('.patient_info_section').hide()
        $('.lab_GetpaymentSection').hide()
        $('.edit_lab_section').hide()
        $('.TestedPatientDTSection').show()
        $('.invoicePrintSection').hide()
    })



     $('#Lab_PaymentForm').submit(function(e){
        e.preventDefault();


        if( (patient_type != 'Direct Patient') &&  ((parseInt($('#overallBalance').val()) < 0 ) || parseInt($("#paymentReceived").val()) <= 0) ){

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

        else if((patient_type == 'Direct Patient') && ( (parseInt($('#overallBalance').val()) < 0 ) || (parseInt($('#discount_amount').val()) <= 0  &&  parseInt($("#paymentReceived").val()) <= 0))){

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


                    var lab_payment_data= [{
                        'LabTestId' : $("#LabTestId").val(),
                        'patient_id' : $("#patientId").val(),
                        'patient_type' : patient_type,
                        'Direct_labtest_Id': $('#direct_labtest_Id').val(),
                        'OP_appointmentid': $('#patient_appointment_Id').val(),
                        'IP_assignid': $('#patient_IP_assignid').val(),
                        'Ward_assignid': $('#patient_Ward_assignid').val(),
                        'total': parseInt($('#totalAmount').val()),
                        'discount': parseInt($('#discount_amount').val()),
                        'total_after_discount': parseInt($('#total_after_discount').val()),
                        'paid': parseInt($("#paymentReceived").val()),
                        'balance': parseInt($("#overallBalance").val()),
                        'cash': parseInt($("#cash").val()),
                        'upi': parseInt($("#upi").val()),
                        'card': parseInt($("#card").val()),
                        'returnLabTestPatient_Id': parseInt($("#returnLabTestPatient_Id").val()) ,
                    }];

                    console.log(lab_payment_data)
        
                    $.ajax({
                        type: "POST",
                        headers: { 
                            'X-CSRFToken': $.cookie("csrftoken"),
                            'Content-Type': 'application/json',
                        },
                        url: $('#lab_payment').data('url'),
                        data: JSON.stringify({
                            'lab_payment_data': lab_payment_data,
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

        }

     })



    $("#Lab_Report_Form").submit(function(e)
    {
        e.preventDefault();

        var ReportObj = [],
            PatientObj = [],
            OverAllgroupamount = 0;

        $(".summary-row").each(function() {

            // if ($(this).find('.TestValue').val() != 0 && $(this).find('.TestValue').val() != null) {
                
                var GroupId = $(this).find('.TestValue').data("group_id");
                var Groupname = $(this).find('.TestValue').data("group");                
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

            // }

        });

        $(".TestGroupData").each(function() {
            OverAllgroupamount += $(this).data("amount");
        });
        

        PatientObj.push({
            patient_id : $("#patientId").val(),
            appointment_id: $('#patient_appointment_Id').val(),
            IP_assignid: $('#patient_IP_assignid').val(),
            ward_assignid: $('#patient_Ward_assignid').val(),
            returnLabTestPatient_Id: $("#returnLabTestPatient_Id").val()
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

        

        else if (ReportObj) {
            console.log(direct_payment_data)
            var LabObj = $("#lab_select2").select2("val");
            console.log(LabObj)

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
                    'patient_type' : patient_type,
                    'doctor_direct_test' : $('#doctor_direct_test').val(),
                    'direct_payment_data' : direct_payment_data,
                    'LabObj' : $("#lab_select2").select2("val")
                }),
                success: function (msg) {
                    location.reload()
                }, error: function (exception) {
                    console.log(exception)
                }
            });

        }
        console.log(ReportObj)


    });


    $("#Edit_Lab_Report_Form").submit(function(e)
    {
        e.preventDefault();

        var ReportObj = [];

        $(".summary-row").each(function() {

            // if ($(this).find('.TestValue').val() != 0 && $(this).find('.TestValue').val() != null) {
                ReportObj.push({
                    test_taken_id: $(this).find('.TestValue').data("test_taken"),
                    testvalue: $(this).find('.TestValue').val(),
                    testunit: $(this).find('.TestValue').data("unit"),
                });
            // }
        });

        if (ReportObj.length != 0) {
            $.ajax({
                type: "POST",
                headers: {
                    'X-CSRFToken': $.cookie("csrftoken"),
                    'Content-Type': 'application/json',
                },
                url: $('#post_edit_lab_result_data').data('url'),
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
        
        $(".Payment_canvas_div_pdf").printThis({
            debug: false, 
            importCSS: true, 
            importStyle: true, 
            printContainer: true, 
            loadCSS: "", 
            pageTitle: "", 
            removeInline: false,
        });
    });
 
})





