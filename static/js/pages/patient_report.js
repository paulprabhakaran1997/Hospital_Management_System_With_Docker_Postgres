$(document).ready(function(){


    var pageURL = $(location).attr("href");
    var Patinet_ID = pageURL.substring(pageURL.lastIndexOf('/') + 1);
    console.log(Patinet_ID); 


    if (parseInt(Patinet_ID) != 0 ){

        $.ajax({
            type: "POST",
            headers: {
                'X-CSRFToken': $.cookie("csrftoken"),
                'Content-Type': 'application/json',
            },
            url: $("#GetPatientDataOnSearch").data('url'),                
            data: JSON.stringify({
                'query': Patinet_ID,
                'type' : 'single'
            }),
            dataType: 'JSON',
            async: true,
            success: function(data) {       
                update_typeahead(data[0]);
            }
        })

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
            update_typeahead(item)

        }

    });

    setTimeout(function() {
        $('#patient_typeahead').focus()
    },200)

    

    function update_typeahead(item){
        console.log(item)

        $(".Patient_Details_Section").show();
        $("#patientId").val(item.id);
        $("#appointedPatientId").text(item.id);
        $("#appointedPatientName").text(item.name);
        $("#appointedPatientAge").text(item.age);
        $("#appointedPatientGender").text(item.gender);
        $("#appointedPatientPlace").text(item.address);
        $("#appointedDate").text(moment(new Date()).format("DD-MM-YYYY"));            
        
       

        $.ajax({
            type: "GET",
            url: $("#get_patient_report").data('url')+"?patient_id="+item.id,
            success : function(data){
                console.log(data)
                OP_Patient_History(data.OP_Patient_History)
                IP_Patient_History(data.IP_Patient_History)
            },
        
            error : function(exception){
                console.log(exception)
            }
        })

    }




    function OP_Patient_History(OP_data){

        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(OP_data);

        if ($.fn.dataTable.isDataTable("#OP_HistoryListDT")) {
            $("#OP_HistoryListDT").DataTable().destroy();
        }

        var patientListDatatable = $("#OP_HistoryListDT").DataTable({
            "dom": '<"top"B>rt<"bottom"ip>',
            buttons: [
                {
                    extend: 'print',
                    footer: true ,
                    title:"<div>\
                            <h3 style='text-align:center'>Nehru Nursing Home</h3>\
                            <h4>OP History</h4>\
                            </div>",
                    text: '<p class="pdf_btn"><span class="fa fa-print" style="margin-right:6px"></span>Print</p>',
                    exportOptions: {
                        modifier: {
                            page: 'all'
                        },
                        columns: ':visible'
                    }
                }
            ],
            data: OP_data,
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
                    "title": "OP ID",
                    "data": "op_id"
                },
                {
                    "title": "Appointed Date",
                    "data": "appointment_date"
                },
                {
                    "title": "Dr.Name",
                    "data": "doctor_name"
                },
                {
                    "title": "Reason",
                    "data": "reason"
                },
                {
                    "title": "Total",
                    "data": "total"
                },                
                {
                    "title": "Discount",
                    "data": "discount"
                },
                {
                    "title" : "Paid",
                    "data"  :"paid"
                },
                {
                    "title" : "Balance",
                    "data"  :"balance"
                },

            ],
            columnDefs: [
                {
                    "targets": 0,
                    "visible": true
                },
                {
                    "targets" : 1,
                    "render" : function(data , type , row)
                    {
                        return ('<h2 class="table-avatar">\
                        <a href="javascript:void(0)">' + moment(new Date(data)).format("DD-MM-YYYY") + ' <span style="text-align:center"> ( ' + moment(new Date(data)).format("HH:mm A") + ' )</span></a>\
                    </h2>')
                    }
                }, 
                {
                    "targets" : 7,
                    "render" : function(data , type , row){
                        if(data == 0){
                            return '<span style="color : green">'+data+'</span>'
                        }else{
                            return '<span style="color : red">'+data+'</span>'
                        }
                    }
                },
                {
                    "targets" : 8,
                    "data" : null,
                    "title" : "Action",
                    "render" : function(data , type , row) 
                    {
                        return (
                            "<a class='btn btn-outline-primary view_op_history_Btn' data-val='" + JSON.stringify(row) + "'  href = 'javascript:void(0)'>View</a>"
                            )
                    }
                }
            ],drawCallback: function () {
                var api = this.api();
                var sum = 0;
                var formated = 0;

                $(api.column(0).footer()).html('Total');

                for(var i=4; i<=7;i++){
                    sum = api.column(i, {page:'current'}).data().sum();
                    formated = parseFloat(sum).toLocaleString(undefined, {minimumFractionDigits:2});
                    $(api.column(i).footer()).html('₹ '+formated);
                }
            }   


        })

    }


    $("#OP_HistoryListDT").on('click' , '.view_op_history_Btn' , function(){
        var thisdata = $(this).data('val')

        console.log(thisdata)
        get_History_data(thisdata.op_id , 'Appointment')

    })



    function IP_Patient_History(IP_data){

        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(IP_data);

        if ($.fn.dataTable.isDataTable("#IP_HistoryListDT")) {
            $("#IP_HistoryListDT").DataTable().destroy();
        }

        var patientListDatatable = $("#IP_HistoryListDT").DataTable({
            "dom": '<"top"B>rt<"bottom"ip>',
            buttons: [
                {
                    extend: 'print',
                    footer: true ,
                    title:"<div>\
                            <h3 style='text-align:center'>Nehru Nursing Home</h3>\
                            <h4>IP History</h4>\
                            </div>",
                    text: '<p class="pdf_btn"><span class="fa fa-print" style="margin-right:6px"></span>Print</p>',
                    exportOptions: {
                        modifier: {
                            page: 'all'
                        },
                        columns: ':visible'
                    }
                }
            ],
            data: IP_data,
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
                    "title": "IP ID",
                    "data": "ip_id"
                },
                {
                    "title": "Appointed Date",
                    "data": "appointment_date"
                },
                {
                    "title": "Reason",
                    "data": "reason"
                },
                {
                    "title": "Total",
                    "data": "total"
                },                
                {
                    "title": "Discount",
                    "data": "discount"
                },
                {
                    "title" : "Paid",
                    "data"  :"paid"
                },
                {
                    "title" : "Balance",
                    "data"  :"balance"
                },

            ],
            columnDefs: [
                {
                    "targets": 0,
                    "visible": true
                },
                {
                    "targets" : 1,
                    "render" : function(data , type , row)
                    {
                        return ('<h2 class="table-avatar">\
                        <a href="javascript:void(0)">' + moment(new Date(data)).format("DD-MM-YYYY") + ' <span style="text-align:center"> ( ' + moment(new Date(data)).format("HH:mm A") + ' )</span></a>\
                    </h2>')
                    }
                }, 
                {
                    "targets" : 6,
                    "render" : function(data , type , row){
                        if(data == 0){
                            return '<span style="color : green">'+data+'</span>'
                        }else{
                            return '<span style="color : red">'+data+'</span>'
                        }
                    }
                },
                {
                    "targets" : 7,
                    "data" : null,
                    "title" : "Action",
                    "render" : function(data , type , row) 
                    {
                        return (
                            "<a class='btn btn-outline-primary view_ip_history_Btn' data-val='" + JSON.stringify(row) + "'  href = 'javascript:void(0)'>View</a>"
                            )
                    }
                }
            ],drawCallback: function () {
                var api = this.api();
                var sum = 0;
                var formated = 0;

                $(api.column(0).footer()).html('Total');

                for(var i=3; i<=6;i++){
                    sum = api.column(i, {page:'current'}).data().sum();
                    formated = parseFloat(sum).toLocaleString(undefined, {minimumFractionDigits:2});
                    $(api.column(i).footer()).html('₹ '+formated);
                }
            }   


        })

    }

    $("#IP_HistoryListDT").on('click' , '.view_ip_history_Btn' , function(){
        var thisdata = $(this).data('val')

        console.log(thisdata)
        get_History_data(thisdata.ip_id , 'AssignRoom')

    })





function get_History_data(ID,TYPE){

    console.log(ID,TYPE)

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

    
    $.ajax({
        type: "GET",
        url: $('#get_patient_checkup_history').data('url')+"?appointment_id="+ID +"&type="+TYPE,
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


}


$('.modal_close').click(function(){
    $('.btn-closed').trigger('click')
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






