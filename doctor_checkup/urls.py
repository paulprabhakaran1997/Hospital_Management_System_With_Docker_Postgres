from django.urls import path
from doctor_checkup.views import DoctorCheckupView ,GetDoctorCheckupData , GetAppointmentData_DT , GetPatient_History , GetPatient_Checkup_History

urlpatterns = [
    path('' , DoctorCheckupView.as_view() , name = "doctor_checkup"),
    path("Get_doctor_checkup_data/" , GetDoctorCheckupData.as_view() , name="Get_doctor_checkup_data"),

    path("get_appointmentdata_dt/" , GetAppointmentData_DT.as_view() , name="get_appointmentdata_dt"),

    path('get_patient_history/' , GetPatient_History.as_view() , name="get_patient_history"),

    path('get_patient_checkup_history' , GetPatient_Checkup_History.as_view() , name="get_patient_checkup_history"),

]