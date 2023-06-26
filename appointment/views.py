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
from django.db.models import Sum

from django.shortcuts import render
from django.conf import settings
from django.core.files.storage import FileSystemStorage

from hospital.models import Role
from patient.models import Patient
from doctor.models import Doctor
from appointment.models import Appointment , DoctorCheckupAmount ,  LabTestForOutPatient , XrayForOutPatient, ScanForOutPatient,OutPatient_Payments , OutPatient_PaymentTransactions , Transfer_TO_IP , OP_UploadedReportsFiles
from room.models import AssignRooms ,Rooms
from lab.models import LabTestForPatient  , LabGroup

from xray.models import XrayForPatient
from scan.models import ScanForPatient

from hospital.helpers import get_doctor_data , get_appointment_data

from configuration.models import AppConfiguration

from lint_hospital.encoders import DefaultEncoder

# Create your views here.

class AppointmentView(View):
    template_name = "add_appointment.html"



    def get(self , request):

        def get_group_data():
            group_data = []

            LabGroupObj = LabGroup.objects.filter(status = True).all()

            for ht in LabGroupObj:
                data = {
                    'id' : ht.id,
                    'name' : ht.name,
                    'amount' : ht.amount,
                    'category' : ht.category.name,
                    'description' : ht.description
                }

                group_data.append(data)

            return group_data

        DoctorData = get_doctor_data()
        context = {
            'groupdata' : json.dumps(get_group_data()),
            'doctordata' : json.dumps(DoctorData , cls = DefaultEncoder),
            "configuration" : AppConfiguration.objects.all().first(),
            
        }

        return render(request , self.template_name , context)


    def post(self , request):

        AppointmentId = request.POST.get("appointmentId")
        PatientObj = Patient.objects.get(id = int(request.POST.get("patientId")))

        if(request.POST.get('is_emergency_val') == 'true'):
            IsEmergency = True
        else:
            IsEmergency = False

        appointment_db_param = {
            "patient" : PatientObj,
            "bp" : request.POST.get("bp"),
            "pulse" : request.POST.get("pulse"),
            "temperature" : request.POST.get("temperature"),
            "rr" : request.POST.get("rr"),
            "sp_o2" : request.POST.get("sp_o2"),
            "blood_sugar" : request.POST.get("blood_sugar"),
            "reason" :request.POST.get("reason"),
            "is_emergency" : IsEmergency,
            "health_checkup_details" : json.loads(request.POST.get('health_checkup_master_created')),

        }

        if AppointmentId == '0':
            DoctorObj = Doctor.objects.get(id = int(request.POST.get("doctor")))
            appointment_db_param['doctor'] = DoctorObj
            appointment_db_param['appointment_date'] = datetime.now()
            Appointment.objects.create(**appointment_db_param)
            messages.success(request , "Appointment Created Successfully")
            if request.POST.get("from_op") == 'from_appointment' :
                return redirect('appointment')
            else:
                return redirect("patient") 

        else:
            Appointment.objects.filter(id = AppointmentId).update(**appointment_db_param)
            messages.success(request , "Appointment Updated Successfully")
            if request.POST.get("from_op") == 'from_appointment' :
                return redirect('appointment')
            else:
                return redirect("patient")     


    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

class GetDoctorData(View):
    def get(self , request):
        context = {'doctordata' : get_doctor_data(),}
        return JsonResponse(context , safe = False)

    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class GetAppointmentData(View):
    def get(self , request):

        today = datetime.now().date()
        tomorrow = today + timedelta(1)
        today_start = datetime.combine(today, time())
        today_end = datetime.combine(tomorrow, time())

        Appointment.objects.filter(checkup = 0).filter(appointment_date__lt = today_start).update(checkup = 2)

        AppointmentData = get_appointment_data()
        context = {
            'appointmentdata' : AppointmentData
        }

        return JsonResponse(context , safe = False)


class GetTodaysAppointmentData(View):
    def get(self , request):

        appointment_data = []

        today = datetime.now().date()
        tomorrow = today + timedelta(1)
        today_start = datetime.combine(today, time())
        today_end = datetime.combine(tomorrow, time())

        AppointmentObj = Appointment.objects.filter(appointment_date__lte = today_end).filter(appointment_date__gte=today_start).all()
        # AppointmentObj = Appointment.objects.all()

        for ht in AppointmentObj:

            currentdate = datetime.now().date() - ht.patient.dob

            age = currentdate.days//365
            month = (currentdate.days - age *365) // 30
            total_amount = 0

            try:
                op_patment = OutPatient_Payments.objects.get(appointment = ht)
                total_amount = op_patment.total
            except:
                total_amount = 0 


            data = {
                'id' : ht.id,
                'patient_id' : ht.patient.id,
                'patient_name' : ht.patient.name,
                'patient_age' : age,
                'patient_month' : month,
                'patient_gender' : ht.patient.gender,
                'patient_phone' : ht.patient.phone,
                'patient_place' : ht.patient.address,
                'pos_id' : ht.patient.pos_id,
                'bp' : ht.bp,
                'pulse' : ht.pulse,
                'temperature' : ht.temperature,
                'rr' : ht.rr,
                'sp_o2' : ht.sp_o2,
                'blood_sugar' : ht.blood_sugar,
                'reason' : ht.reason,
                'doctor_id' : ht.doctor.id,
                'has_lab' : ht.has_lab,
                'has_xray' : ht.has_xray,
                'has_scan' : ht.has_scan,
                'doctor_name' : ht.doctor.name,
                'appointment_date' : str(ht.appointment_date),
                'checkup' : ht.checkup,
                'initially_paid' : str(ht.initially_paid),
                'payment_pending' : str(ht.payment_pending),
                'status' : ht.status,
                'is_emergency' : str(ht.is_emergency),
                'health_checkup_details' : ht.health_checkup_details,
                'total_amount' : total_amount

            }
            appointment_data.append(data)

        context = {
            'appointmentdata' : appointment_data
        }

        return JsonResponse(context , safe = False)


class GetPendingPaymentForOpData(View):
    def get(self , request):

        appointment_data = []

        today = datetime.now().date()
        tomorrow = today + timedelta(1)
        today_start = datetime.combine(today, time())
        today_end = datetime.combine(tomorrow, time())

        AppointmentObj = Appointment.objects.filter(appointment_date__lt = today_start).filter(checkup = 1).filter(payment_pending = True).all()
        # AppointmentObj = Appointment.objects.filter(checkup = 1).filter(payment_pending = True).all()

        for ht in AppointmentObj:

            currentdate = datetime.now().date() - ht.patient.dob

            age = currentdate.days//365
            month = (currentdate.days - age *365) // 30

            total_amount = 0
            balance_amount = 0

            try:
                op_patment = OutPatient_Payments.objects.get(appointment = ht)
                total_amount = op_patment.total
                balance_amount = op_patment.balance
            except:
                total_amount = 0 
                balance_amount = 0 

            data = {
                'id' : ht.id,
                'patient_id' : ht.patient.id,
                'patient_name' : ht.patient.name,
                'patient_age' : age,
                'patient_month' : month,
                'patient_gender' : ht.patient.gender,
                'patient_phone' : ht.patient.phone,
                'patient_place' : ht.patient.address,
                'pos_id' : ht.patient.pos_id,
                'bp' : ht.bp,
                'pulse' : ht.pulse,
                'temperature' : ht.temperature,
                'rr' : ht.rr,
                'sp_o2' : ht.sp_o2,
                'blood_sugar' : ht.blood_sugar,
                'reason' : ht.reason,
                'doctor_id' : ht.doctor.id,
                'has_lab' : ht.has_lab,
                'has_xray' : ht.has_xray,
                'has_scan' : ht.has_scan,
                'doctor_name' : ht.doctor.name,
                'appointment_date' : str(ht.appointment_date),
                'checkup' : ht.checkup,
                'initially_paid' : str(ht.initially_paid),
                'payment_pending' : str(ht.payment_pending),
                'status' : ht.status,
                'health_checkup_details' : ht.health_checkup_details,
                'total_amount' : total_amount,
                'balance_amount' : balance_amount,

            }
            appointment_data.append(data)

        context = {
            'appointmentdata' : appointment_data
        }

        return JsonResponse(context , safe = False)



class GetAmountData(View):
    def get(self , request):
        Appointment_id =  Appointment.objects.get(id = int(request.GET.get('appointment_id'))) 

        today = datetime.now().date()
        tomorrow = today + timedelta(1)
        today_start = datetime.combine(today, time())
        today_end = datetime.combine(tomorrow, time())

        lab_obj = LabTestForOutPatient.objects.filter(appointment = Appointment_id).filter(lab_checked = False).filter(lab_canceled = False)
        xray_obj = XrayForOutPatient.objects.filter(appointment = Appointment_id).filter(xray_checked = False).filter(xray_canceled = False)
        scan_obj = ScanForOutPatient.objects.filter(appointment = Appointment_id).filter(scan_checked = False).filter(scan_canceled = False)

        try:
            lab_amount = 0
            balance_lab_amount = 0
            for ht in LabTestForPatient.objects.filter(appointment = Appointment_id.id):
                lab_amount += ht.total_amount 
                balance_lab_amount += ht.balance 

        except:
            lab_amount = 0  
            balance_lab_amount = 0  

        try:
            xray_amount = 0
            balance_xray_amount = 0
            for ht in XrayForPatient.objects.filter(appointment = Appointment_id):
                xray_amount += ht.total_amount
                balance_xray_amount += ht.balance

        except:
            xray_amount = 0

        try:
            scan_amount = 0
            balance_scan_amount = 0
            for ht in ScanForPatient.objects.filter(appointment = Appointment_id):
                scan_amount += ht.total_amount
                balance_scan_amount += ht.balance

        except:
            scan_amount = 0


        try:
            op_payment_data = OutPatient_Payments.objects.filter(appointment = Appointment_id)
            op_data = {}
            charge_details = {}
            payment_data = {}
            for ht in op_payment_data:

                op_data = {
                    'op_payment_id': ht.id,
                    'payment_recived_by_doctor' : ht.payment_recived_by_doctor,
                    'doctor_check' : ht.doctor_check,
                    'doctor_fees': ht.doctor_fees,
                    'injection': ht.injection,
                    'one_touch': ht.one_touch,
                    'dressing': ht.dressing,
                    'others': ht.others,
                    'neb': ht.neb,
                    'lab': ht.lab,
                    'xray': ht.xray,
                    'scan': ht.scan,

                    'total_amount': ht.total,
                    'discount': ht.discount,
                    'total_after_discount': ht.total_after_discount,
                    'refund': ht.refund,
                    'total_after_refund': ht.total_after_refund,
                    'payment_recived_by_lab': ht.payment_recived_by_lab,
                    'already_paid': ht.paid,
                    'balance': ht.balance,
                    
                    'cash' : ht.cash,
                    'upi'  : ht.upi,
                    'card' : ht.card
                }
        
            for ht in op_payment_data:

                charge_details = {

                    'doctor_fees': ht.doctor_fees,
                    'injection': ht.injection,
                    'one_touch': ht.one_touch,
                    'dressing': ht.dressing,
                    'others': ht.others,
                    'neb': ht.neb,
                    'laboratory_charges': ht.lab,
                    'xray_Charges': ht.xray,
                    'scan_Charges': ht.scan,
                }
                payment_data = {
                    'cash' : ht.cash,
                    'upi'  : ht.upi,
                    'debit_card' : ht.card
                }
        
        
        except:
            op_data = {}
            charge_details = {}
            payment_data = {}

        overall_amount = {
            'lab_amount': lab_amount,
            'balance_lab_amount': balance_lab_amount,
            'xray_amount': xray_amount,
            'balance_xray_amount': balance_xray_amount,
            'scan_amount': scan_amount,
            'balance_scan_amount': balance_scan_amount,
            'op_payment_data': op_data,
            'charge_details': charge_details,
            'payment_data': payment_data,
        }
       
        context = {
            'appointment_amount' : overall_amount,
            'lab_length' : len(lab_obj),
            'xray_length' : len(xray_obj),
            'scan_length' : len(scan_obj),
        }

        return JsonResponse(context , safe = False) 


class OutPatientPaymentView(View):

    def post(self , request):     
        
        data = request.body

        if(data):

            PaymentData = json.loads(data)['PaymentData'][0]

            AppointmentId = PaymentData['appointment_id']
            PatientId = PaymentData['patient_id']

            AppointmentObj = Appointment.objects.get(id = AppointmentId)
            PatientObj = Patient.objects.get(id = PatientId)


            FirstPayment = PaymentData['first_payment']


            if FirstPayment == 'True':

                OutPatientPaymentData = OutPatient_Payments.objects.get(id = PaymentData['outPatientPaymentId'])

                OutPatientPaymentData.doctor_fees = PaymentData['doctor_fees']
                OutPatientPaymentData.neb = PaymentData['neb']
                OutPatientPaymentData.dressing = PaymentData['dressing']
                OutPatientPaymentData.injection = PaymentData['injection']
                OutPatientPaymentData.one_touch = PaymentData['one_touch']
                OutPatientPaymentData.others  = PaymentData['others']
                OutPatientPaymentData.lab = PaymentData['lab']
                OutPatientPaymentData.xray = PaymentData['xray']
                OutPatientPaymentData.scan = PaymentData['scan']

                OutPatientPaymentData.lab = PaymentData['lab']
                OutPatientPaymentData.xray = PaymentData['xray']
                OutPatientPaymentData.scan = PaymentData['scan']
                OutPatientPaymentData.total = PaymentData['total']
                OutPatientPaymentData.discount += PaymentData['discount']
                OutPatientPaymentData.refund += PaymentData['refund']
                OutPatientPaymentData.refund_type = PaymentData['refund_type']
                OutPatientPaymentData.refund_note = PaymentData['refund_note']
                OutPatientPaymentData.total_after_discount = OutPatientPaymentData.total - OutPatientPaymentData.discount
                OutPatientPaymentData.total_after_refund = OutPatientPaymentData.total - OutPatientPaymentData.refund

                OutPatientPaymentData.paid += PaymentData['paid']
                OutPatientPaymentData.cash += PaymentData['cash']
                OutPatientPaymentData.upi += PaymentData['upi']
                OutPatientPaymentData.card += PaymentData['card']
                OutPatientPaymentData.balance = PaymentData['balance']
                OutPatientPaymentData.save()

                AppointmentObj.initially_paid = True
                AppointmentObj.status = True
                AppointmentObj.save()
        
           
            if FirstPayment == 'False':

                OutPatientPaymentData = OutPatient_Payments.objects.get(id = PaymentData['outPatientPaymentId'])
                OutPatientPaymentData.discount += PaymentData['discount']
                OutPatientPaymentData.refund += PaymentData['refund']
                OutPatientPaymentData.total_after_discount = OutPatientPaymentData.total - OutPatientPaymentData.discount
                OutPatientPaymentData.total_after_refund = OutPatientPaymentData.total - OutPatientPaymentData.refund
                OutPatientPaymentData.paid += PaymentData['paid']
                OutPatientPaymentData.cash += PaymentData['cash']
                OutPatientPaymentData.upi += PaymentData['upi']
                OutPatientPaymentData.card += PaymentData['card']
                OutPatientPaymentData.balance = PaymentData['balance']
                OutPatientPaymentData.save()

            OutPatientPaymentTransactionDB = OutPatient_PaymentTransactions(
                user = request.user,
                department = 'Reception',
                op_payment = OutPatientPaymentData,
                appointment = AppointmentObj,
                patient = PatientObj,
                total = PaymentData['total'],
                discount = PaymentData['discount'],
                refund = PaymentData['refund'],
                total_after_discount = (PaymentData['total'] - PaymentData['discount'] ),
                total_after_refund = (PaymentData['total'] - PaymentData['refund'] ),
                existing_balance = PaymentData['existing_balance'],
                paid = PaymentData['paid'],
                balance = PaymentData['balance'],
                cash = PaymentData['cash'],
                upi = PaymentData['upi'],
                card = PaymentData['card'],
            )

            OutPatientPaymentTransactionDB.save()


            for obj in LabTestForPatient.objects.filter(appointment = AppointmentObj):
                if ((obj.balance <= int(PaymentData['paid'])) or (int(PaymentData['balance']) == 0)):

                    if obj.complete == False:
                        if int (PaymentData['cash']) > 0:
                            obj.cash = obj.total_amount
                        else:
                            if int (PaymentData['upi']) >= int (PaymentData['card']):
                                obj.upi = obj.total_amount
                            else:
                                obj.card = obj.total_amount
                        obj.complete = True
                        obj.balance = 0
                        obj.save()
                        op_lab_obj = obj.op_lab_test
                        print("-------------------------------------------------")
                        print("op_lab_obj ============================",op_lab_obj)
                        print("-------------------------------------------------")

                        if not(op_lab_obj == None):
                            op_lab_obj.payment_complete = 2
                            op_lab_obj.save()
            
            for obj in XrayForPatient.objects.filter(appointment = AppointmentObj):
                if ((obj.balance <= int(PaymentData['paid'])) or (int(PaymentData['balance']) == 0)):
                    if obj.complete == False:
                        if int (PaymentData['cash']) > 0:
                            obj.cash = obj.total_amount
                        else:
                            if int (PaymentData['upi']) >= int (PaymentData['card']):
                                obj.upi = obj.total_amount
                            else:
                                obj.card = obj.total_amount
                        obj.complete = True
                        obj.balance = 0
                        obj.save()
            
            for obj in ScanForPatient.objects.filter(appointment = AppointmentObj):
                if ((obj.balance <= int(PaymentData['paid'])) or (int(PaymentData['balance']) == 0)):
                    if obj.complete == False:
                        if int (PaymentData['cash']) > 0:
                            obj.cash = obj.total_amount
                        else:
                            if int (PaymentData['upi']) >= int (PaymentData['card']):
                                obj.upi = obj.total_amount
                            else:
                                obj.card = obj.total_amount
                        obj.complete = True
                        obj.balance = 0
                        obj.save()
                        op_lab_obj = obj.op_scan_test

                        if not(op_lab_obj == None):
                            op_lab_obj.payment_complete = 2
                            op_lab_obj.save()


            

            if PaymentData['balance'] == 0:
                AppointmentObj.payment_pending = False
                AppointmentObj.save()

            messages.success(request , "Payment Processed Successfully")

            return JsonResponse({"status":"success"},status=200)

        return redirect("appointment")    

    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)    



class CancelAppointment(View):
    def get(self , request):
        AppointmentObj = Appointment.objects.get(id = int(request.GET.get('appointmentId')))
        AppointmentObj.checkup = 3
        AppointmentObj.status = 1
        AppointmentObj.save()

        return JsonResponse({'status' : 'success'} , safe = False)



class Transfer_OP_TO_IP(View):
    def post(self, request):
        transfer_OP_id = int(request.POST.get('transfer_OP_id'))
        transfer_patient_id = int(request.POST.get('transfer_patient_id'))
        room = int(request.POST.get('room'))
        assigned_date = request.POST.get('assigned_date')
        transfer_reason = request.POST.get('transfer_reason')
        from_op_balance = int(request.POST.get('from_op_balance'))

        Appointment.objects.filter(id = transfer_OP_id).update(status = 1, checkup = 4)
        paymentObj = OutPatient_Payments.objects.get(appointment = transfer_OP_id)
        roomObj = Rooms.objects.get(id = room)     

        assign_room_db_param = {
            'patient' : Patient.objects.get(id = transfer_patient_id) ,
            'assigned_date' : assigned_date,
            'room' : roomObj,
            'reason' : transfer_reason,
            'has_room' : True,
            'total' : from_op_balance,
            'balance' : from_op_balance,
            'balance_from_op' : from_op_balance
        }
        AssignRooms.objects.create(**assign_room_db_param)

        transfer_db_param = {
            'from_op' : Appointment.objects.get(id = transfer_OP_id),
            'to_ip' : AssignRooms.objects.latest('id'),
            'to_room' : roomObj,
            'reason' : transfer_reason,
        }

        roomObj.vacancy_status = 1
        roomObj.save()
        
        paymentObj.doctor_fees = 0
        paymentObj.total = 0
        paymentObj.paid = 0
        paymentObj.cash = 0
        paymentObj.balance = 0
        paymentObj.save()


        messages.success(request , "Transfered Successfully")
        return redirect("appointment")


    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class OP_UploadReport(View):

    def post(self , request):
        files = request.FILES.getlist('upload_image')
        AppointmentObj = Appointment.objects.get(id = int(request.POST.get('op_id_for_upload_report')))


        for ht in files:
            UploadedReportsFilesDB = OP_UploadedReportsFiles(
                appointment = AppointmentObj,
                reports = ht,
            )

            UploadedReportsFilesDB.save()

        
        messages.success(request , "Uploaded Successfully")
        return redirect("appointment")


    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)



class OP_Refund(View):

    def post(self , request):

        AppointmentObj = Appointment.objects.get(id = int(request.POST.get('op_id_for_refund')))

        refundObj = OutPatient_Payments.objects.get(appointment = AppointmentObj)


        refundObj.refund += int(request.POST.get('refund'))
        refundObj.refund_type = request.POST.get('refund_type')
        refundObj.refund_note = request.POST.get('refund_note')
        refundObj.save()

        
        messages.success(request , "Refunded Successfully")
        return redirect("appointment")


    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)
    

class GetPatientBalanceData(View):
    def get(self , request):

        PatientId = request.GET.get('patient_id')

        BalanceData = OutPatient_Payments.objects.filter(patient = int(PatientId)).aggregate(Sum('balance'))

        return JsonResponse(BalanceData , safe = False)


    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)
