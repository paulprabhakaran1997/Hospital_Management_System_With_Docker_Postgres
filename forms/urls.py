from django.urls import path
from forms import views
from forms.views import ( FormsView , GETFormData , FitnessReportView)

urlpatterns = [
    path('' , FormsView.as_view() , name = 'forms'),
    path('forms_data' , GETFormData.as_view() , name = 'forms_data'),
    path('fitness_report/<id>' , FitnessReportView.as_view() , name = 'fitness_report')
]