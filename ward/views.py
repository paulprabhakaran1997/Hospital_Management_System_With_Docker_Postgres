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

from patient.models import Patient
from doctor.models import Doctor
from hospital.helpers import get_doctor_data , get_appointment_data
from hospital.helpers import get_lab_group_data , get_xray_data , get_scan_data

from lint_hospital.encoders import DefaultEncoder

from lab.models import LabTestForPatient , TestTakenByPatient
from xray.models import XrayForPatient , XrayTakenByPatient
from scan.models import ScanForPatient , ScanTakenByPatient

from room.models import RoomCategory

from ward.models import Wards , WardBed , AssignWard , DocterCheckup_Ward , LabTestForWardPatient , XrayForWardPatient , ScanForWardPatient, DressingForWardPatient,InjectionForWardPatient , MedicineForWardPatient , Ward_Patient_Payments , Ward_Patient_PaymentTransactions , DischargeSummary_Ward


# Create your views here.



class WardView(View):
    template_name = "ward_view.html"

    def get(self , request):

        def get_ward_bed_data():
            ward_bed_data = []

            try:
                WardBedObj = WardBed.objects.all()

                for ht in WardBedObj:
                    data={
                        'id' : ht.id,
                        'ward_id' : ht.ward.id,
                        'ward_name' : ht.ward.ward_name,
                        'bed_no' : ht.bed_no,
                        'description' : ht.description
                    }

                    ward_bed_data.append(data)

            except WardBed.DoesNotExist:
                ward_bed_data = []

            return ward_bed_data

        
        WardBedData = get_ward_bed_data()

        context = {
            'RoomCategory_data' : json.dumps(list(RoomCategory.objects.values()), cls=DefaultEncoder),
            'warddata' : json.dumps(list(Wards.objects.values()), cls=DefaultEncoder),
            'wardbeddata' : json.dumps(WardBedData , cls=DefaultEncoder)
        }     
        return render(request , self.template_name , context)


    def post(self , request):
        WardId = int(request.POST.get("wardId"))

        WardName = request.POST.get("ward_name")
        amount = request.POST.get("ward_amount")
        Description = request.POST.get('description')

        ward_db_param = {
            'ward_name' : WardName,
            'amount' : amount,
            'description' : Description

        }

        if WardId == 0:
            Wards.objects.create(**ward_db_param)
            messages.success(request , "Ward Added Successfully")
            return redirect("ward")

        else:
            Wards.objects.filter(id = WardId).update(**ward_db_param)
            messages.success(request , "Ward Updated Successfully")
            return redirect("ward")



    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)



class WardBedView(View):    
    def post(self , request):
        WardBedId = int(request.POST.get("wardbedId"))

        WardId = request.POST.get("ward")
        BedNo = request.POST.get("bed_no")
        Description = request.POST.get('wardbed_description')

        WardObj = Wards.objects.get(id = WardId)

        wardbed_db_param = {
            'ward' : WardObj,
            'bed_no' : BedNo,
            'description' : Description,
        }

        if WardBedId == 0:
            WardBed.objects.create(**wardbed_db_param)
            messages.success(request , "Ward Details Added Successfully")
            return redirect("ward")

        else:
            WardBedData = WardBed.objects.filter(id = WardBedId).update(**wardbed_db_param)

            messages.success(request , "Ward Details Updated Successfully")
            return redirect("ward")

    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)



class GetWardData(View):
    def get(self , request):

        context = {
                'Ward_Data' : get_ward_data(),
        }

        return JsonResponse(context , safe = False) 


class GetWardBedData(View):
    def get(self , request):

        context = {
                'Ward_bed_data' : get_ward_bed_data(),
        }

        return JsonResponse(context , safe = False) 



def get_ward_data():

    ward_data = []
    for ht in Wards.objects.all():
        data = {
            'id' : ht.id,
            'ward_name' : ht.ward_name
        }
        ward_data.append(data)

    return(ward_data)    

def get_ward_bed_data():

    ward_bed_data = []
    for ht in WardBed.objects.all():
        data = {
            'id' : ht.id,
            'bed_no' : ht.bed_no,
            'ward_id' : ht.ward.id,
            'vacancy_status' : ht.vacancy_status,
        }
        ward_bed_data.append(data)

    return(ward_bed_data)        


class AssignWardView(View):
    def get(self , request):
        template_name = 'assign_ward.html'

        context = {
            'labgroupdata' : get_lab_group_data(),
            'xraydata' : get_xray_data(),
            'scandata' : get_scan_data(),
            'doctordata' : json.dumps(get_doctor_data() , cls = DefaultEncoder),
        }


        return render(request , template_name , context)   

    def post(self , request):

        data = request.body

        if(data):
            AssignWardObj = json.loads(data)['AssignWardData'][0]   

            assign_ward_db_param = {
                'patient' : Patient.objects.get(id = int(AssignWardObj['patient_id'])) ,
                'assigned_date' : AssignWardObj['assigned_date'],
                'ward' : Wards.objects.get(id = int(AssignWardObj['ward_id'])),
                'ward_bed' : WardBed.objects.get(id = int(AssignWardObj['bed_no'])),
                'reason' : AssignWardObj['reason'],
            }
            AssignWard.objects.create(**assign_ward_db_param)

            bedObj = WardBed.objects.get(id = int(AssignWardObj['bed_no']))
            bedObj.vacancy_status = 1
            bedObj.save()


            messages.success(request , "Ward Assigned Successfully")

            return JsonResponse({"status":"success"},status=200)

        return redirect("assign_ward") 

    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)    



def get_assigned_ward_data():
    ward_assigned_data = []
    AssignedWardObj = AssignWard.objects.all()
    for ht in AssignedWardObj:
        currentdate = datetime.now().date() - ht.patient.dob
        age = currentdate.days//365
        month = (currentdate.days - age *365) // 30

        data = {
            'id' : ht.id,
            'patient_id' : ht.patient.id,
            'patient_name' : ht.patient.name,
            'patient_phone' : ht.patient.phone,
            'patient_age' : age,
            'patient_gender' : ht.patient.gender,
            'pos_id' : ht.patient.pos_id,
            'patient_address' : ht.patient.address,
            'ward_id' : ht.ward.id,
            'ward_mame' : ht.ward.ward_name,
            'bed_id' : ht.ward_bed.id,
            'bed_no' : ht.ward_bed.bed_no,
            'reason' : ht.reason,
            'assigned_date' : ht.assigned_date,
            'discharged_date' : ht.discharged_date,
            'vacancy_status' : ht.ward_bed.vacancy_status,
            'status' : ht.status,
            'initially_paid' : ht.initially_paid,
            'payment_pending' : ht.payment_pending
        }
        ward_assigned_data.append(data)

    return ward_assigned_data



class GetAssignedWardData(View):
    def get(self , request):

        context = {
            'Assigned_WardData' : get_assigned_ward_data(),
        }

        return JsonResponse(context , safe = False)


class AssignWardDoctorCheckupView(View):
    def post(self , request):
         
        data = request.body

        if data:
            PatientObj = json.loads(data)['PatientObj']
            InjectionObj = json.loads(data)['InjectionObj']
            MedicineObj = json.loads(data)['MedicineObj']
            Dressing = json.loads(data)['Dressing']
            LabObj = json.loads(data)['LabObj']
            XrayObj = json.loads(data)['XrayObj']
            ScanObj = json.loads(data)['ScanObj']
            Prescription = json.loads(data)['Prescription']
            Medical_Prescription = json.loads(data)['Medical_Prescription']



            patient_id = Patient.objects.get(id = int(PatientObj['patient_id']))

            AssignWardObj = AssignWard.objects.get(id = int(PatientObj['Ward_assignid']))
            WardObj = Wards.objects.get(id = int(PatientObj['ward_id']))
            BedObj = WardBed.objects.get(id = int(PatientObj['bed_id']))

            DocterObj = Doctor.objects.get(id = int(PatientObj['doctor']))


            doctor_checkup_db_param = {
                'ward' : WardObj,
                'ward_bed' : BedObj,
                'assignward' : AssignWardObj,
                'doctor' : DocterObj ,
                'doctor_prescription' : Prescription ,
                'medical_prescription' : Medical_Prescription ,

            }

            DocterCheckup_Ward.objects.create(**doctor_checkup_db_param)

            Latest_dc_Obj = DocterCheckup_Ward.objects.latest('id')

            dressing_dbParam = {
                "patient" : patient_id,
                "assignward" : AssignWardObj,
                "doctor_checkup" : Latest_dc_Obj,
                "dressing" : Dressing,
            }

            injection_dbParam = {
                "patient" : patient_id,
                "assignward" : AssignWardObj,
                "doctor_checkup" : Latest_dc_Obj,
                "injection_list" : InjectionObj,
            }
            medicine_dbParam = {
                "patient" : patient_id,
                "assignward" : AssignWardObj,
                "doctor_checkup" : Latest_dc_Obj,
                "medicine_list" : MedicineObj,
            }

            lab_test_dbParam = {
                "patient" : patient_id,
                "assignward" : AssignWardObj,
                "doctor_checkup" : Latest_dc_Obj,
                "lab_test" : LabObj,
                "lab_test_date" : datetime.now()
            }

            xray_test_dbParam = {
                "patient" : patient_id,
                "assignward" : AssignWardObj,
                "doctor_checkup" : Latest_dc_Obj,
                "xray_test" : XrayObj,
                "xray_test_date" : datetime.now()

            }

            scan_test_dbParam = {
                "patient" : patient_id,
                "assignward" : AssignWardObj,
                "doctor_checkup" : Latest_dc_Obj,
                "scan_test" : ScanObj,
                "scan_test_date" : datetime.now()

            }


            if (Dressing != '0') and (Dressing != '') :
                DressingForWardPatient.objects.create(**dressing_dbParam)

            if not (len(InjectionObj) == 0):
                InjectionForWardPatient.objects.create(**injection_dbParam)

            if not (len(MedicineObj) == 0):
                MedicineForWardPatient.objects.create(**medicine_dbParam)

            if not (len(LabObj) == 0):
                AssignWardObj.has_lab = True
                LabTestForWardPatient.objects.create(**lab_test_dbParam)

            if not (len(XrayObj) == 0):
                AssignWardObj.has_xray = True
                XrayForWardPatient.objects.create(**xray_test_dbParam)

            if not (len(ScanObj) == 0):
                AssignWardObj.has_scan = True
                ScanForWardPatient.objects.create(**scan_test_dbParam)

            
            AssignWardObj.checkup = 1
            AssignWardObj.save()

            messages.success(request , "Successful")

            return JsonResponse({"status":"success"},status=200)
            

    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)        


class Get_Ward_Patient_Checkup_History(View):
    def get(self , request):

        ward_Assignid = int(request.GET.get('Ward_assignid'))


        wardObj = AssignWard.objects.filter(id = ward_Assignid)
        ward_data = []
        for wd in wardObj:
            data = {
                'ward_name' : wd.ward.ward_name,
                'bed_no' : wd.ward_bed.bed_no
            }

            ward_data.append(data) 



        doctor_checkupObj = DocterCheckup_Ward.objects.filter(assignward = ward_Assignid)

        history = []

        for ht in doctor_checkupObj :
            
            patient_dressing_history = []
            patient_medicine_history = []
            patient_injection_history = []
            patient_lab_checkup_history = []
            patient_xray_checkup_history = []
            patient_scan_checkup_history = []

            try:
                patient_dressing_history = DressingForWardPatient.objects.filter(doctor_checkup = ht.id).values()[0]['dressing']
            except:
                patient_dressing_history = []
            
            try:
                patient_medicine_history = MedicineForWardPatient.objects.filter(doctor_checkup = ht.id).values()[0]['medicine_list']
            except:
                patient_medicine_history = []
                
            try:
                patient_injection_history = InjectionForWardPatient.objects.filter(doctor_checkup = ht.id).values()[0]['injection_list']
            except:
                patient_injection_history = []

        
            lab_testobj = LabTestForWardPatient.objects.filter(doctor_checkup = ht.id).filter(lab_canceled = False)

            if not lab_testobj:
                has_lab = False
            else:
                has_lab = True

            for lt in LabTestForWardPatient.objects.filter(doctor_checkup = ht.id):
                for i in LabTestForPatient.objects.filter(ward_lab_test  = lt.id):

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


            xray_testobj = XrayForWardPatient.objects.filter(doctor_checkup = ht.id).filter(xray_canceled = False)

            if not xray_testobj:
                has_xray = False
            else:
                has_xray = True            

            for xt in XrayForWardPatient.objects.filter(doctor_checkup = ht.id):
                
                for j in XrayForPatient.objects.filter(ward_xray_test = xt.id):

                    for obj in XrayTakenByPatient.objects.filter(xray_for_patient = j.id):
                        data = {
                            'xray_name' : obj.xray.name,
                            'xray_date' : obj.created_time,
                        }
                        patient_xray_checkup_history.append(data)

        
            scan_testobj = ScanForWardPatient.objects.filter(doctor_checkup = ht.id).filter(scan_canceled = False)

            if not scan_testobj:
                has_scan = False
            else:
                has_scan = True            

            for xt in ScanForWardPatient.objects.filter(doctor_checkup = ht.id):
                
                for j in ScanForPatient.objects.filter(ward_scan_test = xt.id):

                    for obj in ScanTakenByPatient.objects.filter(scan_for_patient = j.id):
                        data = {
                            'scan_name' : obj.scan.name,
                            'scan_date' : obj.created_time,
                        }
                        patient_scan_checkup_history.append(data)

        
            data = {
                'doctor_name' : ht.doctor.name,
                'doctor_prescription' : ht.doctor_prescription,
                'medical_prescription' : ht.medical_prescription,
                'checkup_date' : ht.created_time,
                'checkup_date' : ht.created_time,
                'dressing' : patient_dressing_history,
                'medicine' : patient_medicine_history,
                'injection' : patient_injection_history,
                'lab' : patient_lab_checkup_history,
                'has_lab' : has_lab,
                'xray' : patient_xray_checkup_history,
                'has_xray' : has_xray,

                'scan' : patient_scan_checkup_history,
                'has_scan' : has_scan,
            }

            history.append(data)
                    
        context = {
            'history' : history,
            'ward_data' : ward_data,

        }

        return JsonResponse(context , safe = False) 



class Get_Amount_Ward_Patient(View):

    def get(self , request):

        ward_assign_id = AssignWard.objects.get(id = int(request.GET.get('ward_assignid')))

        today = datetime.now().date()
        tomorrow = today + timedelta(1)
        today_start = datetime.combine(today, time())
        today_end = datetime.combine(tomorrow, time())

        lab_obj = LabTestForWardPatient.objects.filter(assignward = ward_assign_id).filter(lab_checked = False).filter(lab_canceled = False)
        xray_obj = XrayForWardPatient.objects.filter(assignward = ward_assign_id).filter(xray_checked = False).filter(xray_canceled = False)
        scan_obj = ScanForWardPatient.objects.filter(assignward = ward_assign_id).filter(scan_checked = False).filter(scan_canceled = False)

        try:
            ward_amount = 0
            for ht in AssignWard.objects.filter(id = ward_assign_id):
                ward_amount += ht.ward.amount

        except:
            lab_amount = 0;    

        try:
            lab_amount = 0
            balance_lab_amount = 0
            for ht in LabTestForPatient.objects.filter(assignward = ward_assign_id):
                lab_amount += ht.total_amount
                balance_lab_amount += ht.balance

        except:
            lab_amount = 0;   
            balance_lab_amount = 0   

        try:
            xray_amount = 0
            balance_xray_amount = 0  
            for ht in XrayForPatient.objects.filter(assignward = ward_assign_id):
                xray_amount += ht.total_amount
                balance_xray_amount += ht.balance

        except:
            xray_amount = 0
            balance_xray_amount = 0

        try:
            scan_amount = 0
            balance_scan_amount = 0  
            for ht in ScanForPatient.objects.filter(assignward = ward_assign_id):
                scan_amount += ht.total_amount
                balance_scan_amount += ht.balance

        except:
            scan_amount = 0
            balance_scan_amount = 0


        try:
            ward_payment_data = Ward_Patient_Payments.objects.filter(assignward = ward_assign_id)
            ward_data = {}
            charge_details = {}
            payment_data = {}

            for ht in ward_payment_data:

                charge_details = {
                    'ward_rent': ht.ward,
                    'doctor_fees': ht.doctor_fees,
                    'nursing_charges': ht.nursing_charge,
                    'establishment_charges': ht.establishment_charges,
                    'iv_fluid_charges': ht.iv_fluid_charges,
                    'icu_charges': ht.icu_charges,
                    'physiotherapy_charges': ht.physiotherapy_charges,
                    'surgery_charges': ht.surgery_charges,
                    'consultant_charges': ht.consultant_charges,
                    'dressing_charges': ht.dressing_charges,
                    'miscellaneous_charges': ht.miscellaneous_charges,
                    'injection_charges': ht.injection,   
                    'laboratory_charges': lab_amount,
                    'xray_charges': xray_amount,                 
                    'scan_charges': scan_amount,                 
                }

                payment_data = {
                    'cash' : ht.cash,
                    'upi'  : ht.upi,
                    'debit_card' : ht.card
                }

            for ht in ward_payment_data:

                ward_data = {
                    'id': ht.id,

                    'ward_charge': ht.ward,
                    'doctor_fees': ht.doctor_fees,

                    'nursing_charge': ht.nursing_charge,
                    'establishment_charges': ht.establishment_charges,
                    'iv_fluid_charges': ht.iv_fluid_charges,
                    'icu_charges': ht.icu_charges,
                    'physiotherapy_charges': ht.physiotherapy_charges,
                    'surgery_charges': ht.surgery_charges,
                    'consultant_charges': ht.consultant_charges,
                    'dressing_charges': ht.dressing_charges,
                    'miscellaneous_charges': ht.miscellaneous_charges,

                    'injection': ht.injection,

                    'overall_total' : ht.total,
                    'discount': ht.discount,
                    'total_after_discount': ht.total_after_discount,
                    'payment_recived_by_lab': ht.payment_recived_by_lab,
                    'already_paid': ht.paid,
                    'balance': ht.balance,

                    'cash' : ht.cash,
                    'upi'  : ht.upi,
                    'card' : ht.card
                }
        except:
            ward_data = {}
            charge_details ={}
            payment_data = {}           

        overall_amount = {
            'main_total' : ward_assign_id.total,
            'main_paid' : ward_assign_id.paid,
            'main_balance' : ward_assign_id.balance,
            'ward_amount': ward_amount,

            'lab_amount': lab_amount,
            'balance_lab_amount': balance_lab_amount,

            'xray_amount': xray_amount,
            'balance_xray_amount' : balance_xray_amount,

            'scan_amount': scan_amount,
            'balance_scan_amount' : balance_scan_amount,

            'ward_payment_data': ward_data,
            'charge_details':charge_details,
            'payment_data':payment_data
            
        }
       
        context = {
            'ward_assigned_amount' : overall_amount,
            'lab_length' : len(lab_obj),
            'xray_length' : len(xray_obj),
            'scan_length' : len(scan_obj),
        }

        return JsonResponse(context , safe = False) 



class Ward_PatientPaymentView(View):

    def post(self , request):     
        
        data = request.body

        if(data):

            PaymentData = json.loads(data)['PaymentData'][0]

            AssignId = PaymentData['ward_assign_id']
            PatientId = PaymentData['patient_id']

            AssignObj = AssignWard.objects.get(id = AssignId)
            PatientObj = Patient.objects.get(id = PatientId)


            Initially_paid = PaymentData['initially_paid']
            transactionObj = 0
            existing_balance = 0

            try:
                WardPatientPaymentData = Ward_Patient_Payments.objects.get(assignward = AssignObj.id)

                transactionObj = WardPatientPaymentData
                existing_balance = PaymentData['existing_balance']

                if AssignObj.status == 0 :


                    WardPatientPaymentData.ward += PaymentData['ward']
                    WardPatientPaymentData.doctor_fees += PaymentData['doctor_fees']
                    WardPatientPaymentData.nursing_charge += PaymentData['nursing_charge']
                    WardPatientPaymentData.establishment_charges += PaymentData['establishment_charges']
                    WardPatientPaymentData.iv_fluid_charges += PaymentData['iv_fluid_charges']
                    WardPatientPaymentData.icu_charges += PaymentData['icu_charges']
                    WardPatientPaymentData.physiotherapy_charges += PaymentData['physiotherapy_charges']
                    WardPatientPaymentData.surgery_charges += PaymentData['surgery_charges']
                    WardPatientPaymentData.consultant_charges += PaymentData['consultant_charges']
                    WardPatientPaymentData.dressing_charges += PaymentData['dressing_charges']
                    WardPatientPaymentData.miscellaneous_charges += PaymentData['miscellaneous_charges']
                    WardPatientPaymentData.injection += PaymentData['injection']

                    
                    WardPatientPaymentData.lab = PaymentData['lab']
                    WardPatientPaymentData.xray = PaymentData['xray']
                    WardPatientPaymentData.scan = PaymentData['scan']
                    WardPatientPaymentData.total = PaymentData['overall_total']
                    WardPatientPaymentData.discount += PaymentData['discount']
                    WardPatientPaymentData.total_after_discount = WardPatientPaymentData.total - WardPatientPaymentData.discount

                    WardPatientPaymentData.paid += PaymentData['paid']
                    WardPatientPaymentData.cash += PaymentData['cash']
                    WardPatientPaymentData.upi += PaymentData['upi']
                    WardPatientPaymentData.card += PaymentData['card']
                    WardPatientPaymentData.balance = PaymentData['balance']
                    WardPatientPaymentData.save()

                else:

                    WardPatientPaymentData.discount += PaymentData['discount']
                    WardPatientPaymentData.total_after_discount = WardPatientPaymentData.total - WardPatientPaymentData.discount
                    WardPatientPaymentData.paid += PaymentData['paid']
                    WardPatientPaymentData.cash += PaymentData['cash']
                    WardPatientPaymentData.upi += PaymentData['upi']
                    WardPatientPaymentData.card += PaymentData['card']
                    WardPatientPaymentData.balance = PaymentData['balance'] 
                    WardPatientPaymentData.save()

                AssignObj.total = WardPatientPaymentData.total
                AssignObj.paid = WardPatientPaymentData.paid
                AssignObj.balance = WardPatientPaymentData.balance
                    
                if WardPatientPaymentData.balance == 0:
                    AssignObj.payment_pending = False
                else:
                    AssignObj.payment_pending = True
                AssignObj.save()

            except:

                Ward_PatientPaymentDB = Ward_Patient_Payments(
                    assignward = AssignObj,
                    patient = PatientObj,
                    ward = PaymentData['ward'],
                    doctor_fees = PaymentData['doctor_fees'],
                    nursing_charge = PaymentData['nursing_charge'],
                    establishment_charges = PaymentData['establishment_charges'],
                    iv_fluid_charges = PaymentData['iv_fluid_charges'],
                    icu_charges = PaymentData['icu_charges'],
                    physiotherapy_charges = PaymentData['physiotherapy_charges'],
                    surgery_charges = PaymentData['surgery_charges'],
                    consultant_charges = PaymentData['consultant_charges'],
                    dressing_charges = PaymentData['dressing_charges'],
                    miscellaneous_charges = PaymentData['miscellaneous_charges'],
                    injection = PaymentData['injection'],

                    lab = PaymentData['lab'],
                    xray = PaymentData['xray'],
                    scan = PaymentData['scan'],

                    total = PaymentData['overall_total'],
                    discount = PaymentData['discount'],
                    total_after_discount = (PaymentData['overall_total'] - PaymentData['discount'] ),
                    paid = PaymentData['paid'],
                    balance = PaymentData['balance'],
                    cash = PaymentData['cash'],
                    upi = PaymentData['upi'],
                    card = PaymentData['card'],
                )
                Ward_PatientPaymentDB.save()

                transactionObj = Ward_Patient_Payments.objects.latest('id')
                existing_balance = PaymentData['overall_total']

                AssignObj.total = PaymentData['overall_total']
                AssignObj.paid = PaymentData['paid']
                AssignObj.balance = PaymentData['balance']
                
                if PaymentData['balance'] == 0:
                    AssignObj.payment_pending = False
                else:
                    AssignObj.payment_pending = True
                AssignObj.save()


            WardPatientPaymentTransactionDB = Ward_Patient_PaymentTransactions(
                user = request.user,
                department = 'Reception',
                ward_payment = transactionObj,
                assignward = AssignObj,
                patient = PatientObj,
                total = PaymentData['overall_total'],
                discount = PaymentData['discount'],
                total_after_discount = (PaymentData['overall_total'] - PaymentData['discount'] ),
                existing_balance = existing_balance,
                paid = PaymentData['paid'],
                balance = PaymentData['balance'],
                cash = PaymentData['cash'],
                upi = PaymentData['upi'],
                card = PaymentData['card'],
            )
            WardPatientPaymentTransactionDB.save()

            LabTestForPatient.objects.filter(assignward = AssignObj.id).update(complete = True)
            LabTestForPatient.objects.filter(assignward = AssignObj.id).update(balance = 0)

            XrayForPatient.objects.filter(assignward = AssignObj.id).update(complete = True)
            XrayForPatient.objects.filter(assignward = AssignObj.id).update(balance = 0)

            ScanForPatient.objects.filter(assignward = AssignObj.id).update(complete = True)
            ScanForPatient.objects.filter(assignward = AssignObj.id).update(balance = 0)

            AssignObj.initially_paid = True
            AssignObj.save()

            messages.success(request , "Payment Processed Successfully")

            return JsonResponse({"status":"success"},status=200)

        return redirect("appointment")    

    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)            
      



class Discharge_Summary_Ward(View):

    def post(self , request):

        data = request.body

        if data:
            DischargeSummaryObj = json.loads(data)['DischargeSummary_Data']

            patient_id = Patient.objects.get(id = int(DischargeSummaryObj['patient_id']))
            AssignWardObj = AssignWard.objects.get(id = int(DischargeSummaryObj['ward_no']))
            bedObj = WardBed.objects.get(id = int(DischargeSummaryObj['bed_id']))
            DocterObj = Doctor.objects.get(id = int(DischargeSummaryObj['consultant']))

            discharge_summary_dbParam = {
                
                'patient' : patient_id,
                'ward_no' : AssignWardObj,
                'ward_bed' : bedObj,
                'consultant' : DocterObj,
                'date_of_surgery' : DischargeSummaryObj['dof_surgery'],
                'allergies' :  DischargeSummaryObj['allergies'],
                'diagnosis' :  DischargeSummaryObj['diagnosis'],
                'investigation' :  DischargeSummaryObj['investigation'],
                'treatment' :  DischargeSummaryObj['treatment'],
                'advice_on_discharge' :  DischargeSummaryObj['advice_discharge'],
                    
                }


            if int(DischargeSummaryObj['discharge_summary_id']) == 0:

                DischargeSummary_Ward.objects.create(**discharge_summary_dbParam)

            else:

                DischargeSummary_Ward.objects.filter(id = int(DischargeSummaryObj['discharge_summary_id'])).update(**discharge_summary_dbParam)

            messages.success(request , "Successful")

            return JsonResponse({"status":"success"},status=200)
            

    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)        



class GetDischargeSummary_Data_Ward(View):

    def get(self,request):

        Ward_Assignid = int(request.GET.get('ward_assignid'))
        
        try:
            dischargeObj = DischargeSummary_Ward.objects.get(ward_no = Ward_Assignid)

            currentdate = datetime.now().date() - dischargeObj.patient.dob
            age = currentdate.days//365
            month = (currentdate.days - age *365) // 30

            discharge_summary_data = []


            data = {
                'id' : dischargeObj.id,
                'patient_id' : dischargeObj.patient.id,
                'patient_name' : dischargeObj.patient.name,
                'patient_age' : age,
                'patient_gender' : dischargeObj.patient.gender,
                'patient_address' : dischargeObj.patient.address,

                'ward_no' : dischargeObj.ward_no.id,
                'date_of_admission' : dischargeObj.ward_no.assigned_date,
                'date_of_discharge' : dischargeObj.ward_no.discharged_date,
                'date_of_surgery' : dischargeObj.date_of_surgery,

                'bed_id' : dischargeObj.ward_bed.id,
                'bed_no' : dischargeObj.ward_bed.bed_no,

                'consultant' : dischargeObj.consultant.name,
                'consultant_id' : dischargeObj.consultant.id,

                'allergies' : dischargeObj.allergies,
                'diagnosis' : dischargeObj.diagnosis,
                'investigation' : dischargeObj.investigation,
                'treatment' : dischargeObj.treatment,
                'advice_on_discharge' : dischargeObj.advice_on_discharge,

            }

            discharge_summary_data.append(data)


        except:
            discharge_summary_data = []


        context = {
            'discharge_summary_data' : discharge_summary_data,

        }

        return JsonResponse(context , safe = False) 




class Discharge_Patient(View):

    def get(self , request):

        Ward_Assignid = int(request.GET.get('ward_assignid'))  
        bed_id = int(request.GET.get('bed_id'))  
        

        wardobj = AssignWard.objects.get(id  = Ward_Assignid)
        wardobj.status = 1
        wardobj.discharged_date = datetime.now()  
        wardobj.save()
        # ward_payment = Ward_Patient_Payments.objects.get(assignward = wardobj.id)

        # print('test',ward_payment.balance)
        # if ward_payment.balance == 0:
        #     wardobj.payment_pending = False
        #     wardobj.save()

        WardBed.objects.filter(id  = bed_id).update(vacancy_status = 0)
        print(wardobj)



        messages.success(request , "Patient Discharged")

        return JsonResponse({"status":"success"},status=200)    

