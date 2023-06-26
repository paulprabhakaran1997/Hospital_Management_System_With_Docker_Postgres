$(document).ready(function()
{
  

    $("#prefix").select2({
        placeholder : 'Select',
        allowClear : true,
        minimumResultsForSearch: -1
    })

    $("#gender").select2({
        placeholder : 'Select',
        allowClear : true,
        minimumResultsForSearch: -1
    })


    $(".addNewbtn").click(function()
    {
        $("#addForms").trigger("reset");
        $("#FormsId").val("0");
        $("#prefix").val("").trigger("change");
        $("#gender").val("").trigger("change");
        $(".submitBtn").text("Done");

        $(".FormsDTSection").hide();
        $(".FormCreateSection").show();

        $(".addNewBtnSection").hide();
        $(".backBtnSection").show();
        
    });


    $(".backBtn").click(function()
    {
        $(".backBtnSection").hide();
        $(".addNewBtnSection").show();

        $(".FormCreateSection").hide();
        $(".FormsDTSection").show();
    });



    $.ajax({
        type: "GET",
        url: $("#FormData").data('url'),
        success: function(data) {
            console.log(data);
            Foms_Table(data.formData)
        },
        error: function(exception) {
            console.log(exception)
        }
    });



    function Foms_Table(dataObj) {
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(dataObj);

        if ($.fn.dataTable.isDataTable("#FormsDT")) {
            $("#FormsDT").DataTable().destroy();
        }

        var FormsDT = $("#FormsDT").DataTable({
            data : dataObj,
            responsive: true,
            paging: true,
            searching: true,
            autoWidth: true,
            "scrollY": false,
            "scrollCollapse": true,
            "order": [0, "desc"],
            "pageLength": 10,
            "bLengthChange": false,
            "scrollX": false,
            columns: [{
                "title": "Id",
                "data": "id"
            },
            {
                "title": "Date",
                "data": "date"
            },
            {
                "title": "Patient",
                "data": "name"
            },
            {
                "title": "Age",
                "data": "age"
            },
            {
                "title": "Address",
                "data": "village"
            },
            {
                "title": "Purpose Of",
                "data": "purpose_of"
            },
            {
                "title": "Action",
                "data": null
            },
            ],
            columnDefs: [
                {
                    "targets": 1,
                    "render": function (data, type, row) {
                        return (
                            '<h2 class="table-avatar">\
                            <a href="javascript:void(0)">' + moment(new Date(data)).format("DD-MM-YYYY") + '</a>\
                        </h2>'
                        )
                    }
                },
                {
                    "targets": 2,
                    "render": function (data, type, row) {

                        var typehtml = ''

                        if (row.gender == 'Male') {
                            typehtml = '<h2 class="table-avatar">\
                                        <a href="javascript:void(0)">'+ row.prefix + '. ' + data + ' <span style="text-align:left">[S/O :' + row.father_name + ']</span> </a>\
                                    </h2>'
                        }

                        else {
                            typehtml = '<h2 class="table-avatar">\
                                        <a href="javascript:void(0)">'+ row.prefix + '. ' + data + '<span style="text-align:left">[D/O :' + row.father_name + ']</span> </a>\
                                    </h2>'
                        }
                        return (
                            typehtml
                        )
                    }
                },
                {
                    "targets": 3,
                    "render": function (data, type, row) {
                        return (
                            '<h2 class="table-avatar">\
                                <a href="javascript:void(0)">'+data+'('+row.gender +')<span style="text-align:left">[D.O.B : '+ moment(new Date(row.dob)).format("DD-MM-YYYY")+']</span> </a>\
                            </h2>'
                        )
                    }
                },
                {
                    "targets": 4,
                    "render": function (data, type, row) {
                        return (
                            '<h2 class="table-avatar">\
                                <a href="javascript:void(0)">'+data+'-'+row.pincode +'<span style="text-align:left">['+row.district+']</span> </a>\
                            </h2>'
                        )
                    }
                },
            
            
            {
                "targets" : 6,
                "data" : null,
                "title" : "Action",
                "render" : function(data , type , row) 
                {
                    return (
                        "<a class='btn btn-outline-primary EditBtn' data-val='" + JSON.stringify(row) + "'  href = 'javascript:void(0)'>Edit</a>\
                        <a href = '/forms/fitness_report/"+row.id+"' class='btn btn-outline-primary PrintBtn' data-val='" + JSON.stringify(row) + "'  href = 'javascript:void(0)'>View</a>"
                        )
                }
            }
        ]

        });
    };


    $("#FormsDT").on("click" , ".EditBtn" , function()
    {
        var thisData = $(this).data("val");

        $(".submitBtn").text("Save Changes");
        $(".FormsDTSection").hide();
        $(".FormCreateSection").show();
        $(".addNewBtnSection").hide();
        $(".backBtnSection").show();

        $('#FormsId').val(thisData.id)
        $("#prefix").val(thisData.prefix).trigger('change');
        $("#name").val(thisData.name);
        $("#date").val(thisData.date);
        $("#gender").val(thisData.gender).trigger('change');
        $("#father_name").val(thisData.father_name);
        $("#village").val(thisData.village);
        $("#district").val(thisData.district);
        $("#state").val(thisData.state);
        $("#pincode").val(thisData.pincode);
        $("#purpose_of").val(thisData.purpose_of);
        $("#date").val(thisData.date);
    });


})