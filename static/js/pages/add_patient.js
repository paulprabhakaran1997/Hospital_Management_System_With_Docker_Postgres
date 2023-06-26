$(document).ready(function()
{
   
    var PatientData = $("#PatientData").data("val");

    $("#gender").select2({
        placeholder : "Select Gender",
        allowClear : true,
        minimumResultsForSearch: -1
    });

    $(".numberInput").click(function()
    {
        $(this).select()
    })

    $(".addNewbtn").click(function()
    {
        $("#addPatientForm").trigger("reset");
        $("#patientId").val("0");
        $("#posId").val("0");
        $("#gender").val("").trigger("change");
        $(".formSubmitBtn").text("Add Patient")

        $(".patientListDTSection").hide();
        $(".addNewBtnSection").hide();

        $(".backBtnSection").show();
        $(".patientInfoSection").show();
    });


    $(".backBtn").click(function()
    {
        $(".backBtnSection").hide();
        $(".patientInfoSection").hide();

        $(".patientListDTSection").show();
        $(".addNewBtnSection").show();
    });


        $.ajax({
            type: "GET",
            url: 'get_patient_data',
            success: function(data) {
                patientTable(data);
            },
            error: function(exception) {
                console.log(exception)
            }
        });



    function patientTable(dataObj) {
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(dataObj);

        if ($.fn.dataTable.isDataTable("#patientListDT")) {
            $("#patientListDT").DataTable().destroy();
        }

        var patientListDatatable = $("#patientListDT").DataTable({
            data : dataObj,
            responsive: true,
            paging: true,
            "scrollY": false,
            "scrollCollapse": true,
            "order": [0, "desc"],
            "pageLength": 10,
            "bLengthChange": false,
            "scrollX": false,
            "searching": true,
            columns: [{
                    "title": "Patient Id",
                    "data": "id"
                },{
                    "title": "Name",
                    "data": "name"
                },{
                    "title": "Age",
                    "data": "age"
                },{
                    "title": "Phone",
                    "data": "phone"
                },{
                    "title": "Address",
                    "data": "address"
                },],
            columnDefs: [{
                    "targets" : 0,
                    "visible" : true
                },{
                    "targets" : 1,
                    "render" : function(data , type , row){   
                        var fatherNameText = "";
                        if(row.father_name != ""){
                            if(row.gender == "Male") { fatherNameText = "( S/O "+row.father_name+" )" }
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
                },{
                    "targets" : 2,
                    "render" : function(data , type , row){
                        return ('<h2 class="table-avatar">\
                                    <a href="javascript:void(0)">' + data + ' <span style="text-align:left"> ( ' + row.gender + ' )</span> </a>\
                                </h2>')
                    }
                },{
                    "targets" : 5,
                    "data" : null,
                    "title" : "Action",
                    "render" : function(data , type , row){
                        return ("<button type='button' class='btn btn-outline-primary EditBtn' data-val='" + JSON.stringify(row) + "' >\
                                    <i class='menu-icon tf-icons bx bx-edit'></i> Edit</button>\
                                <button type='button' class='btn btn-outline-primary add_OP_Btn' data-toggle='modal' data-target='#add_OP' data-val='" + JSON.stringify(row) + "' >\
                                    <i class='menu-icon tf-icons bx bx-edit'></i>OP</button>\
                                    <a class='btn btn-outline-primary' href = '/accounts/patient_report/"+row.id+"'>\
                                    <i class='fa fa-expand'></i></a>")
                    }
                }
            ]

        })
    };


    $("#patientListDT").on("click" , ".EditBtn" , function(){

        var thisData = $(this).data("val");
   
        $("#patientId").val(thisData.id);
        $("#posId").val(thisData.pos_id);
        $("#name").val(thisData.name);
        $("#gender").val(thisData.gender).trigger("change");
        $("#age").val(thisData.age);
        $("#month").val(thisData.month);
        $("#father_name").val(thisData.father_name);
        $("#phone").val(thisData.phone);
        $("#address").val(thisData.address);

        $(".formSubmitBtn").text("Save Changes")

        $(".patientListDTSection").hide();
        $(".addNewBtnSection").hide();

        $(".backBtnSection").show();
        $(".patientInfoSection").show();
    })


    $("#patientListDT").on("click" , ".add_OP_Btn" , function(){

        var thisData = $(this).data("val");

        console.log(thisData)
        $("#doctor").val("").trigger("change");
        
        $("#addAppointmentForm").trigger("reset");
        $("#is_emergency_val").val("false");

        $("#patientId_OP").val(thisData.id);

        $("#appointedPatientId").text(thisData.id);
        $("#appointedPatientName").text(thisData.name);
        $("#appointedPatientAge").text(thisData.age);
        $("#appointedPatientGender").text(thisData.gender);
        $("#appointedPatientPlace").text(thisData.place);
        $("#appointedDate").text(moment(new Date()).format("DD-MM-YYYY"));            
                
    })



    $.ajax({
        type: "GET",
        url: $("#get_doctor_data").data('url'),
        success: function (data) {
            doctor_select2(data.doctordata);
        },
        error: function (exception) {
        }
    });
   
  
    function doctor_select2(DoctorData)
    {
        var doctor_selecet2_data = [];

        for(var i=0;i<DoctorData.length;i++)
        {
            doctor_selecet2_data.push({ id : DoctorData[i].id , text : DoctorData[i].name , specialized : DoctorData[i].specialized })
        }
        $("#doctor").select2({
            data : doctor_selecet2_data,
            placeholder : "Select Doctor",
            allowClear : true,
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
            else{
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


    

    $("#addPatientForm").submit(function(e) {
        e.preventDefault();
        
        var months = ["jan", "feb", 'mar', 'apr', 'may', 'jun', 'jul', "aug", 'sep', 'oct', 'nov', 'dec'];

        var patientAge = $("input[name=age]").val();
        var patientMonth = $("input[name=month]").val();

        var totalmonth = (parseInt(patientAge) * 12) + parseInt(patientMonth);
        let currentdate = new Date();
        let birthDate = new Date(currentdate.setMonth(currentdate.getMonth() - totalmonth));

        $("input[name=dateofbirth]").val(moment(birthDate).format("YYYY-MM-DD"));

        var genderId = "";

        if($("#gender").val() == 'Male')
        {
            genderId = '1'
        }
        else
        {
            genderId = '0'
        }

        var dob = new Date($("input[name=dateofbirth]").val());
        var today = new Date();
        var age = Math.floor((today-dob) / (365.25 * 24 * 60 * 60 * 1000));

        var PatientObj = {
            'id' : $("#patientId").val(),
            'pos_id_no' : $("#posId").val(),
            'name' : $("#name").val(),
            'gender' : $("#gender").val(),
            'genderId' : genderId,
            'dob' : $("input[name=dateofbirth]").val(),
            'age' : age,
            'father_name' : $("#father_name").val(),
            'phone' : $("#phone").val(),
            'address' : $("#address").val(),
        };

        if($("#patientId").val() == '0')
        {
            $.ajax({
                type:'POST',
                crossDomain:true,
                data: {patientData: PatientObj},
                //url : "http://192.168.100.200/POS/public/create-patient-api.php",
                url: "http://192.168.1.200/Medical/public/create-patient-api.php",
                headers:{ 
                    'Access-Control-Allow-Origin':'*'
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
                        url: ".",
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
                    console.log("Exception = ",exception)
                }
            });
        }
        else
        {
            $.ajax({
                type:'POST',
                crossDomain:true,
                data: {patientData: PatientObj},
                //url : "http://192.168.100.200/POS/public/create-patient-api.php",
                url: "http://192.168.1.200/Medical/public/create-patient-api.php",

                headers:{ 
                    'Access-Control-Allow-Origin':'*'
                },
                success: function () {
                    $.ajax({
                        type: "POST",
                        headers: {
                            'X-CSRFToken': $.cookie("csrftoken"),
                            'Content-Type': 'application/json',
                        },
                        url: ".",
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
                    console.log("Exception = ",exception)
                }
            });
            
        }
	

        

        // $("#addPatientForm").unbind('submit').submit()

    });



})