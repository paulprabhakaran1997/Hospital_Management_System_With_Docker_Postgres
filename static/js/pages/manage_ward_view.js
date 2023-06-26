$(document).ready(function() {

    var WardData = $("#WardData").data("val");

    wardTable(WardData);



    function getWardData() {

        $.ajax({
            type: "GET",
            url: $('#get_ward_data_url').data('url'),
            success: function (data) {
                displayWardDetails(data['Ward_Data'])
            },
            error: function (exception) {
                console.log(exception)
            }
        });

    }

    getWardData();

    function displayWardDetails(Ward_data) {
        var ward_select_data = [];

        for (var i = 0; i < Ward_data.length; i++) {
            ward_select_data.push({ id: Ward_data[i].id, text: Ward_data[i].ward_name, })
        }

        $("#ward").select2({
            data: ward_select_data,
            placeholder: "Select Ward",
            allowClear: true,
            templateResult: formatWardSelect2
        });

        $("#ward").val("").trigger("change")

        function formatWardSelect2(state) {
            if (state.id) {
                var container = $(
                    '<ul class="list-unstyled users-list m-0 avatar-group d-flex align-items-center">\
                        <li class="fw-bold">' + state.text + '</li>\
                    </ul>'
                )
            }
            return container;
        }

    }



    $(".backBtn").click(function() {
        $(".WardCreation").hide();
        $(".WardView").show();
        $(".backBtnSection").hide();
        $(".addNewBtnSection").show();
        
    });


    $(".addNewbtn").click(function() {

        $("#addWardsForm").trigger('reset');

        $(".submitBtn").text("Add")

        $(".WardCreation").show();
        $(".WardView").hide();

        $(".addNewBtnSection").hide();
        $(".backBtnSection").show();

        $("#wardId").val("0")

    })

    function wardTable(wardObj) {
        (function rec(d) {
            $.each(d, function(k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(wardObj);

        if ($.fn.dataTable.isDataTable("#wardListDT")) {
            $("#wardListDT").DataTable().destroy();
        }

        var wardListDatatable = $("#wardListDT").DataTable({
            "data": wardObj,
            responsive: true,
            paging: true,
            autoWidth: false,
            searching: true,
            "scrollCollapse": true,
            "order": [0, "desc"],
            "pageLength": 10,
            "bLengthChange": false,
            "scrollX": false,
            columns: [{
                    "title":"ID",
                    "data": "id",
                },
                {
                    "title":"Ward Name",
                    "data": "ward_name",
                },
                {
                    "title":"Ward Amount",
                    "data": "amount",
                },
                {
                    "title":"Description",
                    "data": "description",
                },],
            columnDefs: [{
                    "targets": 0,
                    "visible": false
                },
                {
                    "targets": 4,
                    "title":"Action",
                    "data": null,
                    "render": function(data, type, row) {
                        var container = "<button type='button' class='btn btn-outline-primary EditBtn' data-val='" + JSON.stringify(row) + "' >\
                                            <i class='menu-icon tf-icons bx bx-edit'></i> Edit</button>"

                        return container
                    }
                }
            ]

        })
    };


    $("#wardListDT").on("click", ".EditBtn", function() {
        var thisWardData = $(this).data("val");
      
        $("#wardId").val(thisWardData.id)

        $("#ward_name").val(thisWardData.ward_name);
        $("#ward_amount").val(thisWardData.amount);

        $("#description").val(thisWardData.description)

        $(".submitBtn").text("Save Changes")

        $(".WardCreation").show();
        $(".WardView").hide();
        $(".addNewBtnSection").hide();
        $(".backBtnSection").show();
    })


    $("#addWardsForm").submit(function(e) {
        // e.preventDefault();

        if (WardData.length > 0) {
            var ExistingWard = WardData.filter(function(obj) {
                return ((obj.id != $("#wardId").val()) && ((obj.ward_name).toLowerCase() == ($("#ward_name").val()).toLowerCase()))
            });

            if (ExistingWard.length > 0) {
                iziToast.error({
                    timeout: 700,
                    balloon: true,
                    overlay: true,
                    displayMode: 'once',
                    id: 'error',
                    title: 'Error',
                    zindex: 99999999,
                    message: '<b>Ward Name ' + $("#ward_name").val() + ' already Taken </b>',
                });
                return false
            } else if (ExistingWard.length == 0) {
                return true
            }
        } else {
            return true
        }

    })

    var WardBedData = $("#WardBedData").data("val");



    $(".WardBedBackBtn").click(function() {
        $(".WardBedCreation").hide();
        $(".WardBedView").show();
        $(".addWardBedBtnSection").show();
        $(".backWardbedBtnSection").hide();

    });


    $(".addWardbedBtn").click(function() {

        $("#addWardBedForm").trigger('reset');

        $(".submitBtn").text("Add")

        $(".WardBedCreation").show();
        $(".WardBedView").hide();
        $(".addWardBedBtnSection").hide();
        $(".backWardbedBtnSection").show();

        $("#wardbedId").val("0");

        $("#ward").val("").trigger("change")

    })




    wardbedTable(WardBedData);

    function wardbedTable(wardbedObj) {
        (function rec(d) {
            $.each(d, function(k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(wardbedObj);

        if ($.fn.dataTable.isDataTable("#wardbedListDT")) {
            $("#wardbedListDT").DataTable().destroy();
        }

        var wardbedListDatatable = $("#wardbedListDT").DataTable({
            "data": wardbedObj,
            responsive: true,
            paging: true,
            autoWidth: false,
            searching: true,
            "scrollCollapse": true,
            "order": [0, "desc"],
            "pageLength": 10,
            "bLengthChange": false,
            "scrollX": false,
            columns: [{
                    "title":"ID",
                    "data": "id",
                },
                {
                    "title":"Ward Name",
                    "data": "ward_name",
                },
                {
                    "title":"Bed No",
                    "data": "bed_no",
                },
                {
                    "title":"Description",
                    "data": "description",
                },],
            columnDefs: [{
                    "targets": 0,
                    "visible": false
                },
                {
                    "targets": 4,
                    "title":"Action",
                    "data": null,
                    "render": function(data, type, row) {
                        var container = "<button type='button' class='btn btn-outline-primary EditBtn' data-val='" + JSON.stringify(row) + "' >\
                                            <i class='menu-icon tf-icons bx bx-edit'></i> Edit</button>"

                        return container
                    }
                }
            ]

        })
    };


    $("#wardbedListDT").on("click", ".EditBtn", function() {
        var thisWardBedData = $(this).data("val");

        $("#wardbedId").val(thisWardBedData.id)

        $("#ward").val(thisWardBedData.ward_id).trigger("change");

        $("#bed_no").val(thisWardBedData.bed_no);

        $("#wardbed_description").val(thisWardBedData.description)

        $(".submitBtn").text("Save Changes")

        $(".WardBedCreation").show();
        $(".WardBedView").hide();
        $(".addWardBedBtnSection").hide();
        $(".backWardbedBtnSection").show();
    })


    $("#addWardBedForm").submit(function(e) {
        // e.preventDefault();

      
        if (WardBedData.length > 0) {
            var ExistingWardBed = WardBedData.filter(function(obj) {
                return ((obj.id != $("#wardbedId").val()) && obj.ward_id == $("#ward").val() && obj.bed_no == $("#bed_no").val())
            });

            
            if (ExistingWardBed.length > 0) {
                iziToast.error({
                    timeout: 700,
                    balloon: true,
                    overlay: true,
                    displayMode: 'once',
                    id: 'error',
                    title: 'Error',
                    zindex: 99999999,
                    message: '<b>Bed No ' + $("#bed_no").val() + ' already Exists for this Ward </b>',
                });
                return false
            } else if (ExistingWardBed.length == 0) {
                return true
            }
        } else {
            return true
        }

    })

});




//Rooms

$(document).ready(function()
{
    var Room_Data = []
    $(".backBtn").click(function () {
        $(".RoomCreation").hide();
        $(".RoomView").show();
        $(".backBtnSection").hide();
        $(".addNewBtnSection").show();
    });

    $("#room_type").select2({
        placeholder : "Room Type",
        allowClear : true
    })


    
    $('#room_type').on('change' , function(){
        var filtered_category = []
        var thisval = $(this).val()
        var ctyList = $('#RoomCategory_data').data('val')

        $('#room_category').find('option').remove()

        if(thisval == 'Room'){
            var filter_data = ctyList.filter(function(obj){
                return obj.category == thisval
            })
            $.each(filter_data, function(i , obj) {
                filtered_category.push({ id :obj.id , text : obj.name})
              });
        }

        else{
            var filter_data = ctyList.filter(function(obj){
                return obj.category == thisval
            })
            $.each(filter_data, function(i , obj) {
                filtered_category.push({ id :obj.id , text : obj.name})
              });
        }

        console.log(filtered_category)

        $('#room_category').select2({
            data : filtered_category,
            placeholder : 'Categoerys',
            allowClear : true
        })

        $('#room_category').val("").trigger("change");
    })






    $(".addNewbtn").click(function () {

        $("#addRoomsForm").trigger('reset');

        $("#room_type").val("").trigger("change")

        $(".submitBtn").text("Add")

        $(".RoomCreation").show();
        $(".RoomView").hide();
        $(".backBtnSection").show();
        $(".addNewBtnSection").hide();

        $("#roomId").val("0")

    })

    function assignedroom_data(){

    $.ajax({
        type: "GET",
        url: $('#get_room_data_url').data('url'),
        success: function(data) {
            Room_Data = data['Roomdata']

            roomTable(data['Roomdata']);

            console.log(data['Roomdata'])

            function roomTable(roomObj) {
                (function rec(d) {
                    $.each(d, function (k, v) {
                        if (typeof v === 'object') return rec(v)
                        if (isNaN(v) && typeof v === 'number') d[k] = '---';
                    })
                })(roomObj);
        
                if ($.fn.dataTable.isDataTable("#roomListDT")) {
                    $("#roomListDT").DataTable().destroy();
                }
        
                var roomListDatatable = $("#roomListDT").DataTable({
                    "data" : roomObj,
                    responsive: true,
                    paging: true,
                    searching: true,
                    "scrollY": false,
                    "scrollCollapse": true,
                    "order": [0, "desc"],
                    "pageLength": 10,
                    "bLengthChange": false,
                    "scrollX": false,
                    columns: [
                        {
                            "title":"Id",
                            "data":"id",
                        },
                        {
                            "title":"Room No",
                            "data" : "room_no",
                        },                        
                        {
                            "title":"Type",
                            "data" : "room_type",
                        },
                        {
                            "title":"Category",
                            "data" : "category",
                        },
                        {
                            "title":"Price",
                            "data" : "room_price",
                        },
                        {
                            "title":"Description",
                            "data" : "room_description",                 
                        },
                    ],
                    columnDefs: [
                        {
                            "targets" : 0,
                            "visible" : true
                        },
                        {
                            "targets" : 6,
                            "title":"Action",
                            "data" : null,
                            "render" : function(data , type , row){
                                var container = "<button type='button' class='btn btn-outline-primary EditBtn' data-val='"+JSON.stringify(row)+"' >\
                                                    <i class='menu-icon tf-icons bx bx-edit'></i> Edit</button>"
        
                                return container
                            }
                        }
                    ]
        
                })
            };
        },
        error: function(exception) {
            console.log(exception)
        }
    });

}

assignedroom_data();

setInterval(function () {
    assignedroom_data()
}, 30000);


    $("#roomListDT").on("click", ".EditBtn", function () {
        var thisRoomData = $(this).data("val");

        console.log(thisRoomData)

        $("#roomId").val(thisRoomData.id)
        
        $("#room_no").val(thisRoomData.room_no);

        $("#room_type").val(thisRoomData.room_type).trigger("change")
        $("#room_category").val(thisRoomData.category_id).trigger("change")

        $("#price").val(thisRoomData.room_price)

        $("#room_description").val(thisRoomData.room_description)

        $(".submitBtn").text("Save Changes")

        $(".RoomCreation").show();
        $(".RoomView").hide();
        $(".backBtnSection").show();
        $(".addNewBtnSection").hide();
    })


    $("#addRoomsForm").submit(function(e)
    {
        e.preventDefault();

   
        var RoomData  = [{
            'room_id' : parseInt($("#roomId").val()),
            'room_no' : $("#room_no").val(),
            'room_type' :  $("#room_type").val(),
            'category' : $('#room_category').val(),
            'room_price' :  $("#price").val(),
            'room_description' :  $("#room_description").val()
        }]

   
            var ExistingRoom = Room_Data.filter(function(obj)
            {
                return ((obj.id != $("#roomId").val()) && (obj.room_no == $("#room_no").val()))
            });

            if(ExistingRoom.length > 0)
            {
                iziToast.error({
                    timeout: 700,
                    balloon: true,
                    overlay: true,
                    displayMode: 'once',
                    id: 'error',
                    title: 'Error',
                    zindex: 99999999,
                    message: '<b>Room Number '+$("#room_no").val()+' already Taken </b>',
                });
                return false
            }
            else if(ExistingRoom.length == 0)
            {

                console.log(RoomData)
                $.ajax({
                    type: "POST",
                    headers: {
                        'X-CSRFToken': $.cookie("csrftoken"),
                        'Content-Type': 'application/json',
                    },
                    url: $('#room_url').data('url'),
                    data: JSON.stringify({
                        'RoomData': RoomData
                    }),
                    success: function(msg) {
                        location.reload()
                    },
                    error: function(exception) {
                        console.log(exception)
                    }
                });

            }
        





    })

})


// Room Category

$(document).ready(function(){


    console.log($('#RoomCategory_data').data('val'))
    CategoryTable($('#RoomCategory_data').data('val'));

    function CategoryTable(categoryObj) {
        (function rec(d) {
            $.each(d, function(k, v) {
                if (typeof v === 'object') return rec(v)
                if (isNaN(v) && typeof v === 'number') d[k] = '---';
            })
        })(categoryObj);

        if ($.fn.dataTable.isDataTable("#roomCategoryListDT")) {
            $("#roomCategoryListDT").DataTable().destroy();
        }

        var wardbedListDatatable = $("#roomCategoryListDT").DataTable({
            "data": categoryObj,
            responsive: true,
            paging: true,
            autoWidth: false,
            searching: true,
            "scrollCollapse": true,
            "order": [0, "desc"],
            "pageLength": 10,
            "bLengthChange": false,
            "scrollX": false,
            columns: [{
                    "title":"ID",
                    "data": "id",
                },
                {
                    "title":"Type",
                    "data": "category",
                },
                {
                    "title":"Name",
                    "data": "name",
                },
                {
                    "title":"Action",
                    "data": null,
                },
                ],
            columnDefs: [{
                    "targets": 0,
                    "visible": true
                },
                {
                    "targets": 3,
                    "title":"Action",
                    "data": null,
                    "render": function(data, type, row) {
                        var container = "<button type='button' class='btn btn-outline-primary categoryEdit' data-val='" + JSON.stringify(row) + "' >\
                                            <i class='menu-icon tf-icons bx bx-edit'></i> Edit</button>"

                        return container
                    }
                }
            ]

        })
    };

    $("#category").select2({
        placeholder : "Category Type",
        allowClear : true
    })

    $(".addCategorybtn").click(function () {
    
        $("#addRoomsCategory").trigger('reset');
        $(".RoomCategory").show();
        $(".RoomCategoryView").hide();
        $(".backCategorySection").show();
        $(".addCategorySection").hide();
        $("#roomCategoryId").val("0")
        $('#category').val('').trigger('change')
        $('.submitBtn').text('Add')
    
    })
    
    $(".backCategoryBtn").click(function () {
        $(".RoomCategory").hide();
        $(".RoomCategoryView").show();
        $(".backCategorySection").hide();
        $(".addCategorySection").show();
    });
    
    $('#roomCategoryListDT').on('click' , '.categoryEdit' , function(){
    
        $(".RoomCategory").show();
        $(".RoomCategoryView").hide();
        $(".backCategorySection").show();
        $(".addCategorySection").hide();
        $('.submitBtn').text('Save Changes')

        var thisdata = $(this).data('val')

        $('#roomCategoryId').val(thisdata.id)
        $('#category').val(thisdata.category).trigger('change')
        $('#category_name').val(thisdata.name)
    })
})









$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
    console.log("test")
    $($.fn.dataTable.tables(true)).DataTable()
        .columns.adjust();
});