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

from hospital.models import Role
from doctor.models import Doctor

from lint_hospital.encoders import DefaultEncoder

# Create your views here.

class DoctorView(View):
    template_name = "add_doctor.html"

    def get(self , request):

        def get_doctor_data():
            doctor_data = []
            try:
                DoctorObj = Doctor.objects.all()
                for ht in DoctorObj:
                    data = {
                        'id' : ht.id,
                        'name' : ht.name,
                        'phone' : ht.phone,
                        'specialized' : ht.specialized,
                        'fees' : ht.fees,
                        'address' : ht.address,
                        'username' : ht.username,
                        'health_checkup_master' : ht.health_checkup_master
                    }
                    doctor_data.append(data)

            except Doctor.DoesNotExist:
                doctor_data = []

            return doctor_data

        
        DoctorData = get_doctor_data()


        context = {
            'doctordata' : DoctorData,
            "roledata" : json.dumps(list(Role.objects.filter(id = 2).values()) , cls = DefaultEncoder)
        }
        return render(request , self.template_name , context)


    def post(self , request):
        DoctorId = request.POST.get('doctorId')

        RoleObj = Role.objects.get(id = int(request.POST.get('role')))

        print(json.loads(request.POST.get('health_checkup_master_selected')))

        doctor_db_param = {
            "name" : request.POST.get('name'),
            "phone" : request.POST.get('phone'),
            "specialized" : request.POST.get('specialized'),
            "address" : request.POST.get('address'),
            "fees" : request.POST.get('fees'),
            "username" : request.POST.get('username'),
            "health_checkup_master" : json.loads(request.POST.get('health_checkup_master_selected')),
        }

        if DoctorId == '0':
            doctor_db_param['role'] = RoleObj
            Doctor.objects.create(**doctor_db_param)            

            UserDB = User.objects.create_user(
                username = request.POST.get("username"),
                password = request.POST.get("password"),
                first_name = request.POST.get('name'),
            )
            UserDB.save()

            LatestUser = User.objects.latest('id')
            roleName = Role.objects.get(id = int(request.POST.get('role'))).name
            group = Group.objects.get(name = roleName)
            LatestUser.groups.add(group)


            # Update Value to Doctor table

            LatestDoctorObj = Doctor.objects.latest('id')
            LatestDoctorObj.user = LatestUser
            LatestDoctorObj.save()

            messages.success(request , "Doctor Added Successfully")
            return redirect('doctor')

        else:

            Doctor.objects.filter(id = DoctorId).update(**doctor_db_param)

            DoctorData = Doctor.objects.get(id = DoctorId)

            UserObj = User.objects.get(id = int(DoctorData.user.id))

            UserObj.username = request.POST.get("username")
            UserObj.first_name = request.POST.get("name")

            if(request.POST.get("password") != ""):                
                UserObj.set_password(request.POST.get("password"))

            UserObj.save()

            messages.success(request , "Doctor Updated Successfully")

            return redirect('doctor')


    
    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)
