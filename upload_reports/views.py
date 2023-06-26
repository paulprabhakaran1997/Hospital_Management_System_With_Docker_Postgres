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

from upload_reports.models import UploadedReports , UploadedReportsFiles
from patient.models import Patient


from lint_hospital.encoders import DefaultEncoder


class UploadReports(View):
    template_name = 'upload_reports.html'

    def get(self , request):

        

        return render(request , self.template_name)

    def post(self , request):
        print("YESSSS YOUUUU GOTTTT")
        files = request.FILES.getlist('imageInput')
        name = request.POST.get("reportName")
        print(request.POST.get('patientId'))
        PatientObj = Patient.objects.get(id = int(request.POST.get('patientId')))

        UploadedReportsDB = UploadedReports(
            name = name,
            patient = PatientObj,
        )

        UploadedReportsDB.save()


        LatestUploadedReportObj = UploadedReports.objects.latest('id')

        for ht in files:
            UploadedReportsFilesDB = UploadedReportsFiles(
                uploded_reports = LatestUploadedReportObj,
                url = ht,
            )

            UploadedReportsFilesDB.save()

        messages.success(request , "Uploaded Successfully")

        return redirect("upload_reports")

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)



class GetUploadedReports(View):
    def get(self ,  request):

        print("GETTT")

        def get_uploaded_reports_data():
            uploaded_reports_data = []

            UploadedReportsObj = UploadedReports.objects.all()

            for ht in UploadedReportsObj:

                currentdate = datetime.now().date() - ht.patient.dob

                age = currentdate.days//365
                month = (currentdate.days - age *365) // 30

                data = {
                    'id' : ht.id,
                    'patient_id' : ht.patient.id,
                    'patient_name' : ht.patient.name,
                    'patient_age' : age,
                    'patient_month' : month,
                    'patient_gender' : ht.patient.gender,
                    'patient_phone' : ht.patient.phone,
                    'report_name' : ht.name,
                    'uploaded_time' : str(ht.created_time)
                }

                uploaded_reports_data.append(data)

            return uploaded_reports_data

        context =  {
            'uploadedreportsdata' : get_uploaded_reports_data()
        }

        return JsonResponse(context , safe = False)



class GetUploadedReportsFiles(View):
    def get(self ,  request):

        print("GETTT = " , request.GET.get('id'))

        uploaded_reports_files_data = []

        UploadedReportsFilesObj = UploadedReportsFiles.objects.filter(uploded_reports = int(request.GET.get('id'))).all()

        for ht in UploadedReportsFilesObj:

            data = {
                'id' : ht.id,
                'url'  : str(ht.url),
                'uploaded_time' : str(ht.created_time)
            }

            uploaded_reports_files_data.append(data)

        context =  {
            'uploadedreportsfilesdata' : uploaded_reports_files_data
        }

        return JsonResponse(context ,  safe = False)