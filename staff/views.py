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
from staff.models import Staff

from lint_hospital.encoders import DefaultEncoder

from hospital.helpers import get_staff_data

# Create your views here.

class StaffView(View):
    template_name = "add_staff.html"

    def get(self , request):

        StaffData = []
        StaffObj = Staff.objects.all()
        for ht in StaffObj:
            data = {
                'id' : ht.id,
                'name' : ht.name,
                'phone' : ht.phone,
                'address' : ht.address,
                'role_id' : ht.role.id,
                'role_name' : ht.role.name,
                'username' : ht.username
            }
            StaffData.append(data)

        context = {
            "staffdata" : StaffData,
            "roledata" : Role.objects.exclude(id = 1).exclude(id = 2)
        }
        return render(request , self.template_name , context)

    

    def post(self , request):
        StaffId = request.POST.get("staffId")

        RoleObj = Role.objects.get(id = int(request.POST.get("role")))

        staff_db_param = {
            "name" : request.POST.get("name"),
            "phone" : request.POST.get("phone"),
            "address" : request.POST.get("address"),
            "role" : RoleObj,
            "username" : request.POST.get('username'),
        }

        if StaffId == '0':
            Staff.objects.create(**staff_db_param)

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

            # Update Value to Staff table

            LatestStaffObj = Staff.objects.latest('id')
            LatestStaffObj.user = LatestUser
            LatestStaffObj.save()

            messages.success(request , "Staff Added Successfully")
            return redirect("staff")

        else:
            Staff.objects.filter(id = StaffId).update(**staff_db_param)
            StaffData = Staff.objects.get(id = StaffId)

            UserObj = User.objects.get(id = int(StaffData.user.id))

            UserObj.username = request.POST.get("username")
            UserObj.first_name = request.POST.get("name")

            if(request.POST.get("password") != ""):                
                UserObj.set_password(request.POST.get("password"))

            UserObj.save()
            messages.success(request , "Staff Updated Successfully")
            return redirect("staff")

    
    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)
