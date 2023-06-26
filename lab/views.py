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

from django.shortcuts import render
from django.conf import settings
from django.core.files.storage import FileSystemStorage

from lab.models import LabGroup , LabTest, LabCategory
from appointment.models import Appointment , LabTestForOutPatient , OutPatient_Payments , OutPatient_PaymentTransactions

from room.models import Rooms , AssignRooms  ,LabTestForINPatient , IN_Patient_Payments , IN_Patient_PaymentTransactions

from ward.models import AssignWard , LabTestForWardPatient   , Ward_Patient_Payments , Ward_Patient_PaymentTransactions
from doctor.models import Doctor
from lab.models import LabTestForPatient , TestTakenByPatient , LabTestForDirectPatient , LabPaymentTransaction  
from patient.models import Patient

from lint_hospital.encoders import DefaultEncoder
from functools import reduce

from hospital.helpers import get_staff_data

# Create your views here.

class LabTestView(View):
    template_name="add_lab_test.html"

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


        def get_test_data():
            test_data = []

            LabTestObj = LabTest.objects.filter(status = True).all()

            for ht in LabTestObj:
                data = {
                    'id' : ht.id,
                    'name' : ht.name,
                    'group_id' : ht.group.id,
                    'group_name' : ht.group.name,
                    'amount' : ht.group.amount,
                    'normal_range' : ht.normal_range,
                    'unit' : ht.unit,
                    'is_radio' : str(ht.is_radio),
                }

                test_data.append(data)

            return test_data


        context = {
            'groupdata' : get_group_data(),
            'testdata' : get_test_data(),
            'groupdataObj' : json.dumps(get_group_data() , cls = DefaultEncoder),
            'testdataObj' : json.dumps(get_test_data() , cls = DefaultEncoder),
            'category_data' : LabCategory.objects.values()
        }

        return render(request , self.template_name , context)


    def post(self , request):

        TestId = request.POST.get('testId')

        LabGroupObj = LabGroup.objects.get(id = int(request.POST.get('group')))

        if (request.POST.get("is_radio") == None):
            IsRadio = False
        else:
            IsRadio = True


        labtest_db_param = {
            "name" : request.POST.get("test_name"),
            "group" : LabGroupObj,
            "normal_range" : request.POST.get("normal_range"),
            "unit" : request.POST.get("unit"),
            "is_radio" : IsRadio,
            "status" : True,
        }

        if(TestId == '0'):
            LabTest.objects.create(**labtest_db_param)
            messages.success(request , "Test Added Successfully")
            return redirect('lab')
        else:
            LabTest.objects.filter(id = int(TestId)).update(**labtest_db_param)
            messages.success(request , "Test Updated Successfully")
            return redirect('lab')

        return redirect('lab')

        

    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class LabGroupView(View):

    def post(self , request):
        GroupId = request.POST.get("groupId")
        categoryobj = LabCategory.objects.get(id = int(request.POST.get("group_category")))
        
        labgroup_db_param = {
            "name" : request.POST.get("group_name"),
            "amount" : request.POST.get("amount"),
            "category" : categoryobj,
            "description" : request.POST.get("group_description"),
            "status" : True,

        }

        if(GroupId == '0'):
            LabGroup.objects.create(**labgroup_db_param)
            messages.success(request , "Group Added Successfully")
            return redirect('lab')
        else:
            LabGroup.objects.filter(id = int(GroupId)).update(**labgroup_db_param)
            messages.success(request , "Group Updated Successfully")
            return redirect('lab')


    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)




def get_global_group_data():
        group_data = []

        LabGroupObj = LabGroup.objects.filter(status = True).all()

        for ht in LabGroupObj:

            LabTestObj = LabTest.objects.filter(status = True).filter(group = int(ht.id)).all()

            test_data = []

            for lt in LabTestObj:
                labdata = {
                    'id' : lt.id,
                    'name' : lt.name,
                    'normal_range' : lt.normal_range,
                    'unit' : lt.unit,
                    'is_radio' : str(lt.is_radio),
                }

                test_data.append(labdata)

            data = {
                'id' : ht.id,
                'name' : ht.name,
                'amount' : ht.amount,
                'category' : ht.category.name,
                'description' : ht.description,
                'test_data' : test_data
            }

            group_data.append(data)

        return group_data


def get_lab_test_for_patient_data():
    lab_test_for_patient_data = []

    LabTestForPatientObj = LabTestForPatient.objects.all()

    for ht in LabTestForPatientObj:

        currentdate = datetime.now().date() - ht.patient.dob
        age = currentdate.days//365
        month = (currentdate.days - age *365) // 30

        complete = 0
        status = 0
        doctor_name = ""
        appointed_date = ""
        created_time = ""

        if ht.appointment != None :
            op_appointment_id = ht.appointment.id
            status = ht.appointment.status
            doctor_name = ht.appointment.doctor.name
            appointed_date = str(ht.appointment.appointment_date)
            created_time = ht.appointment.created_time
            # print("Doctor Name OP = " , doctor_name)

        else:
             op_appointment_id = 0 

        if ht.assignroom != None :
            print(ht.assignroom)
            IP_assignid = ht.assignroom.id
            status = ht.assignroom.status
            complete = ht.complete
            doctor_name = ht.ip_lab_test.doctor_checkup.doctor.name
            appointed_date = str(ht.assignroom.assigned_date)
            created_time = ht.assignroom.created_time
            print("Doctor Name ROom = " , doctor_name)

        else:
             IP_assignid = 0 

        if ht.assignward != None :
            ward_assignid = ht.assignward.id
            status = ht.assignward.status
            complete = ht.complete
            doctor_name = ht.ward_lab_test.doctor_checkup.doctor.name
            appointed_date = str(ht.assignward.assigned_date)
            created_time = ht.assignward.created_time
            # print("Doctor Name Ward = " , doctor_name)

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
            'doctor_name' : doctor_name,
            'appointed_date' : appointed_date,
            'created_time' : created_time
        }

        lab_test_for_patient_data.append(data)

    return lab_test_for_patient_data


def get_lab_test_for_direct_patient_data():
    lab_test_for_Dpatient_data = []

    LabTestFor_DPatientObj = LabTestForDirectPatient.objects.all()

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

        lab_test_for_Dpatient_data.append(data)

    return lab_test_for_Dpatient_data


class LabTestFromAppointment(View):
    template_name = "lab_test_from_appointment.html"

    def get(self , request):

        context = {
            'groupdata' : json.dumps(get_global_group_data() , cls = DefaultEncoder),
        }

        return render(request , self.template_name , context)



    def post(self , request):
        data = request.body

        if data:

            PatientData = json.loads(data)['PatientObj'][0]
            TestReportData = json.loads(data)['ReportObj']
            OverAllgroupamount = json.loads(data)['OverAllgroupamount']
            patient_type = json.loads(data)['patient_type']

            PatientObj = Patient.objects.get(id = int(PatientData['patient_id']))
            lab_test_dbParam = {
                "patient" : PatientObj,
                "total_amount" : OverAllgroupamount,
                "balance" : OverAllgroupamount
            }


            if patient_type == 'Direct Patient':
                try:

                    direct_labObj = LabTestForDirectPatient.objects.get(id = int(PatientData['returnLabTestPatient_Id']))
                    direct_labObj.lab_checked = True
                    direct_labObj.save()

                    for trd in TestReportData:

                        LabGroupObj = LabGroup.objects.get(id = int(trd['groupId']))
                        LabTestObj = LabTest.objects.get(id = int(trd['testId']))

                        trd_db_param = {
                            "lab_test_for_direct_patient" : direct_labObj,
                            "lab_group" : LabGroupObj,
                            "lab_test" : LabTestObj,
                            "testunit" : trd['testunit'],
                            "testvalue" : trd['testvalue'],
                        }

                        TestTakenByPatient.objects.create(**trd_db_param)


                except:

                    direct_payment_data = json.loads(data)['direct_payment_data'][0]
                    PatientObj = Patient.objects.get(id = int(direct_payment_data['patient_id']))
                    pending = True
                    direct_db = LabTestForDirectPatient(
                        patient = PatientObj,
                        patient_type = direct_payment_data['patient_type'],
                        lab_test = json.loads(data)['LabObj'],
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
                        doctor_name = json.loads(data)['doctor_direct_test'],
                    )
                    direct_db.save()

                    direct_labObj = LabTestForDirectPatient.objects.latest('id')
                    if direct_db.balance == 0 :
                        pending = False
                        direct_labObj.payment_complete = 2
                    elif direct_db.balance == direct_db.total_amount:
                        direct_labObj.payment_complete = 0
                    else:
                        direct_labObj.payment_complete = 1    
                    direct_labObj.save()
                    
                    dt_db_param = {
                        'patient' : PatientObj,
                        'patient_type' : patient_type,    
                        'user' :  request.user,            
                        'lab_for_direct_patient' : direct_labObj,
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

                    LabPaymentTransaction.objects.create(**dt_db_param)




            else:

                if patient_type == 'Out Patient':
                    AppointmentObj = Appointment.objects.get(id = int(PatientData['appointment_id']))
                    lab_test_dbParam['appointment'] = AppointmentObj
                    lab_test_dbParam['patient_type'] = patient_type
                    lab_test_dbParam['op_lab_test'] = LabTestForOutPatient.objects.get(id = int(PatientData['returnLabTestPatient_Id']))


                    Lab_Obj = LabTestForOutPatient.objects.get(id = int(PatientData['returnLabTestPatient_Id']))
                    Lab_Obj.lab_checked = True
                    Lab_Obj.save()
                    try:
                        Latest_Ltfp_Obj = LabTestForPatient.objects.get(op_lab_test = Lab_Obj)
                    except:
                        LabTestForPatient.objects.create(**lab_test_dbParam)
                        Latest_Ltfp_Obj = LabTestForPatient.objects.latest('id')

                if patient_type == 'In Patient':
                    AssignObj = AssignRooms.objects.get(id = int(PatientData['IP_assignid']))
                    lab_test_dbParam['assignroom'] = AssignObj
                    lab_test_dbParam['patient_type'] = patient_type
                    lab_test_dbParam['ip_lab_test'] = LabTestForINPatient.objects.get(id = int(PatientData['returnLabTestPatient_Id']))

                    Lab_Obj = LabTestForINPatient.objects.get(id = int(PatientData['returnLabTestPatient_Id']))
                    Lab_Obj.lab_checked = True
                    Lab_Obj.save()
                    try:
                        Latest_Ltfp_Obj = LabTestForPatient.objects.get(ip_lab_test = Lab_Obj)
                    except:
                        LabTestForPatient.objects.create(**lab_test_dbParam)
                        Latest_Ltfp_Obj = LabTestForPatient.objects.latest('id')

                        AssignObj.total += int(OverAllgroupamount)
                        AssignObj.balance += int(OverAllgroupamount)
                        if AssignObj.balance == 0:
                            AssignObj.payment_pending = False
                        else:
                            AssignObj.payment_pending = True
                        AssignObj.save()

                if patient_type == 'Ward Patient':
                    AssignObj = AssignWard.objects.get(id = int(PatientData['ward_assignid']))
                    lab_test_dbParam['assignward'] = AssignObj
                    lab_test_dbParam['patient_type'] = patient_type
                    lab_test_dbParam['ward_lab_test'] = LabTestForWardPatient.objects.get(id = int(PatientData['returnLabTestPatient_Id']))

                    Lab_Obj = LabTestForWardPatient.objects.get(id = int(PatientData['returnLabTestPatient_Id']))
                    Lab_Obj.lab_checked = True
                    Lab_Obj.save()

                    AssignObj.total += int(OverAllgroupamount)
                    AssignObj.balance += int(OverAllgroupamount)
                    if AssignObj.balance == 0:
                        AssignObj.payment_pending = False
                    else:
                        AssignObj.payment_pending = True
                    AssignObj.save()



                for trd in TestReportData:

                    LabGroupObj = LabGroup.objects.get(id = int(trd['groupId']))
                    LabTestObj = LabTest.objects.get(id = int(trd['testId']))

                    trd_db_param = {
                        "lab_test_for_patient" : Latest_Ltfp_Obj,
                        "lab_group" : LabGroupObj,
                        "lab_test" : LabTestObj,
                        "testunit" : trd['testunit'],
                        "testvalue" : trd['testvalue'],
                    }

                    TestTakenByPatient.objects.create(**trd_db_param)


            messages.success(request , "Successful")
            return JsonResponse({"status":"success"},status=200)    



    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class CancelLab(View):
    def post(self , request):
         data = request.body
         if data:
            patient_type = json.loads(data)['patient_type']
            cancelingLab = json.loads(data)['canceling_lab']


            if patient_type == 'Out Patient':
                LabTestForOutPatient.objects.filter(id = int(cancelingLab)).update(lab_canceled = True)

            if patient_type == 'In Patient':
                LabTestForINPatient.objects.filter(id = int(cancelingLab)).update(lab_canceled = True)

            if patient_type == 'Ward Patient':
                LabTestForWardPatient.objects.filter(id = int(cancelingLab)).update(lab_canceled = True)

            print(patient_type)


            messages.success(request , "Lab Canceled")
            return JsonResponse({"status":"success"},status=200)    


    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class DeleteGroup(View):
    def get(self , request):

        groupId = int(request.GET.get('groupId'))
        LabGroup.objects.filter(id = groupId).update(status = False)
        LabTest.objects.filter(group = groupId).update(status = False)
        messages.success(request , "Group Deleted ")
        return JsonResponse({"status":"success"},status=200)    

class DeleteTest(View):
    def get(self , request):

        testId = int(request.GET.get('testId'))
        LabTest.objects.filter(id = testId).update(status = False)
        messages.success(request , "Test Deleted ")
        return JsonResponse({"status":"success"},status=200)    


    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)






class Get_LabTest_Data(View):
    def get(self , request):

        today = datetime.now().date()
        tomorrow = today + timedelta(1)
        today_start = datetime.combine(today, time())
        today_end = datetime.combine(tomorrow, time())

        def get_testDetails_from_appointment_data_direct():

            testDetails_from_appointment_data_direct = []

            LabObj = LabTestForDirectPatient.objects.filter(lab_checked = False).filter(lab_canceled = False).all()
            for ht in LabObj:
                    for ig in TestTakenByPatient.objects.filter(lab_test_for_direct_patient = ht):
                        print(ig)
                    test_details = []
                    LabTestGroupObj = ht.lab_test
                    for lt in ht.lab_test:
                        lab_test_data = []
                        LabTestObj = LabTest.objects.filter(group = int(lt)).all()
                        thisGroupId = LabGroup.objects.get(id = int(lt)).id
                        thisGroupName = LabGroup.objects.get(id = int(lt)).name
                        for obj in LabTestObj:
                            test_data = {
                                'id' : obj.id,
                                'test_name' : obj.name,
                                'normal_range' : obj.normal_range,
                                'unit' : obj.unit,
                                'is_radio' : obj.is_radio
                            }
                            lab_test_data.append(test_data)
                        test_details.append({thisGroupName : lab_test_data})
                    currentdate = datetime.now().date() - ht.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30

                    data = {
                        'id' : ht.id,
                        'admission_id' : ht.id,
                        'patient_id' : ht.patient.id,
                        'patient_name' : ht.patient.name,
                        'doctor_name' : ht.doctor_name,
                        'test_details' : test_details,
                        'patient_age'   : age,
                        'patient_gender' : ht.patient.gender,
                        'patient_address' : ht.patient.address,
                        'phone' : ht.patient.phone,
                        'suggestedLabObj':LabTestGroupObj,
                        'payment_complete' : ht.payment_complete
                    }

                    testDetails_from_appointment_data_direct.append(data)

            return testDetails_from_appointment_data_direct
        
        def get_testDetails_from_appointment_data_out():

            testDetails_from_appointment_data_out = []
            AppointmentObj = Appointment.objects.filter(status = False)
            for r in AppointmentObj :
                LabObj = LabTestForOutPatient.objects.filter(appointment = r).filter(lab_checked = False).filter(lab_canceled = False).all()
                for ht in LabObj:
                    test_details = []
                    LabTestGroupObj = ht.lab_test
                    for lt in ht.lab_test:
                       
                        lab_test_data = []

                        LabTestObj = LabTest.objects.filter(group = int(lt)).all()
                        thisGroupId = LabGroup.objects.get(id = int(lt)).id
                        thisGroupName = LabGroup.objects.get(id = int(lt)).name

                        
                        for obj in LabTestObj:
                            test_data = {
                                'id' : obj.id,
                                'test_name' : obj.name,
                                'normal_range' : obj.normal_range,
                                'unit' : obj.unit,
                                'is_radio' : obj.is_radio
                            }

                            lab_test_data.append(test_data)

                        test_details.append({thisGroupName : lab_test_data})


                    currentdate = datetime.now().date() - ht.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30

                    data = {
                        'id' : ht.id,
                        'admission_id' : ht.appointment.id,
                        'patient_id' : ht.patient.id,
                        'patient_name' : ht.patient.name,
                        'doctor_name' : ht.appointment.doctor.name,
                        'test_details' : test_details,
                        'patient_age'   : age,
                        'patient_gender' : ht.patient.gender,
                        'patient_address' : ht.patient.address,
                        'phone' : ht.patient.phone,
                        'suggestedLabObj':LabTestGroupObj,
                        'payment_complete' : ht.payment_complete
                    }

                    testDetails_from_appointment_data_out.append(data)

            return testDetails_from_appointment_data_out


        def get_testDetails_from_appointment_data_in():

            testDetails_from_appointment_data_in = []
            AppointmentObj = AssignRooms.objects.filter(status = False)
            for r in AppointmentObj :
                LabObj = LabTestForINPatient.objects.filter(assignroom = r).filter(lab_checked = False).filter(lab_canceled = False).all()
                for ht in LabObj:
                    test_details = []
                    LabTestGroupObj = ht.lab_test
                    for lt in ht.lab_test:
                        lab_test_data = []

                        LabTestObj = LabTest.objects.filter(group = int(lt)).all()
                        thisGroupName = LabGroup.objects.get(id = int(lt)).name
                        
                        for obj in LabTestObj:
                            test_data = {
                                'id' : obj.id,
                                'test_name' : obj.name,
                                'normal_range' : obj.normal_range,
                                'unit' : obj.unit,
                                'is_radio' : obj.is_radio
                            }

                            lab_test_data.append(test_data)

                        test_details.append({thisGroupName : lab_test_data})

                    currentdate = datetime.now().date() - ht.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30

                    data = {
                        'id' : ht.id,
                        'admission_id' : ht.assignroom.id,
                        'patient_id' : ht.patient.id,
                        'patient_name' : ht.patient.name,
                        'doctor_name' : ht.doctor_checkup.doctor.name,
                        'test_details' : test_details,
                        'patient_age'   : age,
                        'patient_gender' : ht.patient.gender,
                        'patient_address' : ht.patient.address,
                        'phone' : ht.patient.phone,
                        'suggestedLabObj':LabTestGroupObj,
                        'payment_complete' : ht.payment_complete


                    }

                    testDetails_from_appointment_data_in.append(data)

            return testDetails_from_appointment_data_in


        def get_testDetails_from_appointment_data_ward():

            testDetails_from_appointment_data_ward = []
            AppointmentObj = AssignWard.objects.filter(status = False)
            for r in AppointmentObj :
                LabObj = LabTestForWardPatient.objects.filter(assignward = r).filter(lab_checked = False).filter(lab_canceled = False).all()
                for ht in LabObj:
                    test_details = []
                    LabTestGroupObj = ht.lab_test
                    for lt in ht.lab_test:
                        lab_test_data = []

                        LabTestObj = LabTest.objects.filter(group = int(lt)).all()
                        thisGroupName = LabGroup.objects.get(id = int(lt)).name
                        
                        for obj in LabTestObj:
                            test_data = {
                                'id' : obj.id,
                                'test_name' : obj.name,
                                'normal_range' : obj.normal_range,
                                'unit' : obj.unit,
                                'is_radio' : obj.is_radio
                            }

                            lab_test_data.append(test_data)

                        test_details.append({thisGroupName : lab_test_data})

                    currentdate = datetime.now().date() - ht.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30

                    data = {
                        'id' : ht.id,
                        'admission_id' : ht.assignward.id,
                        'patient_id' : ht.patient.id,
                        'patient_name' : ht.patient.name,
                        'doctor_name' : ht.doctor_checkup.doctor.name,
                        'test_details' : test_details,
                        'patient_age'   : age,
                        'patient_gender' : ht.patient.gender,
                        'patient_address' : ht.patient.address,
                        'phone' : ht.patient.phone,
                        'suggestedLabObj':LabTestGroupObj,

                    }

                    testDetails_from_appointment_data_ward.append(data)

            return testDetails_from_appointment_data_ward

        
        TestDetailsFromAppointmentData_direct = get_testDetails_from_appointment_data_direct()
        TestDetailsFromAppointmentData_out = get_testDetails_from_appointment_data_out()
        TestDetailsFromAppointmentData_in = get_testDetails_from_appointment_data_in()
        TestDetailsFromAppointmentData_ward = get_testDetails_from_appointment_data_ward()
       

        context = {
            'labtest_from_appointmentdata_direct' : TestDetailsFromAppointmentData_direct , 
            'labtest_from_appointmentdata_out' : TestDetailsFromAppointmentData_out , 
            'labtest_from_appointmentdata_in' : TestDetailsFromAppointmentData_in , 
            'labtest_from_appointmentdata_ward' : TestDetailsFromAppointmentData_ward , 
            'labtestforpatientdata' : get_lab_test_for_patient_data() , 
            'labtestfordirectpatientdata' : get_lab_test_for_direct_patient_data() , 
            'user_group_id' : int(request.user.groups.all()[0].id)
        }

        return JsonResponse(context , safe = False)



class LabPayment(View):

    def post(self , request):

        data = request.body
        if data :
            lab_payment_data = json.loads(data)['lab_payment_data'][0]

            print(lab_payment_data)

            patient_type = lab_payment_data['patient_type']
            PatientObj = Patient.objects.get(id = int(lab_payment_data['patient_id']))



            if patient_type == 'Direct Patient':

                direct_labObj = LabTestForDirectPatient.objects.get(id = int(lab_payment_data['Direct_labtest_Id']))
                
                print(direct_labObj.total_amount)
                total = direct_labObj.total_amount
                existing_balance = direct_labObj.balance
                

                direct_labObj.patient = PatientObj
                direct_labObj.discount += lab_payment_data['discount']
                direct_labObj.total_after_discount = total - direct_labObj.discount
                direct_labObj.paid += lab_payment_data['paid']
                direct_labObj.balance = lab_payment_data['balance']
                direct_labObj.cash += lab_payment_data['cash']
                direct_labObj.card += lab_payment_data['card']
                direct_labObj.upi += lab_payment_data['upi']
                direct_labObj.initially_paid = True
                total_after_discount = direct_labObj.total_after_discount
                
                if int(lab_payment_data['balance']) == 0 :
                    direct_labObj.payment_pending = False
                    direct_labObj.payment_complete = 2
                else:
                    direct_labObj.payment_complete = 1



                direct_labObj.save()    

                dt_db_param = {
                    'patient' : PatientObj,
                    'patient_type' : patient_type,    
                    'user' :  request.user,            
                    'lab_for_direct_patient' : direct_labObj,
                    'total' : total,
                    'discount' : lab_payment_data['discount'],
                    'total_after_discount' : int(total-lab_payment_data['discount']),
                    'paid' : lab_payment_data['paid'],
                    'balance' : lab_payment_data['balance'],
                    'existing_balance' : existing_balance,
                    'cash' : lab_payment_data['cash'],
                    'card' : lab_payment_data['card'],
                    'upi' : lab_payment_data['upi'],
                }

                LabPaymentTransaction.objects.create(**dt_db_param)

                messages.success(request , "Successful")
                return JsonResponse({"status":"info"},status=200) 
            


            if patient_type == 'Out Patient':

                op_obj = Appointment.objects.get(id = int(lab_payment_data['OP_appointmentid']))

                if op_obj.initially_paid == True:
                    messages.info(request , "You Already Paid In Reception")
                    return JsonResponse({"status":"info"},status=200) 

                else:
                    op_payment_data =  OutPatient_Payments.objects.get(appointment = op_obj.id)
                    existing_balance = 0
                    print(int(lab_payment_data['returnLabTestPatient_Id']))
                    op_lab_obj = 0


                    try:

                        labobj =  LabTestForPatient.objects.get(id = int(lab_payment_data['LabTestId']))
                        op_lab_obj = labobj.op_lab_test


                        if labobj.initially_paid == False:
                            op_payment_data.total += lab_payment_data['total']
                            op_payment_data.lab += lab_payment_data['total']
                            op_existing_balance = op_payment_data.total
                        else:   
                            op_existing_balance = op_payment_data.balance

                        existing_balance = labobj.balance
                        labobj.cash = labobj.cash + lab_payment_data['cash']
                        labobj.upi = labobj.upi + lab_payment_data['upi']
                        labobj.card = labobj.card + lab_payment_data['card']
                        labobj.balance = lab_payment_data['balance']
                        labobj.patient = PatientObj
                        labobj.save()


                    except:

                        op_lab_obj = LabTestForOutPatient.objects.get(id = int(lab_payment_data['returnLabTestPatient_Id']))
                        op_payment_data.total += lab_payment_data['total']
                        op_payment_data.lab += lab_payment_data['total']
                        op_existing_balance = op_payment_data.total

                        lab_db = LabTestForPatient(
                            patient = PatientObj,
                            total_amount = lab_payment_data['total'],
                            balance = lab_payment_data['balance'],
                            cash = lab_payment_data['cash'],
                            upi = lab_payment_data['upi'],
                            card = lab_payment_data['card'],
                            appointment = op_obj,
                            patient_type = patient_type,
                            initially_paid = True,
                            op_lab_test = op_lab_obj
                        )
                        lab_db.save()

                        labobj = LabTestForPatient.objects.latest('id')
                        existing_balance = lab_payment_data['total']


                    if int(lab_payment_data['balance'] == 0):
                        op_lab_obj.payment_complete = 2
                    else:
                        op_lab_obj.payment_complete = 1
                    op_lab_obj.save()

                    op_payment_data.payment_recived_by_lab += lab_payment_data['paid']
                    op_payment_data.paid += lab_payment_data['paid']
                    op_payment_data.total_after_discount = op_payment_data.total -  op_payment_data.discount
                    op_payment_data.balance = op_payment_data.total - op_payment_data.paid - op_payment_data.discount
                    op_payment_data.cash += lab_payment_data['cash']
                    op_payment_data.card += lab_payment_data['card']
                    op_payment_data.upi += lab_payment_data['upi']
                    op_payment_data.save()

                    OutPatientPaymentTransactionDB = OutPatient_PaymentTransactions(
                        user = request.user,
                        department = 'Lab',
                        op_payment = op_payment_data,
                        appointment = op_obj,
                        patient = PatientObj,
                        total = op_payment_data.total,
                        existing_balance = op_existing_balance,
                        paid = lab_payment_data['paid'],
                        balance = op_payment_data.balance,
                        cash = lab_payment_data['cash'],
                        upi = lab_payment_data['upi'],
                        card = lab_payment_data['card'],
                    )

                    OutPatientPaymentTransactionDB.save()

                    LabTransactionDB = LabPaymentTransaction(
                            user = request.user,
                            appointment = op_obj,
                            patient_type = patient_type,
                            lab_for_general_patient = labobj,
                            patient = PatientObj,
                            total = lab_payment_data['total'],
                            existing_balance = existing_balance,
                            paid = lab_payment_data['paid'],
                            balance = lab_payment_data['balance'],
                            cash = lab_payment_data['cash'],
                            upi = lab_payment_data['upi'],
                            card = lab_payment_data['card'],
                        )

                    LabTransactionDB.save()


                    messages.success(request , "Successful")
                    return JsonResponse({"status":"info"},status=200)  


            if patient_type == 'In Patient':

                ip_obj = AssignRooms.objects.get(id = int(lab_payment_data['IP_assignid']))
                ip_lab_obj = 0


                ip_payment_db_param = {
                    'assignroom' : ip_obj,
                    'patient' : PatientObj,
                    'payment_recived_by_lab' : lab_payment_data['paid'],
                    'lab' : lab_payment_data['total'],
                    'total' : lab_payment_data['total'],
                    'total_after_discount' : lab_payment_data['total'],
                    'paid' : lab_payment_data['paid'],
                    'balance' : lab_payment_data['balance'],
                    'cash' : lab_payment_data['cash'],
                    'upi' : lab_payment_data['upi'],
                    'card' : lab_payment_data['card'],
                }
                try:
                    labobj =  LabTestForPatient.objects.get(id = int(lab_payment_data['LabTestId']))
                    ip_lab_obj = labobj.ip_lab_test
                except:
                    ip_lab_obj = LabTestForINPatient.objects.get(id = int(lab_payment_data['returnLabTestPatient_Id']))
                    ip_obj.total += int(lab_payment_data['total'])
                    ip_obj.balance += int(lab_payment_data['total'])
                    if ip_obj.balance == 0:
                        ip_obj.payment_pending = False
                    else:
                        ip_obj.payment_pending = True
                    ip_obj.save()

                    lab_db = LabTestForPatient(
                            patient = PatientObj,
                            total_amount = lab_payment_data['total'],
                            balance = lab_payment_data['balance'],
                            assignroom = ip_obj,
                            patient_type = patient_type,
                            ip_lab_test = ip_lab_obj
                        )
                    lab_db.save()
                    labobj = LabTestForPatient.objects.latest('id')


                try:
                        
                    ip_payment =  IN_Patient_Payments.objects.get(assignroom = ip_obj.id )

                    if labobj.initially_paid == False:
                        ip_payment.total += lab_payment_data['total']
                        ip_payment.lab += lab_payment_data['total']
                        ip_existing_balance = ip_payment.total
                    else:
                        ip_existing_balance = ip_payment.balance

                    ip_payment.payment_recived_by_lab += lab_payment_data['paid']
                    ip_payment.paid += lab_payment_data['paid']
                    ip_payment.total_after_discount = ip_payment.total -  ip_payment.discount
                    ip_payment.balance = ip_payment.total - ip_payment.paid - ip_payment.discount
                    ip_payment.cash += lab_payment_data['cash']
                    ip_payment.upi += lab_payment_data['upi']
                    ip_payment.card += lab_payment_data['card']
                    ip_payment.save()

                    IN_PatientPaymentTransactionDB = IN_Patient_PaymentTransactions(
                        user = request.user,
                        department = 'Lab',
                        ip_payment = ip_payment,
                        assignroom = ip_obj,
                        patient = PatientObj,
                        total = ip_payment.total,
                        existing_balance = ip_existing_balance,
                        paid = lab_payment_data['paid'],
                        balance = ip_payment.balance,
                        cash = lab_payment_data['cash'],
                        upi = lab_payment_data['upi'],
                        card = lab_payment_data['card'],
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
                        department = 'Lab',
                        ip_payment = LatestObj,
                        assignroom = ip_obj,
                        patient = PatientObj,
                        total = lab_payment_data['total'],
                        existing_balance = lab_payment_data['total'],
                        paid = lab_payment_data['paid'],
                        balance = lab_payment_data['balance'],
                        cash = lab_payment_data['cash'],
                        upi = lab_payment_data['upi'],
                        card = lab_payment_data['card'],
                    )
                    IN_PatientPaymentTransactionDB.save()

                    ip_obj.paid = lab_payment_data['paid']
                    ip_obj.balance = ip_obj.total - ip_obj.paid
                    if ip_obj.balance == 0:
                        ip_obj.payment_pending = False
                    else:
                        ip_obj.payment_pending = True
                    ip_obj.save()


                if int(lab_payment_data['balance'] == 0):
                    ip_lab_obj.payment_complete = 2
                else:
                    ip_lab_obj.payment_complete = 1
                ip_lab_obj.save()
                
                existing_balance = labobj.balance
                labobj.cash = labobj.cash + lab_payment_data['cash']
                labobj.upi = labobj.upi + lab_payment_data['upi']
                labobj.card = labobj.card + lab_payment_data['card']
                labobj.balance = lab_payment_data['balance']
                labobj.initially_paid = True  
                labobj.save()


                LabTransactionDB = LabPaymentTransaction(
                    user = request.user,
                    assignroom = ip_obj,
                    patient_type = patient_type,
                    lab_for_general_patient = labobj,
                    patient = PatientObj,
                    total = lab_payment_data['total'],
                    existing_balance = existing_balance,
                    paid = lab_payment_data['paid'],
                    balance = lab_payment_data['balance'],
                    cash = lab_payment_data['cash'],
                    upi = lab_payment_data['upi'],
                    card = lab_payment_data['card'],
                )

                LabTransactionDB.save()

                messages.success(request , "Successful")
                return JsonResponse({"status":"info"},status=200) 

            
            
            
            if patient_type == 'Ward Patient':

                ward_obj = AssignWard.objects.get(id = int(lab_payment_data['Ward_assignid']))

                ward_payment_db_param = {
                    'assignward' : ward_obj,
                    'patient' : PatientObj,
                    'payment_recived_by_lab' : lab_payment_data['paid'],
                    'lab' : lab_payment_data['total'],
                    'total' : lab_payment_data['total'],
                    'total_after_discount' : lab_payment_data['total'],
                    'paid' : lab_payment_data['paid'],
                    'balance' : lab_payment_data['balance'],
                    'cash' : lab_payment_data['cash'],
                    'upi' : lab_payment_data['upi'],
                    'card' : lab_payment_data['card'],
                }

                labobj =  LabTestForPatient.objects.get(id = int(lab_payment_data['LabTestId']))

                try:
                    ward_payment =  Ward_Patient_Payments.objects.get(assignward = ward_obj.id )
                    if labobj.initially_paid == False:
                        ward_payment.total += lab_payment_data['total']
                        ward_payment.lab += lab_payment_data['total']
                        ward_existing_balance = ward_payment.total
                    else:
                        ward_existing_balance = ward_payment.balance

                    ward_payment.payment_recived_by_lab += lab_payment_data['paid']
                    ward_payment.paid += lab_payment_data['paid']
                    ward_payment.total_after_discount = ward_payment.total -  ward_payment.discount
                    ward_payment.balance = ward_payment.total - ward_payment.paid  - ward_payment.discount
                    ward_payment.cash += lab_payment_data['cash']
                    ward_payment.upi += lab_payment_data['upi']
                    ward_payment.card += lab_payment_data['card']
                    ward_payment.save()

                    Ward_PatientPaymentTransactionDB = Ward_Patient_PaymentTransactions(
                        user = request.user,
                        department = 'Lab',
                        ward_payment = ward_payment,
                        assignward = ward_obj,
                        patient = PatientObj,
                        total = ward_payment.total,
                        existing_balance = ward_existing_balance,
                        paid = lab_payment_data['paid'],
                        balance = ward_payment.balance,
                        cash = lab_payment_data['cash'],
                        upi = lab_payment_data['upi'],
                        card = lab_payment_data['card'],
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
                        department = 'Lab',
                        ward_payment = LatestObj,
                        assignward = ward_obj,
                        patient = PatientObj,
                        total = lab_payment_data['total'],
                        existing_balance = lab_payment_data['total'],
                        paid = lab_payment_data['paid'],
                        balance = lab_payment_data['balance'],
                        cash = lab_payment_data['cash'],
                        upi = lab_payment_data['upi'],
                        card = lab_payment_data['card'],
                    )
                    Ward_PatientPaymentTransactionDB.save()

                    ward_obj.paid = lab_payment_data['paid']
                    ward_obj.balance = ward_obj.total - ward_obj.paid
                    if ward_obj.balance == 0:
                        ward_obj.payment_pending = False
                    else:
                        ward_obj.payment_pending = True
                    ward_obj.save()
                    
                print("Ward Lab Payment New = " , lab_payment_data)

                
                existing_balance = labobj.balance
                print("Existing Balance = ",existing_balance)
                labobj.cash = labobj.cash + lab_payment_data['cash']
                labobj.upi = labobj.upi + lab_payment_data['upi']
                labobj.card = labobj.card + lab_payment_data['card']
                labobj.balance = lab_payment_data['balance']
                labobj.initially_paid = True  
                labobj.save()


                LabTransactionDB = LabPaymentTransaction(
                    user = request.user,
                    assignward = ward_obj,
                    patient_type = patient_type,
                    lab_for_general_patient = labobj,
                    patient = PatientObj,
                    total = lab_payment_data['total'],
                    existing_balance = existing_balance,
                    paid = lab_payment_data['paid'],
                    balance = lab_payment_data['balance'],
                    cash = lab_payment_data['cash'],
                    upi = lab_payment_data['upi'],
                    card = lab_payment_data['card'],
                )

                LabTransactionDB.save()
            
                messages.success(request , "Successful")
                return JsonResponse({"status":"success"},status=200)  


    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class PatientLabReportView(View):
    template_name = "patient_lab_report.html"

    def get(self , request , patient_type, id , return_url):
        
        print(id)

        def get_patient_data():
            patient_data = []

            
            if patient_type == 'direct_patient':
                try:
                    LabTestForDirectPatientObj = LabTestForDirectPatient.objects.get(id = id)
                    currentdate = datetime.now().date() - LabTestForDirectPatientObj.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30

                    data = {
                        'id' : LabTestForDirectPatientObj.id,
                        'patient_id' : LabTestForDirectPatientObj.patient.id,
                        'patient_name' : LabTestForDirectPatientObj.patient.name,
                        'patient_age' : age,
                        'patient_gender' : LabTestForDirectPatientObj.patient.gender,
                        'test_date' : LabTestForDirectPatientObj.created_time,
                        'phone' : LabTestForDirectPatientObj.patient.phone,
                        'patient_address' : LabTestForDirectPatientObj.patient.address,
                        'doctor_name' : LabTestForDirectPatientObj.doctor_name
                    }

                    patient_data.append(data)

                except LabTestForDirectPatient.DoesNotExist:
                    patient_data = []

                return patient_data
            
            else:
                try:

                    LabTestForPatientObj = LabTestForPatient.objects.get(id = id)
                    currentdate = datetime.now().date() - LabTestForPatientObj.patient.dob
                    age = currentdate.days//365
                    month = (currentdate.days - age *365) // 30

                    if  LabTestForPatientObj.patient_type == 'Out Patient':

                        doctor_name = LabTestForPatientObj.appointment.doctor.name

                    elif  LabTestForPatientObj.patient_type == 'In Patient':

                        doctor_name = LabTestForPatientObj.ip_lab_test.doctor_checkup.doctor.name

                    elif  LabTestForPatientObj.patient_type == 'Ward Patient':

                        doctor_name = LabTestForPatientObj.ward_lab_test.doctor_checkup.doctor.name

                    else:
                        doctor_name = ''

                    data = {
                        'id' : LabTestForPatientObj.id,
                        'patient_id' : LabTestForPatientObj.patient.id,
                        'patient_name' : LabTestForPatientObj.patient.name,
                        'patient_age' : age,
                        'patient_gender' : LabTestForPatientObj.patient.gender,
                        'test_date' : LabTestForPatientObj.created_time,
                        'phone' : LabTestForPatientObj.patient.phone,
                        'patient_address' : LabTestForPatientObj.patient.address,
                        'doctor_name' : doctor_name
                        
                    }

                    patient_data.append(data)

                except LabTestForPatient.DoesNotExist:
                    patient_data = []

                return patient_data


        def get_patient_lab_report_data():
            PatientLabReportData = []

            if patient_type == 'direct_patient':            

                try:
                    PatientLabReportObj = TestTakenByPatient.objects.filter(lab_test_for_direct_patient = id).all()

                    for ht in PatientLabReportObj:
                        
                        data = {
                            'id' : ht.id,
                            'group_id' : ht.lab_group.id,
                            'group_name' : ht.lab_group.name,
                            'category' : ht.lab_group.category.name,
                            'test_id' : ht.lab_test.id,
                            'test_name' : ht.lab_test.name,
                            'normal_range' : ht.lab_test.normal_range,
                            'testunit' : ht.testunit,
                            'testvalue' : ht.testvalue
                        }

                        PatientLabReportData.append(data)

                except TestTakenByPatient.DoesNotExist:
                    PatientLabReportData = []

                return PatientLabReportData
            
            else :

                try:
                    PatientLabReportObj = TestTakenByPatient.objects.filter(lab_test_for_patient = id).all()

                    for ht in PatientLabReportObj:
                        
                        data = {
                            'id' : ht.id,
                            'group_id' : ht.lab_group.id,
                            'group_name' : ht.lab_group.name,
                            'category' : ht.lab_group.category.name,
                            'test_id' : ht.lab_test.id,
                            'test_name' : ht.lab_test.name,
                            'normal_range' : ht.lab_test.normal_range,
                            'testunit' : ht.testunit,
                            'testvalue' : ht.testvalue
                        }

                        PatientLabReportData.append(data)

                except TestTakenByPatient.DoesNotExist:
                    PatientLabReportData = []

                return PatientLabReportData

      

        context = {
            "patientlabreportdata" : json.dumps(get_patient_lab_report_data() , cls = DefaultEncoder),
            "patientdata" : json.dumps(get_patient_data() , cls = DefaultEncoder),
            "return_url" : return_url,
        }

        return render(request , self.template_name , context)

    
    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)



class Get_Lab_Result_Data(View):
    def get(self , request):
        lab_test_id = int(request.GET.get('lab_test_id'))
        patient_type = request.GET.get('patient_type')
        lab_result_data = []


        if patient_type == 'Direct Patient' :
            Direct_lab_obj = LabTestForDirectPatient.objects.get(id = lab_test_id)
            for i in  TestTakenByPatient.objects.filter(lab_test_for_direct_patient= Direct_lab_obj):

                data = {
                    'id' : i.lab_test.id,
                    'name' : i.lab_test.name,
                    'normal_range' : i.lab_test.normal_range,
                    'unit' : i.lab_test.unit,
                    'is_radio' : str(i.lab_test.is_radio),
                    'test_taken_id' : i.id,
                    'test_value' : i.testvalue,
                    'group_id' : i.lab_group.id,
                    'group_name' : i.lab_group.name,
                    'group_category' : i.lab_group.category.name,
                    'group_amount' : i.lab_group.amount,
                    'group_description' : i.lab_group.description,
                }
                lab_result_data.append(data)

        else:

            lab_test_obj = LabTestForPatient.objects.get(id = lab_test_id)
            for i in  TestTakenByPatient.objects.filter(lab_test_for_patient = lab_test_obj):

                data = {
                    'id' : i.lab_test.id,
                    'name' : i.lab_test.name,
                    'normal_range' : i.lab_test.normal_range,
                    'unit' : i.lab_test.unit,
                    'is_radio' : str(i.lab_test.is_radio),
                    'test_taken_id' : i.id,
                    'test_value' : i.testvalue,
                    'group_id' : i.lab_group.id,
                    'group_name' : i.lab_group.name,
                    'group_category' : i.lab_group.category.name,
                    'group_amount' : i.lab_group.amount,
                    'group_description' : i.lab_group.description,
                }

                lab_result_data.append(data)
        contex = {'lab_result_data': lab_result_data}
        return JsonResponse(contex,status=200)    


    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class Post_Edit_Lab_Result_Data(View):

    def post(self , request):
        data = request.body

        if data:
            TestReportData = json.loads(data)['ReportObj']
            for i in TestReportData:
                test_taken_obj = TestTakenByPatient.objects.get(id = int(i['test_taken_id']))
                test_taken_obj.testvalue = i['testvalue']
                test_taken_obj.testunit = i['testunit']
                test_taken_obj.save()
            messages.success(request , "Successfully Updated")
            return JsonResponse({"status":"success"},status=200)    



    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class PatientPaymentReportView(View):
    template_name = "patient_lab_payment_report.html"

    def get(self , request , patient_type, id , return_url):

        group_data = []
        patient_data = []

        if patient_type == 'direct_patient':

            try:
                direct_obj = LabTestForDirectPatient.objects.get(id = id)

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


                for j in TestTakenByPatient.objects.filter(lab_test_for_direct_patient = direct_obj):
                    data = {
                        'group_name' : j.lab_group.name,
                        'group_amount' : j.lab_group.amount,
                    }
                    group_data.append(data)


            except LabTestForDirectPatient.DoesNotExist:
                group_data = []
                patient_data = []


        else:
            try:
                lab_obj = LabTestForPatient.objects.get(id = id)
                lab_test_obj = 0

                currentdate = datetime.now().date() - lab_obj.patient.dob
                age = currentdate.days//365
                month = (currentdate.days - age *365) // 30

                print(lab_obj.patient_type)

                if lab_obj.patient_type == 'Out Patient':
                    appoint_id =  lab_obj.appointment.id
                    lab_test_obj = lab_obj
                else: 
                    appoint_id =  lab_obj.assignroom.id
                    lab_test_obj = lab_obj

                patient_data = [{

                    'appoint_id' : appoint_id,
                    'patient_type' : lab_obj.patient_type,
                    'patient_id' : lab_obj.patient.id,
                    'patient_name' : lab_obj.patient.name,
                    'patient_age' : age,
                    'patient_gender' : lab_obj.patient.gender,
                    'total' : lab_obj.total_amount,                   
                    'discount' : 0,
                    'paid' : 0,
                    'cash' : lab_obj.cash,
                    'card' : lab_obj.card,
                    'upi' : lab_obj.upi,
                    'balance' : lab_obj.balance,
                    'test_date' : lab_obj.created_time,
                }]


                for j in TestTakenByPatient.objects.filter(lab_test_for_patient = lab_test_obj):
                    data = {
                        'group_name' : j.lab_group.name,
                        'group_amount' : j.lab_group.amount,
                    }
                    group_data.append(data)

            except LabTestForPatient.DoesNotExist:
                group_data = []
                patient_data = []

        print(group_data)     
        groups_details = reduce(lambda re, x: re+[x] if x not in re else re, group_data, [])

        context = {
            "groups_details" : json.dumps(groups_details, cls = DefaultEncoder),
            "patient_data" : json.dumps(patient_data, cls = DefaultEncoder),
            "return_url" : return_url,
        }

        return render(request , self.template_name , context)

    
    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)



class GetLabGroupData(View):

    def get(self , request):

        Lab_Test_Data = []

        for i in LabGroup.objects.filter(status = True).all():

            t_data = []
            for j in LabTest.objects.filter(status = True).filter(group = i.id):

                t_data.append({
                    'id' : j.id,
                    'name' : j.name,       
                    'input_type' : j.input_type,
                    'normal_range' : j.normal_range,
                    'unit' : j.unit,
                    'is_radio' : j.is_radio,
                    'status' : j.status
                })


            g_data = {
                'id' : i.id,
                'name' : i.name,       
                'amount' : i.amount,
                'category_id' : i.category.id,
                'category_name' : i.category.name,
                'description' : i.description,
                'status' : i.status,
                'test_data' : t_data
            }

            Lab_Test_Data.append(g_data)

        context = {'Lab_Test_Data' : Lab_Test_Data}
        return JsonResponse(context , safe = False) 

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)



class PostLabGroup(View):

    def post(self , request):

        data = request.body
        if data :
            lab_group_Data = json.loads(data)['lab_group_Data'][0]
            lab_test_Data = json.loads(data)['lab_test_Data']

            print(lab_test_Data)
            categoryobj = LabCategory.objects.get(id = int(lab_group_Data["lab_group_category"]))

            GroupId = int(lab_group_Data['lab_groupId'])
            labgroup_db_param = {
            "name" : lab_group_Data["lab_group_name"],
            "amount" : lab_group_Data["lab_group_amount"],
            "category" : categoryobj,
            "description" : lab_group_Data["lab_group_description"],
            "status" : True,

        }

        if(GroupId == 0):
            LabGroup.objects.create(**labgroup_db_param)
            Latest_grp_Obj = LabGroup.objects.latest('id')
            for i in lab_test_Data:
                labtest_db_param = {
                    'name' : i['lab_test_name'],
                    'group' : Latest_grp_Obj,
                    'input_type' : i['lab_input_type'],
                    'normal_range' : i['lab_normal_range'],
                    'unit' : i['lab_unit'],
                    'is_radio' : i['lab_is_radio'],
                    'status' : True,
                }

                LabTest.objects.create(**labtest_db_param)

        else:
            grp_Obj  = LabGroup.objects.get(id = int(GroupId))
            LabGroup.objects.filter(id = int(GroupId)).update(**labgroup_db_param)

            for i in lab_test_Data:
                test_creation_id = int(i['test_creation_id'])
                labtest_db_param = {
                    'name' : i['lab_test_name'],
                    'group' : grp_Obj,
                    'input_type' : i['lab_input_type'],
                    'normal_range' : i['lab_normal_range'],
                    'unit' : i['lab_unit'],
                    'is_radio' : i['lab_is_radio'],
                    'status' : True,
                }

                if test_creation_id == 0:
                    LabTest.objects.create(**labtest_db_param)
                else:
                    LabTest.objects.filter(id = test_creation_id).update(**labtest_db_param)

        messages.success(request , "Successful")
        return JsonResponse({"status":"info"},status=200) 
            


    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)




class LabCategoryView(View):

    def post(self , request):

        print(request.POST.dict())
        db_param = request.POST.dict()
        CategoryId = int(db_param['category_Id'])
        del db_param['csrfmiddlewaretoken']
        del db_param['category_Id']
        db_param['status'] = True

        if CategoryId == 0:
            LabCategory.objects.create(**db_param)
            messages.success(request , "Category Added Successfully")
            return redirect('lab') 

        else:
            LabCategory.objects.filter(id = CategoryId).update(**db_param) 
            messages.success(request , "Category Updated Successfully")
            return redirect('lab') 


    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)



class GetCategoryData(View):

    def get(self , request):
        context = {'category_data' : list(LabCategory.objects.filter(status = True).values())}

        return JsonResponse(context , safe = False) 

    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)




class Get_Initial_Payment_data_Lab(View):
    def get(self , request):
        suggested_lab_id = int(request.GET.get('suggested_lab_id'))
        patient_type = request.GET.get('patient_type')
        initial_lab_payment_data = []

        complete = 0
        status = 0
        doctor_name = ""
        appointed_date = ""
        created_time = ""
        op_appointment_id = 0
        IP_assignid = 0
        LabTestForPatient_id = 0
        LabTestFor_Direct_Patient_id = 0
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
                'LabTestForPatient_id' : LabTestForPatient_id,
                'LabTestFor_Direct_Patient_id' : LabTestFor_Direct_Patient_id,
                'patient_type' : patient_type,
                'total_amount' : total_amount,
                'balance' : balance,
                'paid' : paid,
                'discount' : discount
            }

            initial_lab_payment_data.append(data)



        if patient_type == 'Direct Patient' :
            lab_test_obj = LabTestForDirectPatient.objects.filter(id = suggested_lab_id)
            for ht in lab_test_obj:
                doctor_name = ht.doctor_name
                appointed_date = str(ht.created_time)
                created_time = ht.created_time
                LabTestFor_Direct_Patient_id = ht.id
                patient_type = ht.patient_type
                total_amount = ht.total_amount
                balance = ht.balance
                paid = ht.paid
                discount = ht.discount
                append_data()

        if patient_type == 'Out Patient' :
            lab_test_obj = LabTestForPatient.objects.filter(op_lab_test = suggested_lab_id)
            for ht in lab_test_obj:
                op_appointment_id = ht.appointment.id
                status = ht.appointment.status
                doctor_name = ht.appointment.doctor.name
                appointed_date = str(ht.appointment.appointment_date)
                created_time = ht.appointment.created_time
                LabTestForPatient_id = ht.id
                patient_type = ht.patient_type
                total_amount = ht.total_amount
                balance = ht.balance
                paid = (ht.total_amount - ht.balance)
                append_data()


        if patient_type == 'In Patient' :
            lab_test_obj = LabTestForPatient.objects.filter(ip_lab_test = suggested_lab_id)
            print(lab_test_obj)
            for ht in lab_test_obj:
                    IP_assignid = ht.assignroom.id
                    status = ht.assignroom.status
                    complete = ht.complete
                    doctor_name = ht.ip_lab_test.doctor_checkup.doctor.name
                    appointed_date = str(ht.assignroom.assigned_date)
                    created_time = ht.assignroom.created_time
                    LabTestForPatient_id = ht.id
                    patient_type = ht.patient_type
                    total_amount = ht.total_amount
                    balance = ht.balance
                    paid = (ht.total_amount - ht.balance)
                    append_data()



        context = {'initial_lab_payment_data':initial_lab_payment_data}
        return JsonResponse(context,status=200)   


    @method_decorator(login_required)
    @method_decorator(transaction.atomic)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)












