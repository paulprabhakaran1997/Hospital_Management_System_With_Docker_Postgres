$(document).ready(function()
{
  
    var RoleData = $("#RoleData").data("val");
 
    var role_select2_data = []

    $.each(RoleData , function(index , obj)
    {
        role_select2_data.push({id : obj.id , text : obj.name})       
    });

    $("#role").select2({
        data : role_select2_data,
        allowClear : false
    })


    $(".addNewbtn").click(function()
    {
        $("#addDoctorForm").trigger("reset");
        $("#doctorId").val("0");
        $("#gender").val("").trigger("change");
        $(".submitBtn").text("Add Doctor");

        $("#password").attr("required" , "required");
        $('input:checkbox').prop('checked' , false);


        $(".doctorListDTSection").hide();
        $(".addNewBtnSection").hide();

        $(".backBtnSection").show();
        $(".doctorInfoSection").show();
    });


    $(".backBtn").click(function()
    {
        $(".backBtnSection").hide();
        $(".doctorInfoSection").hide();

        $(".doctorListDTSection").show();
        $(".addNewBtnSection").show();
    });


    doctorTable();

    function doctorTable() {
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })();

        if ($.fn.dataTable.isDataTable("#doctorListDT")) {
            $("#doctorListDT").DataTable().destroy();
        }

        var doctorListDatatable = $("#doctorListDT").DataTable({
            responsive: true,
            paging: true,
            searching: true,
            "scrollY": false,
            "scrollCollapse": true,
            "order": [0, "desc"],
            "pageLength": 10,
            "bLengthChange": false,
            "scrollX": false,
            columnDefs: [
                {
                    "targets" : 0,
                    "visible" : false
                }
            ]

        })
    };


    $("#doctorListDT").on("click" , ".EditBtn" , function()
    {
        var thisData = $(this).data("val");

        eval('var thisDoctorData = ' + thisData);

        $("#doctorId").val(thisDoctorData.id);

        $("#name").val(thisDoctorData.name);
        $("#phone").val(thisDoctorData.phone);
        $("#specialized").val(thisDoctorData.specialized);
        $("#fees").val(thisDoctorData.fees);
        $("#address").val(thisDoctorData.address);
        $("#username").val(thisDoctorData.username)

        $(".submitBtn").text("Save Changes");

        $("#password").attr("required" , false);
        $('#select_all_checkup').prop("checked", false);
        $('.doctor_checkup_master_fields').prop("checked", false)


        $(".doctorListDTSection").hide();
        $(".addNewBtnSection").hide();

        $(".backBtnSection").show();
        $(".doctorInfoSection").show();


        for(var i =0 ; i<thisDoctorData.health_checkup_master.length ; i++){
            $('#'+thisDoctorData.health_checkup_master[i].id).prop('checked' , true)

        }
    });


    $.ajax({
        type: "GET",
        url: $('#get_health_checkup_master_data').data('url'),
        success: function (data) {
            build_health_checkup_master_data(data.health_checkup_master_data);
        },
        error: function (exception) {
            console.log(exception)
        }
    });


    function build_health_checkup_master_data(data) {

        $('.doctor_checkup_master_section').empty()

        console.log(data)

        for (var i = 0; i < data.length; i++) {

            var master_html = '<div class="col-md-3">\
                                    <div class="doctor_checkup_master_list">\
                                        <div class="form-check">\
                                            <input class="form-check-input doctor_checkup_master_fields" name="doctor_checkup_master_fields" type="checkbox" data-val="'+data[i].id+'"  data-unit="'+data[i].unit+'"  value="'+data[i].name+'" id="'+data[i].id +'">\
                                            <label class="form-check-label" for="'+data[i].id+'">'+data[i].name+'</label>\
                                        </div>\
                                    </div>\
                                </div>'

            $('.doctor_checkup_master_section').append(master_html)

        }

    }

    $('#select_all_checkup').on('change' , function(){
        ($(this).is(":checked") ? $('.doctor_checkup_master_fields').prop("checked", true) : $('.doctor_checkup_master_fields').prop("checked", false))
    })



    $('#addDoctorForm').submit(function (e) {
        // e.preventDefault();
        var doctor_checkup_master_Obj = []
        var fields = $("input[name='doctor_checkup_master_fields']").serializeArray();
        if (fields.length === 0) {
            e.preventDefault();

            iziToast.info({
                timeout: 1000,
                balloon: true,
                overlay: true,
                displayMode: 'once',
                id: 'error',
                title: 'Error',
                zindex: 99999999,
                message: '<b>No Checkup is Selected</b>',
            });
            return false;
        }
        else {

            $('.doctor_checkup_master_list').each(function () {

                if ($(this).find('input[name="doctor_checkup_master_fields"]').is(':checked')) {
                    var all_data = {
                        id: $(this).find('input[name="doctor_checkup_master_fields"]').data('val'),
                        name: $(this).find('input[name="doctor_checkup_master_fields"]').val(),
                        unit: $(this).find('input[name="doctor_checkup_master_fields"]').data('unit'),
                    }
                    doctor_checkup_master_Obj.push(all_data)
                }
            });

        }
        console.log(doctor_checkup_master_Obj)
        $('#health_checkup_master_selected').val(JSON.stringify(doctor_checkup_master_Obj))

    });


})