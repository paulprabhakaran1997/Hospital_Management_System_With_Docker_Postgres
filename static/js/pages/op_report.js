$(document).ready(function()
{





    $.ajax({

        type: "GET",
        url : 'get_op_report',
        success : function(data){

            console.log(data)
            var AppointmentData = data.appointmentdata
            var patientPaymentTransactionData = data.outpatientpayment_transactiondata
            var BalanceData = data.balancedata

            ExecuteReport(AppointmentData , patientPaymentTransactionData , BalanceData)

            console.log(patientPaymentTransactionData)
        },

        error : function(exception){

            console.log(exception)
            
        }
    })

    var dates = ''



    function ExecuteReport(AppointmentData , patientPaymentTransactionData , BalanceData)
    {
        balance_table(BalanceData)
    

    var TodaysAppointmentReportData = AppointmentData.filter(function(obj)
    {
        var thisAppointmentDate = new Date(obj.appointment_date).toISOString().split('T')[0];
        var todayDate = new Date().toISOString().split('T')[0]

        return thisAppointmentDate == todayDate
    })

    Patient_appointment_table(TodaysAppointmentReportData)

    

    var TodaysPaymentReportData = patientPaymentTransactionData.filter(function(obj)
    {
        var thisPaymentDate = new Date(obj.payment_date).toISOString().split('T')[0];
        var todayDate = new Date().toISOString().split('T')[0]

        return thisPaymentDate == todayDate;
    })


    Payment_Report_Table(TodaysPaymentReportData);


   

    $(".resetBtn").click(function()
    {
        dates = ''
        $("#fromDate").val(new Date().toISOString().split('T')[0])
        $("#toDate").val(new Date().toISOString().split('T')[0])
        $("#toDate").attr("min" , $("#fromDate").val());

        $(".dateFilterText").text("")

        Patient_appointment_table(AppointmentData)

        Payment_Report_Table(patientPaymentTransactionData)
    })

    $("#todaysreportBtn").click(function()
    {
        $(".filterView").hide();
        $("#filter_inputs").hide();

        $(".appointmentTableTitle").text("Today's Patient Appointment report");

        $(".paymentTableTitle").text("Today's OP Patient Payment Transaction report");

        Patient_appointment_table(TodaysAppointmentReportData);
        Payment_Report_Table(TodaysPaymentReportData);
    })


    $("#ovarallReportBtn").click(function()
    {
        $(".appointmentTableTitle").text("Overall Appointment Report");

        $(".paymentTableTitle").text("Overall OP Payment Transaction Report");

        $("#filter_inputs").hide();

        $(".filterView").show();

        $(".dateFilterText").text("");

        Patient_appointment_table(AppointmentData);

        Payment_Report_Table(patientPaymentTransactionData);
        
        
    });


    $(document).on('click', '#filter_search', function () 
    { 
        $('#filter_inputs').slideToggle("slow"); 
        $("#fromDate").val(new Date().toISOString().split('T')[0]);
        $("#toDate").val(new Date().toISOString().split('T')[0]);
        $("#toDate").attr("min" , $("#fromDate").val());
        
    });


    $("#fromDate").on("change" , function()
    {
        var thisFromDate = $(this).val();

        var ToDate = $("#toDate").val();

        if( (new Date(thisFromDate)) >  (new Date(ToDate)))
        {
            $("#toDate").val(new Date(thisFromDate).toISOString().split('T')[0]);
        }

        $("#toDate").attr("min" , thisFromDate);
    })

    $(".searchBtn").click(function()
    {
        var FromDateVal = new Date($("#fromDate").val()).toISOString().split('T')[0];

        var ToDateVal = new Date($("#toDate").val()).toISOString().split('T')[0];
        dates = `( ${moment(new Date($("#fromDate").val())).format("DD-MMM-YYYY") } - ${moment(new Date($("#toDate").val())).format("DD-MMM-YYYY") })`;



        var Appointment_DateFilter_Data = AppointmentData.filter(function(data)
        {
            return ((new Date(data.appointment_date).toISOString().split('T')[0]) >= FromDateVal && (new Date(data.appointment_date).toISOString().split('T')[0]) <= ToDateVal)
        })


        var PaymentTransaction_DateFilter_Data = patientPaymentTransactionData.filter(function(data)
        {
            return ((new Date(data.payment_date).toISOString().split('T')[0]) >= FromDateVal && (new Date(data.payment_date).toISOString().split('T')[0]) <= ToDateVal)
        })


        $(".dateFilterText").text("( "+moment(FromDateVal).format("DD-MM-YYYY")+" To "+moment(ToDateVal).format("DD-MM-YYYY")+" )")

        Patient_appointment_table(Appointment_DateFilter_Data)

        Payment_Report_Table(PaymentTransaction_DateFilter_Data)

    })

   


    // Report Datatable Section


    // Patient Appointment Report Datatable

    function Patient_appointment_table(patient_appointment_data) {
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(patient_appointment_data);

        if ($.fn.dataTable.isDataTable("#patient_appointment_ListDT")) { $("#patient_appointment_ListDT").DataTable().destroy(); }

        var Patient_Appointment_ListDatatable = $("#patient_appointment_ListDT").DataTable({
            "dom": '<"top"B>rt<"bottom"ip>',
            buttons: [
                {
                    extend: 'print',
                    footer: true ,
                    title:"<div>\
                            <h3 style='text-align:center'>Nehru Nursing Home</h3>\
                            <h4>"+$(".appointmentTableTitle").text()+"&nbsp; "+dates+"</h4>\
                            </div>",
                    text: '<p class="pdf_btn"><span class="fa fa-print" style="margin-right:6px"></span>Print</p>',
                    exportOptions: {
                        modifier: {
                            page: 'all'
                        },
                        columns: ':visible'
                    }
                }
            ],
            "data": patient_appointment_data,
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
                    "title": "Id",
                    "data": "id"
                },
                {
                    "title": "Patient",
                    "data": "patient_name"
                },
                {
                    "title": "Age",
                    "data": "patient_age"
                },
                {
                    "title": "Reason",
                    "data": "reason"
                },
                {
                    "title" : "Appointed",
                    "data" : "appointment_date"
                },
                {
                    "title" : "Checkup",
                    "data" : "checkup"
                },
                {
                    "title" : "Doctor",
                    "data" : "doctor_name"
                },
                {
                    "title": "Fees",
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
                    "title" : "Balance",
                    "data" : "balance"
                }
            ],
            columnDefs: [
                {
                    "targets": 0,
                    "visible": false,
                },
                {
                    "targets" : 1,
                    "render" : function(data , type , row)
                    {
                        return (
                            '<h2 class="table-avatar">\
                                <a href="javascript:void(0)">'+data+' <span style="text-align:center"> ( Patient Id :  '+row.patient_id+' )</span></a>\
                            </h2>'
                        )
                    }
                },
                {
                    "targets" : 4,
                    "render" : function(data , type , row)
                    {
                        return ('<h2 class="table-avatar">\
                        <a href="javascript:void(0)">' + moment.utc(new Date(data)).format("DD-MM-YYYY") + ' <span style="text-align:center"> ( ' + moment.utc(new Date(data)).format("HH:mm A") + ' )</span></a>\
                    </h2>')
                    }
                }, 
                {
                    "targets" : 5,
                    "render" : function(data , type , row)
                    {
                        if(data == 'False')
                        {
                            return '<span class="me-1" style="color:green;font-weight: bold;">Waiting</span>'
                        }
                        else
                        {
                            return '<span class="me-1" style="color:#7638ff;font-weight: bold;">Visited</span>'
                        }
                    }
                },               
                {
                    "targets" : 10,
                    "render" : function(data , type , row)
                    {
                        if(data == 0)
                        {
                            return '<span style="color : green">'+data+'</span>'
                        }
                        else
                        {
                            return '<span style="color : red">'+data+'</span>'
                        }
                    }
                },
            ],
            footerCallback: function (row, data, start, end, display) {
                var api = this.api();
     
                // Remove the formatting to get integer data for summation
                // var parseInt = function (i) {
                //     return typeof i === 'string' ? i.replace(/[\$,]/g, '') * 1 : typeof i === 'number' ? i : 0;
                // };

                // Total Amount over all pages
                totalAmount = api
                    .column(7, {"search": "applied"})
                    .data()
                    .reduce(function (a, b) {
                        return parseInt(a) + parseInt(b);
                    }, 0);
     
                // Total Paid over all pages
                totalDiscount = api
                    .column(8, {"search": "applied"})
                    .data()
                    .reduce(function (a, b) {
                        return parseInt(a) + parseInt(b);
                    }, 0);

                // Total Balance over all pages
                totalPaid = api
                    .column(9, {"search": "applied"})
                    .data()
                    .reduce(function (a, b) {
                        return parseInt(a) + parseInt(b);
                    }, 0);
                totalBalance = api
                    .column(10, {"search": "applied"})
                    .data()
                    .reduce(function (a, b) {
                        return parseInt(a) + parseInt(b);
                    }, 0);
     
                // Total over this page
                // pageTotalPaid = api
                //     .column(8, { page: 'current' })
                //     .data()
                //     .reduce(function (a, b) {
                //         return parseInt(a) + parseInt(b);
                //     }, 0);


     
                // Update footer
                $(api.column(7).footer()).html( '₹ ' + totalAmount );
                $(api.column(8).footer()).html( '₹ ' + totalDiscount );
                $(api.column(9).footer()).html( '₹ ' + totalPaid ).css("color" , "#7638ff");
                $(api.column(10).footer()).html( '₹ ' + totalBalance ).css("color" , "red");
                // $(".totalText").html( 'Total : ₹ ' + pageTotalPaid + ' ( ₹ ' + totalPaid + ' total)');
            },
        })
    };


    // Payment Report DataTable

    function Payment_Report_Table(payment_report_data) {
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(payment_report_data);

        if ($.fn.dataTable.isDataTable("#Payment_ListDT")) { $("#Payment_ListDT").DataTable().destroy(); }

        var Payment_ListDatatable = $("#Payment_ListDT").DataTable({
            "dom": '<"top"B>rt<"bottom"ip>',
            buttons: [
                {
                    extend: 'print',
                    footer: true ,
                    title:"Today's OP Payment Transaction report",
                    text: '<p class="pdf_btn"><span class="fa fa-print" style="margin-right:6px"></span>Print</p>',
                    exportOptions: {
                        modifier: {
                            page: 'all'
                        },
                        columns: ':visible'
                    }
                }
            ],
            "data": payment_report_data,
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
                    "title": "Id",
                    "data": "id"
                },
                {
                    "title": "OP ID",
                    "data": "appointment_id"
                },
                {
                    "title": "Name",
                    "data": "patient_name"
                },
                {
                    "title" : "Address",
                    "data" : "patient_address"
                },
                {
                    "title": "Paid",
                    "data": "paid"
                },
                {
                    "title": "Paid At",
                    "data": "payment_date"
                },
                {
                    "title": "Derpartment",
                    "data": "department"
                },
                {
                    "title": "Cashier",
                    "data": "cashier"
                },
            ],
            columnDefs: [
                {
                    "targets": 0,
                    "visible": true,
                },
                {
                    "targets": 1,
                    "render": function (data, type, row) {
                        return (
                            '<h2 class="table-avatar">\
                                <a href="javascript:void(0)"> OP ID [#' + data + '] </a>\
                            </h2>'
                        )
                    }
                },
                {
                    "targets": 2,
                    "render": function (data, type, row) {
                        var fatherNameText = "";
                        if (row.father_name != "") {
                            if (row.patient_gender == "Male") 
                            { 
                                fatherNameText = "( S/O " + row.father_name + " )" 
                            }
                            else { fatherNameText = "( D/O " + row.father_name + " )" }
                        }
                        else {
                            fatherNameText = ""
                        }
                        return (
                            '<h2 class="table-avatar">\
                                <a href="javascript:void(0)">' + data + ' <span style="text-align:left"> ' + fatherNameText + ' <span style="text-align:left"> Age :  ' + row.patient_age +  '</span> </a>\
                            </h2>'
                        )
                    }
                },
                {
                    "targets": 3,
                    "render": function (data, type, row) {
                        return (
                            '<h2 class="table-avatar">\
                                <a href="javascript:void(0)">' + data + ' <span style="text-align:left"> ( Ph : ' + row.patient_phone + ' )</span> </a>\
                            </h2>'
                        )
                    }
                },
                {
                    "targets" : 5,
                    "render" : function(data , type , row)
                    {
                        return ('<h2 class="table-avatar">\
                        <a href="javascript:void(0)">' + moment(new Date(data)).format("DD-MM-YYYY") + ' <span style="text-align:center"> ( ' + moment(new Date(data)).format("HH:mm A") + ' )</span></a>\
                    </h2>')
                    }
                }, 
                {
                    "targets" : [0,3,4,5,6,7],
                    "searchable": false
                }
            ],
            footerCallback: function (row, data, start, end, display) {
                var api = this.api();
     
                // Remove the formatting to get integer data for summation
                // var parseInt = function (i) {
                //     return typeof i === 'string' ? i.replace(/[\$,]/g, '') * 1 : typeof i === 'number' ? i : 0;
                // };

                // Total Amount Paid over all pages
                totalAmount = api
                    .column(4, {"search": "applied"})
                    .data()
                    .reduce(function (a, b) {
                        return parseInt(a) + parseInt(b);
                    }, 0);
     
                
     
                // Update footer
                $(api.column(4).footer()).html( 'Total : ₹ ' + totalAmount ).css("color" ,"green");
            },
        })
    };


    // Patient Balance Report Datatable

    function balance_table(dataObj) {
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(dataObj);

        if ($.fn.dataTable.isDataTable("#patient_Balance_ListDT")) { $("#patient_Balance_ListDT").DataTable().destroy(); }

        var Patient_Appointment_ListDatatable = $("#patient_Balance_ListDT").DataTable({
            "dom": '<"top"B>rt<"bottom"ip>',
            buttons: [
                {
                    extend: 'print',
                    footer: true ,
                    title:"OP Payment Balance report",
                    text: '<p class="pdf_btn"><span class="fa fa-print" style="margin-right:6px"></span>Print</p>',
                    exportOptions: {
                        modifier: {
                            page: 'all'
                        },
                        columns: ':visible'
                    }
                }
            ],
            "data" : dataObj,
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
                    "title": "Id",
                    "data": "id"
                },
                {
                    "title": "Patient",
                    "data": "patient_name"
                },
                {
                    "title": "Age",
                    "data": "patient_age"
                },
                {
                    "title": "Reason",
                    "data": "reason"
                },
                {
                    "title" : "Appointed",
                    "data" : "appointment_date"
                },
                {
                    "title" : "Checkup",
                    "data" : "checkup"
                },
                {
                    "title" : "Doctor",
                    "data" : "doctor_name"
                },
                {
                    "title": "Fees",
                    "data": "total"
                },
                {
                    "title": "Paid",
                    "data": "paid"
                },
                {
                    "title" : "Balance",
                    "data" : "balance"
                }
            ],
            columnDefs: [
                {
                    "targets": 0,
                    "visible": false,
                },
                {
                    "targets" : 1,
                    "render" : function(data , type , row)
                    {
                        return (
                            '<h2 class="table-avatar">\
                                <a href="javascript:void(0)">'+data+' - '+row.patient_phone+' <span style="text-align:center"> ( Patient Id :  '+row.patient_id+' )</span></a>\
                            </h2>'
                        )
                    }
                },
                {
                    "targets" : 2,
                    "render" : function(data , type , row)
                    {
                        return (
                            '<h2 class="table-avatar">\
                                <a href="javascript:void(0)">'+data+' <span style="text-align:center"> ( '+row.patient_gender+' )</span></a>\
                            </h2>'
                        )
                    }
                },
                {
                    "targets" : 4,
                    "render" : function(data , type , row)
                    {
                        return ('<h2 class="table-avatar">\
                        <a href="javascript:void(0)">' + moment.utc(new Date(data)).format("DD-MM-YYYY") + ' <span style="text-align:center"> ( ' + moment.utc(new Date(data)).format("HH:mm A") + ' )</span></a>\
                    </h2>')
                    }
                }, 
                {
                    "targets" : 5,
                    "render" : function(data , type , row)
                    {
                        if(data == 'False')
                        {
                            return '<span class="me-1" style="color:green;font-weight: bold;">Waiting</span>'
                        }
                        else
                        {
                            return '<span class="me-1" style="color:#7638ff;font-weight: bold;">Visited</span>'
                        }
                    }
                },               
                {
                    "targets" : 9,
                    "render" : function(data , type , row)
                    {
                        if(data == 0)
                        {
                            return '<span style="color : green">'+data+'</span>'
                        }
                        else
                        {
                            return '<span style="color : red">'+data+'</span>'
                        }
                    }
                },
            ],
            footerCallback: function (row, data, start, end, display) {
                var api = this.api();
     
                // Remove the formatting to get integer data for summation
                // var parseInt = function (i) {
                //     return typeof i === 'string' ? i.replace(/[\$,]/g, '') * 1 : typeof i === 'number' ? i : 0;
                // };

                // Total Amount over all pages
                totalAmount = api
                    .column(7, {"search": "applied"})
                    .data()
                    .reduce(function (a, b) {
                        return parseInt(a) + parseInt(b);
                    }, 0);
     
                // Total Paid over all pages
                totalPaid = api
                    .column(8, {"search": "applied"})
                    .data()
                    .reduce(function (a, b) {
                        return parseInt(a) + parseInt(b);
                    }, 0);

                // Total Balance over all pages
                totalBalance = api
                    .column(9, {"search": "applied"})
                    .data()
                    .reduce(function (a, b) {
                        return parseInt(a) + parseInt(b);
                    }, 0);
     
                // Total over this page
                // pageTotalPaid = api
                //     .column(8, { page: 'current' })
                //     .data()
                //     .reduce(function (a, b) {
                //         return parseInt(a) + parseInt(b);
                //     }, 0);


     
                // Update footer
                // $(api.column(7).footer()).html( '₹ ' + totalAmount );
                // $(api.column(8).footer()).html( '₹ ' + totalPaid ).css("color" , "#7638ff");
                $(api.column(9).footer()).html( '₹ ' + totalBalance ).css("color" , "red");
                // $(".totalText").html( 'Total : ₹ ' + pageTotalPaid + ' ( ₹ ' + totalPaid + ' total)');
            },
        })
    };
    }


})