from django.urls import path
from patient import views
from patient.views import (PatientView , GetPatientData , GetPatientDataOnSearch)


urlpatterns = [
    path('' , views.PatientView.as_view() , name = 'patient'),
    path('get_patient_data/' , GetPatientData.as_view() , name = "get_patient_data"),
    path('get_patient_data_onsearch/' , views.GetPatientDataOnSearch.as_view() , name="get_patient_data_onsearch"),
]