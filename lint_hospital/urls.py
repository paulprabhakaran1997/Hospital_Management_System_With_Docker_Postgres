"""lint_hospital URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path , include
from hospital import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('' , views.HomeView.as_view() , name="home"),
    path('home/' , views.HomeView.as_view() , name="home"),
    path('login/', views.UserLogin.as_view(), name='login'),
    path('logout/' , views.UserLogout.as_view() , name="logout"),

    path('configuration/' , include('configuration.urls')),
    path('patient/' , include('patient.urls')),
    path('doctor/' , include('doctor.urls')),
    path('staff/' , include('staff.urls')),
    path('appointment/' , include('appointment.urls')),
    path('lab/' , include('lab.urls')),
    path('xray/' , include('xray.urls')),
    path('scan/' , include('scan.urls')),
    path('doctor_checkup/' , include('doctor_checkup.urls')),
    path('accounts/' , include('accounts.urls')),
    path('room/' , include('room.urls')),
    path('ward/' , include('ward.urls')),
    path("upload_reports/" , include("upload_reports.urls")),
    path("forms/" , include("forms.urls")),
    path("master/" , include("master.urls"))
]

if settings.DEBUG:
    urlpatterns+= static(settings.MEDIA_URL , document_root = settings.MEDIA_ROOT)