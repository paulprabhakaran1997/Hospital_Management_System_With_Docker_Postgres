import logging
import base64
import sys
import datetime, json
from datetime import datetime, timedelta , time
from json import JSONEncoder
import json

from django.shortcuts import render , redirect
from django.views import View
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import Group
from django.utils.decorators import method_decorator
from django.contrib import messages
from django.views.generic import View
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db import transaction

from django.shortcuts import render
from django.conf import settings
from django.core.files.storage import FileSystemStorage

from lint_hospital.encoders import DefaultEncoder

from configuration.models import AppConfiguration


class ConfigurationView(View):
    template_name = "configuration.html"

    def get(self , request):

        context={
            "configuration" : AppConfiguration.objects.all().first()
        }
        return render(request , self.template_name, context)

    def post(self , request):
        print(request.POST.dict())
        print(request.POST.get('configuration_id'))

        db_param = request.POST.dict()

        del db_param['csrfmiddlewaretoken']
        del db_param['configuration_id']

        if(request.FILES.get('hospital_logo') == None):
            HospitalLogo = AppConfiguration.objects.get(id = 1).hospital_logo
        else:
            HospitalLogo = request.FILES.get('hospital_logo')

        
        AppConfiguration.objects.filter(id = 1).update(**db_param)

        AppConfigurationData = AppConfiguration.objects.get(id = 1)
        AppConfigurationData.hospital_logo = HospitalLogo
        AppConfigurationData.save()

        messages.success(request ,"Updated Successfully")
        return redirect('configuration')
            

        