$(document).ready(function(){

    $('.searchBtn').click(function(){
        var from_date = $('#fromDate').val()
        var to_date = $('#toDate').val()
        console.log(from_date)
        console.log(to_date)

        $.ajax({

            type: "GET",
            url: 'get_cashier_report' + "?from_date=" + from_date+"&to_date=" + to_date,
            success : function(data){
                Collection_amount_DT(data.total_collection_amount);
            },
        
            error : function(exception){
        
                console.log(exception)
                
            }
        })
    })






    function Collection_amount_DT(amount) {

        
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(amount);

        if ($.fn.dataTable.isDataTable("#Collection_Amount_DT")) { $("#Collection_Amount_DT").DataTable().destroy(); }

        var Patient_Appointment_ListDatatable = $("#Collection_Amount_DT").DataTable({
            "dom": '<"top"B>rt<"bottom"ip>',
            buttons: [
                {
                    extend: 'print',
                    footer: true ,
                    title:" <h4 style='text-align:center'>Collection Amount</h4>",
                    text: '<p class="pdf_btn"><span class="fa fa-print" style="margin-right:6px"></span>Print</p>',
                    exportOptions: {
                        modifier: {
                            page: 'all'
                        },
                        columns: ':visible'
                    }
                }
            ],
            "data": amount,
            responsive: true,
            paging: true,
            searching: true,
            "autoWidth": true,
            "jQueryUI": true,
            "scrollY": false,
            "scrollCollapse": true,
            "order": [0, "desc"],
            "pageLength": 10,
            "bLengthChange": false,
            "scrollX": false,
            columns: [
                {
                    "title": "Name",
                    "data": "user_name"
                },
                {
                    "title": "Total",
                    "data": "total_paid"
                },
                {
                    "title": "Cash",
                    "data": "total_cash"
                },
                {
                    "title": "UPI",
                    "data": "total_upi"
                },
                {
                    "title": "Card",
                    "data": "total_card"
                },


            ],

            footerCallback: function (row, data, start, end, display) {
                var api = this.api();
     
                // Remove the formatting to get integer data for summation
                // var parseInt = function (i) {
                //     return typeof i === 'string' ? i.replace(/[\$,]/g, '') * 1 : typeof i === 'number' ? i : 0;
                // };

                totalPaid = api
                    .column(1, {"search": "applied"})
                    .data()
                    .reduce(function (a, b) {
                        return parseInt(a) + parseInt(b);
                    }, 0);
                // Update footer
                totalCash = api
                    .column(2, {"search": "applied"})
                    .data()
                    .reduce(function (a, b) {
                        return parseInt(a) + parseInt(b);
                    }, 0);
                // Update footer
                totalUPI = api
                    .column(3, {"search": "applied"})
                    .data()
                    .reduce(function (a, b) {
                        return parseInt(a) + parseInt(b);
                    }, 0);
                // Update footer
                totalCard = api
                    .column(4, {"search": "applied"})
                    .data()
                    .reduce(function (a, b) {
                        return parseInt(a) + parseInt(b);
                    }, 0);
                // Update footer

                $(api.column(1).footer()).html( '₹ ' + totalPaid ).css("color" , "#7638ff");
                $(api.column(2).footer()).html( '₹ ' + totalCash ).css("color" , "#7638ff");
                $(api.column(3).footer()).html( '₹ ' + totalUPI ).css("color" , "#7638ff");
                $(api.column(4).footer()).html( '₹ ' + totalCard ).css("color" , "#7638ff");
                // $(".totalText").html( 'Total : ₹ ' + pageTotalPaid + ' ( ₹ ' + totalPaid + ' total)');
            },
        })
    };



})






