$(document).ready(function(){

    hometable();

    function hometable() {
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })();
    
        if ($.fn.dataTable.isDataTable("#RoomTable")) {
            $("#RoomTable").DataTable().destroy();
        }
    
        var doctorListDatatable = $("#RoomTable").DataTable({
            responsive: true,
            paging: true,
            searching: false,
            "scrollY": false,
            "scrollCollapse": true,
            "order": [4, "desc"],
            "pageLength": 10,
            "bLengthChange": false,
            "scrollX": false,
            columnDefs: [
                {
                    "targets" : 0,
                    "visible" : false
                },
                
            ]
    
        })
    };


    wardtable();

    function wardtable() {
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })();
    
        if ($.fn.dataTable.isDataTable("#WardTable")) {
            $("#WardTable").DataTable().destroy();
        }
    
        var doctorListDatatable = $("#WardTable").DataTable({
            responsive: true,
            paging: true,
            searching: false,
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
    
    
})