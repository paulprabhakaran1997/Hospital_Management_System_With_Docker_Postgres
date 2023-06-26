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
from functools import reduce

from django.db import transaction

from django.shortcuts import render
from django.conf import settings
from django.core.files.storage import FileSystemStorage

from xray.models import Xray , XrayForPatient ,  XrayTakenByPatient , XrayPaymentTransaction
from patient.models import Patient
from appointment.models import Appointment, XrayForOutPatient , OutPatient_Payments , OutPatient_PaymentTransactions
from lint_hospital.encoders import DefaultEncoder

from room.models import Rooms , AssignRooms , XrayForINPatient , IN_Patient_Payments , IN_Patient_PaymentTransactions

from ward.models import AssignWard , XrayForWardPatient , Ward_Patient_Payments , Ward_Patient_PaymentTransactions

# Create your views here.

class XrayView(View):
    template_name = "add_xray.html"

    def get(self , request):
        context = {
            "xraydata" : get_xray_data()
        }

        return render(request , self.template_name , context)

    
    def post(self , request):        
        XrayId = request.POST.get('xrayId')

        xray_db_param = {
            "name" : request.POST.get("name"),
            "amount" : request.POST.get("amount"),
            "description" : request.POST.get("description"),
        }

        if(XrayId == '0'):
            Xray.objects.create(**xray_db_param)
            messages.success(request , "Xray Added Successfully")
            return redirect("xray")
        else:
            Xray.objects.filter(id = int(XrayId)).update(**xray_db_param)
            messages.success(request , "Xray updated Successfully")
            return redirect("xray")
    

    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


def get_xray_data():
    xray_data = []

    XrayObj = Xray.objects.all()

    for ht in XrayObj:
        data = {
            'id' : ht.id,
            'name' : ht.name,
            'amount' : ht.amount,
            'description' : ht.description
        }

        xray_data.append(data)

    return xray_data        


def get_xray_for_patient_data():
    xray_test_for_patient_data = []

    XrayForPatientObj = XrayForPatient.objects.all()

    for ht in XrayForPatientObj:

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
            doctor_name = ht.ip_xray_test.doctor_checkup.doctor.name
        else:
             IP_assignid = 0 

        if ht.assignward != None :
            ward_assignid = ht.assignward.id
            status = ht.assignward.status
            complete = ht.complete
            created_time = ht.created_time
            appointed_date = str(ht.assignward.assigned_date)
            doctor_name = ht.ward_xray_test.doctor_checkup.doctor.name
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

        xray_test_for_patient_data.append(data)

    return xray_test_for_patient_data


class XrayFromAppointment(View):
    template_name = 'xray_from_appointment.html'

    def get(self , request):

        context = {
             "xraydata" :json.dumps( get_xray_data() , cls = DefaultEncoder),
        }

        return render(request , self.template_name , context)


    def post(self , request):
        data = request.body

        if data:

            PatientData = json.loads(data)['PatientObj'][0]
            XrayObj_amount = json.loads(data)['XrayObj_amount']
            XrayData = json.loads(data)['XrayObj']
            patient_type = json.loads(data)['patient_type']

            PatientObj = Patient.objects.get(id = int(PatientData['patient_id']))

            xray_dbParam = {
                "patient" : PatientObj,
                "total_amount" : XrayObj_amount,
                "balance" : XrayObj_amount
            }

            print(PatientData)

            if patient_type == 'Out Patient':
                AppointmentObj = Appointment.objects.get(id = int(PatientData['appointment_id']))
                xray_dbParam['appointment'] = AppointmentObj
                xray_dbParam['patient_type'] = patient_type

                Xray_Obj = XrayForOutPatient.objects.get(id = int(PatientData['returnXrayTestPatient_Id']))
                Xray_Obj.xray_checked = True
                Xray_Obj.save()



            if patient_type == 'In Patient':
                AssignObj = AssignRooms.objects.get(id = int(PatientData['IP_assignid']))
                xray_dbParam['assignroom'] = AssignObj
                xray_dbParam['ip_xray_test'] = XrayForINPatient.objects.get(id = int(PatientData['returnXrayTestPatient_Id']))
                xray_dbParam['patient_type'] = patient_type

                Xray_Obj = XrayForINPatient.objects.get(id = int(PatientData['returnXrayTestPatient_Id']))
                Xray_Obj.xray_checked = True
                Xray_Obj.save()

                AssignObj.total += int(XrayObj_amount)
                AssignObj.balance += int(XrayObj_amount)
                if AssignObj.balance == 0:
                    AssignObj.payment_pending = False
                else:
                    AssignObj.payment_pending = True
                AssignObj.save()

            if patient_type == 'Ward Patient':
                AssignObj = AssignWard.objects.get(id = int(PatientData['ward_assignid']))
                xray_dbParam['assignward'] = AssignObj
                xray_dbParam['ward_xray_test'] = XrayForWardPatient.objects.get(id = int(PatientData['returnXrayTestPatient_Id']))
                xray_dbParam['patient_type'] = patient_type

                Xray_Obj = XrayForWardPatient.objects.get(id = int(PatientData['returnXrayTestPatient_Id']))
                Xray_Obj.xray_checked = True
                Xray_Obj.save()

                AssignObj.total += int(XrayObj_amount)
                AssignObj.balance += int(XrayObj_amount)
                if AssignObj.balance == 0:
                    AssignObj.payment_pending = False
                else:
                    AssignObj.payment_pending = True
                AssignObj.save()
            
            XrayForPatient.objects.create(**xray_dbParam)

            Latest_xrayfp_Obj = XrayForPatient.objects.latest('id')

            for xd in XrayData:

                xray_obj = Xray.objects.get(id = int(xd))

                xd_db_param = {
                    "xray_for_patient" : Latest_xrayfp_Obj,
                    "xray" : xray_obj,
                }

                XrayTakenByPatient.objects.create(**xd_db_param)



            messages.success(request , "Successful")
            return JsonResponse({"status":"success"},status=200)    

    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)   


class CancelXray(View):
    def post(self , request):
         data = request.body
         if data:
            patient_type = json.loads(data)['patient_type']
            cancelingXray = json.loads(data)['canceling_xray']


            if patient_type == 'Out Patient':
                XrayForOutPatient.objects.filter(id = int(cancelingXray)).update(xray_canceled = True)

            if patient_type == 'In Patient':
                XrayForINPatient.objects.filter(id = int(cancelingXray)).update(xray_canceled = True)

            if patient_type == 'Ward Patient':
                XrayForWardPatient.objects.filter(id = int(cancelingXray)).update(xray_canceled = True)

            print(patient_type)


            messages.success(request , "Xray Canceled")
            return JsonResponse({"status":"success"},status=200)    


    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class Get_XrayTest_Data(View):

    def get(self , request):

        today = datetime.now().date()
        tomorrow = today + timedelta(1)
        today_start = datetime.combine(today, time())
        today_end = datetime.combine(tomorrow, time())

        def get_xrayDetails_from_appointment_data_out():
            xrayDetails_from_appointment_data_out = []
            AppointmentObj = Appointment.objects.filter(status = False)
            for r in AppointmentObj :

                XrayObj = XrayForOutPatient.objects.filter(appointment = r).filter(xray_test_date__lte = today_end).filter(xray_test_date__gte=today_start).filter(xray_checked = False).filter(xray_canceled = False).all()

                for ht in XrayObj:
                    xray_details = []

                    for xd in ht.xray_test:

                        XrayObj = Xray.objects.filter(id = int(xd)).all()

                        for obj in XrayObj:
                            x_data = {
                                'id' : obj.id,
                                'xray_name' : obj.name,
                            }

                            xray_details.append(x_data)

                    currentdate = datetime.now().date() - ht.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30

                    data = {
                        'id' : ht.id,
                        'admission_id' : ht.appointment.id,
                        'patient_id' : ht.patient.id,
                        'patient_name' : ht.patient.name,
                        'doctor_name'  : ht.appointment.doctor.name,
                        'xray_details' : xray_details,
                        'patient_age'   : age,
                        'patient_gender' : ht.patient.gender
                    }

                    xrayDetails_from_appointment_data_out.append(data)

            return xrayDetails_from_appointment_data_out

        def get_xrayDetails_from_appointment_data_in():
            xrayDetails_from_appointment_data_in = []
            AssignObj = AssignRooms.objects.filter(status = False)
            for r in AssignObj :

                XrayObj = XrayForINPatient.objects.filter(assignroom = r).filter(xray_checked = False).filter(xray_canceled = False).all()

                for ht in XrayObj:
                    xray_details = []

                    for xd in ht.xray_test:

                        XrayObj = Xray.objects.filter(id = int(xd)).all()

                        for obj in XrayObj:
                            x_data = {
                                'id' : obj.id,
                                'xray_name' : obj.name,
                            }

                            xray_details.append(x_data)

                    currentdate = datetime.now().date() - ht.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30

                    data = {
                        'id' : ht.id,
                        'admission_id' : ht.assignroom.id,
                        'patient_id' : ht.patient.id,
                        'patient_name' : ht.patient.name,
                        'doctor_name'  : ht.doctor_checkup.doctor.name,
                        'xray_details' : xray_details,
                        'patient_age'   : age,
                        'patient_gender' : ht.patient.gender
                    }

                    xrayDetails_from_appointment_data_in.append(data)

            return xrayDetails_from_appointment_data_in
              
        def get_xrayDetails_from_appointment_data_ward():
            xrayDetails_from_appointment_data_ward = []
            AssignObj = AssignWard.objects.filter(status = False)
            for r in AssignObj :

                XrayObj = XrayForWardPatient.objects.filter(assignward = r).filter(xray_checked = False).filter(xray_canceled = False).all()

                for ht in XrayObj:
                    xray_details = []

                    for xd in ht.xray_test:

                        XrayObj = Xray.objects.filter(id = int(xd)).all()

                        for obj in XrayObj:
                            x_data = {
                                'id' : obj.id,
                                'xray_name' : obj.name,
                            }

                            xray_details.append(x_data)

                    currentdate = datetime.now().date() - ht.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30

                    data = {
                        'id' : ht.id,
                        'admission_id' : ht.assignward.id,
                        'patient_id' : ht.patient.id,
                        'patient_name' : ht.patient.name,
                        'doctor_name'  : ht.doctor_checkup.doctor.name,
                        'xray_details' : xray_details,
                        'patient_age'   : age,
                        'patient_gender' : ht.patient.gender
                    }

                    xrayDetails_from_appointment_data_ward.append(data)

            return xrayDetails_from_appointment_data_ward


        XrayDetailsFromAppointmentData_out = get_xrayDetails_from_appointment_data_out()
        XrayDetailsFromAppointmentData_in = get_xrayDetails_from_appointment_data_in()
        XrayDetailsFromAppointmentData_ward = get_xrayDetails_from_appointment_data_ward()


        context = {
            'xray_from_appointmentdata_out' : XrayDetailsFromAppointmentData_out , 
            'xray_from_appointmentdata_in' : XrayDetailsFromAppointmentData_in , 
            'xray_from_appointmentdata_ward' : XrayDetailsFromAppointmentData_ward , 
            'xrayforpatientdata' : get_xray_for_patient_data() , 

        }

        return JsonResponse(context , safe = False)


class XrayPayment(View):

    def post(self , request):

        data = request.body
        if data :
            xray_payment_data = json.loads(data)['xray_payment_data'][0]

            patient_type = xray_payment_data['patient_type']
            PatientObj = Patient.objects.get(id = int(xray_payment_data['patient_id']))

            if patient_type == 'Out Patient':

                op_obj = Appointment.objects.get(id = int(xray_payment_data['OP_appointmentid']))

                if op_obj.initially_paid == True:
                    messages.info(request , "You Already Paid In Reception")
                    return JsonResponse({"status":"info"},status=200) 

                else:
                    try:

                        xrayobj =  XrayForPatient.objects.get(id = int(xray_payment_data['XrayTestId']))
                        op_payment_data =  OutPatient_Payments.objects.get(appointment = op_obj.id)

                        if xrayobj.initially_paid == False:
                            op_payment_data.total += xray_payment_data['total']
                            op_payment_data.xray += xray_payment_data['total']
                            op_existing_balance = op_payment_data.total
                        else:   
                            op_existing_balance = op_payment_data.balance

                        op_payment_data.payment_recived_by_xray += xray_payment_data['paid']
                        op_payment_data.paid += xray_payment_data['paid']
                        op_payment_data.total_after_discount = op_payment_data.total -  op_payment_data.discount
                        op_payment_data.balance = op_payment_data.total - op_payment_data.paid - op_payment_data.discount
                        op_payment_data.cash += xray_payment_data['cash']
                        op_payment_data.card += xray_payment_data['card']
                        op_payment_data.upi += xray_payment_data['upi']
                        op_payment_data.save()

                        OutPatientPaymentTransactionDB = OutPatient_PaymentTransactions(
                            user = request.user,
                            department = 'Xray',
                            op_payment = op_payment_data,
                            appointment = op_obj,
                            patient = PatientObj,
                            total = op_payment_data.total,
                            existing_balance = op_existing_balance,
                            paid = xray_payment_data['paid'],
                            balance = op_payment_data.balance,
                            cash = xray_payment_data['cash'],
                            upi = xray_payment_data['upi'],
                            card = xray_payment_data['card'],
                        )

                        OutPatientPaymentTransactionDB.save()

                        

                        existing_balance = xrayobj.balance
                        print("Xray Data OP = ",xray_payment_data)                        
                        print("OP Existing Balance = ",existing_balance)

                        xrayobj.cash = xrayobj.cash + xray_payment_data['cash']
                        xrayobj.upi = xrayobj.upi + xray_payment_data['upi']
                        xrayobj.card = xrayobj.card + xray_payment_data['card']

                        xrayobj.balance = xray_payment_data['balance']
                        xrayobj.initially_paid = True 
                        xrayobj.save()

                        XrayPaymentTransactionDB = XrayPaymentTransaction(
                            user = request.user,
                            appointment = op_obj,
                            patient_type = patient_type,
                            xray_for_patient = xrayobj,
                            patient = PatientObj,
                            total = xray_payment_data['total'],
                            existing_balance = existing_balance,
                            paid = xray_payment_data['paid'],
                            balance = xray_payment_data['balance'],
                            cash = xray_payment_data['cash'],
                            upi = xray_payment_data['upi'],
                            card = xray_payment_data['card'],
                        )

                        XrayPaymentTransactionDB.save()

                        messages.success(request , "Successful")
                        return JsonResponse({"status":"info"},status=200)  

                    except:
                        messages.info(request , "Something Wrong")
                        return JsonResponse({"status":"info"},status=200)  

            
            if patient_type == 'In Patient':

                ip_obj = AssignRooms.objects.get(id = int(xray_payment_data['IP_assignid']))

                ip_payment_db_param = {
                    'assignroom' : ip_obj,
                    'patient' : PatientObj,
                    'payment_recived_by_xray' : xray_payment_data['paid'],
                    'xray' : xray_payment_data['total'],
                    'total' : xray_payment_data['total'],
                    'total_after_discount' : xray_payment_data['total'],
                    'paid' : xray_payment_data['paid'],
                    'balance' : xray_payment_data['balance'],
                    'cash' : xray_payment_data['cash'],
                    'upi' : xray_payment_data['upi'],
                    'card' : xray_payment_data['card'],
                }

                xrayobj =  XrayForPatient.objects.get(id = int(xray_payment_data['XrayTestId']))

                try:
                        
                    ip_payment =  IN_Patient_Payments.objects.get(assignroom = ip_obj.id )

                    if xrayobj.initially_paid == False:
                        ip_payment.total += xray_payment_data['total']
                        ip_payment.xray += xray_payment_data['total']
                        ip_existing_balance = ip_payment.total
                    else:
                        ip_existing_balance = ip_payment.balance

                    ip_payment.payment_recived_by_xray += xray_payment_data['paid']
                    ip_payment.paid += xray_payment_data['paid']
                    ip_payment.total_after_discount = ip_payment.total -  ip_payment.discount
                    ip_payment.balance = ip_payment.total - ip_payment.paid - ip_payment.discount
                    ip_payment.cash += xray_payment_data['cash']
                    ip_payment.upi += xray_payment_data['upi']
                    ip_payment.card += xray_payment_data['card']
                    ip_payment.save()

                    IN_PatientPaymentTransactionDB = IN_Patient_PaymentTransactions(
                        user = request.user,
                        department = 'Xray',
                        ip_payment = ip_payment,
                        assignroom = ip_obj,
                        patient = PatientObj,
                        total = ip_payment.total,
                        existing_balance = ip_existing_balance,
                        paid = xray_payment_data['paid'],
                        balance = ip_payment.balance,
                        cash = xray_payment_data['cash'],
                        upi = xray_payment_data['upi'],
                        card = xray_payment_data['card'],
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
                        department = 'Xray',
                        ip_payment = LatestObj,
                        assignroom = ip_obj,
                        patient = PatientObj,
                        total = xray_payment_data['total'],
                        existing_balance = xray_payment_data['total'],
                        paid = xray_payment_data['paid'],
                        balance = xray_payment_data['balance'],
                        cash = xray_payment_data['cash'],
                        upi = xray_payment_data['upi'],
                        card = xray_payment_data['card'],
                    )
                    IN_PatientPaymentTransactionDB.save()

                    ip_obj.paid = xray_payment_data['paid']
                    ip_obj.balance = ip_obj.total - ip_obj.paid
                    if ip_obj.balance == 0:
                        ip_obj.payment_pending = False
                    else:
                        ip_obj.payment_pending = True
                    ip_obj.save()


                existing_balance = xrayobj.balance
                print("Xray Data IP = ",xray_payment_data)                        
                print("IP Existing Balance = ",existing_balance)
                xrayobj.cash = xrayobj.cash + xray_payment_data['cash']
                xrayobj.upi = xrayobj.upi + xray_payment_data['upi']
                xrayobj.card = xrayobj.card + xray_payment_data['card']

                xrayobj.balance = xray_payment_data['balance']
                xrayobj.initially_paid = True  
                xrayobj.save()

                XrayPaymentTransactionDB = XrayPaymentTransaction(
                    user = request.user,
                    assignroom = ip_obj,
                    patient_type = patient_type,
                    xray_for_patient = xrayobj,
                    patient = PatientObj,
                    total = xray_payment_data['total'],
                    existing_balance = existing_balance,
                    paid = xray_payment_data['paid'],
                    balance = xray_payment_data['balance'],
                    cash = xray_payment_data['cash'],
                    upi = xray_payment_data['upi'],
                    card = xray_payment_data['card'],
                )

                XrayPaymentTransactionDB.save()

                messages.success(request , "Successful")
                return JsonResponse({"status":"info"},status=200)
           
        
            if patient_type == 'Ward Patient':

                ward_obj = AssignWard.objects.get(id = int(xray_payment_data['Ward_assignid']))

                ward_payment_db_param = {
                    'assignward' : ward_obj,
                    'patient' : PatientObj,
                    'payment_recived_by_xray' : xray_payment_data['paid'],
                    'xray' : xray_payment_data['total'],
                    'total' : xray_payment_data['total'],
                    'total_after_discount' : xray_payment_data['total'],
                    'paid' : xray_payment_data['paid'],
                    'balance' : xray_payment_data['balance'],
                    'cash' : xray_payment_data['cash'],
                    'upi' : xray_payment_data['upi'],
                    'card' : xray_payment_data['card'],
                }

                xrayobj =  XrayForPatient.objects.get(id = int(xray_payment_data['XrayTestId']))

                try:
                    ward_payment =  Ward_Patient_Payments.objects.get(assignward = ward_obj.id )
                    if xrayobj.initially_paid == False:
                        ward_payment.total += xray_payment_data['total']
                        ward_payment.xray += xray_payment_data['total']
                        ward_existing_balance = ward_payment.total
                    else:
                        ward_existing_balance = ward_payment.balance

                    ward_payment.payment_recived_by_xray += xray_payment_data['paid']
                    ward_payment.paid += xray_payment_data['paid']
                    ward_payment.total_after_discount = ward_payment.total -  ward_payment.discount
                    ward_payment.balance = ward_payment.total - ward_payment.paid  - ward_payment.discount
                    ward_payment.cash += xray_payment_data['cash']
                    ward_payment.upi += xray_payment_data['upi']
                    ward_payment.card += xray_payment_data['card']
                    ward_payment.save()

                    Ward_PatientPaymentTransactionDB = Ward_Patient_PaymentTransactions(
                        user = request.user,
                        department = 'Xray',
                        ward_payment = ward_payment,
                        assignward = ward_obj,
                        patient = PatientObj,
                        total = ward_payment.total,
                        existing_balance = ward_existing_balance,
                        paid = xray_payment_data['paid'],
                        balance = ward_payment.balance,
                        cash = xray_payment_data['cash'],
                        upi = xray_payment_data['upi'],
                        card = xray_payment_data['card'],
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
                        department = 'Xray',
                        ward_payment = LatestObj,
                        assignward = ward_obj,
                        patient = PatientObj,
                        total = xray_payment_data['total'],
                        existing_balance = xray_payment_data['total'],
                        paid = xray_payment_data['paid'],
                        balance = xray_payment_data['balance'],
                        cash = xray_payment_data['cash'],
                        upi = xray_payment_data['upi'],
                        card = xray_payment_data['card'],
                    )
                    Ward_PatientPaymentTransactionDB.save()

                    ward_obj.paid = xray_payment_data['paid']
                    ward_obj.balance = ward_obj.total - ward_obj.paid
                    if ward_obj.balance == 0:
                        ward_obj.payment_pending = False
                    else:
                        ward_obj.payment_pending = True
                    ward_obj.save()
                    
                existing_balance = xrayobj.balance
                print("Xray Data Ward = ",xray_payment_data)                        
                print("Ward Existing Balance = ",existing_balance)
                xrayobj.cash = xrayobj.cash + xray_payment_data['cash']
                xrayobj.upi = xrayobj.upi + xray_payment_data['upi']
                xrayobj.card = xrayobj.card + xray_payment_data['card']

                xrayobj.balance = xray_payment_data['balance']
                xrayobj.initially_paid = True  
                xrayobj.save()

                XrayPaymentTransactionDB = XrayPaymentTransaction(
                    user = request.user,
                    assignward = ward_obj,
                    patient_type = patient_type,
                    xray_for_patient = xrayobj,
                    patient = PatientObj,
                    total = xray_payment_data['total'],
                    existing_balance = existing_balance,
                    paid = xray_payment_data['paid'],
                    balance = xray_payment_data['balance'],
                    cash = xray_payment_data['cash'],
                    upi = xray_payment_data['upi'],
                    card = xray_payment_data['card'],
                )

                XrayPaymentTransactionDB.save()

                messages.success(request , "Successful")
                return JsonResponse({"status":"info"},status=200)


    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)




class PatientXrayReportView(View):
    template_name = "patient_xray_report.html"

    def get(self , request , id):

        def get_patient_data():
            patient_data = []

            try:
                XrayForPatientObj = XrayForPatient.objects.get(id = id)
                currentdate = datetime.now().date() - XrayForPatientObj.patient.dob
                age = currentdate.days//365
                month = (currentdate.days - age *365) // 30

                print(XrayForPatientObj.patient_type)

                if  XrayForPatientObj.patient_type == 'Out Patient':

                    doctor_name = XrayForPatientObj.appointment.doctor.name

                elif  XrayForPatientObj.patient_type == 'In Patient':

                    doctor_name = XrayForPatientObj.ip_xray_test.doctor_checkup.doctor.name

                elif  XrayForPatientObj.patient_type == 'Ward Patient':

                    doctor_name = XrayForPatientObj.ward_xray_test.doctor_checkup.doctor.name

                else:
                    doctor_name = ''

                data = {
                    'id' : XrayForPatientObj.id,
                    'patient_id' : XrayForPatientObj.patient.id,
                    'patient_name' : XrayForPatientObj.patient.name,
                    'patient_age' : age,
                    'patient_gender' : XrayForPatientObj.patient.gender,
                    'test_date' : XrayForPatientObj.created_time,
                    'patient_phone' : XrayForPatientObj.patient.phone,
                    'patient_address' : XrayForPatientObj.patient.address,
                    'doctor_name' : doctor_name
                }

                patient_data.append(data)

            except XrayForPatientObj.DoesNotExist:
                patient_data = []

            return patient_data


        def get_patient_xray_report_data():
            PatientXrayReportData = []

            try:
                PatientXrayReportObj = XrayTakenByPatient.objects.filter(xray_for_patient = id).all()
                
                for ht in PatientXrayReportObj:
                    data = {
                        'id' : ht.id,
                        'xray_name' : ht.xray.name,
                        'xray_id' : ht.xray.id,
                    }
                    
                    PatientXrayReportData.append(data)

            except PatientXrayReportObj.DoesNotExist:
                PatientXrayReportData = []

            return PatientXrayReportData

      

        context = {
            "xraydata" :json.dumps( get_xray_data() , cls = DefaultEncoder),
            "patientxrayreportdata" : json.dumps(get_patient_xray_report_data() , cls = DefaultEncoder),
            "patientdata" : json.dumps(get_patient_data() , cls = DefaultEncoder),
        }

        return render(request , self.template_name , context)

    
    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)




class PatientPaymentReportView(View):
    template_name = "patient_xray_payment_report.html"

    def get(self , request , id):

        xray_data = []
        patient_data = []



        try:
            xray_obj = XrayForPatient.objects.get(id = id)

            currentdate = datetime.now().date() - xray_obj.patient.dob
            age = currentdate.days//365
            month = (currentdate.days - age *365) // 30

            print(xray_obj.patient_type)

            if xray_obj.patient_type == 'Out Patient':
                appoint_id =  xray_obj.appointment.id
            else: 
                appoint_id =  xray_obj.assignroom.id

            patient_data = [{

                'appoint_id' : appoint_id,
                'patient_type' : xray_obj.patient_type,
                'patient_id' : xray_obj.patient.id,
                'patient_name' : xray_obj.patient.name,
                'patient_age' : age,
                'patient_gender' : xray_obj.patient.gender,
                'total' : xray_obj.total_amount,                   
                'discount' : 0,
                'paid' : 0,
                'cash' : xray_obj.cash,
                'card' : xray_obj.card,
                'upi' : xray_obj.upi,
                'balance' : xray_obj.balance,
                'test_date' : xray_obj.created_time,
            }]

            for i in XrayTakenByPatient.objects.filter(xray_for_patient = xray_obj):
                data = {
                    'xray_name' : i.xray.name,
                    'xray_amount' : i.xray.amount,
                }
                xray_data.append(data)

        except XrayForPatient.DoesNotExist:
            xray_data = []
            patient_data = []

        print(xray_data)     
        xray_details = reduce(lambda re, x: re+[x] if x not in re else re, xray_data, [])

        context = {
            "xray_details" : json.dumps(xray_details, cls = DefaultEncoder),
            "patient_data" : json.dumps(patient_data, cls = DefaultEncoder),
        }

        return render(request , self.template_name , context)

    
    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)
