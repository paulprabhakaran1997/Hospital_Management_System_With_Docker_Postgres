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
                    searching: false,
                    "scrollY": false,
                    "scrollCollapse": true,
                    "order": [0, "desc"],
                    "pageLength": 10,
                    "bLengthChange": false,
                    "scrollX": false,
                    columns: [
                        {
                            "data":"id",
                        },
                        {
                            "data" : "room_no",
                        },
                        
                        {
                            "data" : "room_type",
                        },
                        {
                            "data" : "room_price",
                        },
                        {
                            "data" : "room_description",                 
                        },
                    ],
                    columnDefs: [
                        {
                            "targets" : 0,
                            "visible" : false
                        },
                        {
                            "targets" : 5,
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

        $("#roomId").val(thisRoomData.id)
        
        $("#room_no").val(thisRoomData.room_no);

        $("#room_type").val(thisRoomData.room_type).trigger("change")

        $("#price").val(thisRoomData.room_price)

        $("#description").val(thisRoomData.room_description)

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
            'room_price' :  $("#price").val(),
            'room_description' :  $("#description").val()
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