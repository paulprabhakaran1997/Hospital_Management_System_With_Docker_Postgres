from django.urls import path
from staff import views
from staff.views import (StaffView)

urlpatterns = [
    path("" , StaffView.as_view() , name = "staff")
]
