$(document).ready(function()
{
    function doctor_checkup_data() {
        
        $.ajax({
            type: "GET",
            url: 'Get_doctor_checkup_data',
            success: function (data) {

                console.log(data)

                $('.doctor_checkup_data').empty()

                var doctor_checkup_data = ''

                for (var i = 0; i < data.appointmentdata.length; i++) {

                    $('#Doctor_Name').val(data.appointmentdata[i].doctor_name)

                    var AppointmentClass = "bg-primary-light";

                    if(data.appointmentdata[i].is_emergency == 'True'){
                        AppointmentClass = 'bg-danger-light'
                    }

                    doctor_checkup_data += "<div class='col-md-4 col-lg-3 d-flex'>\
                            <div class='card invoices-grid-card w-100 badge "+AppointmentClass+"' style=''>\
                                <div class='card-middle'>\
                                    <h2 class='card-middle-avatar row w-100'>\
                                        <div class='col-md-2 p-0'>\
                                            <a href='javascript:void(0);'><img class='avatar avatar-sm me-2 avatar-img rounded-circle' src='../static/img/patient-icon.png' alt='User Image'>\
                                            </a>\
                                        </div>\
                                        <div class='col-md-7 row text-left'>\
                                            <div class='col-md-12'>\
                                                <h5 class='mb-0'>"+ data.appointmentdata[i].patient_name + "</h5>\
                                            </div>\
                                            <div class='col-md-12 mt-2'>\
                                                <small>"+ data.appointmentdata[i].patient_age + " Yrs / "+ data.appointmentdata[i].patient_gender + "</small>\
                                            </div>\
                                        </div>\
                                        <div class='col-md-3 p-0'>\
                                            <h5 class='mb-0'><strong>O.P ID<span class='text-danger'> #"+ parseInt(i + 1)+"</span></a></strong></h5>\
                                        </div>\
                                    </h2>\
                                </div>\
                                <div class='card-body'>\
                                    <div class='row'>\
                                        <div class='col-12 text-left'>\
                                            <h6><i class='fa fa-bookmark'></i> Reason</h6>\
                                            <h5>"+ data.appointmentdata[i].reason + "</h5>\
                                        </div>\
                                        <div class='text-end'>\
                                            <a class='card-link cardViewBtn btn btn-outline-primary btn-sm' data-val='"+ JSON.stringify(data.appointmentdata[i]) + "' href='javascript:void(0)'>\
                                                View Appointment\
                                            </a>\
                                        </div>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>"
                }

                $('.doctor_checkup_data').append(doctor_checkup_data)
            },
            error: function (exception) {
                console.log(exception)
            }
        })
    }

    doctor_checkup_data();

    setInterval(function () {
        doctor_checkup_data();
    }, 30000);



    function appointment_data(){
    $.ajax({
        type: "GET",
        url:$('#GetAppointmentData_DTUrl').data("url"),
        success: function(data) {
          
            LT_For_Patient_History_Table(data['appointmentdata']);
            console.log(data['appointmentdata'])

            function LT_For_Patient_History_Table(dataObj) {
                (function rec(d) {
                    $.each(d, function (k, v) {
                        if (typeof v === 'object') return rec(v)
                        if (isNaN(v) && typeof v === 'number') d[k] = '---';
                    })
                })(dataObj);
        
                if ($.fn.dataTable.isDataTable("#appointmentListDT")) {
                    $("#appointmentListDT").DataTable().destroy();
                }
        
                var appointmentListDatatable = $("#appointmentListDT").DataTable({
                    data : dataObj,
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
                        "title": "Id",
                        "data": "id"
                    },
                    {
                        "title": "Patient",
                        "data": "patient_name"
                    },
                    {
                        "title": "Appointed To",
                        "data": "doctor_name"
                    },
                    {
                        "title": "Reason",
                        "data": "reason"
                    },
                    {
                        "title": "Appointed",
                        "data": "appointment_date"
                    },],
                    columnDefs: [{
                        "targets": 0,
                        "visible": false
                    },{
                        "targets": 4,
                        "render": function (data, type, row) {
                            return (
                                '<h2 class="table-avatar">\
                                    <a href="javascript:void(0)">' + moment(new Date(data)).format("DD-MM-YYYY") + ' <span style="text-align:center"> ( ' + moment(new Date(data)).format("HH:mm A") + ' )</span></a>\
                                </h2>'
                            )
                        }
                    },{
                        "targets" : 5,
                        "data" : null,
                        "title" : "Action",
                        "render" : function(data , type , row) 
                        {
                            if(parseInt(row.status) == 0){
                                return (
                                    "<a class='btn btn-outline-primary view_Btn' data-val='" + JSON.stringify(row) + "'  href = 'javascript:void(0)'>View</a>"
                                    )
                            }
                            else{
                                return null
                            }

                        }
                    }]

                });
            };

        },
        error: function(exception) {
            console.log(exception)
        }
    });    
}

    appointment_data();

    setInterval(function () {
        appointment_data()
    }, 30000);





    var fees_total = 0
    $(".feesAmount").on("keyup keydown", function() {
        var sum = 0;

        $(".feesAmount").each(function() {
            if (!isNaN($(this).val()) && ($(this).val()).length != 0) {
                sum += parseInt(($(this).val()));

                $("#doctor_amount_total_text").text("Rs. "+sum);
                fees_total = sum
                $('#doctor_amount_total').val(sum)
                
            } else {
                $(this).val(0)
            }
        })
    });

    $(".feesAmount").click(function() {
        $(this).select()
    })

    $("#doctor_amount_total").click(function () {
        $(this).select()
    })
    var doctor_check = false

    $("#doctor_checkup_box").click(function() {
        if($('#doctor_checkup_box').is(':checked')) { 
            $('.doctor_amount_section').show();
            $('#doctor_amount_total').prop('required',true);
            doctor_check = true
            $("#doctor_amount_total").val(fees_total);

        } else {
            $('.doctor_amount_section').hide();
            $('#doctor_amount_total').prop('required',false);
            $('#doctor_amount_total').val(0)
            doctor_check = false


        }
    });



    var M_Row;
    var I_Row;

    var history_for_Patient_id;

    var intial_check = 0
    $("#appointmentListDT").on("click" , ".view_Btn" , function()
    {

        M_Row = 1;
        I_Row = 1;
      
        var thisPatientData = $(this).data("val")

        intial_check = 1

        $("#doctor_checkup").trigger('click')
        $(".sorting").trigger('click')
        history_for_Patient_id  = thisPatientData.patient_id
        getPatient_history();


        $("#DoctorPrescriptionForm").trigger("reset");

        $('#doctor_fees').val(0)
        $('#doctor_fees').prop('requird', false)

        $("#medicine").val("").trigger("change");

        $("#lab").val("").trigger("change");
        $("#xray").val("").trigger("change");
        $("#scan").val("").trigger("change");

        $(".additional_ml").empty();   // Empty Additional Medicine List
        $(".add_medicine_btn").trigger("click");
        $(".ml-row-1").find('.removeMedicineBtn').hide();
        // $(".medicine_select2" ).removeAttr('required','required');


        $(".additional_Il").empty();   // Empty Additional injection List
        $(".add_injection_btn").trigger("click");
        $(".il-row-1").find('.removeInjectionBtn').hide();
        

    
        $("#appointmentId").val(thisPatientData.id);
        $("#patientId").val(thisPatientData.patient_id);
        $("#pos_id").val(thisPatientData.pos_id)
        $('#Doctor_Name').val(thisPatientData.doctor_name)
        $("#appointedPatientName").text(thisPatientData.patient_name);
        $("#appointedPatientAge").text(thisPatientData.patient_age);
        $("#appointedPatientGender").text(thisPatientData.patient_gender);
        $("#patient_Reason").text(thisPatientData.reason);


        // $("#patient_BP").text(thisPatientData.bp);
        // $("#patient_Pulse").text(thisPatientData.pulse);
        // $("#patient_Temperature").text(thisPatientData.temperature);
        // $("#patient_RR").text(thisPatientData.rr);
        // $("#patient_SP_O2").text(thisPatientData.sp_o2);
        // $("#patient_BloodSugar").text(thisPatientData.blood_sugar);

        $("#prescription").val(thisPatientData.doctor_prescription);
        $("#medical_prescription").val(thisPatientData.medical_prescription);
        $("#compliance").val(thisPatientData.compliance);
        $("#comorbids").val(thisPatientData.comorbids);
        // $("#review_next_visit").val(thisPatientData.review_next_visit);

        $(".AppointedPatientList_CardSection").hide();
        $(".backBtnSection").show();
        $(".Doctor_Prescription_Section").show();
        // $(".appointmentListDTSection").hide()

        $('.health_checkup_details_section').empty()

        var data = thisPatientData.health_checkup_details
        for (var i = 0; i < data.length; i++) {
            var checkup_details_html = '<div class="col-md-4">\
                                            <div class="form-group">\
                                                <label>'+ data[i].name +' : &nbsp;<span>'+ data[i].value+'</span> &nbsp;'+data[i].unit+'</label>\
                                            </div>\
                                        </div>'
            $('.health_checkup_details_section').append(checkup_details_html)
        }

        call();
    });



    $(".doctor_checkup_data").on('click','.cardViewBtn', function()
    {
        M_Row = 1;

        I_Row = 1;

        var thisPatientData =  $(this).data("val")

        intial_check = 0

        $("#DoctorPrescriptionForm").trigger("reset");

        // $('#doctor_fees').prop('requird', true)

        $("#lab").val("").trigger("change");
        $("#xray").val("").trigger("change");
        $("#scan").val("").trigger("change");

        $("#medicine").val("").trigger("change");

        $(".additional_ml").empty();   // Empty Additional Medicine List
        $(".add_medicine_btn").trigger("click");
        $(".ml-row-1").find('.removeMedicineBtn').hide();
        // $(".medicine_select2" ).attr('required','required');

        $(".additional_Il").empty();   // Empty Additional injection List
        $(".add_injection_btn").trigger("click");
        $(".il-row-1").find('.removeInjectionBtn').hide();
        
        $("#appointmentId").val(thisPatientData.id);
        $("#patientId").val(thisPatientData.patient_id);
        $("#pos_id").val(thisPatientData.pos_id);

        history_for_Patient_id = thisPatientData.patient_id

        $("#appointedPatientName").text(thisPatientData.patient_name);
        $("#appointedPatientAge").text(thisPatientData.patient_age);
        $("#appointedPatientGender").text(thisPatientData.patient_gender);

        // $("#patient_BP").text(thisPatientData.bp);
        // $("#patient_Pulse").text(thisPatientData.pulse);
        // $("#patient_Temperature").text(thisPatientData.temperature);
        // $("#patient_RR").text(thisPatientData.rr);
        // $("#patient_SP_O2").text(thisPatientData.sp_o2);
        // $("#patient_BloodSugar").text(thisPatientData.blood_sugar);

        $('.health_checkup_details_section').empty()

        var data = thisPatientData.health_checkup_details
        for (var i = 0; i < data.length; i++) {
            var checkup_details_html = '<div class="col-md-4">\
                                            <div class="form-group">\
                                                <label>'+ data[i].name +' : &nbsp;<span>'+ data[i].value+'</span> &nbsp;'+data[i].unit+'</label>\
                                            </div>\
                                        </div>'
            $('.health_checkup_details_section').append(checkup_details_html)
        }

        $("#patient_Reason").text(thisPatientData.reason);

        $("#doctor_fees").val(thisPatientData.fees)
        
        $(".AppointedPatientList_CardSection").hide();
        $(".backBtnSection").show();
        $(".Doctor_Prescription_Section").show();
        // $(".appointmentListDTSection").hide();
        getPatient_history();

    });




    var Patient_HistoryURL = $('#Patient_HistoryURL').data('url')

    function getPatient_history(){

        $.ajax({
            type: "GET",
            url: Patient_HistoryURL+"?patient_id="+history_for_Patient_id,
            success: function(data) {

                var PatientHistoryObj = $.merge(data['Op_data'], data['Ip_Data']);
                PatientHistoryObj = $.merge( PatientHistoryObj, data['Ward_Data']);

                LT_For_Patient_History_Table(PatientHistoryObj);

                function LT_For_Patient_History_Table(dataObj) {
                    (function rec(d) {
                        $.each(d, function (k, v) {
                            if (typeof v === 'object') return rec(v)
                            if (isNaN(v) && typeof v === 'number') d[k] = '---';
                        })
                    })(dataObj);
            
                    if ($.fn.dataTable.isDataTable("#Patients_HistoryDT")) {
                        $("#Patients_HistoryDT").DataTable().destroy();
                    }
            
                    var appointmentListDatatable = $("#Patients_HistoryDT").DataTable({
                        data : dataObj,
                        responsive: true,
                        paging: true,
                        searching: false,
                        autoWidth: true,
                        "scrollY": false,
                        "scrollCollapse": true,
                        "order": [0, "desc"],
                        "pageLength": 10,
                        "bLengthChange": false,
                        "scrollX": false,
                        columns: [{
                            "title": "Id",
                            "data": "admit_id"
                        },
                        {
                            "title": "Date",
                            "data": "assigned_date"
                        },
                        {
                            "title": "Doctor",
                            "data": "doctor_name"
                        },
                                               
                        ],
                        columnDefs: [{
                            "targets": [0,2,3],
                            "visible": false
                        },

                        {
                            "targets": 1,
                            "render": function (data, type, row) {
                                return (
                                    "<h2 class='table-avatar view_history_Btn pointer' data-val='" + JSON.stringify(row) + "' >\
                                        <a>" + moment(new Date(data)).format('DD-MM-YYYY HH:mm A') + "<br>\
                                        <span>Reason: "+row.reason+"</span></a>\
                                    </h2>"
                                )
                            }
                        },
                        {
                            "targets" : 3,
                            "data" : null,
                            "title" : "Action",
                            "render" : function(data , type , row) 
                            {
                                return (
                                    "<a class='btn btn-outline-primary view_history_Btn' data-val='" + JSON.stringify(row) + "'  href = 'javascript:void(0)'>View</a>"
                                    )
                            }
                        }
                        ]

                    });
                };

            },
            error: function(exception) {
                console.log(exception)
            }
        });

    }

    $("#Patients_HistoryDT").on('click' , '.view_history_Btn' , function(){
        var history_data = $(this).data('val')
        $('.Medicine_Details').empty()
        $('.Injection_Details').empty()
        $('.LabTest_Details').empty()
        $('.Xray_Details').empty()
        $('.Scan_Details').empty()
        $(".Prescription_Details").empty()
        $(".Compliance_Details").empty()
        $(".Comorbids_Details").empty()
        $(".Review_Next_Week_Details").empty()
        

        $('.open-siderbar').trigger('click')

        var patient_history = 'get_patient_checkup_history'
        
        $.ajax({
            type: "GET",
            url: patient_history+"?appointment_id="+ history_data.admit_id +"&type="+history_data.type,
            success: function (data) {


                console.log(data)

                $('.history_patient_type').text(data.doctor_checkup_history[0].patient_type)


                $(".appointedPatientName").text(data.doctor_checkup_history[0].patient_appointment_health_data[0].patient_name);
                $(".appointedPatientAge").text(data.doctor_checkup_history[0].patient_appointment_health_data[0].age);
                $(".appointedPatientGender").text(data.doctor_checkup_history[0].patient_appointment_health_data[0].gender);
                $(".appointedDoctorName").text(data.doctor_checkup_history[0].patient_appointment_health_data[0].doctor_name);

                $(".appointedPatientDate").text(moment(new Date(data.doctor_checkup_history[0].patient_appointment_health_data[0].appointment_date)).format("DD-MMM-YYYY"));

                // $(".patient_BP").text(data.doctor_checkup_history[0].patient_appointment_health_data[0].bp);
                // $(".patient_Pulse").text(data.doctor_checkup_history[0].patient_appointment_health_data[0].pulse);
                // $(".patient_Temperature").text(data.doctor_checkup_history[0].patient_appointment_health_data[0].temperature);
                // $(".patient_RR").text(data.doctor_checkup_history[0].patient_appointment_health_data[0].rr);
                // $(".patient_SP_O2").text(data.doctor_checkup_history[0].patient_appointment_health_data[0].sp_o2);
                // $(".patient_BloodSugar").text(data.doctor_checkup_history[0].patient_appointment_health_data[0].blood_sugar);

                $('.patient_history_checkup_details_section').empty()

                var Data = data.doctor_checkup_history[0].patient_appointment_health_data[0].health_checkup_details
                for (var i = 0; i < Data.length; i++) {
                    var checkup_details_html = '<div class="col-md-4" style="width: 30%;">\
                                                    <div class="form-group">\
                                                        <label>'+ Data[i].name +' : &nbsp;<span>'+ Data[i].value+'</span> &nbsp;'+Data[i].unit+'</label>\
                                                    </div>\
                                                </div>'
                    $('.patient_history_checkup_details_section').append(checkup_details_html)
                }

                $(".patient_Reason").text(data.doctor_checkup_history[0].patient_appointment_health_data[0].reason);

                if(data.doctor_checkup_history[0].patient_medicine_history_data.length >0 ){
                    var medicine_history = ''

                    medicine_history  += "<div class = 'col-md-4' style='width: 20%;'><label>Medicine Name</label>\</div>\
                                        <div class = 'col-md-1'style='width: 10%;'><label>Mor</label></div>\
                                        <div class = 'col-md-1'style='width: 10%;'><label>Aft</label></div>\
                                        <div class = 'col-md-1'style='width: 10%;'><label>Nit</label></div>\
                                        <div class = 'col-md-1'style='width: 10%;'><label>SOS</label></div>\
                                        <div class = 'col-md-1'style='width: 10%;'><label>Stat</label></div>\
                                        <div class = 'col-md-1'style='width: 10%;'><label>QID</label></div>\
                                        <div class = 'col-md-1'style='width: 10%;'><label>Days</label></div>\
                                        <div class = 'col-md-1'style='width: 10%;'><label>Total</label></div>\
                                        <hr>"

                    for(var i=0 ;i<(data.doctor_checkup_history[0].patient_medicine_history_data).length; i++){

                        var thisMedicineRow = (data.doctor_checkup_history[0].patient_medicine_history_data)[i].medicine_list

                       

                        for(var j = 0;j<thisMedicineRow.length;j++)
                        {
                            var total = (parseInt(thisMedicineRow[j].morning) + parseInt(thisMedicineRow[j].afternoon) + parseInt(thisMedicineRow[j].night) + parseInt(thisMedicineRow[j].sos) + parseInt(thisMedicineRow[j].stat) + parseInt(thisMedicineRow[j].qid)) * parseInt(thisMedicineRow[j].days)
                            medicine_history  += "<div class = 'col-md-4' style='width: 20%;'>\
                            <label><span class='patientInfoText' > "+thisMedicineRow[j].medicinename+"</span></label>\
                            </div>\
                            <div class = 'col-md-1' style='width: 10%;'>\
                            <label><span class='patientInfoText' > "+thisMedicineRow[j].morning+"</span></label>\
                            </div>\
                            <div class = 'col-md-1'style='width: 10%;'>\
                            <label><span class='patientInfoText' > "+thisMedicineRow[j].afternoon+"</span></label>\
                            </div>\
                            <div class = 'col-md-1' style='width: 10%;'>\
                            <label><span class='patientInfoText' > "+thisMedicineRow[j].night+"</span></label>\
                            </div>\
                            <div class = 'col-md-1'style='width: 10%;'>\
                            <label><span class='patientInfoText' > "+thisMedicineRow[j].sos+"</span></label>\
                            </div>\
                            <div class = 'col-md-1'style='width: 10%;'>\
                            <label><span class='patientInfoText' > "+thisMedicineRow[j].stat+"</span></label>\
                            </div>\
                            <div class = 'col-md-1'style='width: 10%;'>\
                            <label><span class='patientInfoText' > "+thisMedicineRow[j].qid+"</span></label>\
                            </div>\
                            <div class = 'col-md-1'style='width: 10%;'>\
                            <label><span class='patientInfoText' > "+thisMedicineRow[j].days+"</span></label>\
                            </div>\
                            <div class = 'col-md-1'style='width: 10%;'>\
                            <label><span class='patientInfoText' > "+total+"</span></label>\
                            </div>\
                            <hr>"
                        }
                    }
                    $(".Medicine_Details").append('<h5 class="sidebar-title mb-1"><i class="fas fa-pills"></i> Medicine Details</h5>'+medicine_history)
 
                }

                if(data.doctor_checkup_history[0].patient_medicine_history_data.length  == 0 ){
                    medicine_history  = "<div class = 'col-md-3'style='width: 40%;'>No Records</div>"
                    // $(".Medicine_Details").append(medicine_history)
                }

                //Injection Section
                if(data.doctor_checkup_history[0].patient_injection_history_data.length > 0 ){

                    var injection_history = '';

                    for(var i=0 ;i<(data.doctor_checkup_history[0].patient_injection_history_data).length; i++){

                        var thisInjectionRow = (data.doctor_checkup_history[0].patient_injection_history_data)[i].injection_list

                        for(var j = 0;j<thisInjectionRow.length;j++)
                        {
                            
                            injection_history  += "<div class = 'col-md-12' style='width: 100%;'>\
                                <label><span class='patientInfoText' > "+thisInjectionRow[j].injection_name+" - "+thisInjectionRow[j].ml+" ml</span></label>\
                                </div><hr>"
                        }

                    }

                    $(".Injection_Details").append('<h5 class="sidebar-title mb-1"><i class="fas fa-syringe"></i> Injection Details </h5>'+injection_history);
                }

                if(data.doctor_checkup_history[0].patient_injection_history_data.length == 0 ){
                    injection_history  = "<div class = 'col-md-3'style='width: 40%;'>No Records</div>"
                    //$(".Injection_Details").append(injection_history)
                }

                //Laboratory
                if(data.doctor_checkup_history[0].patient_lab_history_data.length >0 ){
                    var labtest_history = ''

                    for(var i=0 ;i<data.doctor_checkup_history[0].patient_lab_history_data.length; i++){

                            labtest_history  += "<div class = 'col-md-12' style='width: 100%;'>\
                                                <label> <span class='patientInfoText' >"+(data.doctor_checkup_history[0].patient_lab_history_data)[i].group_name+"</span></label><br>\
                                                <div class = 'col-md-12'style='width: 100%;'>\
                                                <label>"+data.doctor_checkup_history[0].patient_lab_history_data[i].test_name+" : <span class='patientInfoText' > "+data.doctor_checkup_history[0].patient_lab_history_data[i].testvalue+"  "+data.doctor_checkup_history[0].patient_lab_history_data[i].testunit+" &nbsp;&nbsp; "+data.doctor_checkup_history[0].patient_lab_history_data[i].normal_range +"  </span></label>\
                                                </div>\
                                                 <hr style='margin: 5px;'>";
                    }
                    $(".LabTest_Details").append('<h5 class="sidebar-title mb-1"> <i class="fa fa-thermometer-three-quarters"></i> Lab Test Details :</h5>'+labtest_history);
 
                }

                if(data.doctor_checkup_history[0].patient_lab_history_data.length == 0 ){
                    labtest_history  = "<div class = 'col-md-3' style='width: 40%;'>No Records</div>"
                    //$(".LabTest_Details").append(labtest_history)
                }

                //Xray Section
                if(data.doctor_checkup_history[0].patient_xray_history_data.length >0 ){
                    var xray_history = ''
                    for(var i=0 ;i<data.doctor_checkup_history[0].patient_xray_history_data.length; i++){

                        xray_history  += "<div class = 'col-md-12'style='width: 100%;'>\
                        <label><span class='patientInfoText' > "+data.doctor_checkup_history[0].patient_xray_history_data[i].xray_name+"</span></label>\
                        </div>\
                        <hr style='margin: 5px;'>"
                    }

                    $(".Xray_Details").append('<h5 class="sidebar-title mb-1"><i class="fa fa-universal-access"></i> X-Ray Test Details :</h5>'+xray_history);
                  
                }

                if(data.doctor_checkup_history[0].patient_xray_history_data.length == 0 ){
                    xray_history  = "<div class = 'col-md-3' style='width: 40%;'>No Records</div>"
                    //$(".Xray_Details").append(xray_history)
                }

                //Scan Section
                if(data.doctor_checkup_history[0].patient_scan_history_data.length >0 ){
                    var scan_history = ''
                    for(var i=0 ;i<data.doctor_checkup_history[0].patient_scan_history_data.length; i++){

                        scan_history  += "<div class = 'col-md-12' style='width: 100%;'>\
                        <label><span class='patientInfoText' > "+data.doctor_checkup_history[0].patient_scan_history_data[i].scan_name+"</span></label>\
                        </div>\
                        <hr style='margin: 5px;'>"
                    }
                    $(".Scan_Details").append('<h5 class="sidebar-title mb-1"><i class="fa fa-universal-access"></i> Scan Details :</h5>'+scan_history)
 
                }
                if(data.doctor_checkup_history[0].patient_scan_history_data.length == 0 ){
                    scan_history  = "<div class = 'col-md-3' style='width: 40%;'>No Records</div>"
                    // $(".Scan_Details").append(scan_history)
                }


                //Prescription Section
                for(var i=0 ;i<data.doctor_checkup_history[0].patient_appointment_health_data[0].doctor_prescription.length; i++){

                    if(data.doctor_checkup_history[0].patient_appointment_health_data[0].doctor_prescription[i] != ''){

                        var Prescription_History =  "<div class = 'col-md-12' style='width: 100%;'>"+ data.doctor_checkup_history[0].patient_appointment_health_data[0].doctor_prescription[i];+"</div>"
                        $(".Prescription_Details").append('<h5 class="sidebar-title mb-1"><i class="fa fa-stethoscope"></i> Prescription :</h5>'+Prescription_History)
                    }
                }

                //Compliance
                if(data.doctor_checkup_history[0].patient_appointment_health_data[0].compliance != ''){
                    var Compliance_History =  "<div class = 'col-md-3' style='width: 30%;'>"+ data.doctor_checkup_history[0].patient_appointment_health_data[0].compliance;+"</div>"
                    $(".Compliance_Details").append('<h5 class="sidebar-title mb-1"> Compliance :</h5>'+Compliance_History)
                }

                
                //COMORBIDS
                if(data.doctor_checkup_history[0].patient_appointment_health_data[0].comorbids != ''){
                    var Comorbids_History =  "<div class = 'col-md-3' style='width: 30%;'>"+ data.doctor_checkup_history[0].patient_appointment_health_data[0].comorbids;+"</div>"
                    $(".Comorbids_Details").append('<h5 class="sidebar-title mb-1"> COMORBIDS :</h5>'+Comorbids_History)
                }

                
                if(data.doctor_checkup_history[0].patient_appointment_health_data[0].review_next_visit != ''){
                    var Review_History =  "<div class = 'col-md-3' style='width: 30%;'>"+ moment(new Date(data.doctor_checkup_history[0].patient_appointment_health_data[0].review_next_visit)).format("DD-MMM-YYYY");+"</div>"
                    $(".Review_Next_Week_Details").append('<h5 class="sidebar-title mb-1"> Review or Next Week :</h5>'+Review_History)
                }

            }, error: function (exception) {
                console.log(exception)
            }
        });
        
    })




    $(".backBtn").click(function()
    {
        $(".backBtnSection").hide();
        $(".Doctor_Prescription_Section").hide();
        $(".AppointedPatientList_CardSection").show();
        // $(".appointmentListDTSection").show();
    });

    $('.modal_close').click(function(){
        $('.btn-closed').trigger('click')
    })


    $("#lab").select2({
        allowClear : true,
        placeholder : "Select Lab",
    });

    $("#lab").val("").trigger("change");

    $("#xray").select2({
        allowClear : true,
        placeholder : "Select Xray",
    });

    $("#xray").val("").trigger("change");

    $("#scan").select2({
        allowClear : true,
        placeholder : "Select Scan",
    });

    $("#scan").val("").trigger("change");

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
 


    $("#DoctorPrescriptionForm").submit(function(e)
    {
        e.preventDefault();
        var DoctorCheckup_AmountObj = [];

        var InjectionObj = [];
        var MedicineObj = [];



        if ((parseInt($('#doctor_fees').val()) == 0) && (parseInt($('#dressing').val()) == 0) && (parseInt($('#neb').val()) == 0)) {
            DoctorCheckup_AmountObj = []
        }
        else {
            var payment = 0
            var Doctor_checkup_balance = 0
            if($('#doctor_checkup_box').is(':checked')) { 
                payment = $('#doctor_amount_total').val()
                Doctor_checkup_balance = ((parseInt($('#doctor_fees').val()) + parseInt($('#dressing').val()) + parseInt($('#neb').val())) - parseInt($('#doctor_amount_total').val()))

            }
            else{
                payment = 0
                Doctor_checkup_balance = (parseInt($('#doctor_fees').val()) + parseInt($('#dressing').val()) + parseInt($('#neb').val()))
            }

            
            DoctorCheckup_AmountObj = {
                patient_id: $("#patientId").val(),
                appointment_id: $("#appointmentId").val(),
                doctor_fees: parseInt($('#doctor_fees').val()),
                dressing: parseInt($('#dressing').val()),
                neb: parseInt($('#neb').val()),
                total: (parseInt($('#doctor_fees').val()) + parseInt($('#dressing').val()) + parseInt($('#neb').val())),
                paymentRecived_byDoctor: parseInt(payment),
                doctor_checkup_balance: Doctor_checkup_balance,
                Doctor_check : doctor_check
            }

        }

        var PatientObj = {
            appointment_id: $("#appointmentId").val(),
            patient_id: $("#patientId").val(),
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
        var Compliance = $("#compliance").val()
        var Comorbids = $("#comorbids").val()
        var Review_Next_Visit
        $("#review_next_visit").val() == '' ? Review_Next_Visit = new Date() : Review_Next_Visit = $("#review_next_visit").val()

        var for_api = []

        for (var r = 0; r < InjectionObj.length; r++) {
            var apiInjection_obj = {
                no: r + 1,
                id: InjectionObj[r].injectionid,
                qty:1
            }
            for_api.push(apiInjection_obj)
        }

        for (var r = 0; r < MedicineObj.length; r++) {
            var total = (parseInt(MedicineObj[r].morning) + parseInt(MedicineObj[r].afternoon) + parseInt(MedicineObj[r].night) + parseInt(MedicineObj[r].sos) + parseInt(MedicineObj[r].stat) + parseInt(MedicineObj[r].qid)) * parseInt(MedicineObj[r].days)
            var apiMedicine_obj = {
                no: r + 1,
                id: MedicineObj[r].medicineid,
                qty: total,                
            }
            for_api.push(apiMedicine_obj)
        }

    
        // if((intial_check == 0 && $('#doctor_fees').val() <= 0) || ($('#doctor_checkup_box').is(':checked') && $('#doctor_fees').val() <= 0)) { 
           
        //     iziToast.info({
        //         timeout: 1000,
        //         balloon: true,
        //         overlay: true,
        //         displayMode: 'once',
        //         id: 'error',
        //         title: 'Error',
        //         zindex: 99999999,
        //         message: '<b>Enter Doctor Fees</b>',
        //     });
        // }

        // else if(parseInt(fees_total) < $('#doctor_amount_total').val()){

        //     iziToast.info({
        //         timeout: 1000,
        //         balloon: true,
        //         overlay: true,
        //         displayMode: 'once',
        //         id: 'error',
        //         title: 'Error',
        //         zindex: 99999999,
        //         message: '<b>Amount Is Greater Than Fees</b>',
        //     });

        // }
        
        // else if($('#doctor_checkup_box').is(':checked') && ($('#doctor_amount_total').val() <= 0 || $('#doctor_amount_total').val() == '')) { 
           
        //     iziToast.info({
        //         timeout: 1000,
        //         balloon: true,
        //         overlay: true,
        //         displayMode: 'once',
        //         id: 'error',
        //         title: 'Error',
        //         zindex: 99999999,
        //         message: '<b>Enter Amount</b>',
        //     });
        // }

         if (medicine_value != '' && ((parseInt(morning) == 0) && (parseInt(afternoon) == 0) && (parseInt(night) == 0) && (parseInt(sos) == 0) && (parseInt(stat) == 0) && (parseInt(qid) == 0))) {
            iziToast.info({
                timeout: 1000,
                balloon: true,
                overlay: true,
                displayMode: 'once',
                id: 'error',
                title: 'Error',
                zindex: 99999999,
                message: '<b>Enter Medicine Details Properly</b>',
            });
        }
        
        else{

            var sale_id = 0

            if(for_api){

                var JsonData = JSON.stringify(for_api);
                var Prescription = $('#medical_prescription').val()+';'+$('#Doctor_Name').val()
                console.log(for_api)


                $.ajax({
                    type: 'POST',
                    crossDomain: true,
                    data: { myData: JsonData ,doctor_name: $('#Doctor_Name').val() ,prescription: Prescription , pos_id : parseInt($('#pos_id').val()) },
                    //url: "http://192.168.100.200/POS/public/set-medicine-api.php",
                    url: "http://192.168.1.200/Medical/public/set-medicine-api.php",
                    headers: {
                        'Access-Control-Allow-Origin': '*'
                    },
                    success: function (data) {
                       //location.reload()
                       sale_id = data
                       post_checkup();
                       
                    }, error: function (exception) {
                        console.log("Exception = ", exception)
                    }
                });

            }

            else{
                sale_id = 0
                post_checkup();
            }

            post_checkup();

            function post_checkup(){

                $.ajax({
                    type: "POST",
                    headers: {
                        'X-CSRFToken': $.cookie("csrftoken"),
                        'Content-Type': 'application/json',
                    },
                    url: ".",
                    data: JSON.stringify({
                        'PatientObj': PatientObj,
                        'DoctorCheckup_AmountObj': DoctorCheckup_AmountObj,
                        'InjectionObj': InjectionObj,
                        'MedicineObj': MedicineObj,
                        'LabObj': LabObj,
                        'XrayObj': XrayObj,
                        'ScanObj': ScanObj,
                        'Prescription': Prescription,
                        'Medical_Prescription': Medical_Prescription,
                        'Compliance': Compliance,
                        'Comorbids': Comorbids,
                        'Review_Next_Visit': Review_Next_Visit,
                        'sale_id': sale_id,
                    }),
                    success: function (msg) {
                        location.reload()
                    }, error: function (exception) {
                        console.log(exception)
                    }
                });
            }
           
        }

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

})