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
from django.db import transaction

from django.shortcuts import render
from django.conf import settings
from django.core.files.storage import FileSystemStorage

from forms.models import Forms
from doctor.models import Doctor

from lint_hospital.encoders import DefaultEncoder

# Create your views here.

class FormsView(View):
    template_name = "forms.html"


    def get(self , request):

        context = {'formData' : get_form_data(0)}

        return render(request , self.template_name , context)


    def post(self , request):

        print(request.POST.dict())
        print(request.POST.get('FormsId'))
        FormsId = int(request.POST.get('FormsId'))

        db_param = request.POST.dict()
        del db_param['csrfmiddlewaretoken']
        del db_param['FormsId']

        if FormsId == 0:
            Forms.objects.create(**db_param)

            messages.success(request , "Form Added Successfully")
            return redirect('forms')

        else: 
            Forms.objects.filter(id = FormsId).update(**db_param)

            messages.success(request , "Form Updated Successfully")
            return redirect('forms')   
            

    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


def get_form_data(id):
    form_data = []
    try:
        if int(id) > 0:
            FormObj = Forms.objects.filter(id = int(id))
        else:
            FormObj = Forms.objects.all()

        for ht in FormObj:
            currentdate = datetime.now().date() - ht.dob
            age = currentdate.days//365
            month = (currentdate.days - age *365) // 30
            data = {
                "id" : ht.id,
                "prefix" : ht.prefix,
                "name" : ht.name,
                "father_name" : ht.father_name,                       
                "gender" : ht.gender,
                "dob" : ht.dob,
                "age" : age,
                "village" : ht.village,
                "district" : ht.district,
                "state" : ht.state,
                "pincode" : ht.pincode,
                "purpose_of" : ht.purpose_of,
                "date" : ht.date,
            }
            form_data.append(data)

    except Forms.DoesNotExist:
        form_data = []

    return form_data


class GETFormData(View):

    def get(self , request):
        context = {'formData' : get_form_data(0)}
        return JsonResponse(context , safe = False) 

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class FitnessReportView(View):
    template_name = "fitness_report.html"
    

    def get(self , request , id):
        data = get_form_data(id)
        print(data)
        context = {'formData' : data[0] }
        return render(request , self.template_name , context)

    
    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

