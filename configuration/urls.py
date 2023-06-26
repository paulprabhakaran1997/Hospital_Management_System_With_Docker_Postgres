from django.urls import path
from configuration import views
from configuration.views import ConfigurationView
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path("" , ConfigurationView.as_view() , name = "configuration")
]

