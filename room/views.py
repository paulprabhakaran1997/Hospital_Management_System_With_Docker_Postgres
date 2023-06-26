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

from room.models import Rooms , AssignRooms ,DocterCheckup ,  LabTestForINPatient , XrayForINPatient,ScanForINPatient ,MedicineForINPatient , InjectionForINPatient , DressingForINPatient ,  IN_Patient_Payments , IN_Patient_PaymentTransactions ,DischargeSummary_IN , RoomCategory , TransferRoom
from lab.models import LabTestForPatient , TestTakenByPatient
from xray.models import XrayForPatient , XrayTakenByPatient
from scan.models import ScanForPatient , ScanTakenByPatient

# Create your views here.
class RoomView(View):
    template_name = "room_view.html"

    def get(self , request):

        return render(request , self.template_name)


    def post(self , request):     
        
        data = request.body

        if(data):
            RoomData = json.loads(data)['RoomData'][0]

            Room_id = RoomData['room_id']

            print(RoomData)

            category = RoomCategory.objects.get(id = int(RoomData['category']))

            room_db_param = {
                'room_no' : RoomData['room_no'],
                'room_type' : RoomData['room_type'],
                'category' : category,
                'price' : RoomData['room_price'],
                'description' : RoomData['room_description']
            }

            if Room_id == 0 :
                Rooms.objects.create(**room_db_param)
                messages.success(request , "Room Created Successfully")
                return JsonResponse({"status":"success"},status=200)

            else:
                Rooms.objects.filter(id = Room_id ).update(**room_db_param)
                messages.success(request , "Room Updated Successfully")
                return JsonResponse({"status":"success"},status = 200)

        return redirect("room")    

    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)     


class GetRoomData(View):
    def get(self , request):

        context = {
                'Roomdata' : get_room_data(),
        }

        return JsonResponse(context , safe = False) 


def get_room_data():
    room_data = []
    RoomObj = Rooms.objects.all()
    for ht in RoomObj:
        data = {
            'id' : ht.id,
            'room_no' : ht.room_no,
            'room_type' : ht.room_type,
            'category_id' : ht.category.id,
            'category' : ht.category.name,
            'room_price' : ht.price,
            'room_description' : ht.description,
            'vacancy_status' : ht.vacancy_status,
                  
        }
        room_data.append(data)

    return room_data


def get_assigned_room_data():
    room_assigned_data = []
    AssignedRoomObj = AssignRooms.objects.all()
    for ht in AssignedRoomObj:
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
            'address' : ht.patient.address,
            'room_id' : ht.room.id,
            'room_no' : ht.room.room_no,
            'room_type' : ht.room.room_type,
            'category' : ht.room.category.name,
            'reason' : ht.reason,
            'assigned_date' : ht.assigned_date,
            'discharged_date' : ht.discharged_date,
            'room_price' : ht.room.price,
            'room_description' : ht.room.description,
            'vacancy_status' : ht.room.vacancy_status,
            'status' : ht.status,
            'initially_paid' : ht.initially_paid,
            'payment_pending' : ht.payment_pending
        }
        room_assigned_data.append(data)

    return room_assigned_data


  

class AssignRoom(View):
    def get(self , request):
        template_name = 'assign_room.html'

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
            AssignRoomObj = json.loads(data)['AssignRoomData'][0]
            assign_room_db_param = {
                'patient' : Patient.objects.get(id = int(AssignRoomObj['patient_id'])) ,
                'assigned_date' : AssignRoomObj['assigned_date'],
                'room' : Rooms.objects.get(id = int(AssignRoomObj['room_id'])),
                'reason' : AssignRoomObj['reason'],
                'has_room' : True,
            }
            AssignRooms.objects.create(**assign_room_db_param)

            roomObj = Rooms.objects.get(id = int(AssignRoomObj['room_id']))
            roomObj.vacancy_status = 1
            roomObj.save()


            messages.success(request , "Room Assigned Successfully")

            return JsonResponse({"status":"success"},status=200)

        return redirect("assign_room") 

    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)        


class GetAssignedRoomData(View):
    def get(self , request):

        context = {
            'Assigned_Roomdata' : get_assigned_room_data(),
        }

        return JsonResponse(context , safe = False)



class AssignRoomDoctorCheckupView(View):
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
            sale_id = json.loads(data)['sale_id']


            patient_id = Patient.objects.get(id = int(PatientObj['patient_id']))
            AssignRoomObj = AssignRooms.objects.get(id = int(PatientObj['IP_assignid']))
            RoomObj = Rooms.objects.get(id = int(PatientObj['room_id']))
            DocterObj = Doctor.objects.get(id = int(PatientObj['doctor']))


            doctor_checkup_db_param = {
                'sale_id' : sale_id,
                'room' : RoomObj,
                'assignroom' : AssignRoomObj,
                'doctor' : DocterObj ,
                'doctor_prescription' : Prescription ,
                'medical_prescription' : Medical_Prescription ,

            }

            DocterCheckup.objects.create(**doctor_checkup_db_param)

            Latest_dc_Obj = DocterCheckup.objects.latest('id')

            dressing_dbParam = {
                "patient" : patient_id,
                "assignroom" : AssignRoomObj,
                "doctor_checkup" : Latest_dc_Obj,
                "dressing" : Dressing,
            }

            injection_dbParam = {
                "patient" : patient_id,
                "assignroom" : AssignRoomObj,
                "doctor_checkup" : Latest_dc_Obj,
                "injection_list" : InjectionObj,
            }
            medicine_dbParam = {
                "patient" : patient_id,
                "assignroom" : AssignRoomObj,
                "doctor_checkup" : Latest_dc_Obj,
                "medicine_list" : MedicineObj,
            }

            lab_test_dbParam = {
                "patient" : patient_id,
                "assignroom" : AssignRoomObj,
                "doctor_checkup" : Latest_dc_Obj,
                "lab_test" : LabObj,
                "lab_test_date" : datetime.now()
            }

            xray_test_dbParam = {
                "patient" : patient_id,
                "assignroom" : AssignRoomObj,
                "doctor_checkup" : Latest_dc_Obj,
                "xray_test" : XrayObj,
                "xray_test_date" : datetime.now()

            }

            scan_test_dbParam = {
                "patient" : patient_id,
                "assignroom" : AssignRoomObj,
                "doctor_checkup" : Latest_dc_Obj,
                "scan_test" : ScanObj,
                "scan_test_date" : datetime.now()

            }

            if (Dressing != '0') and (Dressing != '') :
                DressingForINPatient.objects.create(**dressing_dbParam)

            if not (len(InjectionObj) == 0):
                InjectionForINPatient.objects.create(**injection_dbParam)

            if not (len(MedicineObj) == 0):
                MedicineForINPatient.objects.create(**medicine_dbParam)

            if not (len(LabObj) == 0):
                AssignRoomObj.has_lab = True
                LabTestForINPatient.objects.create(**lab_test_dbParam)

            if not (len(XrayObj) == 0):
                AssignRoomObj.has_xray = True
                XrayForINPatient.objects.create(**xray_test_dbParam)

            if not (len(ScanObj) == 0):
                AssignRoomObj.has_scan = True
                ScanForINPatient.objects.create(**scan_test_dbParam)

            
            AssignRoomObj.checkup = 1
            AssignRoomObj.save()

            messages.success(request , "Successful")

            return JsonResponse({"status":"success"},status=200)
            

    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)        



class Get_In_Patient_Checkup_History(View):
    def get(self , request):

        IP_Assignid = int(request.GET.get('IP_assignid'))

        roomobj = AssignRooms.objects.filter(id = IP_Assignid)
        room_data = []
        for rm in roomobj:
            data = {
                'room_no' : rm.room.room_no,
                'room_type' : rm.room.room_type,
                'category_id' : rm.room.category.id,
                'category' : rm.room.category.name,
            }

            room_data.append(data) 

        doctor_checkupObj = DocterCheckup.objects.filter(assignroom = IP_Assignid)

        history = []

        for ht in doctor_checkupObj :
            
            patient_dressing_history = []
            patient_medicine_history = []
            patient_injection_history = []
            patient_lab_checkup_history = []
            patient_xray_checkup_history = []
            patient_scan_checkup_history = []
          
            try:
                patient_dressing_history = DressingForINPatient.objects.filter(doctor_checkup = ht.id).values()[0]['dressing']
            except:
                patient_dressing_history = []
            
            try:
                patient_medicine_history = MedicineForINPatient.objects.filter(doctor_checkup = ht.id).values()[0]['medicine_list']
            except:
                patient_medicine_history = []
                
            try:
                patient_injection_history = InjectionForINPatient.objects.filter(doctor_checkup = ht.id).values()[0]['injection_list']
            except:
                patient_injection_history = []


            lab_testobj = LabTestForINPatient.objects.filter(doctor_checkup = ht.id).filter(lab_canceled = False)

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


            xray_testobj = XrayForINPatient.objects.filter(doctor_checkup = ht.id).filter(xray_canceled = False)

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

        
            scan_testobj = ScanForINPatient.objects.filter(doctor_checkup = ht.id).filter(scan_canceled = False)

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

        
            data = {
                'doctor_name' : ht.doctor.name,
                'room_no' : ht.room.room_no,
                'room_category' : ht.room.category.category,
                'room_category_name' : ht.room.category.name,
                'doctor_prescription' : ht.doctor_prescription,
                'medical_prescription' : ht.medical_prescription,
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
            'room_data' : room_data,

        }

        return JsonResponse(context , safe = False) 



class Get_Amount_IN_Patient(View):

    def get(self , request):
        ip_assign_id = AssignRooms.objects.get(id = int(request.GET.get('ip_assignid'))) 

        today = datetime.now().date()
        tomorrow = today + timedelta(1)
        today_start = datetime.combine(today, time())
        today_end = datetime.combine(tomorrow, time())

        lab_obj = LabTestForINPatient.objects.filter(assignroom = ip_assign_id).filter(lab_checked = False).filter(lab_canceled = False)
        xray_obj = XrayForINPatient.objects.filter(assignroom = ip_assign_id).filter(xray_checked = False).filter(xray_canceled = False)
        scan_obj = ScanForINPatient.objects.filter(assignroom = ip_assign_id).filter(scan_checked = False).filter(scan_canceled = False)

        try:
            room_amount = 0
            for ht in AssignRooms.objects.filter(id = ip_assign_id.id):
                room_amount += ht.room.price

        except:
            room_amount = 0;   
             

        try:
            lab_amount = 0
            balance_lab_amount = 0
            for ht in LabTestForPatient.objects.filter(assignroom = ip_assign_id):
                lab_amount += ht.total_amount
                balance_lab_amount += ht.balance

        except:
            lab_amount = 0;   
            balance_lab_amount = 0 
 
        try:
            xray_amount = 0
            balance_xray_amount = 0 
            for ht in XrayForPatient.objects.filter(assignroom = ip_assign_id):
                xray_amount += ht.total_amount
                balance_xray_amount += ht.balance

        except:
            xray_amount = 0
            balance_xray_amount = 0 

        try:
            scan_amount = 0
            balance_scan_amount = 0 
            for ht in ScanForPatient.objects.filter(assignroom = ip_assign_id):
                scan_amount += ht.total_amount
                balance_scan_amount += ht.balance

        except:
            scan_amount = 0
            balance_scan_amount = 0 


        try:
            in_payment_data = IN_Patient_Payments.objects.filter(assignroom = ip_assign_id)
            ip_data = {}
            charge_details = {}
            payment_data = {}

            for ht in in_payment_data:

                charge_details = {

                    'op_charges' : ip_assign_id.balance_from_op,
                    'room_rent': ht.room,
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

            for ht in in_payment_data:

                ip_data = {
                    'id': ht.id,
                    'balance_from_op' : ip_assign_id.balance_from_op,

                    'room_charge': ht.room,
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
            ip_data = {}
            charge_details ={}
            payment_data = {}

        overall_amount = {

            'main_total' : ip_assign_id.total,
            'main_paid' : ip_assign_id.paid,
            'main_balance' : ip_assign_id.balance,
            'balance_from_op' : ip_assign_id.balance_from_op,
            'room_amount': room_amount,

            'lab_amount': lab_amount,
            'balance_lab_amount': balance_lab_amount,

            'xray_amount': xray_amount,
            'balance_xray_amount': balance_xray_amount,
            
            'scan_amount': scan_amount,
            'balance_scan_amount': balance_scan_amount,
            
            'ip_payment_data': ip_data,
            'charge_details':charge_details,
            'payment_data':payment_data
            
        }
       
        context = {
            'ip_assigned_amount' : overall_amount,
            'lab_length' : len(lab_obj),
            'xray_length' : len(xray_obj),
            'scan_length' : len(scan_obj),
        }

        return JsonResponse(context , safe = False) 



class IN_PatientPaymentView(View):

    def post(self , request):     
        
        data = request.body

        if(data):

            PaymentData = json.loads(data)['PaymentData'][0]

            AssignId = PaymentData['ip_assign_id']
            PatientId = PaymentData['patient_id']

            AssignObj = AssignRooms.objects.get(id = AssignId)
            PatientObj = Patient.objects.get(id = PatientId)


            Initially_paid = PaymentData['initially_paid']
            transactionObj = 0
            existing_balance = 0

            try:
                InPatientPaymentData = IN_Patient_Payments.objects.get(assignroom = AssignObj.id)
                transactionObj = InPatientPaymentData
                existing_balance = PaymentData['existing_balance']

                if AssignObj.status == 0 :

                    print(PaymentData)

                    InPatientPaymentData.room += PaymentData['room']
                    InPatientPaymentData.doctor_fees += PaymentData['doctor_fees'] 
                    InPatientPaymentData.nursing_charge += PaymentData['nursing_charge']
                    InPatientPaymentData.establishment_charges += PaymentData['establishment_charges']
                    InPatientPaymentData.iv_fluid_charges += PaymentData['iv_fluid_charges']
                    InPatientPaymentData.icu_charges += PaymentData['icu_charges']
                    InPatientPaymentData.physiotherapy_charges += PaymentData['physiotherapy_charges']
                    InPatientPaymentData.surgery_charges += PaymentData['surgery_charges']
                    InPatientPaymentData.consultant_charges += PaymentData['consultant_charges']
                    InPatientPaymentData.dressing_charges += PaymentData['dressing_charges']
                    InPatientPaymentData.miscellaneous_charges += PaymentData['miscellaneous_charges']
                    InPatientPaymentData.injection += PaymentData['injection']

                    InPatientPaymentData.lab = PaymentData['lab']
                    InPatientPaymentData.xray = PaymentData['xray']
                    InPatientPaymentData.scan = PaymentData['scan']
                    InPatientPaymentData.total = PaymentData['overall_total']
                    InPatientPaymentData.discount += PaymentData['discount']
                    InPatientPaymentData.total_after_discount = InPatientPaymentData.total - InPatientPaymentData.discount

                    InPatientPaymentData.paid += PaymentData['paid']
                    InPatientPaymentData.cash += PaymentData['cash']
                    InPatientPaymentData.upi += PaymentData['upi']
                    InPatientPaymentData.card += PaymentData['card']
                    InPatientPaymentData.balance = PaymentData['balance']
                    InPatientPaymentData.save()

                else:

                    InPatientPaymentData.discount += PaymentData['discount']
                    InPatientPaymentData.total_after_discount = InPatientPaymentData.total - InPatientPaymentData.discount
                    InPatientPaymentData.paid += PaymentData['paid']
                    InPatientPaymentData.cash += PaymentData['cash']
                    InPatientPaymentData.upi += PaymentData['upi']
                    InPatientPaymentData.card += PaymentData['card']
                    InPatientPaymentData.balance = PaymentData['balance']
                    InPatientPaymentData.save()

                AssignObj.total = InPatientPaymentData.total
                AssignObj.paid = InPatientPaymentData.paid
                AssignObj.balance = InPatientPaymentData.balance

                if InPatientPaymentData.balance == 0:
                    AssignObj.payment_pending = False
                else:
                    AssignObj.payment_pending = True
                AssignObj.save()
                    
            except:

                IN_PatientPaymentDB = IN_Patient_Payments(
                    assignroom = AssignObj,
                    patient = PatientObj,

                    room = PaymentData['room'],
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
                IN_PatientPaymentDB.save()

                transactionObj = IN_Patient_Payments.objects.latest('id')
                existing_balance = PaymentData['overall_total']

                AssignObj.total = PaymentData['overall_total']
                AssignObj.paid = PaymentData['paid']
                AssignObj.balance = PaymentData['balance']

                if PaymentData['balance'] == 0:
                    AssignObj.payment_pending = False
                else:
                    AssignObj.payment_pending = True
                AssignObj.save()
                

            InPatientPaymentTransactionDB = IN_Patient_PaymentTransactions(
                user = request.user,
                department = 'Reception',
                ip_payment = transactionObj,
                assignroom = AssignObj,
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
            InPatientPaymentTransactionDB.save()


            for obj in LabTestForPatient.objects.filter(assignroom = AssignObj.id):
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
                        ip_lab_obj = obj.ip_lab_test
                        ip_lab_obj.payment_complete = 2
                        ip_lab_obj.save()
            
            for obj in XrayForPatient.objects.filter(assignroom = AssignObj.id):
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
            
            for obj in ScanForPatient.objects.filter(assignroom = AssignObj.id):
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
                        ip_lab_obj = obj.ip_scan_test
                        ip_lab_obj.payment_complete = 2
                        ip_lab_obj.save()

            

            # XrayForPatient.objects.filter(assignroom = AssignObj.id).update(complete = True)
            # XrayForPatient.objects.filter(assignroom = AssignObj.id).update(balance = 0)

            # ScanForPatient.objects.filter(assignroom = AssignObj.id).update(complete = True)
            # ScanForPatient.objects.filter(assignroom = AssignObj.id).update(balance = 0)



            AssignObj.initially_paid = True
            AssignObj.save()

            messages.success(request , "Payment Processed Successfully")

            return JsonResponse({"status":"success"},status=200)

        return redirect("appointment")    

    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)            



class DischargeSummary_In(View):

    def post(self , request):

        data = request.body

        if data:
            DischargeSummaryObj = json.loads(data)['DischargeSummary_Data']

            patient_id = Patient.objects.get(id = int(DischargeSummaryObj['patient_id']))
            AssignRoomObj = AssignRooms.objects.get(id = int(DischargeSummaryObj['ip_no']))
            RoomObj = Rooms.objects.get(id = int(DischargeSummaryObj['room_id']))
            DocterObj = Doctor.objects.get(id = int(DischargeSummaryObj['consultant']))

            discharge_summary_dbParam = {
                
                'patient' : patient_id,
                'ip_no' : AssignRoomObj,
                'room' : RoomObj,
                'consultant' : DocterObj,
                'date_of_surgery' : DischargeSummaryObj['dof_surgery'],
                'allergies' :  DischargeSummaryObj['allergies'],
                'diagnosis' :  DischargeSummaryObj['diagnosis'],
                'investigation' :  DischargeSummaryObj['investigation'],
                'treatment' :  DischargeSummaryObj['treatment'],
                'advice_on_discharge' :  DischargeSummaryObj['advice_discharge'],
                    
                }


            if int(DischargeSummaryObj['discharge_summary_id']) == 0:
                DischargeSummary_IN.objects.create(**discharge_summary_dbParam)
                

            else:

                DischargeSummary_IN.objects.filter(id = int(DischargeSummaryObj['discharge_summary_id'])).update(**discharge_summary_dbParam)


            messages.success(request , "Successful")

            return JsonResponse({"status":"success"},status=200)
            

    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)        



class GetDischargeSummary_Data_In(View):

    def get(self,request):

        IP_Assignid = int(request.GET.get('ip_assignid'))



        try:
            dischargeObj = DischargeSummary_IN.objects.get(ip_no = IP_Assignid)

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

                'ip_no' : dischargeObj.ip_no.id,
                'date_of_admission' : dischargeObj.ip_no.assigned_date,
                'date_of_discharge' : dischargeObj.ip_no.discharged_date,
                'date_of_surgery' : dischargeObj.date_of_surgery,

                'room_id' : dischargeObj.room.id,
                'room_no' : dischargeObj.room.room_no,
                'room_type' : dischargeObj.room.room_type,

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

        IP_Assignid = int(request.GET.get('ip_assignid'))  
        roomid = int(request.GET.get('ip_roomid'))  
        

        ipobj = AssignRooms.objects.get(id  = IP_Assignid)
        ipobj.status = 1
        ipobj.discharged_date = datetime.now()  
        ipobj.save()
        # ip_payment = IN_Patient_Payments.objects.get(assignroom = ipobj.id)

        # print('test',ip_payment.balance)
        # if ip_payment.balance == 0:
        #     ipobj.payment_pending = False
        #     ipobj.save()

        Rooms.objects.filter(id  = roomid).update(vacancy_status = 0)
        print(ipobj)



        messages.success(request , "Patient Discharged")

        return JsonResponse({"status":"success"},status=200)    






class RoomCategoryView(View):    
    def post(self , request):
        roomCategoryId = int(request.POST.get("roomCategoryId"))

        category_name = request.POST.get("category_name")
        category = request.POST.get("category")
        category_db_param = {
            'name' : category_name,
            'category' : category,
        }

        if roomCategoryId == 0:
            RoomCategory.objects.create(**category_db_param)
            messages.success(request , "Category Added Successfully")
            return redirect("ward")

        else:
            WardBedData = RoomCategory.objects.filter(id = roomCategoryId).update(**category_db_param)

            messages.success(request , "Category Updated Successfully")
            return redirect("ward")

    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)



class TransferRoomView(View):    
    def post(self , request):
        transfer_IP_id = int(request.POST.get("transfer_IP_id"))
        transfer_room_id = int(request.POST.get("transfer_room_id"))
        room = int(request.POST.get("room"))
        transfer_reason = request.POST.get("transfer_reason")

        print('IP',transfer_IP_id)
        print('t-room',transfer_room_id)
        print('room',room)
        print('reason',transfer_reason)

        Assignroomobj = AssignRooms.objects.get(id = transfer_IP_id)
        from_roomObj =  Rooms.objects.get(id = transfer_room_id)
        to_roomobj = Rooms.objects.get(id = room)

        from_roomObj.vacancy_status = 0
        from_roomObj.save()


        AssignRooms.objects.filter(id = transfer_IP_id).update(room = to_roomobj )

        to_roomobj.vacancy_status = 1
        to_roomobj.save()

        transfer_db_param = {
            'assignroom' : Assignroomobj,
            'from_room' : from_roomObj,
            'to_room' : to_roomobj,
            'reason' : transfer_reason,
        }

        TransferRoom.objects.create(**transfer_db_param)
        messages.success(request , "Transfered Successfully")
        return redirect("assign_room")


    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)




class IP_Refund(View):

    def post(self , request):

        AppointmentObj = AssignRoom.objects.get(id = int(request.POST.get('ip_id_for_refund')))

        print('files',AppointmentObj)
        refundObj = IN_Patient_Payments.objects.get(appointment = AppointmentObj)


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



        

               