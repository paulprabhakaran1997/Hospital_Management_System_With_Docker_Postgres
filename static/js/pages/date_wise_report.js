$(document).ready(function(){

    $('.searchBtn').click(function(){
        var from_date = $('#fromDate').val()
        var to_date = $('#toDate').val()
        console.log(from_date)
        console.log(to_date)

        $.ajax({

            type: "GET",
            url: 'get_date_wise_report' + "?from_date=" + from_date+"&to_date=" + to_date,
            success : function(data){
                console.log(data)


                const res = data.date_wise.reduce((acc, curr) => {
                    var thisIdx = acc.findIndex((item) => item.date === curr.date);
                    if (thisIdx === -1) {
                      acc.push({ date: curr.date, total: curr.total , discount: curr.discount , paid: curr.paid , balance: curr.balance });
                    } else {
                      acc[thisIdx] = { date: curr.date, total: (acc[thisIdx].total) + curr.total , discount: (acc[thisIdx].discount) + curr.discount , paid: (acc[thisIdx].paid) + curr.paid , balance: (acc[thisIdx].balance) + curr.balance };
                    }
                    return acc;
                  }, []);
                  
                  console.log("Result = ", res);

                  Date_Wise_Collection_DT(res)
            },
        
            error : function(exception){
        
                console.log(exception)
                
            }
        })
    })






    function Date_Wise_Collection_DT(amount) {

        
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(amount);

        if ($.fn.dataTable.isDataTable("#Date_Wise_Collection_DT")) { $("#Date_Wise_Collection_DT").DataTable().destroy(); }

        var Date_Wise_Collection_DT = $("#Date_Wise_Collection_DT").DataTable({
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
                    "title": "Date",
                    "data": "date"
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
                    "title": "Paid",
                    "data": "paid"
                },
                {
                    "title": "Balance",
                    "data": "balance"
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



})






