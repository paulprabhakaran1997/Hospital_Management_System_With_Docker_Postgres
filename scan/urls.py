from django.urls import path
from scan.views import (ScanView , ScanFromAppointment , PatientScanReportView ,CancelScan ,
 Get_ScanTest_Data  , ScanPayment , Get_Scan_Result_Data, Post_Edit_Scan_Result_Data , PatientPaymentReportView , Get_Initial_Payment_data_Scan)

 
urlpatterns = [
    path("" , ScanView.as_view() , name="scan"),
    path("scan_from_appointment/" , ScanFromAppointment.as_view() , name="scan_from_appointment"),   
    path("patient_scan_report/<patient_type>/<id>" , PatientScanReportView.as_view() , name="patient_scan_report"),

    path("get_scan_test_data" , Get_ScanTest_Data.as_view() , name="get_scan_test_data"),    
    path("scan_payment" , ScanPayment.as_view() , name="scan_payment"),    
    path("canceling_scan" , CancelScan.as_view() , name = "canceling_scan"),
    path("get_scan_result_data" , Get_Scan_Result_Data.as_view() , name = "get_scan_result_data"),
    path("post_edit_scan_result_data" , Post_Edit_Scan_Result_Data.as_view() , name = "post_edit_scan_result_data"),  
    path("patient_scan_payment_report/<patient_type>/<id>" , PatientPaymentReportView.as_view() , name="patient_scan_payment_report"), 
    path("get_initial_payment_data_scan" , Get_Initial_Payment_data_Scan.as_view() , name="get_initial_payment_data_scan"),  
 



]