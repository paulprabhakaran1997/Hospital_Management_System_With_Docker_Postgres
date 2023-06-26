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

from doctor.models import Doctor

from patient.models import Patient
from appointment.models import Appointment ,DoctorCheckupAmount ,  LabTestForOutPatient , XrayForOutPatient,ScanForOutPatient , MedicineForOutPatient , InjectionForOutPatient , OutPatient_Payments

from lab.models import LabTestForPatient , TestTakenByPatient
from xray.models import XrayForPatient , XrayTakenByPatient
from scan.models import ScanForPatient , ScanTakenByPatient
from hospital.helpers import get_lab_group_data , get_xray_data , get_scan_data

from lint_hospital.encoders import DefaultEncoder

from configuration.models import AppConfiguration

from room.models import AssignRooms ,DocterCheckup ,  LabTestForINPatient , XrayForINPatient ,ScanForINPatient, MedicineForINPatient , InjectionForINPatient , DressingForINPatient , DischargeSummary_IN
from ward.models import AssignWard , DocterCheckup_Ward , LabTestForWardPatient ,XrayForWardPatient ,ScanForWardPatient, MedicineForWardPatient , InjectionForWardPatient ,DressingForWardPatient , DischargeSummary_Ward

# Create your views here.

class DoctorCheckupView(View):
    template_name = "doctor_checkup.html"

    def get(self,request):

        context = {
            "configuration" : AppConfiguration.objects.all().first(),
            'labgroupdata' : get_lab_group_data(),
            'xraydata' : get_xray_data(),
            'scandata' : get_scan_data()
        }
        return render(request , self.template_name , context)


    def post(self , request):
         
        data = request.body

        print(json.loads(data)['Compliance'])

        if data:
            PatientObj = json.loads(data)['PatientObj']
            DoctorCheckup_AmountObj = json.loads(data)['DoctorCheckup_AmountObj']
            InjectionObj = json.loads(data)['InjectionObj']
            MedicineObj = json.loads(data)['MedicineObj']
            LabObj = json.loads(data)['LabObj']
            XrayObj = json.loads(data)['XrayObj']
            ScanObj = json.loads(data)['ScanObj']
            Prescription = json.loads(data)['Prescription']
            Medical_Prescription = json.loads(data)['Medical_Prescription']
            Compliance = json.loads(data)['Compliance']
            Comorbids = json.loads(data)['Comorbids']
            Review_Next_Visit = json.loads(data)['Review_Next_Visit']
            
            sale_id = json.loads(data)['sale_id']

            print('rajan' , Review_Next_Visit)
            print('rajan' , Review_Next_Visit)
            print('rajan' , Review_Next_Visit)
            print('rajan' , Review_Next_Visit)
            print('rajan' , Review_Next_Visit)


            patient_id = Patient.objects.get(id = int(PatientObj['patient_id']))

            AppointmentObj = Appointment.objects.get(id = int(PatientObj['appointment_id']))



            injection_dbParam = {
                "sale_id" : sale_id,
                "patient" : patient_id,
                "appointment" : AppointmentObj,
                "injection_list" : InjectionObj,
            }
            medicine_dbParam = {
                "sale_id" : sale_id,
                "patient" : patient_id,
                "appointment" : AppointmentObj,
                "medicine_list" : MedicineObj,
            }

            lab_test_dbParam = {
                "patient" : patient_id,
                "appointment" : AppointmentObj,
                "lab_test" : LabObj,
                "lab_test_date" : datetime.now()
            }

            xray_test_dbParam = {
                "patient" : patient_id,
                "appointment" : AppointmentObj,
                "xray_test" : XrayObj,
                "xray_test_date" : datetime.now()
            }

            scan_test_dbParam = {
                "patient" : patient_id,
                "appointment" : AppointmentObj,
                "scan_test" : ScanObj,
                "scan_test_date" : datetime.now()
            }

            if int(PatientObj['patient_id']) != 0 :

                AppointmentObj.doctor_prescription = Prescription
                AppointmentObj.medical_prescription = Medical_Prescription
                AppointmentObj.compliance = Compliance
                AppointmentObj.comorbids = Comorbids
                AppointmentObj.review_next_visit = Review_Next_Visit



            if not (len(DoctorCheckup_AmountObj) == 0):

                patient_id = Patient.objects.get(id = int(DoctorCheckup_AmountObj['patient_id']))

                appointment_obj = Appointment.objects.get(id = int(DoctorCheckup_AmountObj['appointment_id']))

                doctor_checkup_amount_dbParam = {
                    "patient" : patient_id,
                    "appointment" : appointment_obj,
                    "doctor_fees" : int(DoctorCheckup_AmountObj['doctor_fees']),
                    "dressing" : int(DoctorCheckup_AmountObj['dressing']),
                    "neb"  : int(DoctorCheckup_AmountObj['neb']), 
                    "total"  : int(DoctorCheckup_AmountObj['total']), 
                    "payment_recived_by_doctor"  : int(DoctorCheckup_AmountObj['paymentRecived_byDoctor']), 
                    "paid"  : int(DoctorCheckup_AmountObj['paymentRecived_byDoctor']), 
                    "balance"  : int(DoctorCheckup_AmountObj['doctor_checkup_balance']), 
                    "cash"  : int(DoctorCheckup_AmountObj['paymentRecived_byDoctor']), 
                }


                appointment_obj = Appointment.objects.get(id = int(DoctorCheckup_AmountObj['appointment_id']))
                
                try:
                    op_payment_data =  OutPatient_Payments.objects.get(appointment = appointment_obj.id)
                    op_payment_data.doctor_fees += int(DoctorCheckup_AmountObj['doctor_fees'])
                    op_payment_data.dressing += int(DoctorCheckup_AmountObj['dressing'])
                    op_payment_data.neb += int(DoctorCheckup_AmountObj['neb'])
                    op_payment_data.total += int(DoctorCheckup_AmountObj['total'])
                    op_payment_data.payment_recived_by_doctor += int(DoctorCheckup_AmountObj['paymentRecived_byDoctor'])
                    op_payment_data.paid += int(DoctorCheckup_AmountObj['paymentRecived_byDoctor'])
                    op_payment_data.cash += int(DoctorCheckup_AmountObj['paymentRecived_byDoctor'])
                    total = op_payment_data.doctor_fees + op_payment_data.dressing + op_payment_data.neb
                    op_payment_data.balance = total-op_payment_data.payment_recived_by_doctor
                    op_payment_data.save()
                except:
                    doctor_checkup_amount_dbParam['doctor_check'] = DoctorCheckup_AmountObj['Doctor_check']
                    OutPatient_Payments.objects.create(**doctor_checkup_amount_dbParam)


                

            if not (len(InjectionObj) == 0):
                InjectionForOutPatient.objects.create(**injection_dbParam)

            if not (len(MedicineObj) == 0):
                MedicineForOutPatient.objects.create(**medicine_dbParam)

            if not (len(LabObj) == 0):
                AppointmentObj.has_lab = True
                LabTestForOutPatient.objects.create(**lab_test_dbParam)

            if not (len(XrayObj) == 0):
                AppointmentObj.has_xray = True
                XrayForOutPatient.objects.create(**xray_test_dbParam)

            if not (len(ScanObj) == 0):
                AppointmentObj.has_scan = True
                ScanForOutPatient.objects.create(**scan_test_dbParam)

            
            AppointmentObj.checkup = 1

            AppointmentObj.save()

            messages.success(request , "Successful")

            return JsonResponse({"status":"success"},status=200)
            

    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)            


class GetDoctorCheckupData(View):

    def get(self, request):

        current_user_id = request.user.id

        def get_appointment_data():
            appointment_data = []
            emergency_op_data = []

            today = datetime.now().date()
            tomorrow = today + timedelta(1)
            today_start = datetime.combine(today, time())
            today_end = datetime.combine(tomorrow, time())

            if((request.user.groups.all()[0]).id == 1  or (request.user.groups.all()[0]).id == 8):
                AppointmentObj = Appointment.objects.filter(checkup = 0).filter(appointment_date__lte = today_end).filter(appointment_date__gte=today_start)
            elif((request.user.groups.all()[0]).id == 2 or (request.user.groups.all()[0]).id == 8):
                DoctorObj = Doctor.objects.filter(user = current_user_id).values()
                AppointmentObj = Appointment.objects.filter(checkup = 0).filter(doctor = DoctorObj[0]['id']).filter(appointment_date__lte = today_end).filter(appointment_date__gte=today_start)
            else:
                AppointmentObj = []

            for ht in AppointmentObj:

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
                    'pos_id' : ht.patient.pos_id,
                    'patient_phone' : ht.patient.phone,
                    'bp' : ht.bp,
                    'pulse' : ht.pulse,
                    'temperature' : ht.temperature,
                    'rr' : ht.rr,
                    'sp_o2' : ht.sp_o2,
                    'blood_sugar' : ht.blood_sugar,
                    'reason' : ht.reason,
                    'doctor_id' : ht.doctor.id,
                    'doctor_name' : ht.doctor.name,
                    'fees' : ht.doctor.fees,
                    'appointment_date' : str(ht.appointment_date),
                    'checkup' : ht.checkup,
                    'payment_pending' : str(ht.payment_pending),
                    'status' : ht.status,
                    'is_emergency' : str(ht.is_emergency),
                    'health_checkup_details' : ht.health_checkup_details
                }
                
                if(ht.is_emergency == True):
                    emergency_op_data.append(data)
                else:
                    appointment_data.append(data)

            sorted_op_data = list(emergency_op_data) + list(appointment_data)

            return sorted_op_data

        context = { 'appointmentdata' : get_appointment_data() }

        return JsonResponse(context , safe = False)


class GetAppointmentData_DT(View):

    def get(self,request):
        current_user_id = request.user.id

        def get_appointment_data():
            appointment_data = []

            today = datetime.now().date()
            tomorrow = today + timedelta(1)
            today_start = datetime.combine(today, time())
            today_end = datetime.combine(tomorrow, time())

            if((request.user.groups.all()[0]).id == 1  or (request.user.groups.all()[0]).id == 8):
                AppointmentObj = Appointment.objects.filter(checkup = 1).filter(appointment_date__lte = today_end).filter(appointment_date__gte=today_start)
            elif((request.user.groups.all()[0]).id == 2  or (request.user.groups.all()[0]).id == 8):
                DoctorObj = Doctor.objects.filter(user = current_user_id).values()
                AppointmentObj = Appointment.objects.filter(checkup = 1).filter(doctor = DoctorObj[0]['id']).filter(appointment_date__lte = today_end).filter(appointment_date__gte=today_start)
            else:
                AppointmentObj = []

            for ht in AppointmentObj:

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
                    'pos_id' : ht.patient.pos_id,
                    'bp' : ht.bp,
                    'pulse' : ht.pulse,
                    'temperature' : ht.temperature,
                    'rr' : ht.rr,
                    'sp_o2' : ht.sp_o2,
                    'blood_sugar' : ht.blood_sugar,
                    'reason' : ht.reason,
                    'doctor_id' : ht.doctor.id,
                    'doctor_name' : ht.doctor.name,
                    'appointment_date' : str(ht.appointment_date),
                    'doctor_prescription' : ht.doctor_prescription,
                    'medical_prescription' : ht.medical_prescription,
                    'compliance' : ht.compliance,
                    'comorbids' : ht.comorbids,
                    'review_next_visit' : ht.review_next_visit,
                    'checkup' : ht.checkup,
                    'payment_pending' : str(ht.payment_pending),
                    'status' : ht.status,
                    'health_checkup_details' : ht.health_checkup_details
                }
                appointment_data.append(data)

            return appointment_data



        context = {
            'appointmentdata' : get_appointment_data(),
        }
        return JsonResponse(context , safe = False)



    @method_decorator(login_required)
    def dispatch(self , request , *args , **kwargs):
        return super().dispatch(request , *args , **kwargs)



class GetPatient_History(View):
    def get(self , request):
        Patient_id = int(request.GET.get('patient_id'))
        
        today = datetime.now().date()
        tomorrow = today + timedelta(1)
        today_start = datetime.combine(today, time())
        today_end = datetime.combine(tomorrow, time())



        patient_obj = Appointment.objects.filter(patient = Patient_id).filter(checkup = 1).order_by('id')[:5]
        patient_history = []

        for ht in patient_obj :

            data = {
                "admit_id" : ht.id,
                "doctor_name" : ht.doctor.name,
                "reason" : ht.reason,
                "assigned_date" : ht.appointment_date,
                "type" : "Appointment"

            }
            patient_history.append(data)
        

        InPatientObj = AssignRooms.objects.filter(patient = Patient_id).filter(status = 1).order_by('id')[:5]

        Ip_Data = []

        for ip in InPatientObj:

            try:
                DischargeSummaryObj = DischargeSummary_IN.objects.get(ip_no = ip.id)
                DoctorName = DischargeSummaryObj.consultant.name
            except DischargeSummary_IN.DoesNotExist:
                DoctorName = ""

            ip_obj = {
                'admit_id' : ip.id,
                "reason" : ip.reason,
                "assigned_date" : ip.assigned_date,
                "discharged_date" : ip.discharged_date,
                "doctor_name" : DoctorName,
                "type" :"IP"
            }

            Ip_Data.append(ip_obj)

        WradPatientObj = AssignWard.objects.filter(patient = Patient_id).filter(status = 1).order_by('id')[:5]

        Ward_Data = []

        for ward in WradPatientObj:

            try:
                DischargeSummaryObj = DischargeSummary_Ward.objects.get(ward_no = ward.id)
                DoctorName = DischargeSummaryObj.consultant.name
            except DischargeSummary_Ward.DoesNotExist:
                DoctorName = ""

            ward_obj = {
                'admit_id' : ward.id,
                "ward" : ward.ward.ward_name,
                "reason" : ward.reason,
                "bed_no" : ward.ward_bed.bed_no,
                "assigned_date" : ward.assigned_date,
                "discharged_date" : ward.discharged_date,
                "doctor_name" : DoctorName,
                "type" : "Ward" 
            }

            Ward_Data.append(ward_obj)

        context = {
            'Op_data' : patient_history,
            'Ip_Data' : Ip_Data,
            'Ward_Data' : Ward_Data
        }

        return JsonResponse(context , safe = False) 




class GetPatient_Checkup_History(View):
    def get(self , request):

        Appointment_id = int(request.GET.get('appointment_id'))

        Patient_type = request.GET.get('type')

        doctor_checkup_history = []

        patient_appointment_health_history = []
        patient_injection_history = []
        patient_medicine_history = []
        patient_lab_checkup_history = []
        patient_xray_checkup_history = []
        patient_scan_checkup_history = []
        patient_dressing_history = []
        Prescription = []


        print(Patient_type)

        
        if Patient_type == 'Appointment':    # AppointMent Data

            appointment_obj = Appointment.objects.filter(id = Appointment_id)
            lab_obj = LabTestForPatient.objects.filter(appointment = Appointment_id)
            xray_obj = XrayForPatient.objects.filter(appointment = Appointment_id)
            scan_obj = ScanForPatient.objects.filter(appointment = Appointment_id)
            injection_obj = InjectionForOutPatient.objects.filter(appointment = Appointment_id)
            medicine_obj = MedicineForOutPatient.objects.filter(appointment = Appointment_id)


            for ht in appointment_obj:

                currentdate = datetime.now().date() - ht.patient.dob
                age = currentdate.days//365
                month = (currentdate.days - age *365) // 30
                
                Prescription.append(ht.doctor_prescription)

                data = {
                        'patient_name' : ht.patient.name ,
                        'age' : age ,
                        'gender' : ht.patient.gender ,
                        'pos_id' : ht.patient.pos_id,
                        'reason' : ht.reason,
                        'doctor_prescription' : Prescription ,
                        'medical_prescription' : ht.medical_prescription,
                        'compliance' : ht.compliance,
                        'comorbids' : ht.comorbids,
                        'review_next_visit' : ht.review_next_visit,
                        'appointment_date' : ht.appointment_date,
                        'doctor_name' : ht.doctor.name,
                        'bp' : ht.bp,
                        'pulse' : ht.pulse,
                        'temperature' : ht.temperature,
                        'rr' : ht.rr,
                        'sp_o2' : ht.sp_o2,
                        'blood_sugar' : ht.blood_sugar,
                        'health_checkup_details' : ht.health_checkup_details
                    }
                patient_appointment_health_history.append(data)

            today = datetime.now().date()
            tomorrow = today + timedelta(1)
            today_start = datetime.combine(today, time())
            today_end = datetime.combine(tomorrow, time())

            for ht in injection_obj:
                data = {
                    'injection_list':ht.injection_list,
                    'injection_date':ht.created_time,
                }
                patient_injection_history .append(data)

            for ht in medicine_obj:
                data = {
                    'medicine_list' : ht.medicine_list,
                    'medicine_date' : ht.created_time,
                }
                patient_medicine_history.append(data)  

            for ht in lab_obj :
                test_obj = TestTakenByPatient.objects.filter(lab_test_for_patient = ht.id)
                
                for obj in test_obj:
                    data = {
                        'id' : obj.id,
                        'group_id' : obj.lab_group.id,
                        'group_name' : obj.lab_group.name,
                        'test_id' : obj.lab_test.id,
                        'test_name' : obj.lab_test.name,
                        'normal_range' : obj.lab_test.normal_range,
                        'testunit' : obj.testunit,
                        'testvalue' : obj.testvalue,
                        'test_date' : obj.created_time,
                    }
                    patient_lab_checkup_history.append(data)

            for ht in xray_obj :
                test_obj = XrayTakenByPatient.objects.filter(xray_for_patient = ht.id)
                for obj in test_obj:             
                    data = {
                        'xray_name' : obj.xray.name,
                        'xray_date' : obj.created_time,
                    }
                    patient_xray_checkup_history.append(data)
        
            for ht in scan_obj :
                test_obj = ScanTakenByPatient.objects.filter(scan_for_patient = ht.id)
                for obj in test_obj:             
                    data = {
                        'scan_name' : obj.scan.name,
                        'scan_date' : obj.created_time,
                    }
                    patient_scan_checkup_history.append(data)
        
            doctor_checkup_history = [{
                'patient_type' : 'OP',
                'patient_appointment_health_data' : patient_appointment_health_history,
                'patient_injection_history_data' : patient_injection_history,
                'patient_medicine_history_data' : patient_medicine_history,
                'patient_lab_history_data' : patient_lab_checkup_history,
                'patient_xray_history_data' : patient_xray_checkup_history,
                'patient_scan_history_data' : patient_scan_checkup_history,
            }]
        
        else:    # IP Data

            appointment_obj = AssignRooms.objects.filter(id = Appointment_id)
            doctor_checkupObj = DocterCheckup.objects.filter(assignroom = Appointment_id)

            try:
                DischargeSummaryObj = DischargeSummary_IN.objects.get(ip_no = Appointment_id)
                DoctorName = DischargeSummaryObj.consultant.name
            except DischargeSummary_IN.DoesNotExist:
                DoctorName = ""


            for ht in doctor_checkupObj :
                
                Prescription.append(ht.doctor_prescription)
                for htd in DressingForINPatient.objects.filter(doctor_checkup = ht.id ):

                    data = {
                        'dressing_list' : htd .dressing,
                        'dressing_date' : htd .created_time,
                    }
                    patient_dressing_history.append(data)  

                for htm in MedicineForINPatient.objects.filter(doctor_checkup = ht.id ):

                    data = {
                        'medicine_list' : htm.medicine_list,
                        'medicine_date' : htm.created_time,
                    }
                    patient_medicine_history.append(data)  

                for hti in InjectionForINPatient.objects.filter(doctor_checkup = ht.id ):

                    data = {
                        'injection_list':hti.injection_list,
                        'injection_date':hti.created_time,
                    }
                    patient_injection_history .append(data)



                lab_testobj = LabTestForINPatient.objects.filter(doctor_checkup = ht.id)

                if not lab_testobj:
                    has_lab = False
                else:
                    has_lab = True

                for lt in LabTestForINPatient.objects.filter(doctor_checkup = ht.id):
                    for i in LabTestForPatient.objects.filter(ip_lab_test  = lt.id):

                        for obj in TestTakenByPatient.objects.filter(lab_test_for_patient = i.id):

                            data = {
                            'id' : obj.id,
                            'group_id' : obj.lab_group.id,
                            'group_name' : obj.lab_group.name,
                            'test_id' : obj.lab_test.id,
                            'test_name' : obj.lab_test.name,
                            'normal_range' : obj.lab_test.normal_range,
                            'testunit' : obj.testunit,
                            'testvalue' : obj.testvalue,
                            'test_date' : obj.created_time,
                            }

                            patient_lab_checkup_history.append(data)


                xray_testobj = XrayForINPatient.objects.filter(doctor_checkup = ht.id)

                if not xray_testobj:
                    has_xray = False
                else:
                    has_xray = True            

                for xt in XrayForINPatient.objects.filter(doctor_checkup = ht.id):
                    
                    for j in XrayForPatient.objects.filter(ip_xray_test = xt.id):

                        for obj in XrayTakenByPatient.objects.filter(xray_for_patient = j.id):
                            data = {
                                'xray_name' : obj.xray.name,
                                'xray_date' : obj.created_time,
                            }
                            patient_xray_checkup_history.append(data)

            
                scan_testobj = ScanForINPatient.objects.filter(doctor_checkup = ht.id)

                if not scan_testobj:
                    has_scan = False
                else:
                    has_scan = True            

                for xt in ScanForINPatient.objects.filter(doctor_checkup = ht.id):
                    
                    for j in ScanForPatient.objects.filter(ip_scan_test = xt.id):

                        for obj in ScanTakenByPatient.objects.filter(scan_for_patient = j.id):
                            data = {
                                'scan_name' : obj.scan.name,
                                'scan_date' : obj.created_time,
                            }
                            patient_scan_checkup_history.append(data)

            for ht in appointment_obj:

                currentdate = datetime.now().date() - ht.patient.dob
                age = currentdate.days//365
                month = (currentdate.days - age *365) // 30

                data = {
                        'patient_name' : ht.patient.name ,
                        'age' : age ,
                        'gender' : ht.patient.gender ,
                        'pos_id' : ht.patient.pos_id,
                        'reason' : ht.reason,
                        'doctor_prescription' : Prescription,
                        'medical_prescription' : '',
                        'compliance' : '',
                        'comorbids' : '',
                        'review_next_visit' : '',
                        'appointment_date' : ht.assigned_date,
                        'doctor_name' : DoctorName,
                        'bp' : '',
                        'pulse' : '',
                        'temperature' : '',
                        'rr' : '',
                        'sp_o2' : '',
                        'blood_sugar' : '',
                        'health_checkup_details' : []
                    }
                patient_appointment_health_history.append(data)
       
            doctor_checkup_history = [{
                'patient_type' : 'IP',
                'patient_appointment_health_data' : patient_appointment_health_history,
                'patient_injection_history_data' : patient_injection_history,
                'patient_medicine_history_data' : patient_medicine_history,
                'patient_lab_history_data' : patient_lab_checkup_history,
                'patient_xray_history_data' : patient_xray_checkup_history,
                'patient_scan_history_data' : patient_scan_checkup_history,
            }]

        context = {
            'doctor_checkup_history' : doctor_checkup_history,
        }
        return JsonResponse(context , safe = False) 


 



