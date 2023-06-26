$(document).ready(function()
{
 


    $(".addNewbtn").click(function()
    {
        $("#add_health_checkup_master_Form").trigger("reset");
        $("#health_checkup_masterId").val("0");

        $(".submitBtn").text("Add");

        $(".HealthCheckupListDTSection").hide();
        $(".addNewBtnSection").hide();
        $(".backBtnSection").show();
        $(".HealthCheckupInfoSection").show();
    });


    $(".backBtn").click(function()
    {
        $(".backBtnSection").hide();
        $(".HealthCheckupInfoSection").hide();
        $(".HealthCheckupListDTSection").show();
        $(".addNewBtnSection").show();
    });


    $.ajax({
        type: "GET",
        url: 'get_health_checkup_master_data',
        success: function (data) {

            console.log(data)
            healthcheckupmasterTable(data.health_checkup_master_data);
        },
        error: function (exception) {
            console.log(exception)
        }
    });


    function healthcheckupmasterTable(dataObj) {
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(dataObj);

        if ($.fn.dataTable.isDataTable("#HealthCheckupDT")) {
            $("#HealthCheckupDT").DataTable().destroy();
        }

        var healthcheckupmasterTable = $("#HealthCheckupDT").DataTable({
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
                    "title": "Id",
                    "data": "id"
                },
                {
                    "title": "Name",
                    "data": "name"
                },
                {
                    "title": "Unit",
                    "data": "unit"
                },
                {
                    "title": "Description",
                    "data": "description"
                },
                {
                    "title": "Action",
                    "data": null
                },
            ],
            columnDefs: [{
                    "targets" : 0,
                    "visible" : true
                },
                {
                    "targets" : 4,
                    "data" : null,
                    "title" : "Action",
                    "render" : function(data , type , row){
                        return ("<button type='button' class='btn btn-outline-primary EditBtn' data-val='" + JSON.stringify(row) + "' >\
                                <i class='menu-icon tf-icons bx bx-edit'></i> Edit</button>")
                    }
                }
            ]

        })
    };


    $("#HealthCheckupDT").on("click" , ".EditBtn" , function(){

        var thisData = $(this).data("val");
   
        console.log(thisData)

        $("#health_checkup_masterId").val(thisData.id);
        $("#name").val(thisData.name);
        $("#unit").val(thisData.unit);
        $("#description").val(thisData.description);

        $(".formSubmitBtn").text("Save Changes")

        $(".HealthCheckupListDTSection").hide();
        $(".addNewBtnSection").hide();

        $(".backBtnSection").show();
        $(".HealthCheckupInfoSection").show();
    })




})