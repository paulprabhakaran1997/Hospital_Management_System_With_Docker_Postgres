$(document).ready(function()
{
     // Group Tab Section
    $(".newGroupBtn").click(function()
    {        
        $("#addGroupForm").trigger('reset');
        $("#groupId").val("0");

        $(".groupformSubmitBtn").text("Add");

        $(".groupListDTSection").hide();
        $(".groupAddNewBtnSection").hide();

        $(".groupCreateSection").show();
        $(".groupBackBtnSection").show();
    });

    $('#group_category').select2({
        placeholder : 'Select Categoey',
        allowClear : true
    })

    $(".groupTabBackBtn").click(function()
    {
        $(".groupCreateSection").hide();
        $(".groupBackBtnSection").hide();

        $(".groupListDTSection").show();
        $(".groupAddNewBtnSection").show();
    });

    var GroupData = $("#get_lab_data").data('group');    
    var TestData = $("#get_lab_data").data('test')

    groupTable(GroupData);

    function groupTable(dataObj) {
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(dataObj);

        if ($.fn.dataTable.isDataTable("#groupListDT")) {
            $("#groupListDT").DataTable().destroy();
        }

        var groupListDatatable = $("#groupListDT").DataTable({
            data : dataObj,
            responsive: true,
            paging: true,
            searching: true,
            "scrollY": false,
            "scrollCollapse": true,
            "order": [0, "desc"],
            "pageLength": 10,
            "bLengthChange": false,
            "scrollX": false,
            columns: [{
                "title": "Id",
                "data": "id"
            }, {
                "title": "Name",
                "data": "name"
            }, {
                "title": "Amount",
                "data": "amount"
            }, {
                "title": "Description",
                "data": "description"
            }, {
                "title": "Action",
                "data": null
            },],

            columnDefs: [
              {
                    "targets" : 4,
                    "render" : function(data , type , row){   
                       
                        return (
                            "<button type='button' class='btn btn-outline-primary groupEditBtn' data-val='"+JSON.stringify(row)+"' >\
                            <i class='menu-icon tf-icons bx bx-edit'></i> Edit</button>\
                            <button type='button' class='btn btn-outline-danger group_DeleteBtn' data-val='"+JSON.stringify(row)+"' >\
                             Delete</button>"
                        )
                    }
                },
            ]

        })
    };

    $("#groupListDT").on("click" , ".groupEditBtn" , function()
    {
        var thisGroupdata = $(this).data("val");
        
        $("#groupId").val(thisGroupdata.id);
        $("#group_name").val(thisGroupdata.name);
        $("#amount").val(thisGroupdata.amount);
        $("#group_category").text(thisGroupdata.category).trigger('change');
        $("#group_description").val(thisGroupdata.description);

        $(".groupformSubmitBtn").text("Save Changes");

        $(".groupListDTSection").hide();
        $(".groupAddNewBtnSection").hide();

        $(".groupCreateSection").show();
        $(".groupBackBtnSection").show();
    })

    $("#groupListDT").on("click" , ".group_DeleteBtn" , function()
    {
        var thisdata = $(this).data("val");
        console.log(thisdata)

        Swal.fire({
            title: '<span class="trashIcon" style="color: red;font-size:45px;"><i class="far fa-question-circle me-1"></i></span>',
            html: '<div class="row" style="margin-top:15px">\
                    <div class="col-md-12">\
                            <div class= "titleSection text-center">\
                                <h4>Are You Sure</h4>\
                            </div>\
                    </div >\
                </div >\
                <div class="row" style="margin-top:15px">\
                    <div class="col-md-12">\
                        <div class="confirmSection text-center">\
                            <p style="line-height:1.5;font-size:25px">Delete <span style="font-weight : bold;color:#7638ff"> '+thisdata.name+'</span></p>\
                        </div>\
                    </div>\
                </div>',
            showCloseButton: false,
            showConfirmButton: true,
            showCancelButton: true,
            cancelButtonText: "No",
            cancelButtonColor: 'grey',
            confirmButtonText: "Yes",
            confirmButtonColor: '#22CC62',
            focusConfirm: false,

        }).then(function (result) {
            if (result.value == true) {
                $.ajax({
                    type : "GET",
                    url: "delete_group?groupId="+thisdata.id,
                    success: function(data) {
                        location.reload()
                    },
                    error: function(exception) {
                        console.log(exception)
                    }
                })
            } 
        })
        

    })


    // Test Tab Section

    $("#group").select2({
        placeholder : "Select Group",
        allowClear : true
    });

    $("#radio_test_range").select2({
        placeholder : "Select Option",
        allowClear : true
    });

    $("#radio_test_range").val("").trigger("change");

    $("#is_radio").on("change" , function()
    {
        var IsRadio = $(this).prop("checked");

        if(IsRadio == true)
        {
            $("#normal_range , #unit").val("");
            $("#normal_range , #unit").attr("required" , false);
            $(".NonRadioTestSection").hide();
        }
        else
        {
            $("#normal_range , #unit").val("");
            $("#normal_range , #unit").attr("required" , "required");
            $(".NonRadioTestSection").show();
        }
    })

    $(".newTestBtn").click(function()
    {        
        $("#addTestForm").trigger("reset");
        $("#testId").val('0');

        $("#group").val("").trigger("change");

        $("#is_radio").prop("checked" , false).trigger("change");

        $(".testFormsubmitBtn").text("Add");

        $(".testListDTSection").hide();
        $(".testAddNewBtnSection").hide();

        $(".testCreateSection").show();
        $(".testBackBtnSection").show();
    });


    $(".testTabBackBtn").click(function()
    {
        $(".testCreateSection").hide();
        $(".testBackBtnSection").hide();

        $(".testListDTSection").show();
        $(".testAddNewBtnSection").show();
    });

    testTable(TestData);

    function testTable(dataObj) {
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(dataObj);

        if ($.fn.dataTable.isDataTable("#testListDT")) {
            $("#testListDT").DataTable().destroy();
        }

        var testListDatatable = $("#testListDT").DataTable({
            data : dataObj,
            responsive: true,
            paging: true,
            searching: true,
            "scrollY": false,
            "scrollCollapse": true,
            "order": [0, "desc"],
            "pageLength": 10,
            "bLengthChange": false,
            "scrollX": false,
            columns: [{
                "title": "Id",
                "data": "id"
            }, {
                "title": "Name",
                "data": "name"
            }, {
                "title": "Group",
                "data": "group_name"
            }, {
                "title": "Normal Range",
                "data": "normal_range"
            },{
                "title": "Unit",
                "data": "unit"
            }, {
                "title": "IsRadio",
                "data": "is_radio"
            },{
                "title": "Action",
                "data": "id"
            },],
            columnDefs: [
                {
                    "targets" : 3,
                    "render" : function(data , type , row)
                    {
                        return data
                    }
                },
                {
                    "targets" : 6,
                    "render" : function(data , type , row)
                    {                        
                        return "<button type='button' class='btn btn-outline-primary testEditBtn' data-val='"+JSON.stringify(row)+"' >\
                            <i class='menu-icon tf-icons bx bx-edit'></i> Edit</button>\
                            <button type='button' class='btn btn-outline-danger test_DeleteBtn' data-val='"+JSON.stringify(row)+"' >\
                            Delete</button>"
                    }
                }
            ]

        }).columns.adjust();
    };

    $("#testListDT").on("click" , ".testEditBtn" , function()
    {
        var thisTestData = $(this).data("val");
        $("#testId").val(thisTestData.id);
        $("#test_name").val(thisTestData.name);
        $("#group").val(thisTestData.group_id).trigger("change");

        if(thisTestData.is_radio == "True")
        {
            $("#is_radio").prop("checked" , true).trigger("change");
        }
        else
        {
            $("#is_radio").prop("checked" , false).trigger("change");
        }

        $("#normal_range").val(thisTestData.normal_range);
        $("#unit").val(thisTestData.unit);

        $(".testFormsubmitBtn").text("Save Changes");

        $(".testListDTSection").hide();
        $(".testAddNewBtnSection").hide();

        $(".testCreateSection").show();
        $(".testBackBtnSection").show();

    });



    $("#testListDT").on("click" , ".test_DeleteBtn" , function()
    {
        var thisdata = $(this).data("val");
        console.log(thisdata)

        Swal.fire({
            title: '<span class="trashIcon" style="color: red;font-size:45px;"><i class="far fa-question-circle me-1"></i></span>',
            html: '<div class="row" style="margin-top:15px">\
                    <div class="col-md-12">\
                            <div class= "titleSection text-center">\
                                <h4>Are You Sure</h4>\
                            </div>\
                    </div >\
                </div >\
                <div class="row" style="margin-top:15px">\
                    <div class="col-md-12">\
                        <div class="confirmSection text-center">\
                            <p style="line-height:1.5;font-size:25px">Delete <span style="font-weight : bold;color:#7638ff"> '+thisdata.name+'</span></p>\
                        </div>\
                    </div>\
                </div>',
            showCloseButton: false,
            showConfirmButton: true,
            showCancelButton: true,
            cancelButtonText: "No",
            cancelButtonColor: 'grey',
            confirmButtonText: "Yes",
            confirmButtonColor: '#22CC62',
            focusConfirm: false,

        }).then(function (result) {
            if (result.value == true) {
                $.ajax({
                    type : "GET",
                    url: "delete_test?testId="+thisdata.id,
                    success: function(data) {
                        location.reload()
                    },
                    error: function(exception) {
                        console.log(exception)
                    }
                })
            } 
        })
        

    })













// @Rajan Lab Group Test integrated 


    function get_lab_test_data(){
        $.ajax({
            type: "GET",
            url: $("#get_lab_group_data").data('url'),
            success: function (data) {
                Lab_Test_Data(data.Lab_Test_Data);
            },
            error: function (exception) {
            }
        });
    }

    get_lab_test_data();


    function Lab_Test_Data(dataObj) {
        (function rec(d) {
            $.each(d, function (k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(dataObj);

        if ($.fn.dataTable.isDataTable("#labtestListDT")) {
            $("#labtestListDT").DataTable().destroy();
        }

        var groupListDatatable = $("#labtestListDT").DataTable({
            data : dataObj,
            responsive: true,
            paging: true,
            searching: true,
            "scrollY": false,
            "scrollCollapse": true,
            "order": [0, "desc"],
            "pageLength": 10,
            "bLengthChange": false,
            "scrollX": false,
            columns: [{
                "title": "Id",
                "data": "id"
            }, {
                "title": "Name",
                "data": "name"
            }, {
                "title": "Amount",
                "data": "amount"
            }, {
                "title": "Description",
                "data": "description"
            }, {
                "title": "Action",
                "data": null
            },],

            columnDefs: [
            {
                    "targets" : 4,
                    "render" : function(data , type , row){   
                    
                        return (
                            "<button type='button' class='btn btn-outline-primary EditBtn' data-val='"+JSON.stringify(row)+"' >\
                            <i class='menu-icon tf-icons bx bx-edit'></i> Edit</button>\
                            <button type='button' class='btn btn-outline-danger group_DeleteBtn' data-val='"+JSON.stringify(row)+"' >\
                            Delete</button>"
                        )
                    }
                },
            ]

        })
    };



    $('#lab_group_category').select2({
        placeholder : 'Select Categoey',
        allowClear : true
    })

    var lab_test_row = 0

    $(".newlabtestBtn").click(function()
    {        
        lab_test_row = 1;
        $("#add_LabTestForm").trigger("reset");
        $("#lab_groupId").val('0');
        $("#lab_testId").val('0');

        $("#lab_group").val("").trigger("change");

        $("#lab_is_radio").prop("checked" , false).trigger("change");
        $('#lab_group_category').val("").trigger('change')
        $('.append_lab_test_section').empty()

        $(".add_LabTestForm_SubmitBtn").text("Submit");

        $(".labtestListDTSection").hide();
        $(".labtestAddNewBtnSection").hide();

        $(".labtestCreateSection").show();
        $(".labtestBackBtnSection").show();

        $('.ADDTEST_Btn').trigger('click')
        $('#removetest_Btn-1').hide()
    });


    $(".labtestBackBtn").click(function()
    {
        $(".labtestCreateSection").hide();
        $(".labtestBackBtnSection").hide();

        $(".labtestListDTSection").show();
        $(".labtestAddNewBtnSection").show();
    });


    $('#labtestListDT').on('click' , '.EditBtn' , function(){
        var thisdata = $(this).data('val')
        console.log(thisdata)
        lab_test_row = 1;

        $(".labtestListDTSection").hide();
        $(".labtestAddNewBtnSection").hide();

        $(".labtestCreateSection").show();
        $(".labtestBackBtnSection").show();

        
        $("#add_LabTestForm").trigger("reset");
        $('.append_lab_test_section').empty()
        $(".add_LabTestForm_SubmitBtn").text("Save Changes");

        $("#lab_groupId").val(thisdata.id);
        $("#lab_group_name").val(thisdata.name);
        $("#lab_group_amount").val(thisdata.amount);
        $("#lab_group_category").val(thisdata.category_id).trigger('change');
        $("#lab_group_description").val(thisdata.description);

        var testdata =  thisdata.test_data
        for(var i = 0 ; i < testdata.length ; i++){
            console.log(testdata[i].id)
            add_test(testdata[i].id);

            $('.lab_test_name-'+testdata[i].id).val(testdata[i].name);
            $('.lab_input_type-'+testdata[i].id).val(testdata[i].input_type).trigger('change');
            if(testdata[i].is_radio == true)
            {
                $(".lab_is_radio-"+testdata[i].id).prop("checked" , true).trigger("change");
            }
            else
            {
                $(".lab_is_radio-"+testdata[i].id).prop("checked" , false).trigger("change");
            }

            $('.lab_normal_range-'+testdata[i].id).val(testdata[i].normal_range);
            $('.lab_unit-'+testdata[i].id).val(testdata[i].unit).trigger("change");
            $('.REMOVETEST_Btn-'+testdata[i].id).hide()
            $('.DeleteTEST_Btn-'+testdata[i].id).show()
        }

    })


    function add_test(test_id) {

        var lab_test_html = '<div class="row form-group lab_test_row-'+lab_test_row+'  lab_test_parent" data-val="'+lab_test_row+'" data-test_creation="'+test_id+'">\
                                    <div class="col-md-6">\
                                        <a href="javascript:void(0)" class="btn btn-primary me-1 REMOVETEST_Btn REMOVETEST_Btn-'+test_id+'" id="removetest_Btn-'+lab_test_row+'" data-val="'+lab_test_row+'">\
                                            <i class="fas fa-trash"></i> Remove Test\
                                        </a>\
                                    </div>\
                                    <div class="col-md-6" style="margin-top: 10px ; text-align:end" >\
                                        <a href="javascript:void(0)" class="hide me-1 DeleteTEST_Btn DeleteTEST_Btn-'+test_id+'" data-delete_test="'+test_id+'" >\
                                            <i class="fas fa-trash" style="font-size:20px; color:red"></i>\
                                        </a>\
                                    </div>\
                                    <div class="col-md-6">\
                                        <label for="lab_test_name" class="col-sm-3 col-form-label input-label">Test Name</label>\
                                        <div class="col-sm-12">\
                                            <input type="text" class="form-control lab_test_name-'+test_id+'" name="lab_test_name" id="lab_test_name-'+lab_test_row+'" placeholder="Test Name" required>\
                                        </div>\
                                    </div>\
                                    <div class="col-md-6">\
                                        <label for="lab_input_type" class="col-form-label input-label">Input Type</label>\
                                        <div class="col-sm-12">\
                                            <select name="lab_input_type" id="lab_input_type-'+lab_test_row+'" class="form-control lab_input_type   lab_input_type-'+test_id+'" required>\
                                                <option value=""></option>\
                                                <option value="single_line">Single Line</option>\
                                                <option value="paragraph">Paragraph</option>\
                                            </select>\
                                        </div>\
                                    </div>\
                                    <div class="col-md-4" style="margin-bottom:20px">\
                                        <label for="lab_is_radio" class="col-form-label input-label">Positive / Negative</label>\
                                        <div class="col-sm-12 form-switch">\
                                            <input class="form-check-input lab_is_radio lab_is_radio-'+test_id+'" type="checkbox" name="lab_is_radio" id="lab_is_radio-'+lab_test_row+'" data-val="'+lab_test_row+'">\
                                        </div>\
                                    </div>\
                                    <div class="col-md-4 lab_NonRadioTestSection-'+lab_test_row+'">\
                                                <label for="lab_unit" class="col-form-label input-label">Unit</label>\
                                                <div class="col-sm-12">\
                                                    <select name="lab_unit" id="lab_unit-'+lab_test_row+'" class="form-control lab_unit lab_unit-'+test_id+'" required>\
                                                        <option ></option>\
                                                        <option value="gm">gm</option>\
                                                        <option value="Cells/Cumm">Cells/Cumm</option>\
                                                        <option value="%">%</option>\
                                                        <option value="mms">mms</option>\
                                                        <option value="-+">-+</option>\
                                                        <option value="mg/dl">mg/dl</option>\
                                                        <option value="mg/lit">mg/lit</option>\
                                                        <option value="mmol/let">mmol/let</option>\
                                                        <option value="mg/dl">mg/dl</option>\
                                                        <option value="u/l">u/l</option>\
                                                        <option value="g/l">g/l</option>\
                                                        <option value="U/L">U/L</option>\
                                                        <option value="Pg/mc">Pg/mc</option>\
                                                        <option value="ng/dl">ng/dl</option>\
                                                        <option value="ulu/ml">ulu/ml</option>\
                                                        <option value="mlu/L">mlu/L</option>\
                                                        <option value="ng/dl">ng/dl</option>\
                                                        <option value="ug/dl">ug/dl</option>\
                                                        <option value="ng/ml">ng/ml</option>\
                                                        <option value="mg/dl">mg/dl</option>\
                                                        <option value="NEGATIVE">NEGATIVE</option>\
                                                        <option value="IU/ml">IU/ml</option>\
                                                        <option value="ng/mL">ng/mL</option>\
                                                        <option value="pg">pg</option>\
                                                        <option value="g/dl">g/dl</option>\
                                                        <option value="*10^6/ul">*10^6/ul</option>\
                                                        <option value="fl">fl</option>\
                                                        <option value="*10*3/ul">*10*3/ul</option>\
                                                    </select>\
                                                </div>\
                                    </div>\
                                    <div class="col-md-12">\
                                        <label for="lab_normal_range" class="col-form-label input-label">Normal Range</label>\
                                        <div class="col-sm-12">\
                                            <textarea type="text" class="form-control lab_normal_range-'+test_id+'" name="lab_normal_range" id="lab_normal_range-'+lab_test_row+'" placeholder="Range"  row="4" required></textarea>\
                                        </div>\
                                    </div>\
                                    <hr class="mt-3">\
                                </div>'



        $('.append_lab_test_section').append(lab_test_html)

        lab_test_row++;  

        $(".lab_input_type").select2({
            placeholder: "Select",
            allowClear: true,
            minimumResultsForSearch: -1
        });

        $(".lab_unit").select2({
            placeholder: "Select Unit",
            allowClear: true
        });

    }

    $('.ADDTEST_Btn').on('click', function () {
        add_test(0);
    })

    $('.append_lab_test_section').on('click' , '.REMOVETEST_Btn', function(){
        var thisrow = parseInt($(this).data('val'))
        $('.lab_test_row-'+thisrow).remove()
        
    })



    $(".append_lab_test_section").on("change" , '.lab_is_radio' ,function()
    {
        var IsRadio = $(this).prop("checked");
        var thisrow = parseInt($(this).data('val'))

        if(IsRadio == true)
        {
            $("#lab_unit-"+thisrow).val("").trigger('change');
            $("#lab_unit-"+thisrow).attr("required" , false);
            $(".lab_NonRadioTestSection-"+thisrow).hide();
        }
        else
        {
            $("#lab_unit-"+thisrow).val("").trigger('change');
            $("#lab_unit-"+thisrow).attr("required" , "required");
            $(".lab_NonRadioTestSection-"+thisrow).show();
        }
    })




//  Category Tap


$(".newcategoryBtn").click(function()
{        
    $("#add_CategoryForm").trigger('reset');
    $("#category_Id").val("0");

    $(".add_CategoryForm_SubmitBtn").text("Add");

    $(".categoryListDTSection").hide();
    $(".categoryAddNewBtnSection").hide();

    $(".categoryCreateSection").show();
    $(".categoryBackBtnSection").show();
});

$(".categoryTabBackBtn").click(function()
{

    $(".categoryListDTSection").show();
    $(".categoryCreateSection").hide();
    $('.categoryBackBtnSection').hide()
    $('.categoryAddNewBtnSection').show()
   
});

$.ajax({
    type: "GET",
    url: $('#get_category_data').data('url'),
    success: function (data) {

        console.log(data)
        categoryTable(data.category_data);
    },
    error: function (exception) {
        console.log(exception)
    }
});


function categoryTable(dataObj) {
    (function rec(d) {
        $.each(d, function (k, v) {
            if (typeof v === 'object') return rec(v)
            if (isNaN(v) && typeof v === 'number') d[k] = '---';
        })
    })(dataObj);

    if ($.fn.dataTable.isDataTable("#categoryListDT")) {
        $("#categoryListDT").DataTable().destroy();
    }

    var categoryListDatatable = $("#categoryListDT").DataTable({
        data : dataObj,
        responsive: true,
        paging: true,
        "scrollY": false,
        "scrollCollapse": true,
        "order": [0, "desc"],
        "pageLength": 10,
        "bLengthChange": false,
        "scrollX": false,
        "searching": true,
        columns: [{
                "title": "Id",
                "data": "id"
            },
            {
                "title": "Category Name",
                "data": "name"
            },
            {
                "title": "Description",
                "data": "description"
            },
            {
                "title": "Action",
                "data": null
            },
        ],
        columnDefs: [{
                "targets" : 0,
                "visible" : true
            },
            {
                "targets" : 3,
                "render" : function(data , type , row){   
                   
                    return (
                        "<button type='button' class='btn btn-outline-primary categoryEditBtn' data-val='"+JSON.stringify(row)+"' >\
                        <i class='menu-icon tf-icons bx bx-edit'></i> Edit</button>"
                    )
                }
            },
        ]

    })
};



$("#labtestListDT").on("click" , ".group_DeleteBtn" , function()
{
    var thisdata = $(this).data("val");
    console.log(thisdata)

    Swal.fire({
        title: '<span class="trashIcon" style="color: red;font-size:45px;"><i class="far fa-question-circle me-1"></i></span>',
        html: '<div class="row" style="margin-top:15px">\
                <div class="col-md-12">\
                        <div class= "titleSection text-center">\
                            <h4>Are You Sure</h4>\
                        </div>\
                </div >\
            </div >\
            <div class="row" style="margin-top:15px">\
                <div class="col-md-12">\
                    <div class="confirmSection text-center">\
                        <p style="line-height:1.5;font-size:25px">Delete <span style="font-weight : bold;color:#7638ff"> '+thisdata.name+'</span></p>\
                    </div>\
                </div>\
            </div>',
        showCloseButton: false,
        showConfirmButton: true,
        showCancelButton: true,
        cancelButtonText: "No",
        cancelButtonColor: 'grey',
        confirmButtonText: "Yes",
        confirmButtonColor: '#22CC62',
        focusConfirm: false,

    }).then(function (result) {
        if (result.value == true) {
            $.ajax({
                type : "GET",
                url: "delete_group?groupId="+thisdata.id,
                success: function(data) {
                    location.reload()
                },
                error: function(exception) {
                    console.log(exception)
                }
            })
        } 
    })
    

})

$('.append_lab_test_section').on('click' , '.DeleteTEST_Btn', function(){
    var thistest = parseInt($(this).data('delete_test'))
    console.log(thistest)

    Swal.fire({
        title: '<span class="trashIcon" style="color: red;font-size:45px;"><i class="far fa-question-circle me-1"></i></span>',
        html: '<div class="row" style="margin-top:15px">\
                <div class="col-md-12">\
                        <div class= "titleSection text-center">\
                            <h4>Are You Sure</h4>\
                        </div>\
                </div >\
            </div >\
            <div class="row" style="margin-top:15px">\
                <div class="col-md-12">\
                    <div class="confirmSection text-center">\
                        <p style="line-height:1.5;font-size:25px"><span style="font-weight : bold;color:#7638ff"> Delete this Test</span></p>\
                    </div>\
                </div>\
            </div>',
        showCloseButton: false,
        showConfirmButton: true,
        showCancelButton: true,
        cancelButtonText: "No",
        cancelButtonColor: 'grey',
        confirmButtonText: "Yes",
        confirmButtonColor: '#22CC62',
        focusConfirm: false,

    }).then(function (result) {
        if (result.value == true) {
            $.ajax({
                type : "GET",
                url: "delete_test?testId="+thistest,
                success: function(data) {
                    location.reload()
                },
                error: function(exception) {
                    console.log(exception)
                }
            })
        } 
    })
   
    
})

$("#categoryListDT").on("click" , ".categoryEditBtn" , function()
{
    var thisGroupdata = $(this).data("val");
    
    $("#category_Id").val(thisGroupdata.id);
    $("#category_name").val(thisGroupdata.name);
    $("#category_description").val(thisGroupdata.description);

    $(".add_CategoryForm_SubmitBtn").text("Save Changes");

    $(".categoryListDTSection").hide();
    $(".categoryAddNewBtnSection").hide();

    $(".categoryCreateSection").show();
    $(".categoryBackBtnSection").show();
})

















    $('#add_LabTestForm').submit(function(e){
        e.preventDefault();

        var lab_group_Data = [{
            'lab_groupId': parseInt($('#lab_groupId').val()),
            'lab_group_name': $("#lab_group_name").val(),
            'lab_group_amount': parseInt($("#lab_group_amount").val()),
            'lab_group_category': parseInt($("#lab_group_category").val()),
            'lab_group_description': $("#lab_group_description").val(),

        }];

        var lab_test_Data = []



        $('.lab_test_parent').each(function () {

                    var newObj = {
                        test_creation_id : parseInt($(this).data('test_creation')),
                        lab_test_name : $(this).find('input[name="lab_test_name"]').val(),
                        lab_input_type : $(this).find('select[name="lab_input_type"]').val(),
                        lab_is_radio : $(this).find('input[name="lab_is_radio"]').prop("checked"),
                        lab_normal_range : $(this).find('textarea[name="lab_normal_range"]').val(),
                        lab_unit : $(this).find('select[name="lab_unit"]').val(),
                        }
                    lab_test_Data.push(newObj);

        });

        console.log(lab_test_Data)


        $.ajax({
            type: "POST",
            headers: {
                'X-CSRFToken': $.cookie("csrftoken"),
                'Content-Type': 'application/json',
            },
            url: $('#post_lab_group').data('url'),
            data: JSON.stringify({
                'lab_group_Data': lab_group_Data,
                'lab_test_Data': lab_test_Data,
            }),
            success: function(msg) {
                location.reload()
            },
            error: function(exception) {
                console.log(exception)
            }
        });

    })


















    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e){
        $($.fn.dataTable.tables(true)).DataTable()
           .columns.adjust();
     });
    
     $('a[data-toggle="tab').on('shown.bs.collapse', function () {
        $($.fn.dataTable.tables(true)).DataTable()
           .columns.adjust();
     });

});




