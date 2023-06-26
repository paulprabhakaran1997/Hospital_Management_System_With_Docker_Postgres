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
from functools import reduce


from django.shortcuts import render
from django.conf import settings
from django.core.files.storage import FileSystemStorage

from scan.models import Scan , ScanForPatient ,  ScanTakenByPatient , ScanPaymentTransaction , ScanForDirectPatient
from patient.models import Patient
from appointment.models import Appointment, ScanForOutPatient , OutPatient_Payments , OutPatient_PaymentTransactions
from lint_hospital.encoders import DefaultEncoder

from room.models import Rooms , AssignRooms , ScanForINPatient , IN_Patient_Payments , IN_Patient_PaymentTransactions

from ward.models import AssignWard , ScanForWardPatient , Ward_Patient_Payments , Ward_Patient_PaymentTransactions

# Create your views here.

class ScanView(View):
    template_name = "add_scan.html"

    def get(self , request):
        context = {
            "scandata" : get_scan_data()
        }

        return render(request , self.template_name , context)

    
    def post(self , request):        
        scan_id = int(request.POST.get('ScanId'))

        scan_db_param = {
            "name" : request.POST.get("name"),
            "amount" : request.POST.get("amount"),
            "description" : request.POST.get("description"),
        }

        if(scan_id == 0):
            Scan.objects.create(**scan_db_param)
            messages.success(request , "Scan Added Successfully")
            return redirect("scan")
        else:
            Scan.objects.filter(id = scan_id).update(**scan_db_param)
            messages.success(request , "Scan updated Successfully")
            return redirect("scan")
    

    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


def get_scan_data():
    scan_data = []

    ScanObj = Scan.objects.all()

    for ht in ScanObj:
        data = {
            'id' : ht.id,
            'name' : ht.name,
            'amount' : ht.amount,
            'description' : ht.description
        }

        scan_data.append(data)

    return scan_data        


def get_scan_for_patient_data():
    scan_test_for_patient_data = []

    ScanForPatientObj = ScanForPatient.objects.all()

    for ht in ScanForPatientObj:

        currentdate = datetime.now().date() - ht.patient.dob
        age = currentdate.days//365
        month = (currentdate.days - age *365) // 30

        complete = 0
        status = 0
        created_time = ""
        appointed_date = "" 
        doctor_name = ""


        if ht.appointment != None :
            op_appointment_id = ht.appointment.id
            status = ht.appointment.status
            created_time = ht.created_time
            appointed_date = str(ht.appointment.appointment_date)
            doctor_name = ht.appointment.doctor.name
        else:
             op_appointment_id = 0 

        if ht.assignroom != None :
            IP_assignid = ht.assignroom.id
            status = ht.assignroom.status
            complete = ht.complete
            created_time = ht.created_time
            appointed_date = str(ht.assignroom.assigned_date)
            doctor_name = ht.ip_scan_test.doctor_checkup.doctor.name
        else:
             IP_assignid = 0 

        if ht.assignward != None :
            ward_assignid = ht.assignward.id
            status = ht.assignward.status
            complete = ht.complete
            created_time = ht.created_time
            appointed_date = str(ht.assignward.assigned_date)
            doctor_name = ht.ward_scan_test.doctor_checkup.doctor.name
        else:
             ward_assignid = 0 

        data = {
            'id' : ht.id,
            'patient_id' : ht.patient.id,
            'patient_name' : ht.patient.name,
            'patient_type' : ht.patient_type,
            'phone' : ht.patient.phone,
            'father_name' : ht.patient.father_name,
            'patient_gender' : ht.patient.gender,
            'patient_age' : age,
            'patient_address' : ht.patient.address,
            'total_amount' : ht.total_amount,
            'balance' : ht.balance,
            'op_appointment_id' : op_appointment_id,
            'IP_assignid' : IP_assignid,
            'ward_assignid' : ward_assignid,
            'status' : status,
            'complete' : complete,
            'created_time' : created_time,
            'appointed_date' : appointed_date,
            'doctor_name' : doctor_name

        }

        scan_test_for_patient_data.append(data)

    return scan_test_for_patient_data


def get_scan_for_direct_patient_data():
    scan_test_for_Dpatient_data = []

    ScanFor_DPatientObj = ScanForDirectPatient.objects.all()

    for ht in ScanFor_DPatientObj:

        currentdate = datetime.now().date() - ht.patient.dob

        age = currentdate.days//365
        month = (currentdate.days - age *365) // 30

        data = {
            'id' : ht.id,
            'patient_id' : ht.patient.id,
            'patient_name' : ht.patient.name,
            'patient_type' : ht.patient_type,
            'phone' : ht.patient.phone,
            'father_name' : ht.patient.father_name,
            'patient_gender' : ht.patient.gender,
            'patient_age' : age,
            'patient_address' : ht.patient.address,
            'total_amount' : ht.total_amount,
            'discount' : ht.discount,
            'total_after_discount' : ht.total_after_discount,
            'paid' : ht.paid,
            'balance' : ht.balance,
            'cash' : ht.cash,
            'card' : ht.card,
            'upi' : ht.upi,
            'initially_paid' : ht.initially_paid,
            'payment_pending' : ht.payment_pending,
            'doctor_name' : ht.doctor_name,
            'appointed_date' : ht.created_time,
            'created_time' : ht.created_time
        }

        scan_test_for_Dpatient_data.append(data)

    return scan_test_for_Dpatient_data


class ScanFromAppointment(View):
    template_name = 'scan_from_appointment.html'

    def get(self , request):

        context = {
             "scandata" :json.dumps( get_scan_data() , cls = DefaultEncoder),
        }

        return render(request , self.template_name , context)


    def post(self , request):
        data = request.body

        if data:
            PatientData = json.loads(data)['PatientObj'][0]
            ScanObj_amount = json.loads(data)['ScanObj_amount']
            ScanData = json.loads(data)['ReportObj']
            patient_type = json.loads(data)['patient_type']

            PatientObj = Patient.objects.get(id = int(PatientData['patient_id']))

            scan_dbParam = {
                "patient" : PatientObj,
                "total_amount" : ScanObj_amount,
                "balance" : ScanObj_amount
            }

            print(PatientData)

            if patient_type == 'Direct Patient':

                try:

                    direct_scanObj = ScanForDirectPatient.objects.get(id = int(PatientData['returnScanTestPatient_Id']))
                    direct_scanObj.scan_checked = True
                    direct_scanObj.save()

                    for sd in ScanData:
                        scan_obj = Scan.objects.get(id = int(sd['scan_Id']))
                        sd_db_param = {
                            "scan_for_direct_patient" : Latest_scanfp_Obj,
                            "scan" : scan_obj,
                            "value" : sd['scan_value']
                        }
                        ScanTakenByPatient.objects.create(**sd_db_param)
  


                except:

                    direct_payment_data = json.loads(data)['direct_payment_data'][0]
                    PatientObj = Patient.objects.get(id = int(direct_payment_data['patient_id']))
                    pending = True

                        

                    direct_db = ScanForDirectPatient(
                        patient = PatientObj,
                        patient_type = direct_payment_data['patient_type'],
                        scan_test = json.loads(data)['ScanObj'],
                        total_amount = direct_payment_data['total'],
                        discount = direct_payment_data['discount'],
                        total_after_discount = direct_payment_data['total_after_discount'],
                        paid = direct_payment_data['paid'],
                        balance = direct_payment_data['balance'],
                        cash = direct_payment_data['cash'],
                        card = direct_payment_data['card'],
                        upi = direct_payment_data['upi'],
                        initially_paid = True,
                        payment_pending = pending,
                        doctor_name = json.loads(data)['doctor_direct_scan'],
                    )
                    direct_db.save()

                    direct_scanObj = ScanForDirectPatient.objects.latest('id')
                    if direct_db.balance == 0 :
                        pending = False
                        direct_scanObj.payment_complete = 2
                    elif direct_db.balance == direct_db.total_amount:
                        direct_scanObj.payment_complete = 0
                    else:
                        direct_scanObj.payment_complete = 1    
                    direct_scanObj.save()
                    
                    dt_db_param = {
                        'patient' : PatientObj,
                        'patient_type' : patient_type,    
                        'user' :  request.user,            
                        'scan_for_direct_patient' : direct_scanObj,
                        'total' : direct_payment_data['total'],
                        'discount' : direct_payment_data['discount'],
                        'total_after_discount' : direct_payment_data['total_after_discount'],
                        'paid' : direct_payment_data['paid'],
                        'balance' : direct_payment_data['balance'],
                        'existing_balance' : direct_payment_data['total'],
                        'cash' : direct_payment_data['cash'],
                        'card' : direct_payment_data['card'],
                        'upi' : direct_payment_data['upi'],
                    }

                    ScanPaymentTransaction.objects.create(**dt_db_param)
         
            else:

                if patient_type == 'Out Patient':
                    AppointmentObj = Appointment.objects.get(id = int(PatientData['appointment_id']))
                    scan_dbParam['appointment'] = AppointmentObj
                    scan_dbParam['patient_type'] = patient_type

                    Scan_Obj = ScanForOutPatient.objects.get(id = int(PatientData['returnScanTestPatient_Id']))
                    Scan_Obj.scan_checked = True
                    Scan_Obj.save()

                if patient_type == 'In Patient':
                    AssignObj = AssignRooms.objects.get(id = int(PatientData['IP_assignid']))
                    scan_dbParam['assignroom'] = AssignObj
                    scan_dbParam['ip_scan_test'] = ScanForINPatient.objects.get(id = int(PatientData['returnScanTestPatient_Id']))
                    scan_dbParam['patient_type'] = patient_type

                    Scan_Obj = ScanForINPatient.objects.get(id = int(PatientData['returnScanTestPatient_Id']))
                    Scan_Obj.scan_checked = True
                    Scan_Obj.save()

                    AssignObj.total += int(ScanObj_amount)
                    AssignObj.balance += int(ScanObj_amount)
                    if AssignObj.balance == 0:
                        AssignObj.payment_pending = False
                    else:
                        AssignObj.payment_pending = True
                    AssignObj.save()

                if patient_type == 'Ward Patient':
                    AssignObj = AssignWard.objects.get(id = int(PatientData['ward_assignid']))
                    scan_dbParam['assignward'] = AssignObj
                    scan_dbParam['ward_scan_test'] = ScanForWardPatient.objects.get(id = int(PatientData['returnScanTestPatient_Id']))
                    scan_dbParam['patient_type'] = patient_type

                    Scan_Obj = ScanForWardPatient.objects.get(id = int(PatientData['returnScanTestPatient_Id']))
                    Scan_Obj.scan_checked = True
                    Scan_Obj.save()

                    AssignObj.total += int(ScanObj_amount)
                    AssignObj.balance += int(ScanObj_amount)
                    if AssignObj.balance == 0:
                        AssignObj.payment_pending = False
                    else:
                        AssignObj.payment_pending = True
                    AssignObj.save()
                
                ScanForPatient.objects.create(**scan_dbParam)

                Latest_scanfp_Obj = ScanForPatient.objects.latest('id')

                for sd in ScanData:
                    scan_obj = Scan.objects.get(id = int(sd['scan_Id']))
                    sd_db_param = {
                        "scan_for_patient" : Latest_scanfp_Obj,
                        "scan" : scan_obj,
                        "value" : sd['scan_value']
                    }
                    ScanTakenByPatient.objects.create(**sd_db_param)



            messages.success(request , "Successful")
            return JsonResponse({"status":"success"},status=200)    

    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)   


class CancelScan(View):
    def post(self , request):
         data = request.body
         if data:
            patient_type = json.loads(data)['patient_type']
            cancelingScan = json.loads(data)['canceling_scan']


            if patient_type == 'Out Patient':
                ScanForOutPatient.objects.filter(id = int(cancelingScan)).update(scan_canceled = True)

            if patient_type == 'In Patient':
                ScanForINPatient.objects.filter(id = int(cancelingScan)).update(scan_canceled = True)

            if patient_type == 'Ward Patient':
                ScanForWardPatient.objects.filter(id = int(cancelingScan)).update(scan_canceled = True)

            print(patient_type)


            messages.success(request , "Scan Canceled")
            return JsonResponse({"status":"success"},status=200)    


    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class Get_ScanTest_Data(View):

    def get(self , request):

        today = datetime.now().date()
        tomorrow = today + timedelta(1)
        today_start = datetime.combine(today, time())
        today_end = datetime.combine(tomorrow, time())

        def get_scanDetails_from_appointment_data_direct():
            scanDetails_from_appointment_data_direct = []
            ScanObj = ScanForDirectPatient.objects.filter(scan_checked = False).filter(scan_canceled = False).all()

            for ht in ScanObj:
                scan_details = []

                for xd in ht.scan_test:

                    ScanObj = Scan.objects.filter(id = int(xd)).all()

                    for obj in ScanObj:
                        x_data = {
                            'id' : obj.id,
                            'scan_name' : obj.name,
                            'scan_amount' : obj.amount,
                        }

                        scan_details.append(x_data)

                currentdate = datetime.now().date() - ht.patient.dob
                age = currentdate.days//365
                month = (currentdate.days - age *365) // 30

                data = {
                    'id' : ht.id,
                    'admission_id' : ht.id,
                    'patient_id' : ht.patient.id,
                    'patient_name' : ht.patient.name,
                    'doctor_name'  : ht.doctor_name,
                    'scan_details' : scan_details,
                    'patient_gender' : ht.patient.gender,
                    'patient_age' : age,
                    'address' : ht.patient.address,
                    'phone' : ht.patient.phone,
                    'payment_complete' : ht.payment_complete,
                    'scan_details' : scan_details,

                }

                scanDetails_from_appointment_data_direct.append(data)

            return scanDetails_from_appointment_data_direct
        
        def get_scanDetails_from_appointment_data_out():
            scanDetails_from_appointment_data_out = []
            AppointmentObj = Appointment.objects.filter(status = False)
            for r in AppointmentObj :

                ScanObj = ScanForOutPatient.objects.filter(appointment = r).filter(scan_checked = False).filter(scan_canceled = False).all()

                for ht in ScanObj:
                    scan_details = []

                    for xd in ht.scan_test:

                        ScanObj = Scan.objects.filter(id = int(xd)).all()

                        for obj in ScanObj:
                            x_data = {
                                'id' : obj.id,
                                'scan_name' : obj.name,
                                'scan_amount' : obj.amount,
                            }

                            scan_details.append(x_data)

                    currentdate = datetime.now().date() - ht.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30

                    data = {
                        'id' : ht.id,
                        'admission_id' : ht.appointment.id,
                        'patient_id' : ht.patient.id,
                        'patient_name' : ht.patient.name,
                        'doctor_name'  : ht.appointment.doctor.name,
                        'patient_gender' : ht.patient.gender,
                        'patient_age' : age,
                        'address' : ht.patient.address,
                        'phone' : ht.patient.phone,
                        'payment_complete' : ht.payment_complete,
                        'scan_details' : scan_details,

                    }

                    scanDetails_from_appointment_data_out.append(data)

            return scanDetails_from_appointment_data_out

        def get_scanDetails_from_appointment_data_in():
            scanDetails_from_appointment_data_in = []
            AssignObj = AssignRooms.objects.filter(status = False)
            for r in AssignObj :

                ScanObj = ScanForINPatient.objects.filter(assignroom = r).filter(scan_checked = False).filter(scan_canceled = False).all()

                for ht in ScanObj:
                    scan_details = []

                    for xd in ht.scan_test:

                        ScanObj = Scan.objects.filter(id = int(xd)).all()

                        for obj in ScanObj:
                            x_data = {
                                'id' : obj.id,
                                'scan_name' : obj.name,
                                'scan_amount' : obj.amount,
                            }

                            scan_details.append(x_data)

                    currentdate = datetime.now().date() - ht.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30

                    data = {
                        'id' : ht.id,
                        'admission_id' : ht.assignroom.id,
                        'patient_id' : ht.patient.id,
                        'patient_name' : ht.patient.name,
                        'doctor_name'  : ht.doctor_checkup.doctor.name,
                        'scan_details' : scan_details,
                        'patient_gender' : ht.patient.gender,
                        'patient_age' : age,
                        'address' : ht.patient.address,
                        'phone' : ht.patient.phone,
                        'payment_complete' : ht.payment_complete,
                        'scan_details' : scan_details,
                    }

                    scanDetails_from_appointment_data_in.append(data)

            return scanDetails_from_appointment_data_in
              
        def get_scanDetails_from_appointment_data_ward():
            scanDetails_from_appointment_data_ward = []
            AssignObj = AssignWard.objects.filter(status = False)
            for r in AssignObj :

                ScanObj = ScanForWardPatient.objects.filter(assignward = r).filter(scan_checked = False).filter(scan_canceled = False).all()

                for ht in ScanObj:
                    scan_details = []

                    for xd in ht.scan_test:

                        ScanObj = Scan.objects.filter(id = int(xd)).all()

                        for obj in ScanObj:
                            x_data = {
                                'id' : obj.id,
                                'scan_name' : obj.name,
                                'scan_amount' : obj.amount,
                            }

                            scan_details.append(x_data)

                    currentdate = datetime.now().date() - ht.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30

                    data = {
                        'id' : ht.id,
                        'admission_id' : ht.assignward.id,
                        'patient_id' : ht.patient.id,
                        'patient_name' : ht.patient.name,
                        'doctor_name'  : ht.doctor_checkup.doctor.name,
                        'scan_details' : scan_details,
                        'patient_gender' : ht.patient.gender,
                        'patient_age' : age,
                        'address' : ht.patient.address,
                        'phone' : ht.patient.phone,
                        'scan_details' : scan_details,
                    }

                    scanDetails_from_appointment_data_ward.append(data)

            return scanDetails_from_appointment_data_ward


        ScanDetailsFromAppointmentData_direct = get_scanDetails_from_appointment_data_direct()
        ScanDetailsFromAppointmentData_out = get_scanDetails_from_appointment_data_out()
        ScanDetailsFromAppointmentData_in = get_scanDetails_from_appointment_data_in()
        ScanDetailsFromAppointmentData_ward = get_scanDetails_from_appointment_data_ward()


        context = {
            'scan_from_appointmentdata_direct' : ScanDetailsFromAppointmentData_direct , 
            'scan_from_appointmentdata_out' : ScanDetailsFromAppointmentData_out , 
            'scan_from_appointmentdata_in' : ScanDetailsFromAppointmentData_in , 
            'scan_from_appointmentdata_ward' : ScanDetailsFromAppointmentData_ward , 
            'scanforpatientdata' : get_scan_for_patient_data() , 
            'scanfordirectpatientdata' : get_scan_for_direct_patient_data()

        }

        return JsonResponse(context , safe = False)


class ScanPayment(View):

    def post(self , request):

        data = request.body
        if data :
            scan_payment_data = json.loads(data)['scan_payment_data'][0]

            patient_type = scan_payment_data['patient_type']
            PatientObj = Patient.objects.get(id = int(scan_payment_data['patient_id']))

            if patient_type == 'Direct Patient':

                direct_scanbObj = ScanForDirectPatient.objects.get(id = int(scan_payment_data['direct_scan_Id']))
                
                print(direct_scanbObj.total_amount)
                total = direct_scanbObj.total_amount
                existing_balance = direct_scanbObj.balance
                

                direct_scanbObj.patient = PatientObj
                direct_scanbObj.discount += scan_payment_data['discount']
                direct_scanbObj.total_after_discount = total - direct_scanbObj.discount
                direct_scanbObj.paid += scan_payment_data['paid']
                direct_scanbObj.balance = scan_payment_data['balance']
                direct_scanbObj.cash += scan_payment_data['cash']
                direct_scanbObj.card += scan_payment_data['card']
                direct_scanbObj.upi += scan_payment_data['upi']
                direct_scanbObj.initially_paid = True
                total_after_discount = direct_scanbObj.total_after_discount
                
                if int(scan_payment_data['balance']) == 0 :
                    direct_scanbObj.payment_pending = False
                    direct_scanbObj.payment_complete = 2
                else:
                    direct_scanbObj.payment_complete = 1



                direct_scanbObj.save()    

                dt_db_param = {
                    'patient' : PatientObj,
                    'patient_type' : patient_type,    
                    'user' :  request.user,            
                    'scan_for_direct_patient' : direct_scanbObj,
                    'total' : total,
                    'discount' : scan_payment_data['discount'],
                    'total_after_discount' : int(total-scan_payment_data['discount']),
                    'paid' : scan_payment_data['paid'],
                    'balance' : scan_payment_data['balance'],
                    'existing_balance' : existing_balance,
                    'cash' : scan_payment_data['cash'],
                    'card' : scan_payment_data['card'],
                    'upi' : scan_payment_data['upi'],
                }

                ScanPaymentTransaction.objects.create(**dt_db_param)

                messages.success(request , "Successful")
                return JsonResponse({"status":"info"},status=200) 
      

            if patient_type == 'Out Patient':

                op_obj = Appointment.objects.get(id = int(scan_payment_data['OP_appointmentid']))

                if op_obj.initially_paid == True:
                    messages.info(request , "You Already Paid In Reception")
                    return JsonResponse({"status":"info"},status=200) 

                else:
                    op_payment_data =  OutPatient_Payments.objects.get(appointment = op_obj.id)
                    existing_balance = 0
                    print(int(scan_payment_data['returnScanTestPatient_Id']))
                    op_scan_obj = 0


                    try:

                        scanobj =  ScanForPatient.objects.get(id = int(scan_payment_data['ScanTestId']))
                        op_scan_obj = scanobj.op_scan_test


                        if scanobj.initially_paid == False:
                            op_payment_data.total += scan_payment_data['total']
                            op_payment_data.scan += scan_payment_data['total']
                            op_existing_balance = op_payment_data.total
                        else:   
                            op_existing_balance = op_payment_data.balance

                        existing_balance = scanobj.balance
                        scanobj.cash = scanobj.cash + scan_payment_data['cash']
                        scanobj.upi = scanobj.upi + scan_payment_data['upi']
                        scanobj.card = scanobj.card + scan_payment_data['card']
                        scanobj.balance = scan_payment_data['balance']
                        scanobj.patient = PatientObj
                        scanobj.save()


                    except:

                        op_scan_obj = ScanForOutPatient.objects.get(id = int(scan_payment_data['returnScanTestPatient_Id']))
                        op_payment_data.total += scan_payment_data['total']
                        op_payment_data.scan += scan_payment_data['total']
                        op_existing_balance = op_payment_data.total

                        scan_db = ScanForPatient(
                            patient = PatientObj,
                            total_amount = scan_payment_data['total'],
                            balance = scan_payment_data['balance'],
                            cash = scan_payment_data['cash'],
                            upi = scan_payment_data['upi'],
                            card = scan_payment_data['card'],
                            appointment = op_obj,
                            patient_type = patient_type,
                            initially_paid = True,
                            op_scan_test = op_scan_obj
                        )
                        scan_db.save()

                        scanobj = ScanForPatient.objects.latest('id')
                        existing_balance = scan_payment_data['total']


                    if int(scan_payment_data['balance'] == 0):
                        op_scan_obj.payment_complete = 2
                    else:
                        op_scan_obj.payment_complete = 1
                    op_scan_obj.save()

                    op_payment_data.payment_recived_by_scan += scan_payment_data['paid']
                    op_payment_data.paid += scan_payment_data['paid']
                    op_payment_data.total_after_discount = op_payment_data.total -  op_payment_data.discount
                    op_payment_data.balance = op_payment_data.total - op_payment_data.paid - op_payment_data.discount
                    op_payment_data.cash += scan_payment_data['cash']
                    op_payment_data.card += scan_payment_data['card']
                    op_payment_data.upi += scan_payment_data['upi']
                    op_payment_data.save()

                    OutPatientPaymentTransactionDB = OutPatient_PaymentTransactions(
                        user = request.user,
                        department = 'Scan',
                        op_payment = op_payment_data,
                        appointment = op_obj,
                        patient = PatientObj,
                        total = op_payment_data.total,
                        existing_balance = op_existing_balance,
                        paid = scan_payment_data['paid'],
                        balance = op_payment_data.balance,
                        cash = scan_payment_data['cash'],
                        upi = scan_payment_data['upi'],
                        card = scan_payment_data['card'],
                    )

                    OutPatientPaymentTransactionDB.save()

                    ScanTransactionDB = ScanPaymentTransaction(
                            user = request.user,
                            appointment = op_obj,
                            patient_type = patient_type,
                            scan_for_patient = scanobj,
                            patient = PatientObj,
                            total = scan_payment_data['total'],
                            existing_balance = existing_balance,
                            paid = scan_payment_data['paid'],
                            balance = scan_payment_data['balance'],
                            cash = scan_payment_data['cash'],
                            upi = scan_payment_data['upi'],
                            card = scan_payment_data['card'],
                        )

                    ScanTransactionDB.save()


                    messages.success(request , "Successful")
                    return JsonResponse({"status":"info"},status=200)  

            
            if patient_type == 'In Patient':

                ip_obj = AssignRooms.objects.get(id = int(scan_payment_data['IP_assignid']))
                ip_scan_obj = 0


                ip_payment_db_param = {
                    'assignroom' : ip_obj,
                    'patient' : PatientObj,
                    'payment_recived_by_scan' : scan_payment_data['paid'],
                    'scan' : scan_payment_data['total'],
                    'total' : scan_payment_data['total'],
                    'total_after_discount' : scan_payment_data['total'],
                    'paid' : scan_payment_data['paid'],
                    'balance' : scan_payment_data['balance'],
                    'cash' : scan_payment_data['cash'],
                    'upi' : scan_payment_data['upi'],
                    'card' : scan_payment_data['card'],
                }
                try:
                    scanobj =  ScanForPatient.objects.get(id = int(scan_payment_data['ScanTestId']))
                    ip_scan_obj = scanobj.ip_scan_test
                except:
                    print(scan_payment_data)
                    ip_scan_obj = ScanForINPatient.objects.get(id = int(scan_payment_data['returnScanTestPatient_Id']))
                    ip_obj.total += int(scan_payment_data['total'])
                    ip_obj.balance += int(scan_payment_data['total'])
                    if ip_obj.balance == 0:
                        ip_obj.payment_pending = False
                    else:
                        ip_obj.payment_pending = True
                    ip_obj.save()

                    scan_db = ScanForPatient(
                            patient = PatientObj,
                            total_amount = scan_payment_data['total'],
                            balance = scan_payment_data['balance'],
                            assignroom = ip_obj,
                            patient_type = patient_type,
                            ip_scan_test = ip_scan_obj
                        )
                    scan_db.save()
                    scanobj = ScanForPatient.objects.latest('id')


                try:
                        
                    ip_payment =  IN_Patient_Payments.objects.get(assignroom = ip_obj.id )

                    if scanobj.initially_paid == False:
                        ip_payment.total += scan_payment_data['total']
                        ip_payment.scan += scan_payment_data['total']
                        ip_existing_balance = ip_payment.total
                    else:
                        ip_existing_balance = ip_payment.balance

                    ip_payment.payment_recived_by_scan += scan_payment_data['paid']
                    ip_payment.paid += scan_payment_data['paid']
                    ip_payment.total_after_discount = ip_payment.total -  ip_payment.discount
                    ip_payment.balance = ip_payment.total - ip_payment.paid - ip_payment.discount
                    ip_payment.cash += scan_payment_data['cash']
                    ip_payment.upi += scan_payment_data['upi']
                    ip_payment.card += scan_payment_data['card']
                    ip_payment.save()

                    IN_PatientPaymentTransactionDB = IN_Patient_PaymentTransactions(
                        user = request.user,
                        department = 'Scan',
                        ip_payment = ip_payment,
                        assignroom = ip_obj,
                        patient = PatientObj,
                        total = ip_payment.total,
                        existing_balance = ip_existing_balance,
                        paid = scan_payment_data['paid'],
                        balance = ip_payment.balance,
                        cash = scan_payment_data['cash'],
                        upi = scan_payment_data['upi'],
                        card = scan_payment_data['card'],
                    )
                    IN_PatientPaymentTransactionDB.save()

                    ip_obj.paid = ip_payment.paid
                    ip_obj.balance = ip_payment.balance
                    if ip_obj.balance == 0:
                        ip_obj.payment_pending = False
                    else:
                        ip_obj.payment_pending = True
                    ip_obj.save()

                except:
                    IN_Patient_Payments.objects.create(**ip_payment_db_param)

                    LatestObj = IN_Patient_Payments.objects.latest('id')

                    IN_PatientPaymentTransactionDB = IN_Patient_PaymentTransactions(
                        user = request.user,
                        department = 'Scan',
                        ip_payment = LatestObj,
                        assignroom = ip_obj,
                        patient = PatientObj,
                        total = scan_payment_data['total'],
                        existing_balance = scan_payment_data['total'],
                        paid = scan_payment_data['paid'],
                        balance = scan_payment_data['balance'],
                        cash = scan_payment_data['cash'],
                        upi = scan_payment_data['upi'],
                        card = scan_payment_data['card'],
                    )
                    IN_PatientPaymentTransactionDB.save()

                    ip_obj.paid = scan_payment_data['paid']
                    ip_obj.balance = ip_obj.total - ip_obj.paid
                    if ip_obj.balance == 0:
                        ip_obj.payment_pending = False
                    else:
                        ip_obj.payment_pending = True
                    ip_obj.save()


                if int(scan_payment_data['balance'] == 0):
                    ip_scan_obj.payment_complete = 2
                else:
                    ip_scan_obj.payment_complete = 1
                ip_scan_obj.save()
                
                existing_balance = scanobj.balance
                scanobj.cash = scanobj.cash + scan_payment_data['cash']
                scanobj.upi = scanobj.upi + scan_payment_data['upi']
                scanobj.card = scanobj.card + scan_payment_data['card']
                scanobj.balance = scan_payment_data['balance']
                scanobj.initially_paid = True  
                scanobj.save()


                ScanTransactionDB = ScanPaymentTransaction(
                    user = request.user,
                    assignroom = ip_obj,
                    patient_type = patient_type,
                    scan_for_patient = scanobj,
                    patient = PatientObj,
                    total = scan_payment_data['total'],
                    existing_balance = existing_balance,
                    paid = scan_payment_data['paid'],
                    balance = scan_payment_data['balance'],
                    cash = scan_payment_data['cash'],
                    upi = scan_payment_data['upi'],
                    card = scan_payment_data['card'],
                )

                ScanTransactionDB.save()

                messages.success(request , "Successful")
                return JsonResponse({"status":"info"},status=200) 
         
        
            if patient_type == 'Ward Patient':

                ward_obj = AssignWard.objects.get(id = int(scan_payment_data['Ward_assignid']))

                ward_payment_db_param = {
                    'assignward' : ward_obj,
                    'patient' : PatientObj,
                    'payment_recived_by_scan' : scan_payment_data['paid'],
                    'scan' : scan_payment_data['total'],
                    'total' : scan_payment_data['total'],
                    'total_after_discount' : scan_payment_data['total'],
                    'paid' : scan_payment_data['paid'],
                    'balance' : scan_payment_data['balance'],
                    'cash' : scan_payment_data['cash'],
                    'upi' : scan_payment_data['upi'],
                    'card' : scan_payment_data['card'],
                }

                scanobj =  ScanForPatient.objects.get(id = int(scan_payment_data['ScanTestId']))

                try:
                    ward_payment =  Ward_Patient_Payments.objects.get(assignward = ward_obj.id )
                    if scanobj.initially_paid == False:
                        ward_payment.total += scan_payment_data['total']
                        ward_payment.scan += scan_payment_data['total']
                        ward_existing_balance = ward_payment.total
                    else:
                        ward_existing_balance = ward_payment.balance

                    ward_payment.payment_recived_by_scan += scan_payment_data['paid']
                    ward_payment.paid += scan_payment_data['paid']
                    ward_payment.total_after_discount = ward_payment.total -  ward_payment.discount
                    ward_payment.balance = ward_payment.total - ward_payment.paid  - ward_payment.discount
                    ward_payment.cash += scan_payment_data['cash']
                    ward_payment.upi += scan_payment_data['upi']
                    ward_payment.card += scan_payment_data['card']
                    ward_payment.save()

                    Ward_PatientPaymentTransactionDB = Ward_Patient_PaymentTransactions(
                        user = request.user,
                        department = 'Scan',
                        ward_payment = ward_payment,
                        assignward = ward_obj,
                        patient = PatientObj,
                        total = ward_payment.total,
                        existing_balance = ward_existing_balance,
                        paid = scan_payment_data['paid'],
                        balance = ward_payment.balance,
                        cash = scan_payment_data['cash'],
                        upi = scan_payment_data['upi'],
                        card = scan_payment_data['card'],
                    )
                    Ward_PatientPaymentTransactionDB.save()

                    ward_obj.paid = ward_payment.paid
                    ward_obj.balance = ward_payment.balance
                    if ward_obj.balance == 0:
                        ward_obj.payment_pending = False
                    else:
                        ward_obj.payment_pending = True
                    ward_obj.save()


                except:
                    Ward_Patient_Payments.objects.create(**ward_payment_db_param)
                    LatestObj = Ward_Patient_Payments.objects.latest('id')

                    Ward_PatientPaymentTransactionDB = Ward_Patient_PaymentTransactions(
                        user = request.user,
                        department = 'Scan',
                        ward_payment = LatestObj,
                        assignward = ward_obj,
                        patient = PatientObj,
                        total = scan_payment_data['total'],
                        existing_balance = scan_payment_data['total'],
                        paid = scan_payment_data['paid'],
                        balance = scan_payment_data['balance'],
                        cash = scan_payment_data['cash'],
                        upi = scan_payment_data['upi'],
                        card = scan_payment_data['card'],
                    )
                    Ward_PatientPaymentTransactionDB.save()

                    ward_obj.paid = scan_payment_data['paid']
                    ward_obj.balance = ward_obj.total - ward_obj.paid
                    if ward_obj.balance == 0:
                        ward_obj.payment_pending = False
                    else:
                        ward_obj.payment_pending = True
                    ward_obj.save()
                    
                existing_balance = scanobj.balance
                print("Scan Data Ward = ",scan_payment_data)                        
                print("Ward Existing Balance = ",existing_balance)
                scanobj.cash = scanobj.cash + scan_payment_data['cash']
                scanobj.upi = scanobj.upi + scan_payment_data['upi']
                scanobj.card = scanobj.card + scan_payment_data['card']

                scanobj.balance = scan_payment_data['balance']
                scanobj.initially_paid = True  
                scanobj.save()

                ScanPaymentTransactionDB = ScanPaymentTransaction(
                    user = request.user,
                    assignward = ward_obj,
                    patient_type = patient_type,
                    scan_for_patient = scanobj,
                    patient = PatientObj,
                    total = scan_payment_data['total'],
                    existing_balance = existing_balance,
                    paid = scan_payment_data['paid'],
                    balance = scan_payment_data['balance'],
                    cash = scan_payment_data['cash'],
                    upi = scan_payment_data['upi'],
                    card = scan_payment_data['card'],
                )

                ScanPaymentTransactionDB.save()

                messages.success(request , "Successful")
                return JsonResponse({"status":"info"},status=200)


    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class PatientScanReportView(View):
    template_name = "patient_scan_report.html"

    def get(self , request , patient_type, id):
        
        def get_patient_data():
            patient_data = []

            
            if patient_type == 'direct_patient':
                try:
                    ScanForDirectPatientObj = ScanForDirectPatient.objects.get(id = id)
                    currentdate = datetime.now().date() - ScanForDirectPatientObj.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30

                    data = {
                        'id' : ScanForDirectPatientObj.id,
                        'patient_id' : ScanForDirectPatientObj.patient.id,
                        'patient_name' : ScanForDirectPatientObj.patient.name,
                        'patient_age' : age,
                        'patient_gender' : ScanForDirectPatientObj.patient.gender,
                        'test_date' : ScanForDirectPatientObj.created_time,
                        'phone' : ScanForDirectPatientObj.patient.phone,
                        'patient_address' : ScanForDirectPatientObj.patient.address,
                        'doctor_name' : ScanForDirectPatientObj.doctor_name
                    }

                    patient_data.append(data)

                except ScanForDirectPatient.DoesNotExist:
                    patient_data = []

                return patient_data
            
            else:
                try:

                    ScanForPatientObj = ScanForPatient.objects.get(id = id)
                    currentdate = datetime.now().date() - ScanForPatientObj.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30

                    if  ScanForPatientObj.patient_type == 'Out Patient':

                        doctor_name = ScanForPatientObj.appointment.doctor.name

                    elif  ScanForPatientObj.patient_type == 'In Patient':

                        doctor_name = ScanForPatientObj.ip_scan_test.doctor_checkup.doctor.name

                    elif  ScanForPatientObj.patient_type == 'Ward Patient':

                        doctor_name = ScanForPatientObj.ward_scan_test.doctor_checkup.doctor.name

                    else:
                        doctor_name = ''

                    data = {
                        'id' : ScanForPatientObj.id,
                        'patient_id' : ScanForPatientObj.patient.id,
                        'patient_name' : ScanForPatientObj.patient.name,
                        'patient_age' : age,
                        'patient_gender' : ScanForPatientObj.patient.gender,
                        'test_date' : ScanForPatientObj.created_time,
                        'phone' : ScanForPatientObj.patient.phone,
                        'patient_address' : ScanForPatientObj.patient.address,
                        'doctor_name' : doctor_name
                        
                    }

                    patient_data.append(data)

                except ScanForPatient.DoesNotExist:
                    patient_data = []

                return patient_data


        def get_patient_scan_report_data():
            PatientScanReportData = []

            if patient_type == 'direct_patient':            
                try:
                    PatientScanReportObj = ScanTakenByPatient.objects.filter(scan_for_direct_patient = id).all()
                    for ht in PatientScanReportObj:
                        data = {
                            'id' : ht.id,
                            'scan_name' : ht.scan.name,
                            'scan_value' : ht.value
                        }
                        PatientScanReportData.append(data)

                except ScanTakenByPatient.DoesNotExist:
                    PatientScanReportData = []
                return PatientScanReportData
            
            else :

                try:
                    PatientScanReportObj = ScanTakenByPatient.objects.filter(scan_for_patient = id).all()
                    for ht in PatientScanReportObj:
                        data = {
                            'id' : ht.id,
                            'scan_name' : ht.scan.name,
                            'scan_value' : ht.value
                        }
                        PatientScanReportData.append(data)

                except ScanTakenByPatient.DoesNotExist:
                    PatientScanReportData = []
                return PatientScanReportData

      

        context = {
            "patientscanreportdata" : json.dumps(get_patient_scan_report_data() , cls = DefaultEncoder),
            "patientdata" : json.dumps(get_patient_data() , cls = DefaultEncoder),
        }

        return render(request , self.template_name , context)

    
    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class Get_Scan_Result_Data(View):
    def get(self , request):
        scan_id = int(request.GET.get('scan_id'))
        patient_type = request.GET.get('patient_type')
        scan_result_data = []


        if patient_type == 'Direct Patient' :
            Direct_scan_obj = ScanForDirectPatient.objects.get(id = scan_id)
            for i in  ScanTakenByPatient.objects.filter(scan_for_direct_patient= Direct_scan_obj):

                data = {
                    'id' : i.scan.id,
                    'name' : i.scan.name,
                    'scan_taken_id' : i.id,
                    'scan_value' : i.value,
                    'scan_amount' : i.scan.amount,
                    'scan_description' : i.scan.description,
                }
                scan_result_data.append(data)

        else:

            scan_obj = ScanForPatient.objects.get(id = scan_id)
            for i in  ScanTakenByPatient.objects.filter(scan_for_patient = scan_obj):

                data = {
                    'id' : i.scan.id,
                    'name' : i.scan.name,
                    'scan_taken_id' : i.id,
                    'scan_value' : i.value,
                    'scan_amount' : i.scan.amount,
                    'scan_description' : i.scan.description,
                }
                scan_result_data.append(data)
        contex = {'scan_result_data': scan_result_data}
        return JsonResponse(contex,status=200)    


    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class Post_Edit_Scan_Result_Data(View):

    def post(self , request):
        data = request.body

        if data:
            ScanReportData = json.loads(data)['ReportObj']
            for i in ScanReportData:
                scan_taken_obj = ScanTakenByPatient.objects.get(id = int(i['scan_taken_id']))
                scan_taken_obj.value = i['scan_value']
                scan_taken_obj.save()
            messages.success(request , "Successfully Updated")
            return JsonResponse({"status":"success"},status=200)    



    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)



class PatientPaymentReportView(View):
    template_name = "patient_scan_payment_report.html"

    def get(self , request , patient_type, id):

        scan_data = []
        patient_data = []

        if patient_type == 'direct_patient':

            try:
                direct_obj = ScanForDirectPatient.objects.get(id = id)

                currentdate = datetime.now().date() - direct_obj.patient.dob
                age = currentdate.days//365
                month = (currentdate.days - age *365) // 30

                patient_data = [{

                    'appoint_id' : direct_obj.id,
                    'patient_type' : direct_obj.patient_type,
                    'patient_id' : direct_obj.patient.id,
                    'patient_name' : direct_obj.patient.name,
                    'patient_age' : age,
                    'patient_gender' : direct_obj.patient.gender,
                    'total' : direct_obj.total_amount,
                    'discount' : direct_obj.discount,
                    'paid' : direct_obj.paid,
                    'cash' : direct_obj.cash,
                    'card' : direct_obj.card,
                    'upi' : direct_obj.upi,
                    'balance' : direct_obj.balance,
                    'test_date' : direct_obj.created_time,
                }]


                for i in  direct_obj.scan_test:
                    for j in Scan.objects.all():
                        if int(i) == j.id:
                            data = {
                                'scan_name' : j.name,
                                'scan_amount' : j.amount,
                            }

                    scan_data.append(data)

            except ScanForDirectPatient.DoesNotExist:
                scan_data = []
                patient_data = []


        else:
            try:
                scan_obj = ScanForPatient.objects.get(id = id)
                scan_test_obj = 0

                currentdate = datetime.now().date() - scan_obj.patient.dob
                age = currentdate.days//365
                month = (currentdate.days - age *365) // 30

                print(scan_obj)

                if scan_obj.patient_type == 'Out Patient':
                    appoint_id =  scan_obj.appointment.id
                    scan_test_obj = scan_obj.op_scan_test.scan_test
                else: 
                    appoint_id =  scan_obj.assignroom.id
                    scan_test_obj = scan_obj.ip_scan_test.scan_test

                patient_data = [{

                    'appoint_id' : appoint_id,
                    'patient_type' : scan_obj.patient_type,
                    'patient_id' : scan_obj.patient.id,
                    'patient_name' : scan_obj.patient.name,
                    'patient_age' : age,
                    'patient_gender' : scan_obj.patient.gender,
                    'total' : scan_obj.total_amount,                   
                    'discount' : 0,
                    'paid' : 0,
                    'cash' : scan_obj.cash,
                    'card' : scan_obj.card,
                    'upi' : scan_obj.upi,
                    'balance' : scan_obj.balance,
                    'test_date' : scan_obj.created_time,
                }]

                for i in  scan_test_obj:
                    for j in Scan.objects.all():
                        if int(i) == j.id:
                            data = {
                                'scan_name' : j.name,
                                'scan_amount' : j.amount,
                            }

                    scan_data.append(data)


            except ScanForPatient.DoesNotExist:
                scan_data = []
                patient_data = []
  
        scan_details = reduce(lambda re, x: re+[x] if x not in re else re, scan_data, [])


        context = {
            "scan_details" : json.dumps(scan_details, cls = DefaultEncoder),
            "patient_data" : json.dumps(patient_data, cls = DefaultEncoder),
        }

        return render(request , self.template_name , context)

    
    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)



class Get_Initial_Payment_data_Scan(View):
    def get(self , request):
        suggested_scan_id = int(request.GET.get('suggested_scan_id'))
        patient_type = request.GET.get('patient_type')
        initial_scan_payment_data = []

        complete = 0
        status = 0
        doctor_name = ""
        appointed_date = ""
        created_time = ""
        op_appointment_id = 0
        IP_assignid = 0
        ScanForPatient_id = 0
        ScanFor_Direct_Patient_id = 0
        total_amount = 0
        balance = 0
        paid = 0
        discount = 0

        print(patient_type)

 
        def append_data():
            data = {
                'op_appointment_id' : op_appointment_id,
                'IP_assignid' : IP_assignid,
                'status' : status,
                'complete' : complete,
                'doctor_name' : doctor_name,
                'appointed_date' : appointed_date,
                'created_time' : created_time,
                'ScanForPatient_id' : ScanForPatient_id,
                'ScanFor_Direct_Patient_id' : ScanFor_Direct_Patient_id,
                'patient_type' : patient_type,
                'total_amount' : total_amount,
                'balance' : balance,
                'paid' : paid,
                'discount' : discount
            }

            initial_scan_payment_data.append(data)



        if patient_type == 'Direct Patient' :
            scan_test_obj = ScanForDirectPatient.objects.filter(id = suggested_scan_id)
            for ht in scan_test_obj:
                doctor_name = ht.doctor_name
                appointed_date = str(ht.created_time)
                created_time = ht.created_time
                ScanFor_Direct_Patient_id = ht.id
                patient_type = ht.patient_type
                total_amount = ht.total_amount
                balance = ht.balance
                paid = ht.paid
                discount = ht.discount
                append_data()

        if patient_type == 'Out Patient' :
            scan_test_obj = ScanForPatient.objects.filter(op_scan_test = suggested_scan_id)
            for ht in scan_test_obj:
                op_appointment_id = ht.appointment.id
                status = ht.appointment.status
                doctor_name = ht.appointment.doctor.name
                appointed_date = str(ht.appointment.appointment_date)
                created_time = ht.appointment.created_time
                ScanForPatient_id = ht.id
                patient_type = ht.patient_type
                total_amount = ht.total_amount
                balance = ht.balance
                paid = (ht.total_amount - ht.balance)
                append_data()


        if patient_type == 'In Patient' :
            scan_test_obj = ScanForPatient.objects.filter(ip_scan_test = suggested_scan_id)
            print(scan_test_obj)
            for ht in scan_test_obj:
                    IP_assignid = ht.assignroom.id
                    status = ht.assignroom.status
                    complete = ht.complete
                    doctor_name = ht.ip_scan_test.doctor_checkup.doctor.name
                    appointed_date = str(ht.assignroom.assigned_date)
                    created_time = ht.assignroom.created_time
                    ScanForPatient_id = ht.id
                    patient_type = ht.patient_type
                    total_amount = ht.total_amount
                    balance = ht.balance
                    paid = (ht.total_amount - ht.balance)
                    append_data()



        context = {'initial_scan_payment_data':initial_scan_payment_data}
        return JsonResponse(context,status=200)   


    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)
