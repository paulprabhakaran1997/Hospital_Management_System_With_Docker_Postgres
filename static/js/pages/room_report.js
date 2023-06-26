$(document).ready(function()
{



    $.ajax({
        type: "GET",
        url : 'get_room_report',
        success : function(data){

            var AssignRoomData = data.assignroomdata
            var RoomPaymentTransactionData = data.roompaymenttransactiondata
            var BalanceData = data.balancedata

            console.log(data.balancedata)

            ExecuteReport(AssignRoomData , RoomPaymentTransactionData , BalanceData)
        },

        error : function(exception){

            console.log(exception)
        }
    })

    function ExecuteReport(AssignRoomData, RoomPaymentTransactionData, BalanceData) {


        balance_table(BalanceData);

        console.log('balance_data',BalanceData)


        var TodaysAssignRoomReportData = AssignRoomData.filter(function (obj) {
            var thisAssignRoomDate = new Date(obj.assigned_date).toISOString().split('T')[0];
            var todayDate = new Date().toISOString().split('T')[0]

            return thisAssignRoomDate == todayDate
        })

        assign_room_table(TodaysAssignRoomReportData)



        var TodaysPaymentReportData = RoomPaymentTransactionData.filter(function (obj) {
            var thisPaymentDate = new Date(obj.payment_date).toISOString().split('T')[0];
            var todayDate = new Date().toISOString().split('T')[0]

            return thisPaymentDate == todayDate;
        })


        Payment_Report_Table(TodaysPaymentReportData);


        $(".resetBtn").click(function () {
            $("#fromDate").val(new Date().toISOString().split('T')[0])
            $("#toDate").val(new Date().toISOString().split('T')[0])
            $("#toDate").attr("min", $("#fromDate").val());

            $(".dateFilterText").text("")

            assign_room_table(AssignRoomData)

            Payment_Report_Table(RoomPaymentTransactionData)
        })

        $("#todaysreportBtn").click(function () {
            $(".filterView").hide();
            $("#filter_inputs").hide();

            $(".assignroomTableTitle").text("Today's Room report");

            $(".paymentTableTitle").text("Today's Room Payment Transaction report");

            assign_room_table(TodaysAssignRoomReportData);
            Payment_Report_Table(TodaysPaymentReportData);
            balance_table(BalanceData);
        })


        $("#ovarallReportBtn").click(function () {
            $(".assignroomTableTitle").text("Overall IP Report");

            $(".paymentTableTitle").text("Overall IP Payment Transaction Report");

            $("#filter_inputs").hide();

            $(".filterView").show();

            $(".dateFilterText").text("");

            assign_room_table(AssignRoomData);

            Payment_Report_Table(RoomPaymentTransactionData);

            balance_table(BalanceData);


        });



        $(document).on('click', '#filter_search', function () {
            $('#filter_inputs').slideToggle("slow");
            $("#fromDate").val(new Date().toISOString().split('T')[0]);
            $("#toDate").val(new Date().toISOString().split('T')[0]);
            $("#toDate").attr("min", $("#fromDate").val());

        });


        $("#fromDate").on("change", function () {
            var thisFromDate = $(this).val();

            var ToDate = $("#toDate").val();

            if ((new Date(thisFromDate)) > (new Date(ToDate))) {
                $("#toDate").val(new Date(thisFromDate).toISOString().split('T')[0]);
            }

            $("#toDate").attr("min", thisFromDate);
        })

        $(".searchBtn").click(function () {
            var FromDateVal = new Date($("#fromDate").val()).toISOString().split('T')[0];

            var ToDateVal = new Date($("#toDate").val()).toISOString().split('T')[0];


            var AssignRoom_DateFilter_Data = AssignRoomData.filter(function (data) {
                return ((new Date(data.assigned_date).toISOString().split('T')[0]) >= FromDateVal && (new Date(data.assigned_date).toISOString().split('T')[0]) <= ToDateVal)
            })


            var PaymentTransaction_DateFilter_Data = RoomPaymentTransactionData.filter(function (data) {
                return ((new Date(data.payment_date).toISOString().split('T')[0]) >= FromDateVal && (new Date(data.payment_date).toISOString().split('T')[0]) <= ToDateVal)
            })


            $(".dateFilterText").text("( " + moment(FromDateVal).format("DD-MM-YYYY") + " To " + moment(ToDateVal).format("DD-MM-YYYY") + " )")

            assign_room_table(AssignRoom_DateFilter_Data)

            Payment_Report_Table(PaymentTransaction_DateFilter_Data)

        })




        // Report Datatable Section


        // Patient Appointment Report Datatable

        function assign_room_table(dataObj) {
            (function rec(d) {
                $.each(d, function (k, v) {
                    if (typeof v === 'object') return rec(v)
                    if (isNaN(v) && typeof v === 'number') d[k] = '---';
                })
            })(dataObj);

            if ($.fn.dataTable.isDataTable("#patient_assignroom_ListDT")) { $("#patient_assignroom_ListDT").DataTable().destroy(); }

            var Patient_Appointment_ListDatatable = $("#patient_assignroom_ListDT").DataTable({
                "dom": '<"top"B>rt<"bottom"ip>',
                buttons: [
                    {
                        extend: 'print',
                        footer: true ,
                        title: "Today's Room Report",
                        text: '<p class="pdf_btn"><span class="fa fa-print" style="margin-right:6px"></span>Print</p>',
                        exportOptions: {
                            modifier: {
                                page: 'all'
                            },
                            columns: ':visible'
                        }
                    }
                ],
                "data": dataObj,
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
                        "title": "Room No",
                        "data": "room_no"
                    },
                    {
                        "title": "Assigned",
                        "data": "assigned_date"
                    },
                    {
                        "title": "Status",
                        "data": "status"
                    },
                    {
                        "title": "Discharged",
                        "data": "discharged_date"
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
                        "title": "Balance",
                        "data": "balance"
                    }
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
                                <a href="javascript:void(0)">'+ data + ' <span style="text-align:center"> ( Patient Id :  ' + row.patient_id + ' )</span></a>\
                            </h2>'
                            )
                        }
                    },
                    {
                        "targets": 3,
                        "render": function (data, type, row) {
                            return (
                                '<h2 class="table-avatar">\
                                <a href="javascript:void(0)">'+ data + ' <span style="text-align:center">( ' + row.room_type + ' )</span></a>\
                            </h2>'
                            )
                        }
                    },
                    {
                        "targets": 4,
                        "render": function (data, type, row) {
                            return ('<h2 class="table-avatar">\
                        <a href="javascript:void(0)">' + moment.utc(new Date(data)).format("DD-MM-YYYY") + ' <span style="text-align:center"> ( ' + moment.utc(new Date(data)).format("HH:mm A") + ' )</span></a>\
                    </h2>')
                        }
                    },
                    {
                        "targets": 5,
                        "render": function (data, type, row) {
                            if (data == 0) {
                                return '<span class="me-1" style="color:green;font-weight: bold;">Admitted</span>'
                            }
                            else {
                                return '<span class="me-1" style="color:#7638ff;font-weight: bold;">Discharged</span>'
                            }
                        }
                    },
                    {
                        "targets": 6,
                        "render": function (data, type, row) {
                            if (data != "None") {
                                return ('<h2 class="table-avatar">\
                            <a href="javascript:void(0)">' + moment.utc(new Date(data)).format("DD-MM-YYYY") + ' <span style="text-align:center"> ( ' + moment.utc(new Date(data)).format("HH:mm A") + ' )</span></a>\
                        </h2>')
                            } else {
                                return "Not discharged"
                            }
                        }
                    },
                    {
                        "targets": 10,
                        "render": function (data, type, row) {
                            if (data == 0) {
                                return '<span style="color : green">' + data + '</span>'
                            }
                            else {
                                return '<span style="color : red">' + data + '</span>'
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
                        .column(7, { "search": "applied" })
                        .data()
                        .reduce(function (a, b) {
                            return parseInt(a) + parseInt(b);
                        }, 0);

                    // Total Paid over all pages
                    totalPaid = api
                        .column(9, { "search": "applied" })
                        .data()
                        .reduce(function (a, b) {
                            return parseInt(a) + parseInt(b);
                        }, 0);

                    // Total Balance over all pages
                    totalBalance = api
                        .column(10, { "search": "applied" })
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
                    $(api.column(7).footer()).html('₹ ' + totalAmount);
                    $(api.column(9).footer()).html('₹ ' + totalPaid).css("color", "#7638ff");
                    $(api.column(10).footer()).html('₹ ' + totalBalance).css("color", "red");
                    // $(".totalText").html( 'Total : ₹ ' + pageTotalPaid + ' ( ₹ ' + totalPaid + ' total)');
                },
            })
        };


        // Payment Report DataTable

        function Payment_Report_Table(dataObj) {
            (function rec(d) {
                $.each(d, function (k, v) {
                    if (typeof v === 'object') return rec(v)
                    if (isNaN(v) && typeof v === 'number') d[k] = '---';
                })
            })(dataObj);

            if ($.fn.dataTable.isDataTable("#Payment_ListDT")) { $("#Payment_ListDT").DataTable().destroy(); }

            var Payment_ListDatatable = $("#Payment_ListDT").DataTable({
                "dom": '<"top"B>rt<"bottom"ip>',
                buttons: [
                    {
                        extend: 'print',
                        footer: true ,
                        title: "Today's Room Payment Transaction Report",
                        text: '<p class="pdf_btn"><span class="fa fa-print" style="margin-right:6px"></span>Print</p>',
                        exportOptions: {
                            modifier: {
                                page: 'all'
                            },
                            columns: ':visible'
                        }
                    }
                ],
                "data": dataObj,
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
                        "title": "IP ID",
                        "data": "assigned_room_id"
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
                                    <a href="javascript:void(0)"> IP ID [#' + data + '] </a>\
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


        // Balance Report Datatable

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
                        title: "Payment Balance in Room Report",
                        text: '<p class="pdf_btn"><span class="fa fa-print" style="margin-right:6px"></span>Print</p>',
                        exportOptions: {
                            modifier: {
                                page: 'all'
                            },
                            columns: ':visible'
                        }
                    }
                ],
                "data": dataObj,
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
                        "title": "Room No",
                        "data": "room_no"
                    },
                    {
                        "title": "Assigned",
                        "data": "assigned_date"
                    },
                    {
                        "title": "Status",
                        "data": "status"
                    },
                    {
                        "title": "Discharged",
                        "data": "discharged_date"
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
                        "title": "Balance",
                        "data": "balance"
                    }
                ],
                columnDefs: [
                    {
                        "targets": 0,
                        "visible": false,
                    },
                    {
                        "targets": 1,
                        "render": function (data, type, row) {
                            return (
                                '<h2 class="table-avatar">\
                                <a href="javascript:void(0)">'+ data + ' - ' + row.patient_phone + ' <span style="text-align:center"> ( Patient Id :  ' + row.patient_id + ' )</span></a>\
                            </h2>'
                            )
                        }
                    },
                    {
                        "targets": 2,
                        "render": function (data, type, row) {
                            return (
                                '<h2 class="table-avatar">\
                                <a href="javascript:void(0)">'+ data + ' <span style="text-align:center"> ( ' + row.patient_gender + ' )</span></a>\
                            </h2>'
                            )
                        }
                    },
                    {
                        "targets": 3,
                        "render": function (data, type, row) {
                            return (
                                '<h2 class="table-avatar">\
                                <a href="javascript:void(0)">'+ data + ' <span style="text-align:center">( ' + row.room_type + ' )</span></a>\
                            </h2>'
                            )
                        }
                    },
                    {
                        "targets": 4,
                        "render": function (data, type, row) {
                            return ('<h2 class="table-avatar">\
                        <a href="javascript:void(0)">' + moment.utc(new Date(data)).format("DD-MM-YYYY") + ' <span style="text-align:center"> ( ' + moment.utc(new Date(data)).format("HH:mm A") + ' )</span></a>\
                    </h2>')
                        }
                    },
                    {
                        "targets": 5,
                        "render": function (data, type, row) {
                            if (data == 0) {
                                return '<span class="me-1" style="color:green;font-weight: bold;">Admitted</span>'
                            }
                            else {
                                return '<span class="me-1" style="color:#7638ff;font-weight: bold;">Discharged</span>'
                            }
                        }
                    },
                    {
                        "targets": 6,
                        "render": function (data, type, row) {
                            if (data != "None") {
                                return ('<h2 class="table-avatar">\
                            <a href="javascript:void(0)">' + moment.utc(new Date(data)).format("DD-MM-YYYY") + ' <span style="text-align:center"> ( ' + moment.utc(new Date(data)).format("HH:mm A") + ' )</span></a>\
                        </h2>')
                            } else {
                                return "Not discharged"
                            }
                        }
                    },
                    {
                        "targets": 10,
                        "render": function (data, type, row) {
                            if (data == 0) {
                                return '<span style="color : green">' + data + '</span>'
                            }
                            else {
                                return '<span style="color : red">' + data + '</span>'
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
                        .column(8, { "search": "applied" })
                        .data()
                        .reduce(function (a, b) {
                            return parseInt(a) + parseInt(b);
                        }, 0);

                    // Total Paid over all pages
                    totalPaid = api
                        .column(9, { "search": "applied" })
                        .data()
                        .reduce(function (a, b) {
                            return parseInt(a) + parseInt(b);
                        }, 0);

                    // Total Balance over all pages
                    totalBalance = api
                        .column(10, { "search": "applied" })
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
                    $(api.column(10).footer()).html('₹ ' + totalBalance).css("color", "red");
                    // $(".totalText").html( 'Total : ₹ ' + pageTotalPaid + ' ( ₹ ' + totalPaid + ' total)');
                },
            })
        };

    }


})