$(document).ready(function()
{
    console.log("Lab Report");
    var dates = ''

    $('.searchBtn').click(function(){
        var from_date = $('#fromDate').val()
        var to_date = $('#toDate').val()
        console.log(from_date)
        console.log(to_date)
        dates = `( ${moment(new Date(from_date)).format("DD-MMM-YYYY") } - ${moment(new Date(to_date)).format("DD-MMM-YYYY") })`;
        getReportData(from_date , to_date)
        
    });

    getReportData($('#fromDate').val() , $('#toDate').val())

    function getReportData(from_date , to_date) {
        var GetLabReportUrl = $("#GetLabReport").data('url')
        $.ajax({
            type: "POST",
            url: GetLabReportUrl,
            headers: {
                'X-CSRFToken': $.cookie("csrftoken"),
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({
                'from_date' : from_date,
                'to_date' : to_date
            }),
            success : function(data){
                var mergedData = $.merge(data.labtestfromallcatogory ,  data.labtestfromdirectpatient);
                PatientData_Lab_DT(mergedData);
                var LAbPaymentTransactionData = data.labpaymenttransaction;
                LabPaymentTransactionDT(LAbPaymentTransactionData)

                var result = Array.from((data.group_amount).reduce(
                    (m, {group_name, amount}) => m.set(group_name, (m.get(group_name) || 0) + amount), new Map
                  ), ([group_name, amount]) => ({group_name, amount}));

                console.log("Result = " , result)
                Group_Amount(result)

            },
        
            error : function(exception){        
                console.log(exception)
            }
        })
    }

    function PatientData_Lab_DT(dataObj) {
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(dataObj);

        if ($.fn.dataTable.isDataTable("#testedPatientListDT")) {
            $("#testedPatientListDT").DataTable().destroy();
        }

        var patientListDatatable = $("#testedPatientListDT").DataTable({
            "dom": '<"top"B>rt<"bottom"ip>',
            buttons: [
                {
                    extend: 'print',
                    footer: true ,
                    title:"<div>\
                            <h3 style='text-align:center'>Nehru Nursing Home</h3>\
                            <h4>Patient Lab Tests&nbsp; "+dates+"</h4>\
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
            data: dataObj,
            responsive: true,
            paging: true,
            "scrollY": false,
            "scrollCollapse": true,
            "order": [4, "desc"],
            "pageLength": 10,
            "bLengthChange": false,
            "scrollX": false,
            columns: [
                {
                    "title": "Id",
                    "data": "id"
                },
                {
                    "title": "Name",
                    "data": "patient_name"
                },
                {
                    "title": "Address",
                    "data": "patient_address"
                },
                {
                    "title": "Patient Type",
                    "data": "patient_type"
                },                
                {
                    "title": "Tested At",
                    "data": "tested_at"
                },
                {
                    "title" : "Fees",
                    "data"  :"fees"
                },
                {
                    "title" : "Discount",
                    "data"  :"discount"
                },
                {
                    "title" : "Paid",
                    "data"  :"paid"
                },
                {
                    "title" : "Balance",
                    "data"  :"balance"
                }
            ],
            columnDefs: [
                {
                    "targets": 0,
                    "visible": true
                },
                {
                    "targets": 1,
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
                                <a href="javascript:void(0)">' + data + ' [# '+row.patient_id+'] <span style="text-align:left"> ' + fatherNameText + ' <span style="text-align:left"> Age :  ' + row.patient_age +  '</span> </a>\
                            </h2>'
                        )
                    }
                },
                {
                    "targets": 2,
                    "render": function (data, type, row) {
                        return (
                            '<h2 class="table-avatar">\
                                <a href="javascript:void(0)">' + data + ' <span style="text-align:left"> ( Ph : ' + row.phone + ' )</span> </a>\
                            </h2>'
                        )
                    }
                },
                {
                    "targets": 3,
                    "render": function (data, type, row) {
                        var assigned_type = ""
                        var assigned_id = ""

                        if(data == 'Out Patient') { assigned_type = "OP Id" ; assigned_id = row.appointed_id }
                        else if(data == 'In Patient') { assigned_type = "IP Id" ; assigned_id = row.appointed_id}
                        else if(data == 'Ward Patient') { assigned_type = "Ward Id"; assigned_id = row.appointed_id }
                        else { assigned_type = "---" ; assigned_id = "---" }

                        return (
                            '<h2 class="table-avatar">\
                                <a href="javascript:void(0)">' + data + ' <span style="text-align:left"> ( '+ assigned_type +' : ' + assigned_id + ' )</span> </a>\
                            </h2>'
                        )
                    }
                },
                {
                    "targets" : 4,
                    "render" : function(data , type , row)
                    {
                        return ('<h2 class="table-avatar">\
                        <a href="javascript:void(0)">' + moment(new Date(data)).format("DD-MM-YYYY") + ' <span style="text-align:center"> ( ' + moment(new Date(data)).format("HH:mm A") + ' )</span></a>\
                    </h2>')
                    }
                }, 
                {
                    "targets" : 8,
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
                }
            ],
            footerCallback: function (row, data, start, end, display) {
                var api = this.api();
     
                // Remove the formatting to get integer data for summation
                // var parseInt = function (i) {
                //     return typeof i === 'string' ? i.replace(/[\$,]/g, '') * 1 : typeof i === 'number' ? i : 0;
                // };

                totalAmount = api
                    .column(5, {"search": "applied"})
                    .data()
                    .reduce(function (a, b) {
                        return parseInt(a) + parseInt(b);
                    }, 0);

                totalDiscount = api
                    .column(6, {"search": "applied"})
                    .data()
                    .reduce(function (a, b) {
                        return parseInt(a) + parseInt(b);
                    }, 0);

                totalPaid = api
                    .column(7, {"search": "applied"})
                    .data()
                    .reduce(function (a, b) {
                        return parseInt(a) + parseInt(b);
                    }, 0);

                totalBalance = api
                    .column(8, {"search": "applied"})
                    .data()
                    .reduce(function (a, b) {
                        return parseInt(a) + parseInt(b);
                    }, 0);
     
     
                // Update footer
                $(api.column(5).footer()).html( '₹ ' + totalAmount ).css("color" , "green");
                $(api.column(6).footer()).html( '₹ ' + totalDiscount );
                $(api.column(7).footer()).html( '₹ ' + totalPaid ).css("color" , "#7638ff");
                $(api.column(8).footer()).html( '₹ ' + totalBalance ).css("color" , "red");
                // $(".totalText").html( 'Total : ₹ ' + pageTotalPaid + ' ( ₹ ' + totalPaid + ' total)');
            },

        })
    };


    function LabPaymentTransactionDT(dataObj) {
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(dataObj);

        if ($.fn.dataTable.isDataTable("#labPaymentTransactionListDT")) {
            $("#labPaymentTransactionListDT").DataTable().destroy();
        }

        var patientListDatatable = $("#labPaymentTransactionListDT").DataTable({
            "dom": '<"top"B>rt<"bottom"ip>',
            buttons: [
                {
                    extend: 'print',
                    footer: true ,
                    title:"<div>\
                            <h3 style='text-align:center'>Nehru Nursing Home</h3>\
                            <h4>Lab Payment Transactions&nbsp; "+dates+"</h4>\
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
            data: dataObj,
            responsive: true,
            paging: true,
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
                    "title": "Assigned Id",
                    "data": "appointed_id"
                },
                {
                    "title": "Name",
                    "data": "patient_name"
                },
                {
                    "title": "Address",
                    "data": "patient_address"
                },
                {
                    "title": "Patient Type",
                    "data": "patient_type"
                },                
                {
                    "title": "Tested At",
                    "data": "tested_at"
                },
                {
                    "title" : "Paid",
                    "data"  :"paid"
                },
                {
                    "title" : "Paid At",
                    "data"  :"paid_at"
                },
                {
                    "title" : "Cashier",
                    "data"  :"cash_received_by"
                }
            ],
            columnDefs: [
                {
                    "targets": 0,
                    "visible": true
                },
                {
                    "targets": 1,
                    "render": function (data, type, row) {
                        var type = ""
                        if(row.patient_type == 'Out Patient') { type = 'OP' }
                        else if(row.patient_type == 'In Patient') { type = 'IP' }
                        else{ type = '--' }
                        return (
                            '<h2 class="table-avatar">\
                                <a href="javascript:void(0)"> <span style="text-align:left"> ( '+type+' ID : ' + data + ' )</span> <span style="text-align:left"> ( Lab Tested ID : ' + row.lab_tested_id + ' )</span> </a>\
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
                                <a href="javascript:void(0)">' + data + ' [# '+row.patient_id+']  <span style="text-align:left"> ' + fatherNameText + ' <span style="text-align:left"> Age :  ' + row.patient_age +  '</span> </a>\
                            </h2>'
                        )
                    }
                },
                {
                    "targets": 3,
                    "render": function (data, type, row) {
                        return (
                            '<h2 class="table-avatar">\
                                <a href="javascript:void(0)">' + data + ' <span style="text-align:left"> ( Ph : ' + row.phone + ' )</span> </a>\
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
                    "targets" : 6,
                    "render" : function(data , type , row)
                    {
                        return (
                            '<h2 class="table-avatar">\
                                <a href="javascript:void(0)">'+data+' <p style="display:flex;justify-content:center;align-items:center"><span style="text-align:center;margin-right:3px"> ( Cash :  '+row.cash+' )</span>  <span style="text-align:center"> ( UPI :  '+row.upi+' )</span> <span style="text-align:center"> ( Card :  '+row.card+' )</span></p></a>\
                            </h2>'
                        )
                    }
                },
                {
                    "targets" : 7,
                    "render" : function(data , type , row)
                    {
                        return ('<h2 class="table-avatar">\
                        <a href="javascript:void(0)">' + moment(new Date(data)).format("DD-MM-YYYY") + ' <span style="text-align:center"> ( ' + moment(new Date(data)).format("HH:mm A") + ' )</span></a>\
                    </h2>')
                    }
                }, 
            ],
            footerCallback: function (row, data, start, end, display) {
                var api = this.api();
     
                // Remove the formatting to get integer data for summation
                // var parseInt = function (i) {
                //     return typeof i === 'string' ? i.replace(/[\$,]/g, '') * 1 : typeof i === 'number' ? i : 0;
                // };

                totalAmount = api
                    .column(6, {"search": "applied"})
                    .data()
                    .reduce(function (a, b) {
                        return parseInt(a) + parseInt(b);
                    }, 0);
     
     
                // Update footer
                $(api.column(6).footer()).html( '₹ ' + totalAmount ).css("color" , "green");
                // $(".totalText").html( 'Total : ₹ ' + pageTotalPaid + ' ( ₹ ' + totalPaid + ' total)');
            },

        })
    };


    function get_lab_test_data(){
        $.ajax({
            type: "GET",
            url: $("#get_lab_group_data").data('url'),
            success: function (data) {
                $.each(data.Lab_Test_Data, function(index, Obj) {           
                    var AllGroupName = []
                    var select2obj = {
                        id: Obj.id,
                        text : Obj.name
                    }
                    AllGroupName.push(select2obj);
                    $('#lab_select2').select2({
                        data: AllGroupName,
                        allowClear: true,
                        placeholder: "Select Test",
                    })
                });
            },
            error: function (exception) {
            }
        });
    }

    get_lab_test_data();


    $('.Lab_searchBtn').click(function(){

        $.ajax({
            type: "POST",
            headers: {
                'X-CSRFToken': $.cookie("csrftoken"),
                'Content-Type': 'application/json',
            },
            url: $('#get_lab_group_amount').data('url'),
            data: JSON.stringify({
                'LabObj': $('#lab_select2').val(),
            }),
            success: function (data) {
                Group_Amount(data.group_amount);

            }, error: function (exception) {
                console.log(exception)
            }
        });
    })

    function Group_Amount(g_amount) {

        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(g_amount);

        if ($.fn.dataTable.isDataTable("#LabGroupListDT")) { $("#LabGroupListDT").DataTable().destroy(); }

        var Patient_Appointment_ListDatatable = $("#LabGroupListDT").DataTable({
            "dom": '<"top"B>rt<"bottom"ip>',
            buttons: [
                {
                    extend: 'print',
                    footer: true ,
                    title:"<div>\
                            <h3 style='text-align:center'>Nehru Nursing Home</h3>\
                            <h4>Lab Test Collection&nbsp; "+dates+"</h4>\
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
            "data": g_amount,
            responsive: true,
            "bInfo" : false,
            paging: false,
            searching: false,
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
                    "title": "Test",
                    "data": "group_name"
                },
                {
                    "title": "Amount",
                    "data": "amount"
                },
            ],

            footerCallback: function (row, data, start, end, display) {
                var api = this.api();

                totalFees = api
                    .column(1, {"search": "applied"})
                    .data()
                    .reduce(function (a, b) {
                        return parseFloat(a) + parseFloat(b);
                    }, 0);
                // Update footer

                $(api.column(1).footer()).html( '₹ ' + totalFees ).css("color" , "#7638ff");
                // $(".totalText").html( 'Total : ₹ ' + pageTotalPaid + ' ( ₹ ' + totalPaid + ' total)');
            },
        })

    };

    Group_Amount();
 



})