from django.urls import path
from room.views import (RoomView , AssignRoom ,  GetRoomData , GetAssignedRoomData ,
 AssignRoomDoctorCheckupView , Get_In_Patient_Checkup_History , Get_Amount_IN_Patient ,
  IN_PatientPaymentView , DischargeSummary_In , GetDischargeSummary_Data_In , Discharge_Patient , RoomCategoryView , TransferRoomView,
  IP_Refund,)

urlpatterns = [
    path("" , RoomView.as_view() , name="room"),
    path("assign_room" , AssignRoom.as_view() , name="assign_room"),
    path("get_room_data/" , GetRoomData.as_view() , name="get_room_data"),
    path("get_assigned_room_data/" , GetAssignedRoomData.as_view() , name="get_assigned_room_data"),
    path("assignroom_doctor_checkup" , AssignRoomDoctorCheckupView.as_view() , name="assignroom_doctor_checkup"),

    path('get_IN_patient_checkup_history/' , Get_In_Patient_Checkup_History.as_view() , name="get_IN_patient_checkup_history"),

    path('get_amount_in_patient/' , Get_Amount_IN_Patient.as_view() , name="get_amount_in_patient"),

    path('in_patient_payment' , IN_PatientPaymentView.as_view() , name="in_patient_payment"),

    path('discharge_summary_in' , DischargeSummary_In.as_view() , name="discharge_summary_in"),
    path('get_discharge_summary_data_in' , GetDischargeSummary_Data_In.as_view() , name="get_discharge_summary_data_in"),
    path('discharge_patient_ip' , Discharge_Patient.as_view() , name="discharge_patient_ip"),

    path('room_category/' , RoomCategoryView.as_view() , name="room_category"),
    path('transfer_room/' , TransferRoomView.as_view() , name="transfer_room"),
        path('ip_refund/' , IP_Refund.as_view() , name = 'ip_refund')


]