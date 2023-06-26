$(document).ready(function()
{
    console.log("Xray Report");

    $('.searchBtn').click(function(){
        var from_date = $('#fromDate').val()
        var to_date = $('#toDate').val()
        console.log(from_date)
        console.log(to_date)

        getReportData(from_date , to_date)
        
    });

    getReportData($('#fromDate').val() , $('#toDate').val())

    function getReportData(from_date , to_date) {
        var GetXrayReportUrl = $("#GetXrayReport").data('url')
        $.ajax({
            type: "GET",
            url: GetXrayReportUrl + "?from_date=" + from_date+"&to_date=" + to_date,
            success : function(data){
                console.log("Data = " , data.xraytestfromallcatogory)
                PatientData_Xray_DT(data.xraytestfromallcatogory)
                console.log("Transaction Data = ", data.xraypaymenttransaction)
                XrayPaymentTransactionDT(data.xraypaymenttransaction)
            },
        
            error : function(exception){        
                console.log(exception)
            }
        })
    }

    function PatientData_Xray_DT(dataObj) {
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
     
     
                // Update footer
                $(api.column(5).footer()).html( '₹ ' + totalAmount ).css("color" , "green");
                // $(".totalText").html( 'Total : ₹ ' + pageTotalPaid + ' ( ₹ ' + totalPaid + ' total)');
            },

        })
    };


    function XrayPaymentTransactionDT(dataObj) {
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(dataObj);

        if ($.fn.dataTable.isDataTable("#xrayPaymentTransactionListDT")) {
            $("#xrayPaymentTransactionListDT").DataTable().destroy();
        }

        var patientListDatatable = $("#xrayPaymentTransactionListDT").DataTable({
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
                        else{ type = 'Ward' }
                        return (
                            '<h2 class="table-avatar">\
                                <a href="javascript:void(0)"> <span style="text-align:left"> ( '+type+' ID : ' + data + ' )</span> <span style="text-align:left"> ( Xray Tested ID : ' + row.xray_tested_id + ' )</span> </a>\
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



})