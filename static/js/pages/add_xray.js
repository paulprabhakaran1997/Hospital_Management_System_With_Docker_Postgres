$(document).ready(function()
{

    $(".addNewbtn").click(function()
    {
        $("#addXrayForm").trigger("reset");
        $("#xrayId").val("0");
        $(".submitBtn").text("Add");

        $(".xrayListDTSection").hide();
        $(".addNewBtnSection").hide();

        $(".backBtnSection").show();
        $(".xrayCreateSection").show();
    });


    $(".backBtn").click(function()
    {
        $(".backBtnSection").hide();
        $(".xrayCreateSection").hide();

        $(".xrayListDTSection").show();
        $(".addNewBtnSection").show();
    });


    xrayTable();

    function xrayTable() {
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })();

        if ($.fn.dataTable.isDataTable("#xrayListDT")) {
            $("#xrayListDT").DataTable().destroy();
        }

        var xrayListDatatable = $("#xrayListDT").DataTable({
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


    $("#xrayListDT").on("click" , ".EditBtn" , function()
    {
        var thisData = $(this).data("val");

        eval('var thisXrayData = ' + thisData);

        $("#xrayId").val(thisXrayData.id);
        $("#name").val(thisXrayData.name);
        $("#amount").val(thisXrayData.amount);
        $("#description").val(thisXrayData.description);

        $(".submitBtn").text("Save Changes");

        $(".xrayListDTSection").hide();
        $(".addNewBtnSection").hide();

        $(".backBtnSection").show();
        $(".xrayCreateSection").show();
    });


})


$('a[data-toggle="tab"]').on('shown.bs.tab', function(e){
    $($.fn.dataTable.tables(true)).DataTable()
       .columns.adjust();
 });