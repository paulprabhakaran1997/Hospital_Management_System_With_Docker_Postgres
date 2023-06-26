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
from functools import reduce
from django.utils.dateformat import DateFormat
from django.utils.formats import get_format


from django.shortcuts import render
from django.conf import settings
from django.core.files.storage import FileSystemStorage

from doctor.models import Doctor

from patient.models import Patient
from appointment.models import Appointment  , OutPatient_Payments , OutPatient_PaymentTransactions , InjectionForOutPatient , MedicineForOutPatient
from room.models import AssignRooms , IN_Patient_Payments , IN_Patient_PaymentTransactions , DocterCheckup , DressingForINPatient ,InjectionForINPatient , MedicineForINPatient , LabTestForINPatient, XrayForINPatient
from ward.models import AssignWard , Ward_Patient_Payments , Ward_Patient_PaymentTransactions , DocterCheckup_Ward , DressingForWardPatient , InjectionForWardPatient , MedicineForWardPatient , LabTestForWardPatient , XrayForWardPatient

from lab.models import LabTestForPatient , TestTakenByPatient , LabTestForDirectPatient , LabPaymentTransaction
from xray.models import XrayForPatient , XrayTakenByPatient , XrayPaymentTransaction
from hospital.helpers import get_lab_group_data , get_xray_data

from lab.models import LabTestForPatient , TestTakenByPatient , LabTestForDirectPatient , LabPaymentTransaction , LabGroup

from scan.models import Scan , ScanForPatient , ScanTakenByPatient , ScanPaymentTransaction , ScanForDirectPatient

from lint_hospital.encoders import DefaultEncoder


# Create your views here.



class OP_Report(View):
    template_name = "op_report.html"


    def get(self , request):
   
        return render(request , self.template_name )


    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class GET_OP_Report(View):

    def get(self, request):

        def get_op_payment_data():
            op_payment_data = []

            try:
                OutPatientPaymentObj = OutPatient_Payments.objects.all()

                for ht in OutPatientPaymentObj:

                    data = {
                        'id' : ht.id,
                        'appointment_id' : ht.appointment.id,
                        'patient_id' : ht.patient.id,
                        'patient_name' : ht.patient.name,
                        'doctor_fees' : ht.doctor_fees,
                        'dressing' : ht.dressing,
                        # 'ecg' : ht.ecg,
                        'injection' : ht.injection,
                        'neb' : ht.neb,
                        'one_touch' : ht.one_touch,
                        'total' : ht.total,
                        'discount' : ht.discount,
                        'paid' : ht.paid,
                        'balance' : ht.balance,
                        'cash' : ht.cash,
                        'upi' : ht.upi,
                        'card' : ht.card,
                        'payment_date' : ht.created_time
                    }

                    op_payment_data.append(data)

            except OutPatient_Payments.DoesNotExist:
                op_payment_data = []

            return op_payment_data


        def get_op_payment_transaction_data():
            op_payment_transaction_data = []

            try:
                OutPatientPaymentTransactionObj = OutPatient_PaymentTransactions.objects.all()

                for ht in OutPatientPaymentTransactionObj:

                    print('test' , ht.patient.dob)

                    currentdate = datetime.now().date() - ht.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30

                    data = {
                        'id' : ht.id,
                        'op_payment_id' : ht.op_payment.id,
                        'appointment_id' : ht.appointment.id,
                        'appointment_date' : ht.appointment.appointment_date,
                        'doctor' : ht.appointment.doctor.name,
                        'patient_id' : ht.patient.id,
                        'father_name' : ht.patient.father_name,
                        'patient_name' : ht.patient.name,
                        'patient_address' : ht.patient.address,
                        'patient_age' : age,
                        'patient_gender' : ht.patient.gender,
                        'patient_phone' : ht.patient.phone,
                        'total' : ht.total,
                        'existing_balance' : ht.existing_balance,
                        'paid' : ht.paid,
                        'cash' : ht.cash,
                        'upi' : ht.upi,
                        'card' : ht.card,
                        'balance' : ht.balance,
                        'payment_date' : ht.payment_date,
                        'department' : ht.department,
                        'cashier' : ht.user.username
                    }


                    op_payment_transaction_data.append(data)

            except OutPatient_PaymentTransactions.DoesNotExist:
                op_payment_transaction_data = []

            
            return op_payment_transaction_data


        def get_appointment_data():
            appointment_data = []
            try:
                AppointmentObj = Appointment.objects.all()
                for ht in AppointmentObj:

                    OutPatientPaymentObj = OutPatient_Payments.objects.filter(appointment = ht.id).values().first()
                    
                    if not(OutPatientPaymentObj == None):
                        OutPatientPaymentId = OutPatientPaymentObj['id']
                        OutPatientPaymentTotal = OutPatientPaymentObj['total']
                        OutPatientPaymentDiscount = OutPatientPaymentObj['discount']
                        OutPatientPaymentPaid = OutPatientPaymentObj['paid']
                        OutPatientPaymentBalance = OutPatientPaymentObj['balance']
                    
                    else:
                        OutPatientPaymentId = ""
                        OutPatientPaymentTotal = 0
                        OutPatientPaymentPaid = 0
                        OutPatientPaymentBalance = 0


                    currentdate = datetime.now().date() - ht.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30

                    data = {
                        'id' : ht.id,
                        'patient_id' : ht.patient.id,
                        'patient_name' : ht.patient.name,
                        'patient_age' :age,
                        'patient_gender' : ht.patient.gender,
                        'doctor_id' : ht.doctor.id,
                        'doctor_name' : ht.doctor.name,
                        'appointment_date' : str(ht.appointment_date),
                        'checkup' : str(ht.checkup),
                        'reason' : ht.reason,
                        'payment_id' : OutPatientPaymentId,
                        'total' : OutPatientPaymentTotal,
                        'discount' : OutPatientPaymentDiscount,
                        'paid' : OutPatientPaymentPaid,
                        'balance' : OutPatientPaymentBalance
                    }
                    appointment_data.append(data)

            except Appointment.DoesNotExist:
                appointment_data = []

            return appointment_data


        def get_balance_data_op():
            balance_data = []

            try:
                AppointmentObj = Appointment.objects.filter(status = 1).filter(payment_pending = 'True')
                for ht in AppointmentObj:

                    OutPatientPaymentObj = OutPatient_Payments.objects.filter(appointment = ht.id).values().first()
                    
                    if not(OutPatientPaymentObj == None):
                        OutPatientPaymentId = OutPatientPaymentObj['id']
                        OutPatientPaymentTotal = OutPatientPaymentObj['total']
                        OutPatientPaymentDiscount = OutPatientPaymentObj['discount']
                        OutPatientPaymentPaid = OutPatientPaymentObj['paid']
                        OutPatientPaymentBalance = OutPatientPaymentObj['balance']
                    
                    else:
                        OutPatientPaymentId = ""
                        OutPatientPaymentTotal = 0
                        OutPatientPaymentDiscount = 0
                        OutPatientPaymentPaid = 0
                        OutPatientPaymentBalance = 0

                    currentdate = datetime.now().date() - ht.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30


                    data = {
                        'id' : ht.id,
                        'patient_id' : ht.patient.id,
                        'patient_name' : ht.patient.name,
                        'patient_age' : age,
                        'patient_gender' : ht.patient.gender,
                        'patient_phone' : ht.patient.phone,
                        'doctor_id' : ht.doctor.id,
                        'doctor_name' : ht.doctor.name,
                        'appointment_date' : str(ht.appointment_date),
                        'checkup' : str(ht.checkup),
                        'reason' : ht.reason,
                        'payment_id' : OutPatientPaymentId,
                        'total' : OutPatientPaymentTotal,
                        'discount' : OutPatientPaymentDiscount,
                        'paid' : OutPatientPaymentPaid,
                        'balance' : OutPatientPaymentBalance
                    }
                    balance_data.append(data)

            except Appointment.DoesNotExist:
                balance_data = []

            return balance_data



        AppointmentData = get_appointment_data()
        OutPatientPaymentData = get_op_payment_data()
        OutPatientPaymentTransactionData = get_op_payment_transaction_data()
        BalanceData = get_balance_data_op()


        context = {
            'appointmentdata' : AppointmentData,
            'outpatientpaymentdata' :OutPatientPaymentData,
            'outpatientpayment_transactiondata' :OutPatientPaymentTransactionData, 
            'balancedata' : BalanceData , 
        }             

        return JsonResponse(context , safe = False) 

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)        





class Room_Report(View):
    template_name = "room_report.html"

    def get(self , request):

        return render(request , self.template_name)


    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class GET_Room_Report(View):

    def get(self, request):

        def get_assigned_room_data():
            assigned_room_data = []

            try:
                AssignRoomObj = AssignRooms.objects.all()

                for ht in AssignRoomObj:

                    RoomPaymentObj = IN_Patient_Payments.objects.filter(assignroom = ht.id).values().first()

                    if not(RoomPaymentObj == None):
                        RoomPaymentId = RoomPaymentObj['id']
                        RoomPaymentDiscount = RoomPaymentObj['discount']
                        RoomPaymentTotal = RoomPaymentObj['total']
                        RoomPaymentPaid = RoomPaymentObj['paid']
                        RoomPaymentBalance = RoomPaymentObj['balance']
                    
                    else:
                        RoomPaymentId = 0
                        RoomPaymentDiscount = 0
                        RoomPaymentTotal = 0
                        RoomPaymentPaid = 0
                        RoomPaymentBalance = 0


                    currentdate = datetime.now().date() - ht.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30

                    data = {
                        'id' : ht.id,
                        'patient_id' : ht.patient.id,
                        'patient_name' : ht.patient.name,
                        'patient_age' : age,
                        'patient_gender' : ht.patient.gender,
                        'room_id' : ht.room.id,
                        'room_no' : ht.room.room_no,
                        'room_type' : ht.room.room_type,
                        'room_charge' : ht.room.price,
                        'assigned_date' : str(ht.assigned_date),
                        'discharged_date' : str(ht.discharged_date),
                        'payment_pending' : str(ht.payment_pending),
                        'reason' : ht.reason,
                        'status' : ht.status,
                        'payment_id' : RoomPaymentId,
                        'discount' : RoomPaymentDiscount,
                        'total' : RoomPaymentTotal,
                        'paid' : RoomPaymentPaid,
                        'balance' : RoomPaymentBalance
                    }

                    assigned_room_data.append(data)

            except AssignRoomObj.DoesNotExist:
                assigned_room_data = []

            return assigned_room_data


        def get_room_payment_transaction_data():
            room_payment_transaction_data = []

            try:
                RoomPaymentTransactionObj = IN_Patient_PaymentTransactions.objects.all()

                for ht in RoomPaymentTransactionObj:

                    currentdate = datetime.now().date() - ht.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30


                    data = {
                        'id' : ht.id,
                        'assigned_room_id' : ht.assignroom.id,
                        'assigned_date' : str(ht.assignroom.assigned_date),
                        'room_payment' : ht.ip_payment.id,
                        'payment_date' : str(ht.payment_date),
                        'patient_id' : ht.patient.id,
                        'father_name' : ht.patient.father_name,
                        'patient_name' : ht.patient.name,
                        'patient_address' : ht.patient.address,
                        'patient_age' : age,
                        'patient_gender' : ht.patient.gender,
                        'patient_phone' : ht.patient.phone,
                        'total' : ht.total,
                        'existing_balance' : ht.existing_balance,
                        'paid' : ht.paid,
                        'cash' : ht.cash,
                        'upi' : ht.upi,
                        'card' : ht.card,
                        'balance' : ht.balance,
                        'payment_date' : ht.payment_date,
                        'department' : ht.department,
                        'cashier' : ht.user.username
                    }

                    room_payment_transaction_data.append(data)

            except:
                room_payment_transaction_data = []

            return room_payment_transaction_data


        def get_balance_data_in():

            balance_data = []

            try:
                AssignRoomObj = AssignRooms.objects.filter(status = 1).filter(payment_pending = 'True')

                for ht in AssignRoomObj:

                    RoomPaymentObj = IN_Patient_Payments.objects.filter(assignroom = ht.id).values().first()

                    if not(RoomPaymentObj == None):
                        RoomPaymentId = RoomPaymentObj['id']
                        RoomPaymentDiscount = RoomPaymentObj['discount']
                        RoomPaymentTotal = RoomPaymentObj['total']
                        RoomPaymentPaid = RoomPaymentObj['paid']
                        RoomPaymentBalance = RoomPaymentObj['balance']
                    
                    else:
                        RoomPaymentId = 0
                        RoomPaymentDiscount = 0
                        RoomPaymentTotal = 0
                        RoomPaymentPaid = 0
                        RoomPaymentBalance = 0


                    currentdate = datetime.now().date() - ht.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30


                    data = {
                        'id' : ht.id,
                        'patient_id' : ht.patient.id,
                        'patient_name' : ht.patient.name,
                        'patient_age' : age,
                        'patient_gender' : ht.patient.gender,
                        'patient_phone' : ht.patient.phone,
                        'room_id' : ht.room.id,
                        'room_no' : ht.room.room_no,
                        'room_type' : ht.room.room_type,
                        'room_charge' : ht.room.price,
                        'assigned_date' : str(ht.assigned_date),
                        'discharged_date' : str(ht.discharged_date),
                        'payment_pending' : str(ht.payment_pending),
                        'reason' : ht.reason,
                        'status' : ht.status,
                        'payment_id' : RoomPaymentId,
                        'discount' : RoomPaymentDiscount,
                        'total' : RoomPaymentTotal,
                        'paid' : RoomPaymentPaid,
                        'balance' : RoomPaymentBalance
                    }

                    balance_data.append(data)

            except AssignRoomObj.DoesNotExist:
                balance_data = []

            return balance_data


        AssignedRoomData = get_assigned_room_data()
        RoomPaymentTransactionData = get_room_payment_transaction_data()
        BalanceData = get_balance_data_in()

        context = {
            'assignroomdata' : AssignedRoomData , 
            'roompaymenttransactiondata' : RoomPaymentTransactionData , 
            'balancedata' : BalanceData , 
        }           

        return JsonResponse(context , safe = False) 






    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)        





class Ward_Report(View):
    template_name = "ward_report.html" 

    def get(self , request):

        return render(request , self.template_name )

    

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class GET_Ward_Report(View):

    def get(self, request):

        def get_assign_ward_data():
            assign_ward_data = []

            try:
                AssignedWardObj = AssignWard.objects.all()

                for ht in AssignedWardObj:

                    WardPaymentObj = Ward_Patient_Payments.objects.filter(assignward = ht.id).values().first()

                    if not(WardPaymentObj == None):
                        WardPaymentId = WardPaymentObj['id']
                        WardPaymentDiscount = WardPaymentObj['discount']
                        WardPaymentTotal = WardPaymentObj['total']
                        WardPaymentPaid = WardPaymentObj['paid']
                        WardPaymentBalance = WardPaymentObj['balance']
                    
                    else:
                        WardPaymentId = 0
                        WardPaymentDiscount = 0
                        WardPaymentTotal = 0
                        WardPaymentPaid = 0
                        WardPaymentBalance = 0


                    currentdate = datetime.now().date() - ht.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30

                    data = {
                        'id' : ht.id,
                        'patient_id' : ht.patient.id,
                        'patient_name' : ht.patient.name,
                        'patient_age' : age,
                        'patient_gender' : ht.patient.gender,
                        'ward_id' : ht.ward.id,
                        'ward_name' : ht.ward.ward_name,
                        'ward_bed_id' : ht.ward_bed.id,
                        'bed_no' : ht.ward_bed.bed_no,
                        'reason' : ht.reason,
                        'assigned_date' : str(ht.assigned_date),
                        'status' : ht.status,
                        'payment_pending' : str(ht.payment_pending),
                        'discharged_date' : str(ht.discharged_date),
                        'payment_id' : WardPaymentId,
                        'discount' : WardPaymentDiscount,
                        'total' : WardPaymentTotal,
                        'paid' : WardPaymentPaid,
                        'balance' : WardPaymentBalance
                    }

                    assign_ward_data.append(data)

            except AssignWard.DoesNotExist:
                assign_ward_data = []

            return assign_ward_data

        
        def get_ward_payment_transaction_data():
            ward_payment_transaction_data = []

            try:
                WardPaymentObj = Ward_Patient_PaymentTransactions.objects.all()

                for ht in WardPaymentObj:

                    currentdate = datetime.now().date() - ht.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30

                    data = {
                        'id' : ht.id,
                        'assigned_ward_id' : ht.assignward.id,
                        'ward_name' : ht.assignward.ward.ward_name,
                        'bed_no' : ht.assignward.ward_bed.bed_no,
                        'assigned_date' : str(ht.assignward.assigned_date),
                        'ward_payment' : ht.ward_payment.id,
                        'payment_date' : str(ht.payment_date),
                        'patient_id' : ht.patient.id,
                        'father_name' : ht.patient.father_name,
                        'patient_name' : ht.patient.name,
                        'patient_address' : ht.patient.address,
                        'patient_age' : age,
                        'patient_gender' : ht.patient.gender,
                        'patient_phone' : ht.patient.phone,
                        'total' : ht.total,
                        'existing_balance' : ht.existing_balance,
                        'paid' : ht.paid,
                        'cash' : ht.cash,
                        'upi' : ht.upi,
                        'card' : ht.card,
                        'balance' : ht.balance,
                        'payment_date' : ht.payment_date,
                        'department' : ht.department,
                        'cashier' : ht.user.username
                    }

                    ward_payment_transaction_data.append(data)

            except WardPaymentObj.DoesNotExist:
                ward_payment_transaction_data = []

            return ward_payment_transaction_data
        
        
        def get_balance_data_ward():
            balance_data = []

            try:
                AssignedWardObj = AssignWard.objects.filter(status = 1).filter(payment_pending = 'True')

                for ht in AssignedWardObj:

                    WardPaymentObj = Ward_Patient_Payments.objects.filter(assignward = ht.id).values().first()

                    if not(WardPaymentObj == None):
                        WardPaymentId = WardPaymentObj['id']
                        WardPaymentDiscount = WardPaymentObj['discount']
                        WardPaymentTotal = WardPaymentObj['total']
                        WardPaymentPaid = WardPaymentObj['paid']
                        WardPaymentBalance = WardPaymentObj['balance']
                    
                    else:
                        WardPaymentId = 0
                        WardPaymentDiscount = 0
                        WardPaymentTotal = 0
                        WardPaymentPaid = 0
                        WardPaymentBalance = 0

                    currentdate = datetime.now().date() - ht.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30


                    data = {
                        'id' : ht.id,
                        'patient_id' : ht.patient.id,
                        'patient_name' : ht.patient.name,
                        'patient_age' : age,
                        'patient_gender' : ht.patient.gender,
                        'patient_phone' : ht.patient.phone,
                        'ward_id' : ht.ward.id,
                        'ward_name' : ht.ward.ward_name,
                        'ward_bed_id' : ht.ward_bed.id,
                        'bed_no' : ht.ward_bed.bed_no,
                        'reason' : ht.reason,
                        'assigned_date' : str(ht.assigned_date),
                        'status' : ht.status,
                        'payment_pending' : str(ht.payment_pending),
                        'discharged_date' : str(ht.discharged_date),
                        'payment_id' : WardPaymentId,
                        'discount' : WardPaymentDiscount,
                        'total' : WardPaymentTotal,
                        'paid' : WardPaymentPaid,
                        'balance' : WardPaymentBalance
                    }

                    balance_data.append(data)

            except AssignWard.DoesNotExist:
                balance_data = []

            return balance_data


        AssignWardData = get_assign_ward_data()
        WardPaymentTransactionData = get_ward_payment_transaction_data()
        BalanceData = get_balance_data_ward()

        
        context = {
            'assignwarddata' : AssignWardData , 
            'wardpaymenttransactiondata' :WardPaymentTransactionData , 
            'balancedata' : BalanceData , 
        }    

        return JsonResponse(context , safe = False) 

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)        




# @ Paul

class Lab_Report(View):
    template_name = "lab_report.html"

    def get(self , request):
        return render(request , self.template_name)


    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class GetLabReport(View):

    def post(self , request):

        data = request.body
        print(data)
        if(data):
            From_Date = json.loads(data)['from_date']
            To_Date = json.loads(data)['to_date']
            group_amount = []
            for i in TestTakenByPatient.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date):
                group_amount.append({'group_name' : i.lab_group.name , 'amount' :i.lab_group.amount})

            def get_lab_test_for_patient_data():
                lab_test_for_patient_data = []

                LabTestForPatientObj = LabTestForPatient.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date).all()

                for ht in LabTestForPatientObj:

                    currentdate = datetime.now().date() - ht.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30

                    if(ht.appointment != None):
                        appointed_id = ht.appointment.id
                    elif(ht.assignroom != None):
                        appointed_id = ht.assignroom.id
                    else:
                        appointed_id = ht.assignward.id


                    complete = 0
                    status = 0
                    paid = (ht.cash + ht.card + ht.upi)

                    data = {
                        'id' : ht.id,
                        'patient_id' : ht.patient.id,
                        'appointed_id' : appointed_id,
                        'patient_name' : ht.patient.name,
                        'patient_type' : ht.patient_type,
                        'phone' : ht.patient.phone,
                        'father_name' : ht.patient.father_name,
                        'patient_gender' : ht.patient.gender,
                        'patient_age' : age,
                        'patient_address' : ht.patient.address,
                        'fees' : ht.total_amount,
                        'discount' : 0,
                        'total_after_discount' : ht.total_amount,
                        'paid' : ht.cash,
                        'balance' : ht.balance,
                        'tested_at' : str(ht.created_time)
                    }

                    lab_test_for_patient_data.append(data)

                return lab_test_for_patient_data


            def get_lab_test_for_direct_patient_data():
                lab_test_for_Dpatient_data = []

                LabTestFor_DPatientObj = LabTestForDirectPatient.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date).all()

                for ht in LabTestFor_DPatientObj:

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
                        'payment_received_by_lab' : ht.paid,
                        'fees' : ht.total_amount,
                        'discount' : ht.discount,
                        'total_after_discount' : ht.total_after_discount,
                        'paid' : ht.paid,
                        'balance' : ht.balance,
                        'tested_at' : str(ht.created_time)
                    }

                    lab_test_for_Dpatient_data.append(data)

                return lab_test_for_Dpatient_data



            def get_lab_payment_transaction_data():
                lab_payment_transaction_data = []

                LabPaymentTransactionObj = LabPaymentTransaction.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date).all()

                for ht in LabPaymentTransactionObj:

                    currentdate = datetime.now().date() - ht.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30

                    if(ht.appointment != None):
                        appointed_id = ht.appointment.id
                        tested_id = ht.lab_for_general_patient.id
                        tested_at = ht.lab_for_general_patient.created_time
                    elif(ht.assignroom != None):
                        appointed_id = ht.assignroom.id
                        tested_id = ht.lab_for_general_patient.id
                        tested_at = ht.lab_for_general_patient.created_time
                    elif(ht.assignward != None):
                        appointed_id = ht.assignward.id
                        tested_id = ht.lab_for_general_patient.id
                        tested_at = ht.lab_for_general_patient.created_time
                    else:
                        appointed_id = '--'
                        tested_id = ht.lab_for_direct_patient.id
                        tested_at = ht.lab_for_direct_patient.created_time

                    data = {
                        'id' : ht.id,
                        'cash_received_by' : ht.user.username,
                        'patient_type' : ht.patient_type,
                        'appointed_id' : appointed_id,
                        'lab_tested_id' : tested_id,
                        'patient_id' : ht.patient.id,
                        "patient_name" : ht.patient.name,
                        'patient_age' : age,
                        'father_name' : ht.patient.father_name,
                        'phone' : ht.patient.phone,
                        'patient_address' : ht.patient.address,
                        'paid' : ht.paid,
                        'cash' : ht.cash,
                        'upi' : ht.upi,
                        'card' : ht.card,
                        'paid_at' : str(ht.created_time),
                        'tested_at' : str(tested_at)
                    }

                    lab_payment_transaction_data.append(data)


                return lab_payment_transaction_data
            

            context = {
                'labtestfromallcatogory' : get_lab_test_for_patient_data(),
                'labtestfromdirectpatient' : get_lab_test_for_direct_patient_data(),
                'labpaymenttransaction' : get_lab_payment_transaction_data(),
                'group_amount' : group_amount
            }

        return JsonResponse(context , safe = False) 

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs) 


class Xray_Report(View):
    template_name = "xray_report.html"

    def get(self , request):
        return render(request , self.template_name)


    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)



class GetXrayReport(View):
    def get(self , request):

        From_Date = request.GET.get('from_date')
        To_Date = request.GET.get('to_date')
        print("From_Date Xray",From_Date)

        def get_xray_test_for_patient_data():
            xray_test_for_patient_data = []

            XrayTestForPatientObj = XrayForPatient.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date).all()

            for ht in XrayTestForPatientObj:

                currentdate = datetime.now().date() - ht.patient.dob
                age = currentdate.days//365
                month = (currentdate.days - age *365) // 30

                if(ht.appointment != None):
                    appointed_id = ht.appointment.id
                elif(ht.assignroom != None):
                    appointed_id = ht.assignroom.id
                else:
                    appointed_id = ht.assignward.id


                complete = 0
                status = 0

                data = {
                    'id' : ht.id,
                    'patient_id' : ht.patient.id,
                    'appointed_id' : appointed_id,
                    'patient_name' : ht.patient.name,
                    'patient_type' : ht.patient_type,
                    'phone' : ht.patient.phone,
                    'father_name' : ht.patient.father_name,
                    'patient_gender' : ht.patient.gender,
                    'patient_age' : age,
                    'patient_address' : ht.patient.address,
                    'fees' : ht.total_amount,
                    'tested_at' : str(ht.created_time)
                }

                xray_test_for_patient_data.append(data)

            return xray_test_for_patient_data

        
        def get_xray_payment_transaction_data():
            xray_payment_transaction_data = []

            XrayPaymentTransactionObj = XrayPaymentTransaction.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date).all()

            for ht in XrayPaymentTransactionObj:

                currentdate = datetime.now().date() - ht.patient.dob
                age = currentdate.days//365
                month = (currentdate.days - age *365) // 30

                if(ht.appointment != None):
                    appointed_id = ht.appointment.id
                elif(ht.assignroom != None):
                    appointed_id = ht.assignroom.id
                else:
                    appointed_id = ht.assignward.id

                data = {
                    'id' : ht.id,
                    'cash_received_by' : ht.user.username,
                    'patient_type' : ht.patient_type,
                    'appointed_id' : appointed_id,
                    'xray_tested_id' : ht.xray_for_patient.id,
                    'patient_id' : ht.patient.id,
                    "patient_name" : ht.patient.name,
                    'patient_age' : age,
                    'father_name' : ht.patient.father_name,
                    'phone' : ht.patient.phone,
                    'patient_address' : ht.patient.address,
                    'paid' : ht.paid,
                    'cash' : ht.cash,
                    'upi' : ht.upi,
                    'card' : ht.card,
                    'paid_at' : str(ht.created_time),
                    'tested_at' : str(ht.xray_for_patient.created_time)
                }

                xray_payment_transaction_data.append(data)

            print("xray_payment_transaction_data = ",xray_payment_transaction_data)

            return xray_payment_transaction_data


        
        context = {
            'xraytestfromallcatogory' : get_xray_test_for_patient_data(),
            'xraypaymenttransaction' : get_xray_payment_transaction_data()
        }

        return JsonResponse(context , safe = False) 

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)



class ScanReport(View):
    template_name = "scan_report.html"

    def get(self , request):
        return render(request , self.template_name)


    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)



class GetScanReport(View):
    def get(self , request):

        From_Date = request.GET.get('from_date')
        To_Date = request.GET.get('to_date')
        print("From_Date Scan",From_Date)

        def get_scan_test_for_patient_data():
            scan_test_for_patient_data = []

            ScanTestForPatientObj = ScanForPatient.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date).all()

            for ht in ScanTestForPatientObj:

                currentdate = datetime.now().date() - ht.patient.dob
                age = currentdate.days//365
                month = (currentdate.days - age *365) // 30

                if(ht.appointment != None):
                    appointed_id = ht.appointment.id
                elif(ht.assignroom != None):
                    appointed_id = ht.assignroom.id
                else:
                    appointed_id = ht.assignward.id


                complete = 0
                status = 0

                data = {
                    'id' : ht.id,
                    'patient_id' : ht.patient.id,
                    'appointed_id' : appointed_id,
                    'patient_name' : ht.patient.name,
                    'patient_type' : ht.patient_type,
                    'phone' : ht.patient.phone,
                    'father_name' : ht.patient.father_name,
                    'patient_gender' : ht.patient.gender,
                    'patient_age' : age,
                    'patient_address' : ht.patient.address,
                    'fees' : ht.total_amount,
                    'tested_at' : str(ht.created_time)
                }

                scan_test_for_patient_data.append(data)

            return scan_test_for_patient_data

        
        def get_scan_payment_transaction_data():
            scan_payment_transaction_data = []

            ScanPaymentTransactionObj = ScanPaymentTransaction.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date).all()

            for ht in ScanPaymentTransactionObj:

                currentdate = datetime.now().date() - ht.patient.dob
                age = currentdate.days//365
                month = (currentdate.days - age *365) // 30

                if(ht.appointment != None):
                    appointed_id = ht.appointment.id
                elif(ht.assignroom != None):
                    appointed_id = ht.assignroom.id
                else:
                    appointed_id = ht.assignward.id

                data = {
                    'id' : ht.id,
                    'cash_received_by' : ht.user.username,
                    'patient_type' : ht.patient_type,
                    'appointed_id' : appointed_id,
                    'scan_tested_id' : ht.scan_for_patient.id,
                    'patient_id' : ht.patient.id,
                    "patient_name" : ht.patient.name,
                    'patient_age' : age,
                    'father_name' : ht.patient.father_name,
                    'phone' : ht.patient.phone,
                    'patient_address' : ht.patient.address,
                    'paid' : ht.paid,
                    'cash' : ht.cash,
                    'upi' : ht.upi,
                    'card' : ht.card,
                    'paid_at' : str(ht.created_time),
                    'tested_at' : str(ht.scan_for_patient.created_time)
                }

                scan_payment_transaction_data.append(data)

            print("scan_payment_transaction_data = ",scan_payment_transaction_data)

            return scan_payment_transaction_data


        
        context = {
            'scantestfromallcatogory' : get_scan_test_for_patient_data(),
            'scanpaymenttransaction' : get_scan_payment_transaction_data()
        }

        return JsonResponse(context , safe = False) 

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)





class OverAll_Report(View):
    template_name = "overall_report.html" 

    def get(self , request):

        return render(request , self.template_name )

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class Cashier_Report(View):
    template_name = "cashier_report.html" 

    def get(self , request):

        return render(request , self.template_name )

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class Patient_Report(View):
    template_name = "patient_report.html" 

    def get(self , request,id):


        return render(request , self.template_name )

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)



class GET_OverAll_Report(View):

    def get(self, request):

        From_Date = request.GET.get('from_date')
        To_Date = request.GET.get('to_date')
        print("From_Date",From_Date)

        op_payment_report_data = []
        ip_payment_report_data = []
        ward_payment_report_data = []



        all_doctor_fees = 0
        all_neb = 0 
        all_dressing_charges = 0 
        all_injection = 0
        all_one_touch = 0 
        all_others = 0 

        all_room_Ward = 0  
        all_nursing_charge = 0 
        all_establishment_charges = 0
        all_iv_fluid_charges = 0
        all_icu_charges = 0 
        all_physiotherapy_charges = 0
        all_surgery_charges = 0
        all_consultant_charges = 0 
        all_miscellaneous_charges = 0

        all_lab = 0 
        all_xray = 0 
        all_scan = 0   






        for ht in OutPatient_Payments.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date):

            all_doctor_fees += ht.doctor_fees
            all_dressing_charges += ht.dressing
            all_neb += ht.neb
            all_injection += ht.injection  
            all_one_touch += ht.one_touch  
            all_others += ht.others   
            all_lab += ht.lab   
            all_xray += ht.xray   
            all_scan += ht.scan   






            currentdate = datetime.now().date() - ht.patient.dob
            age = currentdate.days//365
            month = (currentdate.days - age *365) // 30
            sale_ID = []
            
            for i in MedicineForOutPatient.objects.filter(appointment = ht.appointment):
                if not (i.sale_id in sale_ID):
                    sale_ID.append(i.sale_id)
            for i in InjectionForOutPatient.objects.filter(appointment = ht.appointment):
                if not (i.sale_id in sale_ID):
                    sale_ID.append(i.sale_id)

            data = {
                'id' : ht.id,

                'patient_id' : ht.patient.id,
                'patient_name' : ht.patient.name,
                'patient_age' : age,
                'patient_gender' : ht.patient.gender,
                'patient_phone' : ht.patient.phone,
                'sale_ID'        : sale_ID,

                'op_appointed_id' : ht.appointment.id,
                'appointed_date' : ht.appointment.appointment_date,
                'reason' : ht.appointment.reason,
                'checkup' : ht.appointment.checkup,
                'type' : 'OP Patient',

                'payment_recived_by_doctor' : ht.payment_recived_by_doctor,

                'doctor_fees' : ht.doctor_fees,

                'other_payment': float(ht.dressing) + float(ht.neb) + float(ht.injection) + float(ht.one_touch)+ float(ht.others),

                'dressing' : ht.dressing,
                'neb' : ht.neb,
                'injection' : ht.injection,  
                'one_touch' : ht.one_touch,  
                'others' : ht.others,   
                'lab' : ht.lab,   
                'xray' : ht.xray,   
                'scan' : ht.scan,   

                'total' : ht.total,
                'discount' : ht.discount,
                'total_after_discount' : ht.total_after_discount,             
                'paid' : ht.paid,
                'cash' : ht.cash,
                'upi' : ht.upi,
                'card' : ht.card,
                'balance' : ht.balance,
                'payment_date' : ht.created_time
            }
            op_payment_report_data.append(data)

        for ht in IN_Patient_Payments.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date):
            
            all_room_Ward += ht.room 
            all_doctor_fees += ht.doctor_fees 
            all_nursing_charge += ht.nursing_charge 
            all_establishment_charges += ht.establishment_charges 
            all_iv_fluid_charges += ht.iv_fluid_charges
            all_icu_charges += ht.icu_charges
            all_physiotherapy_charges += ht.physiotherapy_charges
            all_surgery_charges += ht.surgery_charges
            all_consultant_charges += ht.consultant_charges
            all_dressing_charges += ht.dressing_charges
            all_miscellaneous_charges += ht.miscellaneous_charges
            all_injection += ht.injection
            all_lab += ht.lab
            all_xray += ht.xray
            all_scan += ht.scan   

            currentdate = datetime.now().date() - ht.patient.dob
            age = currentdate.days//365
            month = (currentdate.days - age *365) // 30
            sale_ID = []
            
            for i in DocterCheckup.objects.filter(assignroom = ht.assignroom):
                if int(i.sale_id) > 0:
                    sale_ID.append(i.sale_id)
            
            data = {
                'id' : ht.id,

                'patient_id' : ht.patient.id,
                'patient_name' : ht.patient.name,
                'patient_age' : age,
                'patient_gender' : ht.patient.gender,
                'patient_phone' : ht.patient.phone,
                'sale_ID'      : sale_ID,

                'ip_appointed_id' : ht.assignroom.id,
                'appointed_date' : ht.assignroom.assigned_date,
                'checkup' : ht.assignroom.checkup,
                'ip_discharged_date' : ht.assignroom.discharged_date,
                'payment_pending' : ht.assignroom.payment_pending,
                'reason' : ht.assignroom.reason,
                'status' : ht.assignroom.status,
                'type' : 'IP Patient',

                'room/Ward' : ht.room ,
                'doctor_fees' : ht.doctor_fees ,

                'other_payment': float(ht.room)+
                                    float(ht.nursing_charge)+
                                    float(ht.establishment_charges)+
                                    float(ht.iv_fluid_charges)+
                                    float(ht.icu_charges)+
                                    float(ht.physiotherapy_charges)+
                                    float(ht.surgery_charges)+
                                    float(ht.consultant_charges)+
                                    float(ht.dressing_charges)+
                                    float(ht.miscellaneous_charges)+
                                    float(ht.injection),

                'nursing_charge' : ht.nursing_charge ,
                'establishment_charges' : ht.establishment_charges ,
                'iv_fluid_charges' : ht.iv_fluid_charges,
                'icu_charges' : ht.icu_charges,
                'physiotherapy_charges' : ht.physiotherapy_charges,
                'surgery_charges' : ht.surgery_charges,
                'consultant_charges' : ht.consultant_charges,
                'dressing_charges' : ht.dressing_charges,
                'miscellaneous_charges' : ht.miscellaneous_charges,
                'injection' : ht.injection,
                'lab' : ht.lab,
                'xray' : ht.xray,
                'scan' : ht.scan,   

                'total' : ht.total,
                'total_after_discount' : ht.total_after_discount,             
                'discount' : ht.discount,             
                'paid' : ht.paid,
                'cash' : ht.cash,
                'upi' : ht.upi,
                'card' : ht.card,
                'balance' : ht.balance,
                'payment_date' : ht.created_time
            }
            ip_payment_report_data.append(data)
    
        for ht in Ward_Patient_Payments.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date):
            currentdate = datetime.now().date() - ht.patient.dob
            age = currentdate.days//365
            month = (currentdate.days - age *365) // 30

            data = {
                'id' : ht.id,
                
                'patient_id' : ht.patient.id,
                'patient_name' : ht.patient.name,
                'patient_age' : age,
                'patient_gender' : ht.patient.gender,
                'patient_phone' : ht.patient.phone,

                'ward_appointed_id' : ht.assignward.id,
                'appointed_date' : ht.assignward.assigned_date,
                'checkup' : ht.assignward.checkup,
                'ward_discharged_date' : ht.assignward.discharged_date,
                'payment_pending' : ht.assignward.payment_pending,
                'reason' : ht.assignward.reason,
                'status' : ht.assignward.status,
                'type' : 'Ward Patient',

                'room/Ward' : ht.ward ,
                'doctor_fees' : ht.doctor_fees ,
                'nursing_charge' : ht.nursing_charge ,
                'establishment_charges' : ht.establishment_charges ,
                'iv_fluid_charges' : ht.iv_fluid_charges,
                'icu_charges' : ht.icu_charges,
                'physiotherapy_charges' : ht.physiotherapy_charges,
                'surgery_charges' : ht.surgery_charges,
                'consultant_charges' : ht.consultant_charges,
                'dressing_charges' : ht.dressing_charges,
                'miscellaneous_charges' : ht.miscellaneous_charges,
                'injection' : ht.injection,
                'lab' : ht.lab,
                'xray' : ht.xray,
                'scan' : ht.scan,   

                'total' : ht.total,
                'discount' : ht.discount,
                'total_after_discount' : ht.total_after_discount,             
                'paid' : ht.paid,
                'cash' : ht.cash,
                'upi' : ht.upi,
                'card' : ht.card,
                'balance' : ht.balance,
                'payment_date' : ht.created_time
            }
            ward_payment_report_data.append(data)

        OP_total_doctor_Fees = []
        
        for i in  Doctor.objects.all() :
                op_obj = Appointment.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date).filter(doctor = i.id)
                dname = i.name
                appointment_count = 0
                doctor_fees = 0
                for j in op_obj :
                    appointment_count += 1
                    doctor = OutPatient_Payments.objects.filter(appointment = j.id)
                    if doctor.exists():
                        doctor_fees += int(doctor.values('doctor_fees')[0]['doctor_fees'])
                    else:
                        doctor_fees += 0  
                data = {
                    'doctor_name' : dname,
                    'appointment_count' : appointment_count,
                    'doctor_total_fees' :  doctor_fees
                }
                OP_total_doctor_Fees.append(data)



        op_lab_fees = 0
        ip_lab_fees = 0
        ward_lab_fees = 0
        direct_lab_fees = 0

        op_lab = OutPatient_Payments.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date).aggregate(Sum('lab'))
        if op_lab['lab__sum'] != None :
            op_lab_fees = op_lab['lab__sum']

        ip_lab = IN_Patient_Payments.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date).aggregate(Sum('lab'))
        if ip_lab['lab__sum']  != None :
            ip_lab_fees = ip_lab['lab__sum']        
        
        ward_lab = Ward_Patient_Payments.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date).aggregate(Sum('lab'))
        if ward_lab['lab__sum'] != None :
            ward_lab_fees = ward_lab['lab__sum']

        direct_lab = LabTestForDirectPatient.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date).aggregate(Sum('total_amount'))
        if direct_lab['total_amount__sum'] != None :
            direct_lab_fees = direct_lab['total_amount__sum']
            all_lab += direct_lab_fees

        lab_total = op_lab_fees + ip_lab_fees + ward_lab_fees + direct_lab_fees

        total_lab_amount = [{
            'department' : 'Lab',
            'total_amount' : lab_total
        }]


        op_xray_fees = 0
        ip_xray_fees = 0
        ward_xray_fees = 0

        op_xray = OutPatient_Payments.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date).aggregate(Sum('xray'))
        if op_xray['xray__sum'] != None :
            op_xray_fees = op_xray['xray__sum']


        ip_xray = IN_Patient_Payments.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date).aggregate(Sum('xray'))
        if ip_xray['xray__sum'] != None :
            ip_xray_fees = ip_xray['xray__sum']        
        
        ward_xray = Ward_Patient_Payments.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date).aggregate(Sum('xray'))
        if ward_xray['xray__sum'] != None :
            ward_xray_fees = ward_xray['xray__sum']

        xray_total = op_xray_fees + ip_xray_fees + ward_xray_fees

        total_xray_amount = [{
            'department' : 'Xray',
            'total_amount' : xray_total
        }]

        op_scan_fees = 0
        ip_scan_fees = 0
        ward_scan_fees = 0

        op_scan = OutPatient_Payments.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date).aggregate(Sum('scan'))
        if op_scan['scan__sum'] != None :
            op_scan_fees = op_scan['scan__sum']


        ip_scan = IN_Patient_Payments.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date).aggregate(Sum('scan'))
        if ip_scan['scan__sum'] != None :
            ip_scan_fees = ip_scan['scan__sum']        
        
        ward_scan = Ward_Patient_Payments.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date).aggregate(Sum('scan'))
        if ward_scan['scan__sum'] != None :
            ward_scan_fees = ward_scan['scan__sum']

        scan_total = op_scan_fees + ip_scan_fees + ward_scan_fees

        total_scan_amount = [{
            'department' : 'Scan',
            'total_amount' : scan_total
        }]


        charge_type = {

                'Doctor Fees' : all_doctor_fees,
                'Neb' : all_neb, 
                'Dressing Charges' : all_dressing_charges, 
                'Injection' : all_injection,
                'One Touch' : all_one_touch, 
                'Others' : all_others,    

                'Room Ward ' : all_room_Ward,
                'Nursing Charge' : all_nursing_charge, 
                'Establishment Charges' : all_establishment_charges,
                'Iv Fluid Charges' : all_iv_fluid_charges,
                'Icu Charges' : all_icu_charges, 
                'Physiotherapy Charges' : all_physiotherapy_charges,
                'Surgery Charges' : all_surgery_charges,
                'Consultant Charges' : all_consultant_charges, 
                'Miscellaneous Charges' : all_miscellaneous_charges,

                'Lab' : all_lab, 
                'Xray' : all_xray, 
                'Scan' : all_scan, 

            }

        all_charges = []
        for key, value in charge_type.items() :
            data = {
                'charge_type' : key,
                'amount' : value
            }
            all_charges.append(data)



        def previous_transactions():


            previous_trans_data = []
            for op_trns in OutPatient_PaymentTransactions.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date):
                op_previous = {
                    'patient_id' : op_trns.patient.id,
                    'patient_name' : op_trns.patient.name,
                    'appoint_id' : op_trns.appointment.id,
                    'appoint_date' : op_trns.appointment.created_time,
                    'paid' : op_trns.paid,
                    'balance' : op_trns.balance,
                    'patient_type' : 'OP Patient',
                    'trns_date' : op_trns.created_time,
                }

                previous_trans_data.append(op_previous)

            ip_previous = {}
            for ip_trns in IN_Patient_PaymentTransactions.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date):
                ip_previous = {
                    'patient_id' : ip_trns.patient.id,
                    'patient_name' : ip_trns.patient.name,
                    'appoint_id' : ip_trns.assignroom.id,
                    'appoint_date' : ip_trns.assignroom.created_time,
                    'paid' : ip_trns.paid,
                    'balance' : ip_trns.balance,
                    'patient_type' : 'IP Patient',
                    'trns_date' : ip_trns.created_time,
                }
                previous_trans_data.append(ip_previous)

            lab_previous = {}
            for ht in LabPaymentTransaction.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date):

                if(ht.appointment != None):
                    appoint_id = ht.appointment.id
                    appoint_date = ht.appointment.created_time
                elif(ht.assignroom != None):
                    appoint_id = ht.assignroom.id
                    appoint_date = ht.assignroom.created_time
                else:
                    appoint_id = '--'
                    appoint_date = ht.created_time
                lab_previous = {
                    'appoint_id' : appoint_id,
                    'appoint_date' : appoint_date,
                    'patient_id' : ht.patient.id,
                    "patient_name" : ht.patient.name,
                    'paid' : ht.paid,
                    'balance' : ht.balance,
                    'patient_type' : ht.patient_type,
                    'trns_date' : ht.created_time,
                }
                previous_trans_data.append(lab_previous)


            return (previous_trans_data)


        


        context = {
            'op_payment_report_data' : op_payment_report_data , 
            'ip_payment_report_data' : ip_payment_report_data , 
            'ward_payment_report_data' : ward_payment_report_data , 

            'OP_total_doctor_Fees' : OP_total_doctor_Fees , 

            'total_lab_amount' : total_lab_amount , 
            'total_xray_amount' : total_xray_amount , 
            'total_scan_amount' : total_scan_amount , 
            'all_charges' : all_charges , 
            'previous_transactions' : previous_transactions() , 
            'total_collection_amount' : collection_amount(From_Date , To_Date),
        }    

        return JsonResponse(context , safe = False) 

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)        






def collection_amount(FD , TD):
    From_Date =  FD
    To_Date =  TD
    total_collection_amount = []

    for i in User.objects.all() :
        user_name = i.username

        total_paid = 0
        total_cash = 0
        total_upi = 0
        total_card = 0

        op_trans = OutPatient_PaymentTransactions.objects.filter(user = i).filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date)
        ip_trans = IN_Patient_PaymentTransactions.objects.filter(user = i).filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date)
        ward_trans = Ward_Patient_PaymentTransactions.objects.filter(user = i).filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date)
        direct_trans = LabPaymentTransaction.objects.filter(user = i).filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date)

        for op in op_trans :
            total_paid += op.paid
            total_cash += op.cash
            total_upi += op.upi
            total_card += op.card

        for ip in ip_trans :
            total_paid += ip.paid
            total_cash += ip.cash
            total_upi += ip.upi
            total_card += ip.card

        for ward in ward_trans :
            total_paid += ward.paid
            total_cash += ward.cash
            total_upi += ward.upi
            total_card += ward.card

        for direct in direct_trans :
            total_paid += direct.paid
            total_cash += direct.cash
            total_upi += direct.upi
            total_card += direct.card

        data = {
            'user_name' : user_name,
            'total_paid' : total_paid,
            'total_cash' : total_cash,
            'total_upi' : total_upi,
            'total_card' : total_card,
        }

        total_collection_amount.append(data)
    return      total_collection_amount   



class GET_Cashier_Report(View):

    def get(self, request):

        From_Date = request.GET.get('from_date')
        To_Date = request.GET.get('to_date')

        total_collection_amount = []

        for i in User.objects.all() :
            user_name = i.username

            total_paid = 0
            total_cash = 0
            total_upi = 0
            total_card = 0

            op_trans = OutPatient_PaymentTransactions.objects.filter(user = i).filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date)
            ip_trans = IN_Patient_PaymentTransactions.objects.filter(user = i).filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date)
            ward_trans = Ward_Patient_PaymentTransactions.objects.filter(user = i).filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date)
            direct_trans = LabPaymentTransaction.objects.filter(user = i).filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date)

            for op in op_trans :
                total_paid += op.paid
                total_cash += op.cash
                total_upi += op.upi
                total_card += op.card

            for ip in ip_trans :
                total_paid += ip.paid
                total_cash += ip.cash
                total_upi += ip.upi
                total_card += ip.card

            for ward in ward_trans :
                total_paid += ward.paid
                total_cash += ward.cash
                total_upi += ward.upi
                total_card += ward.card

            for direct in direct_trans :
                total_paid += direct.paid
                total_cash += direct.cash
                total_upi += direct.upi
                total_card += direct.card

            data = {
                'user_name' : user_name,
                'total_paid' : total_paid,
                'total_cash' : total_cash,
                'total_upi' : total_upi,
                'total_card' : total_card,
            }

            total_collection_amount.append(data)
            
        context = {
            'total_collection_amount' : collection_amount(From_Date , To_Date) , 
        }    

        return JsonResponse(context , safe = False) 

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)        



class Get_Lab_Group_Amount(View):

    def post(self, request):
        data = request.body
        if(data):
            LabObj = json.loads(data)['LabObj']
            group_amount = []

            for i in LabObj:
                for k in LabGroup.objects.filter(id = int(i)):
                    amount = 0
                    for j in TestTakenByPatient.objects.filter(lab_group = k):
                        amount += int(j.lab_group.amount)
                    group_amount.append({'group_name' : k.name , 'amount' :amount })
            context = {'group_amount' : group_amount}    

            return JsonResponse(context , safe = False) 

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)        




class GET_Previous_Trns(View):

    def get(self, request):

        From_Date = request.GET.get('from_date')
        To_Date = request.GET.get('to_date')

        op_previous = []
        for op_trns in OutPatient_PaymentTransactions.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date):
            data = {
                'patient_id' : op_trns.patient.id,
                'patient_name' : op_trns.patient.name,
                'appoint_id' : op_trns.appointment.id,
                'appoint_date' : op_trns.appointment.created_time,
                'paid' : op_trns.paid,
                'balance' : op_trns.balance,
                'patient_type' : 'OP Patient',
                'trns_date' : op_trns.created_time,

            }
            op_previous.append(data)
        print('op',op_previous)

        ip_previous = []
        for ip_trns in IN_Patient_PaymentTransactions.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date):
            data = {
                'patient_id' : ip_trns.patient.id,
                'patient_name' : ip_trns.patient.name,
                'appoint_id' : ip_trns.assignroom.id,
                'appoint_date' : ip_trns.assignroom.created_time,
                'paid' : ip_trns.paid,
                'balance' : ip_trns.balance,
                'patient_type' : 'IP Patient',
                'trns_date' : ip_trns.created_time,

            }
            ip_previous.append(data)
        print('ip',ip_previous)

        lab_previous = []
        for ht in LabPaymentTransaction.objects.filter(created_time__date__gte = From_Date).filter(created_time__date__lte = To_Date):

            if(ht.appointment != None):
                appoint_id = ht.appointment.id
                appoint_date = ht.appointment.created_time
            elif(ht.assignroom != None):
                appoint_id = ht.assignroom.id
                appoint_date = ht.assignroom.created_time
            else:
                appoint_id = '--'
                appoint_date = ht.created_time
            data = {
                'appoint_id' : appoint_id,
                'appoint_date' : appoint_date,
                'patient_id' : ht.patient.id,
                "patient_name" : ht.patient.name,
                'paid' : ht.paid,
                'balance' : ht.balance,
                'patient_type' : ht.patient_type
            }

            lab_previous.append(data)
        print('lab',lab_previous)




        context = {
            'op_previous' : op_previous,
            'ip_previous' : ip_previous,
            'lab_previous' : lab_previous,
        }    

        return JsonResponse(context , safe = False) 

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)        




class GET_Patient_Report(View):

    def get(self, request):
        Patient_Id = int(request.GET.get('patient_id'))
        print(Patient_Id)
        print(Patient_Id)
        print(Patient_Id)
        print(Patient_Id)
        print(Patient_Id)
        OP_Patient_History = []
        IP_Patient_History = []
        

        for obj in Appointment.objects.filter(patient = Patient_Id) :
            try:
                op_obj = OutPatient_Payments.objects.get(appointment = obj)
                currentdate = datetime.now().date() - obj.patient.dob
                age = currentdate.days//365
                month = (currentdate.days - age *365) // 30
                data = {
                        'op_id' : obj.id,
                        'patient_name' : obj.patient.name ,
                        'age' : age ,
                        'gender' : obj.patient.gender ,
                        'pos_id' : obj.patient.pos_id,
                        'reason' : obj.reason,
                        'doctor_prescription' : obj.doctor_prescription,
                        'medical_prescription' : obj.medical_prescription,
                        'appointment_date' : obj.appointment_date,
                        'doctor_name' : obj.doctor.name,
                        'bp' : obj.bp,
                        'pulse' : obj.pulse,
                        'temperature' : obj.temperature,
                        'rr' : obj.rr,
                        'sp_o2' : obj.sp_o2,
                        'blood_sugar' : obj.blood_sugar,
                        'total'       : op_obj.total,
                        'discount'       : op_obj.discount,
                        'paid'       : op_obj.paid,
                        'balance'       : op_obj.balance,
                    }
                
                OP_Patient_History.append(data)

            except:
                pass
       

        for obj in AssignRooms.objects.filter(patient = Patient_Id) :

            currentdate = datetime.now().date() - obj.patient.dob
            age = currentdate.days//365
            month = (currentdate.days - age *365) // 30

            try:
                ip_obj = IN_Patient_Payments.objects.get(assignroom = obj)
                total = ip_obj.total
                discount = ip_obj.discount
                paid = ip_obj.paid
                balance = ip_obj.balance
            except:
                total = 0
                discount = 0
                paid = 0
                balance = 0

            data = {
                    'ip_id' : obj.id,
                    'patient_name' : obj.patient.name ,
                    'age' : age ,
                    'gender' : obj.patient.gender ,
                    'pos_id' : obj.patient.pos_id,
                    'appointment_date' : obj.assigned_date,
                    'reason' : obj.reason,
                    'total'       :  total,
                    'discount'    :  discount,
                    'paid'        :  paid,
                    'balance'     :  balance,
                }
            
            IP_Patient_History.append(data)

       

        context = {
            'OP_Patient_History' : OP_Patient_History,
            'IP_Patient_History' : IP_Patient_History,
        }
        return JsonResponse(context , safe = False) 
  

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)        




class Date_Wise_Collection(View):
    template_name = "date_wise_collection.html" 

    def get(self , request):

        return render(request , self.template_name )

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)




class GET_Date_Wise_Report(View):

    def get(self, request):

        From_Date = request.GET.get('from_date')
        To_Date = request.GET.get('to_date')

        date_wise = []

        op_payments = OutPatient_Payments.objects.filter(updated_time__date__gte = From_Date).filter(updated_time__date__lte = To_Date)

        for i in op_payments:
            dt = i.updated_time
            df = DateFormat(dt)
            df.format(get_format('DATE_FORMAT')) 
            df.format('Y-m-d')
            data = {
                'department': 'op',
                'date' : df.format('d-m-Y'),
                'total' : i.total,
                'discount' : i.discount,
                'paid' : i.paid,
                'balance' : i.balance
            }
            date_wise.append(data)
        
        ip_payments = IN_Patient_Payments.objects.filter(updated_time__date__gte = From_Date).filter(updated_time__date__lte = To_Date)

        for i in ip_payments:
            dt = i.updated_time
            df = DateFormat(dt)
            df.format(get_format('DATE_FORMAT')) 
            df.format('Y-m-d')
            data = {
                'department': 'ip',
                'date' : df.format('d-m-Y'),
                'total' : i.total,
                'discount' : i.discount,
                'paid' : i.paid,
                'balance' : i.balance
            }
            date_wise.append(data)
        
        dlab_payments = LabTestForDirectPatient.objects.filter(updated_time__date__gte = From_Date).filter(updated_time__date__lte = To_Date)

        for i in dlab_payments:
            dt = i.updated_time
            df = DateFormat(dt)
            df.format(get_format('DATE_FORMAT')) 
            df.format('Y-m-d')
            data = {
                'department': 'D_Lab',
                'date' : df.format('d-m-Y'),
                'total' : i.total_amount,
                'discount' : i.discount,
                'paid' : i.paid,
                'balance' : i.balance
            }
            date_wise.append(data)
        

        dscan_payments = ScanForDirectPatient.objects.filter(updated_time__date__gte = From_Date).filter(updated_time__date__lte = To_Date)

        for i in dscan_payments:
            dt = i.updated_time
            df = DateFormat(dt)
            df.format(get_format('DATE_FORMAT')) 
            df.format('Y-m-d')
            data = {
                'department': 'D_Scan',
                'date' : df.format('d-m-Y'),
                'total' : i.total_amount,
                'discount' : i.discount,
                'paid' : i.paid,
                'balance' : i.balance
            }
            date_wise.append(data)
        

        context = {
            'date_wise' : date_wise , 
        }    

        return JsonResponse(context , safe = False) 

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)        
