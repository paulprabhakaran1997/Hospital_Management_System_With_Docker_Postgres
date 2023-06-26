$(document).ready(function(){
    /* @Vinish */

    $('input[name="dates"]').daterangepicker({
        ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                'This Year': [moment().startOf('year'), moment().endOf('year')],
                'Last Year': [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year')],
                'All Time': [moment("2010-01-01"), moment()],
                },
        "locale": {
            "format": "DD/MM/YYYY",
            "separator": " - ",
            "weekLabel": "W",
            "firstDay": 1
        },
        "linkedCalendars": false,
        "alwaysShowCalendars": true,
        "startDate": moment(),
        "endDate": moment(),
    }, function(start, end, label) {
      console.log('New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')');
    });

    /* @vinish */

    $('.searchBtn').click(function(){

        var from_date = moment($('input[name="dates"]').data('daterangepicker').startDate._d).format('YYYY-MM-DD');
        var to_date = moment($('input[name="dates"]').data('daterangepicker').endDate._d).format('YYYY-MM-DD');

        $.ajax({
            type: 'POST',
            crossDomain: true,
            data: {from_date: from_date, to_date: to_date},
            url: "http://192.168.1.200/Medical/public/get-sales-report-api.php",
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            success: function (data) {

                
               
               get_sale_id(data);
               overall_report_ajax();
            }, error: function (exception) {
                console.log("Exception = ", exception)
            }
        });
        overall_report_ajax();
        function overall_report_ajax(){
            $.ajax({
                type: "GET",
                url: 'get_overall_report' + "?from_date=" + from_date+"&to_date=" + to_date,
                success : function(data){
                    get_over_all_report(data);
                    console.log(data)
                },
                error : function(exception){
                    console.log(exception)
                }
            })
        }


        var Sale_id_array = [];

        function get_sale_id(data){
            data != undefined ? Sale_id_array = JSON.parse(data) : null ;
        }

        function get_over_all_report(data){


            var OP_dataObj = data.op_payment_report_data;

            for (var i = 0 ; i < OP_dataObj.length ; i++ ){
                var total_medicine_amount = 0
                for (var j = 0 ; j < OP_dataObj[i].sale_ID.length ; j++ ){
                    var result = Sale_id_array.filter(function(obj){
                        return parseInt(obj.sale_id) == OP_dataObj[i].sale_ID[j]
                    })
                    $.map(result, function(i) {total_medicine_amount += parseFloat(i.total)});
                }
                OP_dataObj[i]['medicine_amount'] = total_medicine_amount
            }

            OverAll_Report_OP_DT(OP_dataObj);
     

            var IP_dataObj = data.ip_payment_report_data
            for (var i = 0 ; i < IP_dataObj.length ; i++ ){
                var total_medicine_amount = 0
                for (var j = 0 ; j < IP_dataObj[i].sale_ID.length ; j++ ){
                    var result = Sale_id_array.filter(function(obj){
                        return parseInt(obj.sale_id) == IP_dataObj[i].sale_ID[j]
                    })
                    $.map(result, function(i) {total_medicine_amount += parseFloat(i.total)});
                }
                IP_dataObj[i]['medicine_amount'] = total_medicine_amount
            }

            OverAll_Report_IP_WP_DT(IP_dataObj);



            var medicine_department_amount = 0
            $.map(Sale_id_array, function(i) {medicine_department_amount += parseFloat(i.total)});
            var all_arr = data.all_charges
            all_arr.push({charge_type : 'Medical', amount : medicine_department_amount.toFixed(2)})
            All_Fees_DT(all_arr) 



            Recived_DoctorFees_OP_DT(data.OP_total_doctor_Fees);
            Collection_amount_DT(data.total_collection_amount);
            previous_transactionDT(data.previous_transactions);
        
    }

    })



    function OverAll_Report_OP_DT(DataObj) {

        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(DataObj);

        if ($.fn.dataTable.isDataTable("#OverAll_Report_OP_DT")) { $("#OverAll_Report_OP_DT").DataTable().destroy(); }

        var Patient_Appointment_ListDatatable = $("#OverAll_Report_OP_DT").DataTable({
            "dom": '<"top"B>rt<"bottom"ip>',
             buttons: [
                {
                    extend: 'print',
                    footer: true ,
                    title:"Over All OP Report",
                    text: '<p class="pdf_btn"><span class="fa fa-print" style="margin-right:6px"></span>Print</p>',
                    exportOptions: {
                        modifier: {
                            page: 'all'
                        },
                        columns: ':visible',
                    }
                }
            ], 
            "data": DataObj,
            responsive: true,
            "bInfo" : false,
            paging: false,
            searching: false,
            "autoWidth": true,
            "jQueryUI": true,
            "scrollY": false,
            "scrollCollapse": true,
            "order": [0, "asc"],
            "pageLength": 10,
            "bLengthChange": false,
            "scrollX": false,
            columns: [{
                    "title": "Id",
                    "data": "id",
                    "width":"1%",
                },{
                    "title": "Patient",
                    "data": "patient_name",
                    "width":"1%",
                },{
                    "title": "Dr. Fee",
                    "data": "doctor_fees",
                    "width":"1%",
                },{
                    "title" : "Medical",
                    "data" : "medicine_amount",
                    "width":"1%",
                },{
                    "title": "Lab",
                    "data": "lab",
                    "width":"1%",
                },{
                    "title": "Xray",
                    "data": "xray",
                    "width":"1%",
                },{
                    "title": "Scan",
                    "data": "scan",
                    "width":"1%",
                },{
                    "title" : "Other's",
                    "data" : "other_payment",
                    "width":"1%",
                },{
                    "title": "SubTotal",
                    "data": "total",
                    "width":"1%",
                },{
                    "title": "Discount",
                    "data": "discount",
                    "width":"1%",
                },{
                    "title": "Total",
                    "data": 'total_after_discount',
                    "width":"1%",                   
                },{
                    "title": "Paid",
                    "data": "paid",
                    "width":"1%",
                },{
                    "title" : "Balance",
                    "data" : "balance",
                    "width":"1%",
                },
                
            ],
            columnDefs: [{
                    "targets": 0,
                    "visible": true,
                },{
                    "targets" : 1,
                    "render" : function(data , type , row){
                        return (
                            '<h2 class="table-avatar">\
                                <a href="javascript:void(0)">'+data+' <span style="text-align:center"> ( Patient Id :  '+row.patient_id+' )</span></a>\
                            </h2>'
                        )
                    }
                },{
                    "targets" : 10,
                    "render" : function(data , type , row){
                        if(data == 0){
                            return '<span style="color : green">'+data+'</span>'
                        }else{
                            return '<span style="color : red">'+data+'</span>'
                        }
                    }
                },
            ],drawCallback: function () {
                var api = this.api();
                var sum = 0;
                var formated = 0;

                $(api.column(0).footer()).html('Total');

                for(var i=2; i<=12;i++){
                    sum = api.column(i, {page:'current'}).data().sum();
                    formated = parseFloat(sum).toLocaleString(undefined, {minimumFractionDigits:2});
                    $(api.column(i).footer()).html('₹ '+formated);
                }
                
            }     
        })
    };


    function OverAll_Report_IP_WP_DT(DataObj) {

        
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(DataObj);

        if ($.fn.dataTable.isDataTable("#OverAll_Report_IP_WP_DT")) { $("#OverAll_Report_IP_WP_DT").DataTable().destroy(); }

       
        var Patient_Appointment_ListDatatable = $("#OverAll_Report_IP_WP_DT").DataTable({
            "dom": '<"top"B>rt<"bottom"ip>',
            buttons: [
                {
                    extend: 'print',
                    footer: true ,
                    title:"Over All IP Report",
                    text: '<p class="pdf_btn"><span class="fa fa-print" style="margin-right:6px"></span>Print</p>',
                    exportOptions: {
                        modifier: {
                            page: 'all'
                        },
                        columns: ':visible'
                    }
                }
            ],
            "data": DataObj,
            responsive: true,
            "bInfo" : false,
            paging: false,
            searching: false,
            "autoWidth": true,
            "jQueryUI": true,
            "scrollY": false,
            "scrollCollapse": true,
            "order": [0, "asc"],
            "pageLength": 10,
            "bLengthChange": false,
            "scrollX": false,
            columns: [{
                    "title": "Id",
                    "data": "id"
                },{
                    "title": "Patient",
                    "data": "patient_name"
                },{
                    "title": "Patient Type",
                    "data": "type"
                },{
                    "title": "Dr. Fee",
                    "data": "doctor_fees"
                },{
                    "title": "Room/Ward Fees",
                    "data": "room/Ward"
                },{
                    "title": "Nursing Charge",
                    "data": "nursing_charge"
                },{
                    "title": "Establishment Charges",
                    "data": "establishment_charges"
                },{
                    "title": "IV Fluid Charges",
                    "data": "iv_fluid_charges"
                },{
                    "title": "ICU Charges",
                    "data": "icu_charges"
                },{
                    "title": "Physiotherapy Charges",
                    "data": "physiotherapy_charges"
                },{
                    "title": "Surgery Charges",
                    "data": "surgery_charges"
                },{
                    "title": "Consultant Charges",
                    "data": "consultant_charges"
                },{
                    "title": "Dressing Charges",
                    "data": "dressing_charges"
                },{
                    "title": "Miscellaneous Charges",
                    "data": "miscellaneous_charges"
                },{
                    "title": "Injection",
                    "data": "injection"
                },{
                    "title" : "Medical",
                    "data" : "medicine_amount"
                },{
                    "title": "Lab",
                    "data": "lab"
                },{
                    "title": "Xray",
                    "data": "xray"
                },{
                    "title": "Scan",
                    "data": "scan"
                },{
                    "title" : "Other's",
                    "data" : "other_payment"
                },{
                    "title": "SubTotal",
                    "data": "total"
                },{
                    "title": "Discount",
                    "data": "discount"
                },{
                    "title": "Total",
                    "data": 'total_after_discount',                   
                },{
                    "title": "Paid",
                    "data": "paid"
                },{
                    "title" : "Balance",
                    "data" : "balance"
                },                
            ],
            columnDefs: [{
                    "targets": 0,
                    "visible": true,
                },{
                    "targets": [2,4,5,6,7,8,9,10,11,12,13,14],
                    "visible": false,
                },{
                    "targets" : 1,
                    "render" : function(data , type , row)
                    {
                        return (
                            '<h2 class="table-avatar">\
                                <a href="javascript:void(0)">'+data+' <span style="text-align:center"> [Patient Id :  '+row.patient_id+']</span></a>\
                            </h2>'
                        )
                    }
                },{
                    "targets" : 24,
                    "render" : function(data , type , row)
                    {
                        if(data == 0) {
                            return '<span style="color : green">'+data+'</span>'
                        } else {
                            return '<span style="color : red">'+data+'</span>'
                        }
                    }
                },
            ],drawCallback: function () {
                var api = this.api();
                var sum = 0;
                var formated = 0;

                $(api.column(0).footer()).html('Total');

                for(var i=2; i<=24;i++){
                    sum = api.column(i, {page:'current'}).data().sum();
                    formated = parseFloat(sum).toLocaleString(undefined, {minimumFractionDigits:2});
                    $(api.column(i).footer()).html('₹ '+formated);
                }
                
            }     
        })
    };


    function Recived_DoctorFees_OP_DT(DataObj) {

        
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(DataObj);

        if ($.fn.dataTable.isDataTable("#Recived_DoctorFees_OP_DT")) { $("#Recived_DoctorFees_OP_DT").DataTable().destroy(); }

        var Patient_Appointment_ListDatatable = $("#Recived_DoctorFees_OP_DT").DataTable({
            "dom": '<"top"B>rt<"bottom"ip>',
            buttons: [
                {
                    extend: 'print',
                    footer: true ,
                    title:"Recived Doctor Fees - OP",
                    text: '<p class="pdf_btn"><span class="fa fa-print" style="margin-right:6px"></span>Print</p>',
                    exportOptions: {
                        modifier: {
                            page: 'all'
                        },
                        columns: ':visible'
                    }
                }
            ],
            "data": DataObj,
            responsive: true,
            "bInfo" : false,
            paging: false,
            searching: false,
            "autoWidth": true,
            "jQueryUI": true,
            "scrollY": false,
            "scrollCollapse": true,
            "order": [0, "asc"],
            "pageLength": 10,
            "bLengthChange": false,
            "scrollX": false,
            columns: [{
                    "title": "Doctor Name",
                    "data": "doctor_name"
                },{
                    "title": "Total Appointment",
                    "data": "appointment_count"
                },{
                    "title": "Total Fees",
                    "data": "doctor_total_fees"
                },
            ],drawCallback: function () {
                var api = this.api();
                var sum = 0;
                var formated = 0;

                $(api.column(0).footer()).html('Total');

                for(var i=1; i<=2;i++){
                    sum = api.column(i, {page:'current'}).data().sum();
                    formated = parseFloat(sum).toLocaleString(undefined, {minimumFractionDigits:2});
                    $(api.column(i).footer()).html('₹ '+formated);
                }
                
            }     
        })
    };


    function All_Fees_DT(DataObj) {

        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(DataObj);

        if ($.fn.dataTable.isDataTable("#All_Fees_DT")) { $("#All_Fees_DT").DataTable().destroy(); }

        var ListDatatable = $("#All_Fees_DT").DataTable({
            "dom": '<"top"B>rt<"bottom"ip>',
            buttons: [
                {
                    extend: 'print',
                    footer: true ,
                    title:"Department Collection",
                    text: '<p class="pdf_btn"><span class="fa fa-print" style="margin-right:6px"></span>Print</p>',
                    exportOptions: {
                        modifier: {
                            page: 'all'
                        },
                        columns: ':visible'
                    }
                }
            ],
            "data": DataObj,
            responsive: true,
            "bInfo" : false,
            paging: false,
            searching: false,
            "autoWidth": true,
            "jQueryUI": true,
            "scrollY": false,
            "scrollCollapse": true,
            "order": [0, "asc"],
            "pageLength": 10,
            "bLengthChange": false,
            "scrollX": false,
            columns: [
                {
                    "title": "Charges",
                    "data": "charge_type"
                },
                {
                    "title": "Total",
                    "data": "amount"
                },
            ],drawCallback: function () {
                var api = this.api();
                var sum = 0;
                var formated = 0;

                $(api.column(0).footer()).html('Total');

                for(var i=1; i<=1;i++){
                    sum = api.column(i, {page:'current'}).data().sum();
                    formated = parseFloat(sum).toLocaleString(undefined, {minimumFractionDigits:2});
                    $(api.column(i).footer()).html('₹ '+formated);
                }
                
            }     
        })

    };


    function Collection_amount_DT(DataObj) {

        
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(DataObj);

        if ($.fn.dataTable.isDataTable("#Collection_Amount_DT")) { $("#Collection_Amount_DT").DataTable().destroy(); }

        var Patient_Appointment_ListDatatable = $("#Collection_Amount_DT").DataTable({
             "dom": '<"top"B>rt<"bottom"ip>',
            buttons: [
                {
                    extend: 'print',
                    footer: true ,
                    title:"<h4 style='text-align:center'>Collection Amount</h4>",
                    text: '<p class="pdf_btn"><span class="fa fa-print" style="margin-right:6px"></span>Print</p>',
                    exportOptions: {
                        modifier: {
                            page: 'all'
                        },
                        columns: ':visible'
                    }
                }
            ], 
            "data": DataObj,
            responsive: true,
            "bInfo" : false,
            paging: false,
            searching: false,
            "autoWidth": true,
            "jQueryUI": true,
            "scrollY": false,
            "scrollCollapse": true,
            "order": [0, "asc"],
            "pageLength": 10,
            "bLengthChange": false,
            "scrollX": false,
            columns: [{
                    "title": "Name",
                    "data": "user_name",
                },{
                    "title": "Total",
                    "data": "total_paid",
                },{
                    "title": "Cash",
                    "data": "total_cash",
                },{
                    "title": "UPI",
                    "data": "total_upi",
                },{
                    "title": "Card",
                    "data": "total_card",
                },
            ],drawCallback: function () {
                var api = this.api();
                var sum = 0;
                var formated = 0;

                $(api.column(0).footer()).html('Total');

                for(var i=1; i<=4;i++){
                    sum = api.column(i, {page:'current'}).data().sum();
                    formated = parseFloat(sum).toLocaleString(undefined, {minimumFractionDigits:2});
                    $(api.column(i).footer()).html('₹ '+formated);
                }
                
            }     
        })
    };


    function previous_transactionDT(DataObj) {

        
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(DataObj);

        if ($.fn.dataTable.isDataTable("#previous_transactionDT")) { $("#previous_transactionDT").DataTable().destroy(); }

        var previous_transactionDT = $("#previous_transactionDT").DataTable({
             "dom": '<"top"B>rt<"bottom"ip>',
            buttons: [
                {
                    extend: 'print',
                    footer: true ,
                    title:"<h4 style='text-align:center'>Collection Amount</h4>",
                    text: '<p class="pdf_btn"><span class="fa fa-print" style="margin-right:6px"></span>Print</p>',
                    exportOptions: {
                        modifier: {
                            page: 'all'
                        },
                        columns: ':visible'
                    }
                }
            ], 
            "data": DataObj,
            responsive: true,
            "bInfo" : false,
            paging: false,
            searching: false,
            "autoWidth": true,
            "jQueryUI": true,
            "scrollY": false,
            "scrollCollapse": true,
            "order": [0, "asc"],
            "pageLength": 10,
            "bLengthChange": false,
            "scrollX": false,
            columns: [
                {
                    "title": "Transaction Date",
                    "data": "trns_date",
                },{
                    "title": "Name",
                    "data": "patient_name",
                },{
                    "title": "Patinet Type",
                    "data": "patient_type",
                },{
                    "title": "Appoint At",
                    "data": "appoint_date",
                },{
                    "title": "Paid",
                    "data": "paid",
                }
            ],
            columnDefs: [{
                "targets" : 0,
                "render" : function(data , type , row)
                {
                    return (
                        '<h2 class="table-avatar">\
                            <a href="javascript:void(0)">'+moment(new Date(data)).format("DD-MMM-YYYY")+'<span style="text-align:center"> [Patient Id :  '+row.patient_id+']</span></a>\
                        </h2>'
                    )
                }
            },{
                "targets" : 3,
                "render" : function(data , type , row)
                {
                    return (
                        '<h2 class="table-avatar">\
                            <a href="javascript:void(0)">'+moment(new Date(data)).format("DD-MMM-YYYY")+' <span style="text-align:center"> [Appoint Id :  '+row.appoint_id+']</span></a>\
                        </h2>'
                    )
                }
            }
        ],
        drawCallback: function () {
            var api = this.api();
            var sum = 0;
            var formated = 0;
            $(api.column(0).footer()).html('Total');
            for(var i=4; i<=4;i++){
                sum = api.column(i, {page:'current'}).data().sum();
                formated = parseFloat(sum).toLocaleString(undefined, {minimumFractionDigits:2});
                $(api.column(i).footer()).html('₹ '+formated);
            }
        }      
        })
    };






})
