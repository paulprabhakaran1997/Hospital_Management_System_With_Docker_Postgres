import logging
import base64
import sys
import datetime, json
from datetime import datetime, timedelta , time
from json import JSONEncoder
import json
from decimal import Decimal
from django.utils.dateparse import parse_date

from decimal import Decimal
from django.db.models import Sum
from django.shortcuts import render , redirect
from django.views import View
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import Group
from django.template import Context, Template
from django.utils.decorators import method_decorator
from django.forms.models import model_to_dict
from django.contrib import messages
from django.core.paginator import EmptyPage, InvalidPage, Paginator
from django.views.generic import View
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.utils.translation import get_language
from django.contrib.auth.models import User


from django.shortcuts import render
from django.conf import settings
from django.core.files.storage import FileSystemStorage

from lint_hospital.encoders import DefaultEncoder

from appointment.models import Appointment , OutPatient_Payments

from room.models import AssignRooms ,  IN_Patient_Payments

from ward.models import AssignWard

# Create your views here.

class UserLogin(View):
    template_name = 'login.html'

    def get(self , request):     
        return render(request , self.template_name)

    def post(self , request):
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                messages.success(request, "Logged In Successfully")                
                return redirect('home')
            else:
                messages.error(request, "Incorrect Username (Or) Password")
        else:
            messages.error(request, "Invalid Username (Or) Password")

        return render(request , self.template_name)




class UserLogout(View):
    def get(self , request):
        logout(request)
        messages.success(request, "Logged Out Successfully")
        return redirect('login') 





class HomeView(View):
    template_name = "index.html"

    def get(self , request):    

        today = datetime.now().date()
        tomorrow = today + timedelta(1)
        today_start = datetime.combine(today, time())
        today_end = datetime.combine(tomorrow, time())

        today_op = Appointment.objects.filter(appointment_date__gte=today_start).filter(appointment_date__lte = today_end).all()

        current_ip = AssignRooms.objects.filter(status = 0).all()
        today_ip = AssignRooms.objects.filter(assigned_date__gte=today_start).filter(assigned_date__lte = today_end).all()

        op_paid_amount = OutPatient_Payments.objects.filter(created_time__gte = today_start).filter(updated_time__lte = today_end ).aggregate(Sum('paid'))
        in_paid_amount = IN_Patient_Payments.objects.filter(created_time__gte = today_start).filter(updated_time__lte = today_end ).aggregate(Sum('paid'))

        if op_paid_amount['paid__sum'] == None :
            op_paid_amount['paid__sum'] = 0

        if in_paid_amount['paid__sum'] == None :
            in_paid_amount['paid__sum'] = 0



        assignroom_data = []
        for r in AssignRooms.objects.filter(status = 0) :

            data = {
                'id' : r.id,
                'patient_name' : r.patient.name,
                'patient_address' : r.patient.address,
                'room_no' : r.room.room_no,
                'reason': r.reason,
                'admit_date':r.assigned_date
            }

            assignroom_data.append(data)


        assignward_data = []
        for r in AssignWard.objects.filter(status = 0) :

            data = {
                'id' : r.id,
                'patient_name' : r.patient.name,
                'patient_address' : r.patient.address,
                'bed_no' : r.ward_bed.bed_no,
                'ward' : r.ward.ward_name,
                'reason': r.reason,
                'admit_date':r.assigned_date
            }

            assignward_data.append(data)

            


        context = {
            'today_op' : len(today_op),
            'current_ip' : len(current_ip),
            'today_op_and_current_ip' : int(len(today_ip)) + int(len(today_op)),
            'amount' : op_paid_amount['paid__sum'] + in_paid_amount['paid__sum'],
            'assignroom_data' : assignroom_data,
            'assignward_data' : assignward_data
        }
 

        return render(request , self.template_name , context)


    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)
