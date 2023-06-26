$(document).ready(function()
{
   
    $("#role").select2({
        placeholder : "Select Role",
        allowClear : true
    })


    $(".addNewbtn").click(function()
    {
        $("#addStaffForm").trigger("reset");
        $("#staffId").val("0");
        $("#role").val("").trigger("change");
        $(".submitBtn").text("Add");
        $("#password").attr("required" , "required");

        $(".staffListDTSection").hide();
        $(".addNewBtnSection").hide();

        $(".backBtnSection").show();
        $(".staffInfoSection").show();
    });


    $(".backBtn").click(function()
    {
        $(".backBtnSection").hide();
        $(".staffInfoSection").hide();

        $(".staffListDTSection").show();
        $(".addNewBtnSection").show();
    });


    staffTable();

    function staffTable() {
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })();

        if ($.fn.dataTable.isDataTable("#staffListDT")) {
            $("#staffListDT").DataTable().destroy();
        }

        var staffListDatatable = $("#staffListDT").DataTable({
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


    $("#staffListDT").on("click" , ".EditBtn" , function()
    {
        var thisData = $(this).data("val");

        eval('var thisStaffData = ' + thisData);

        $("#staffId").val(thisStaffData.id);

        $("#name").val(thisStaffData.name)
        $("#phone").val(thisStaffData.phone)
        $("#address").val(thisStaffData.address)
        $("#role").val(thisStaffData.role_id).trigger("change");
        $("#username").val(thisStaffData.username);

        $("#password").attr("required" , false);

        
        $(".submitBtn").text("Save Changes");

        $(".staffListDTSection").hide();
        $(".addNewBtnSection").hide();

        $(".backBtnSection").show();
        $(".staffInfoSection").show();
    });


})