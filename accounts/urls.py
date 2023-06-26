from django.urls import path
from accounts.views import (OP_Report , ScanReport , GetScanReport , GetLabReport ,  Lab_Report , Xray_Report , GetXrayReport  , Room_Report, Ward_Report, OverAll_Report, Cashier_Report, Patient_Report,GET_OP_Report ,
 GET_Room_Report , GET_Ward_Report , GET_OverAll_Report, GET_Cashier_Report , GET_Patient_Report , Get_Lab_Group_Amount , GET_Previous_Trns,
 Date_Wise_Collection , GET_Date_Wise_Report)

urlpatterns = [
    path("" , OP_Report.as_view() , name="op_report"),
    path("op_report" , OP_Report.as_view() , name="op_report"),
    path("room_report" , Room_Report.as_view() , name="room_report"),
    path("ward_report" , Ward_Report.as_view() , name="ward_report"),
    path("lab_report" , Lab_Report.as_view() , name="lab_report"),
    path("xray_report" , Xray_Report.as_view() , name="xray_report"),
    path("scan_report" , ScanReport.as_view() , name="scan_report"),
    path("overall_report" , OverAll_Report.as_view() , name="overall_report"),
    path("cashier_report" , Cashier_Report.as_view() , name="cashier_report"),
    path("date_wise_collection_report" , Date_Wise_Collection.as_view() , name="date_wise_collection_report"),
    path("patient_report/<id>" , Patient_Report.as_view() , name="patient_report"),

    path("get_op_report" , GET_OP_Report.as_view() , name="get_op_report"),
    path("get_room_report" , GET_Room_Report.as_view() , name="get_room_report"),
    path("get_ward_report" , GET_Ward_Report.as_view() , name="get_ward_report"),
    path("get_lab_report" , GetLabReport.as_view() , name="get_lab_report"),
    path("get_xray_report" , GetXrayReport.as_view() , name="get_xray_report"),
    path("get_scan_report" , GetScanReport.as_view() , name="get_scan_report"),
    path("get_overall_report" , GET_OverAll_Report.as_view() , name="get_overall_report"),
    path("get_cashier_report" , GET_Cashier_Report.as_view() , name="get_cashier_report"),
    path("get_patient_report" , GET_Patient_Report.as_view() , name="get_patient_report"),
    path("get_lab_group_amount" , Get_Lab_Group_Amount.as_view() , name="get_lab_group_amount"),
    path("get_previous_trns" , GET_Previous_Trns.as_view() , name="get_previous_trns"),
    path("get_date_wise_report" , GET_Date_Wise_Report.as_view() , name="get_date_wise_report"),

]