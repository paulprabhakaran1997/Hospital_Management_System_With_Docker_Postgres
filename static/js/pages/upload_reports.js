$(document).ready(function() 
{
    $(document).on('click', '.uploadNewBtn', function () 
    { 
        $("#uploadReportsForm").trigger('reset');
        $("#patientId").val("0");
        $(".patientDetailsSection").hide();
        $('.uploadReportsContainer').slideToggle("slow");       
    });

    function getUploadedReportsData(){
        $.ajax({
            type  : 'GET',
            url : $("#GetUploadedReports").data('url'),
            success : function(data){
                BuildReportTable(data.uploadedreportsdata)
            },
            error : function(err){
                console.log(err.message)
            }
        })
    }

    getUploadedReportsData();

    $(".backbtn").click(function(){
        $(".view2").hide();
        $(".uploadReportsContainer").hide();
        $(".view1").show();
    })


    $('#patient_typeahead').typeahead({

        source: function(query, process) {
         
            $.ajax({
                type: "POST",
                headers: {
                    'X-CSRFToken': $.cookie("csrftoken"),
                    'Content-Type': 'application/json',
                },
                url: $("#GetPatientDataOnSearch").data('url'),                
                data: JSON.stringify({
                    'query': query
                }),
                dataType: 'JSON',
                async: true,
                success: function(data) {              
                    var resultList = data.map(function(item) {
                        var link = {
                            id: item.id,
                            name: item.name,
                            father_name : item.father_name,
                            phone: item.phone,
                            address: item.address,
                            age: item.age,
                            month : item.month,
                            gender: item.gender,
                        };
                        return JSON.stringify(link);
                    });
                    return process(resultList);
                }
            })
        },

        highlighter: function(link) {
            var item = JSON.parse(link);
            return (
                '<div class="row"><span class="col-12 col-md-6"><h6>Name: ' + item.name + '</h6></span>'+
                '<span class="col-12 col-md-6 text-end"><h6>(ID : '+item.id+')</h6></span><br>'+
                '<span class="col-12 col-md-6">Ph:' + item.phone + '</span>'+
                '<span class="col-12 col-md-6 text-end">Place: ' + item.address + '</span></<div>'
            )
        },

        updater: function(link) {
            var item = JSON.parse(link);

            $("#patientId").val(item.id);

            $("#appointedPatientId").text(item.id);
            $("#appointedPatientName").text(item.name);
            $("#appointedPatientAge").text(item.age);
            $("#appointedPatientGender").text(item.gender);         
            
            $(".patientDetailsSection").show();
        }

    });


    // Datatable build

    function BuildReportTable(dataObj) {
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(dataObj);

        if ($.fn.dataTable.isDataTable("#uploadReportsDT")) {
            $("#uploadReportsDT").DataTable().destroy();
        }

        var uploadReportsDatatable = $("#uploadReportsDT").DataTable({
            data : dataObj,
            responsive: true,
            paging: true,
            searching: false,
            "scrollY": false,
            "scrollCollapse": true,
            "order": [0, "desc"],
            "pageLength": 10,
            "bLengthChange": false,
            "scrollX": false,
            columns : [
                {
                    title : "Id",
                    data : "id"
                },
                {
                    title : "Patient",
                    data : "patient_name"
                },
                {
                    title : "Report Name",
                    data : "report_name"
                },
            ],
            columnDefs: [
                {
                    "targets" : 0,
                    "visible" : true
                },
                {
                    "targets" : 1,
                    "render": function (data, type, row) {
                        return (
                            '<h2 class="table-avatar">\
                                <a href="javascript:void(0)">' + data + ' [ #' + row.patient_id +' ]<span style="text-align:left"> [Ph:  ' + row.patient_phone + '] </span>' + '</a>\
                            </h2>'
                        )
                    }
                },
                {
                    "targets" : 3,
                    "title" : "Action",
                    "data" : null,
                    "render" : function(data , type , row){
                        return (
                            "<button type='button' class='btn btn-outline-primary ViewReportBtn' data-val='" + JSON.stringify(row) + "' >\
                                <i class='menu-icon tf-icons bx bx-edit'></i> View Report</button>"
                        )
                    }
                }                
            ]

        })
    };


    $("#uploadReportsDT").on("click" , ".ViewReportBtn" , function() {
        var thisData = $(this).data("val");
        // console.log(thisData);

        $(".reportTitle").text(thisData.report_name)

        $.ajax({
            type  : 'GET',
            url : $("#GetUploadedReportsFiles").data('url')+"?id="+thisData.id,
            success : function(data){
                console.log(data);

                $(".reportView").empty()

                var thisFileList = data.uploadedreportsfilesdata;

                var $container = ""

                for(var i =0 ; i < thisFileList.length ; i++) {
                    $container += '<div class="col-md-6">\
                                        <div class="displayReport">\
                                            <img src="/media/'+thisFileList[i].url+'" alt='+thisData.report_name+' />\
                                        </div>\
                                    </div>'
                }

                $(".reportView").append($container)

                $(".view1").hide();
                $(".uploadReportsContainer").hide();
                $(".view2").show();
            },
            error : function(err){
                console.log(err.message)
            }
        })

    })

})