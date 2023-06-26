from django.urls import path
from lab.views import (LabTestView , LabGroupView  , LabTestFromAppointment , 
PatientLabReportView , Get_LabTest_Data ,LabPayment , CancelLab , DeleteGroup , DeleteTest, Get_Lab_Result_Data , Post_Edit_Lab_Result_Data,
PatientPaymentReportView , GetLabGroupData , PostLabGroup , LabCategoryView , GetCategoryData , Get_Initial_Payment_data_Lab)


urlpatterns = [
    path("" , LabTestView.as_view() , name="lab"),    
    path("group/" , LabGroupView.as_view() , name="group"),    
    # path("lt_for_patient/" , LabTestForPatientView.as_view() , name="lt_for_patient"),    
    path("lt_from_appointment/" , LabTestFromAppointment.as_view() , name="lt_from_appointment"),    
    path("patient_lt_report/<patient_type>/<id>/<return_url>" , PatientLabReportView.as_view() , name="patient_lt_report"),  
    path("patient_lab_payment_report/<patient_type>/<id>/<return_url>" , PatientPaymentReportView.as_view() , name="patient_lab_payment_report"),  

    path("get_lab_test_data" , Get_LabTest_Data.as_view() , name="get_lab_test_data"),    
    path("lab_payment" , LabPayment.as_view() , name="lab_payment"),  
    path("canceling_lab" , CancelLab.as_view() , name = "canceling_lab"),
    path("delete_group" , DeleteGroup.as_view() , name = "delete_group")  ,
    path("delete_test" , DeleteTest.as_view() , name = "delete_test"),  
    path("get_lab_result_data" , Get_Lab_Result_Data.as_view() , name = "get_lab_result_data"),  
    path("post_edit_lab_result_data" , Post_Edit_Lab_Result_Data.as_view() , name = "post_edit_lab_result_data"),  
    path("get_lab_group_data" , GetLabGroupData.as_view() , name = "get_lab_group_data"),  
    path("post_lab_group" , PostLabGroup.as_view() , name = "post_lab_group"), 
    path("category/" , LabCategoryView.as_view() , name="category"),    
    path("get_category_data/" , GetCategoryData.as_view() , name="get_category_data"),    
    path("get_initial_payment_data_lab" , Get_Initial_Payment_data_Lab.as_view() , name="get_initial_payment_data_lab"),  
  
 
]