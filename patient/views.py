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


from patient.models import ( Patient )


from django.shortcuts import render
from django.conf import settings
from django.core.files.storage import FileSystemStorage

from lint_hospital.encoders import DefaultEncoder
from hospital.helpers import get_patient_data
from django.db.models import Q

# Create your views here.

class PatientView(View):
    template_name = "add_patient.html"

    def get(self , request):
        PatientData = get_patient_data()

        context = {
            'patientdata' : json.dumps(PatientData , cls=DefaultEncoder)
        }

        return render(request , self.template_name , context)


    def post(self , request):

        data = request.body

        if(data):
            patient_data = json.loads(data)['PatientObj']

            patientId = patient_data['id']
        
            patient_db_param = {
                "name": patient_data['name'],
                "gender": patient_data['gender'],
                "dob": patient_data['dob'],
                "father_name": patient_data['father_name'],
                "phone": patient_data['phone'],
                "address": patient_data['address'],
            }

            if patientId == '0':
                patient_db_param['pos_id'] = patient_data['pos_id']
                Patient.objects.create(**patient_db_param)
                messages.success(request, "Patient Created Successfully")
                return JsonResponse({"status":"success"},status=200)

            else:
                Patient.objects.filter(id = patientId).update(**patient_db_param)
                messages.success(request, "Patient Updated Successfully")
                return JsonResponse({"status":"success"},status=200)

    

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)



class GetPatientData(View):
    def get(self , request):
        PatientData = get_patient_data()
        return JsonResponse(PatientData , safe=False)



class GetPatientDataOnSearch(View):
    def post(self , request):

        data = request.body
        if(data):
            PatientObj = []
            query_data = json.loads(data)['query']
            type = json.loads(data)['type']

            print(type)
            
            if type == 'all':
                PatientData = Patient.objects.filter(Q(id__icontains = query_data) | Q(name__icontains = query_data) | Q(phone__icontains = query_data) | Q(address__icontains = query_data)).all()
            else:
                PatientData = Patient.objects.filter(id = int(query_data)).all()


            for ht in PatientData:
                currentdate = datetime.now().date() - ht.dob

                age = currentdate.days//365
                month = (currentdate.days - age *365) // 30
                data = {
                    'id' : ht.id,
                    'name' : ht.name,
                    'age' : age,
                    'month' : month,
                    'gender' : ht.gender,
                    'phone' : ht.phone,
                    'father_name' : ht.father_name,
                    'address' : ht.address,
                    'pos_id' : ht.pos_id,
                }

                PatientObj.append(data)
            
            return JsonResponse(PatientObj , safe = False)

