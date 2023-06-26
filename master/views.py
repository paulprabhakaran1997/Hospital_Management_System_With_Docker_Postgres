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

from django.shortcuts import render
from django.core.files.storage import FileSystemStorage

from lint_hospital.encoders import DefaultEncoder
from django.db import transaction

from master.models import HealthCheckupMaster



class HealthCheckupMasterView(View):
    template_name = 'health_checkup_master.html'

    def get(self , request):
        return render(request , self.template_name)


    def post(self , request):

        db_param = request.POST.dict()
        health_checkup_masterId = int(db_param['health_checkup_masterId'])


        del db_param['csrfmiddlewaretoken']
        del db_param['health_checkup_masterId']
        
        if health_checkup_masterId == 0:
            HealthCheckupMaster.objects.create(**db_param)
            messages.success(request , "Health Checkup Added Successfully")
            return redirect('master') 

        else:
            HealthCheckupMaster.objects.filter(id = health_checkup_masterId).update(**db_param) 
            messages.success(request , "Health Checkup  Updated Successfully")
            return redirect('master') 



    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)









class GetHealthCheckupMasterData(View):

    def get(self , request):
        context = {'health_checkup_master_data' : list(HealthCheckupMaster.objects.values())}

        return JsonResponse(context , safe = False) 