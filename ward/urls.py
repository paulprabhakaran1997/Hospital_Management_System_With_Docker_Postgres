from django.urls import path
from ward.views import (WardView , WardBedView , AssignWardView , GetWardData , GetWardBedData ,GetAssignedWardData ,
 AssignWardDoctorCheckupView , Get_Ward_Patient_Checkup_History , Get_Amount_Ward_Patient , Ward_PatientPaymentView ,
  Discharge_Summary_Ward , GetDischargeSummary_Data_Ward , Discharge_Patient)

urlpatterns = [
    path("" , WardView.as_view() , name="ward"),    
    path('ward_bed/' , WardBedView.as_view() , name="ward_bed"),
    path('assign_ward/' , AssignWardView.as_view() , name="assign_ward"),
    path('get_ward_data' , GetWardData.as_view() , name="get_ward_data"),
    path('get_ward_bed_data' , GetWardBedData.as_view() , name="get_ward_bed_data"),
    path('get_assigned_ward_data' , GetAssignedWardData.as_view() , name="get_assigned_ward_data"),

    path("assignward_doctor_checkup" , AssignWardDoctorCheckupView.as_view() , name="assignward_doctor_checkup"),
    path("get_ward_patient_checkup_history" , Get_Ward_Patient_Checkup_History.as_view() , name="get_ward_patient_checkup_history"),

    path('get_amount_ward_patient/' , Get_Amount_Ward_Patient.as_view() , name="get_amount_ward_patient"),

    path('ward_patient_payment' , Ward_PatientPaymentView.as_view() , name="ward_patient_payment"),

    path('discharge_summary_ward' , Discharge_Summary_Ward.as_view() , name="discharge_summary_ward"),
    path('get_discharge_summary_data_ward' , GetDischargeSummary_Data_Ward.as_view() , name="get_discharge_summary_data_ward"),
    path('discharge_patient_ward' , Discharge_Patient.as_view() , name="discharge_patient_ward"),

      
]