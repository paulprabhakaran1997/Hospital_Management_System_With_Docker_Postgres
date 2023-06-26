from django.urls import path
from master import views
from master.views import (HealthCheckupMasterView , GetHealthCheckupMasterData)

urlpatterns = [
    path('' , views.HealthCheckupMasterView.as_view() , name = 'master'),
    path('get_health_checkup_master_data' , views.GetHealthCheckupMasterData.as_view() , name = 'get_health_checkup_master_data'),

]    
