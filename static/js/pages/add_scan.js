$(document).ready(function()
{

    $(".addNewbtn").click(function()
    {
        $("#addScanForm").trigger("reset");
        $("#ScanId").val("0");
        $(".submitBtn").text("Add");

        $(".scanListDTSection").hide();
        $(".addNewBtnSection").hide();

        $(".backBtnSection").show();
        $(".scanCreateSection").show();
    });


    $(".backBtn").click(function()
    {
        $(".backBtnSection").hide();
        $(".scanCreateSection").hide();

        $(".scanListDTSection").show();
        $(".addNewBtnSection").show();
    });


    scanTable();

    function scanTable() {
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })();

        if ($.fn.dataTable.isDataTable("#scanListDT")) {
            $("#scanListDT").DataTable().destroy();
        }

        var scanListDatatable = $("#scanListDT").DataTable({
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


    $("#scanListDT").on("click" , ".EditBtn" , function()
    {
        var thisData = $(this).data("val");

        eval('var thisScanData = ' + thisData);

        $("#ScanId").val(thisScanData.id);
        $("#name").val(thisScanData.name);
        $("#amount").val(thisScanData.amount);
        $("#description").val(thisScanData.description);

        $(".submitBtn").text("Save Changes");

        $(".scanListDTSection").hide();
        $(".addNewBtnSection").hide();

        $(".backBtnSection").show();
        $(".scanCreateSection").show();
    });


})


$('a[data-toggle="tab"]').on('shown.bs.tab', function(e){
    $($.fn.dataTable.tables(true)).DataTable()
       .columns.adjust();
 });