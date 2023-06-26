from django.urls import path
from xray.views import (XrayView , XrayFromAppointment , PatientXrayReportView , CancelXray, Get_XrayTest_Data ,
XrayPayment, PatientPaymentReportView )

 
urlpatterns = [
    path("" , XrayView.as_view() , name="xray"),
    # path("xray_patient/" , XrayPatient.as_view() , name="xray_patient"),   
    path("xray_from_appointment/" , XrayFromAppointment.as_view() , name="xray_from_appointment"),   
    path("patient_xray_report/<id>" , PatientXrayReportView.as_view() , name="patient_xray_report"),

    path("get_xray_test_data" , Get_XrayTest_Data.as_view() , name="get_xray_test_data"),    
    path("xray_payment" , XrayPayment.as_view() , name="xray_payment"),    
    path("canceling_xray" , CancelXray.as_view() , name = "canceling_xray"),
    path("patient_xray_payment_report/<id>" , PatientPaymentReportView.as_view() , name="patient_xray_payment_report"),  
 

]