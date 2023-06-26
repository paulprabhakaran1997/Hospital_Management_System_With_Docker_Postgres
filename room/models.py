from django.db import models

# Create your models here.

from patient.models import Patient
from doctor.models import Doctor
from django.contrib.auth.models import User

class RoomCategory(models.Model):
    
    name = models.CharField(max_length = 150 , null = True)
    category = models.CharField(max_length = 150 , null = True)     
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = "RoomCategory"
        ordering = ['id']
        default_permissions = ()    



class Rooms(models.Model):
    
    room_no = models.CharField(max_length = 150 , null = True)

    room_type = models.CharField(max_length = 200 , null = True)
    category = models.ForeignKey(RoomCategory , on_delete = models.DO_NOTHING , null = True , blank = True)

    price = models.IntegerField(default = 0 , null = True)
    description = models.TextField(null = True)
    vacancy_status = models.IntegerField(default = 0)

    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = "Rooms"
        ordering = ['id']
        default_permissions = ()



class AssignRooms(models.Model):
    id = models.IntegerField(primary_key  = True)
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True , blank = True)
    doctor = models.ForeignKey(Doctor , on_delete = models.DO_NOTHING , null = True , blank = True)
    checkup = models.IntegerField(default = 0 , null = True)
    has_room = models.BooleanField(default = False , null = True)
    has_lab = models.BooleanField(default=False , null = True)
    has_xray = models.BooleanField(default=False , null = True)
    has_scan = models.BooleanField(default=False , null = True)
    room = models.ForeignKey(Rooms , on_delete = models.DO_NOTHING , null = True , blank = True)
    assigned_date = models.DateTimeField(auto_now=False , auto_now_add = False , null = True)
    reason = models.TextField(null = True , default = "")
    discharged_date = models.DateTimeField(auto_now=False , auto_now_add = False , null = True)
    status = models.IntegerField(default = 0)

    balance_from_op = models.IntegerField(default = 0 , null = True)

    total = models.IntegerField(default = 0 , null = True)
    paid = models.IntegerField(default = 0 , null = True)
    balance = models.IntegerField(default = 0 , null = True)
    
    initially_paid = models.BooleanField(default=False , null = True)
    payment_pending = models.BooleanField(default=True , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)   

    class Meta:
        verbose_name_plural = "AssignRooms"
        ordering = ['id']
        default_permissions = ()


class DocterCheckup(models.Model):
    
    sale_id = models.IntegerField(default=0 , null=True)
    room = models.ForeignKey(Rooms , on_delete = models.DO_NOTHING , null = True , blank = True)
    assignroom = models.ForeignKey(AssignRooms , on_delete = models.DO_NOTHING , null = True , blank = True)   
    doctor = models.ForeignKey(Doctor , on_delete = models.DO_NOTHING , null = True , blank = True)
    doctor_prescription = models.TextField(default = "" , null = True)
    medical_prescription = models.TextField(default = "" , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = 'DocterCheckup'
        ordering = ['id']
        default_permissions = ()




class LabTestForINPatient(models.Model):
    
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True , blank = True)  
    doctor_checkup = models.ForeignKey(DocterCheckup , on_delete = models.DO_NOTHING , null = True , blank = True)
    assignroom = models.ForeignKey(AssignRooms , on_delete = models.DO_NOTHING , null = True , blank = True)   
    lab_test = models.JSONField(null = True)
    lab_checked = models.BooleanField(default=False , null = True)
    lab_canceled = models.BooleanField(default=False , null = True)
    lab_test_date = models.DateTimeField(auto_now=False , auto_now_add = False , null = True)
    payment_complete = models.IntegerField(default = 0 , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = 'LabTestForINPatient'
        ordering = ['id']
        default_permissions = ()


class XrayForINPatient(models.Model):
    
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True , blank = True)  
    doctor_checkup = models.ForeignKey(DocterCheckup , on_delete = models.DO_NOTHING , null = True , blank = True)
    assignroom = models.ForeignKey(AssignRooms , on_delete = models.DO_NOTHING , null = True, blank = True)   
    xray_test = models.JSONField(null = True)
    xray_checked = models.BooleanField(default=False , null = True)
    xray_canceled = models.BooleanField(default=False , null = True)
    xray_test_date = models.DateTimeField(auto_now=False , auto_now_add = False , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = 'XrayForINPatient'
        ordering = ['id']
        default_permissions = ()       

class ScanForINPatient(models.Model):
    
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True , blank = True)  
    doctor_checkup = models.ForeignKey(DocterCheckup , on_delete = models.DO_NOTHING , null = True , blank = True)
    assignroom = models.ForeignKey(AssignRooms , on_delete = models.DO_NOTHING , null = True, blank = True)   
    scan_test = models.JSONField(null = True)
    scan_checked = models.BooleanField(default=False , null = True)
    scan_canceled = models.BooleanField(default=False , null = True)
    scan_test_date = models.DateTimeField(auto_now=False , auto_now_add = False , null = True)
    payment_complete = models.IntegerField(default = 0 , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = 'ScanForINPatient'
        ordering = ['id']
        default_permissions = ()       


class MedicineForINPatient(models.Model):
    
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True , blank = True)  
    doctor_checkup = models.ForeignKey(DocterCheckup , on_delete = models.DO_NOTHING , null = True , blank = True)
    assignroom = models.ForeignKey(AssignRooms , on_delete = models.DO_NOTHING , null = True , blank = True)   
    medicine_list = models.JSONField(null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = 'MedicineForINPatient'
        ordering = ['id']
        default_permissions = ()      



class InjectionForINPatient(models.Model):
    
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True , blank = True)  
    doctor_checkup = models.ForeignKey(DocterCheckup , on_delete = models.DO_NOTHING , null = True , blank = True)
    assignroom = models.ForeignKey(AssignRooms , on_delete = models.DO_NOTHING , null = True , blank = True)   
    injection_list = models.JSONField(null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = 'InjectionForINPatient'
        ordering = ['id']
        default_permissions = ()        


class DressingForINPatient(models.Model):
    
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True , blank = True)  
    doctor_checkup = models.ForeignKey(DocterCheckup , on_delete = models.DO_NOTHING , null = True , blank = True)
    assignroom = models.ForeignKey(AssignRooms , on_delete = models.DO_NOTHING , null = True , blank = True)   
    dressing = models.CharField(max_length = 100 , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = 'DressingForINPatient'
        ordering = ['id']
        default_permissions = ()



class IN_Patient_Payments(models.Model):
    
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null= True)
    assignroom = models.ForeignKey(AssignRooms , on_delete = models.DO_NOTHING , null = True)
    payment_recived_by_lab = models.IntegerField(default = 0 , null = True)
    payment_recived_by_xray = models.IntegerField(default = 0 , null = True)
    payment_recived_by_scan = models.IntegerField(default = 0 , null = True)

    room = models.IntegerField(default = 0 , null = True)
    doctor_fees = models.IntegerField(default = 0 , null = True)
    nursing_charge = models.IntegerField(default = 0 , null = True)
    establishment_charges = models.IntegerField(default = 0 , null = True)
    iv_fluid_charges = models.IntegerField(default = 0 , null = True)
    icu_charges = models.IntegerField(default = 0 , null = True)
    physiotherapy_charges = models.IntegerField(default = 0 , null = True)
    surgery_charges = models.IntegerField(default = 0 , null = True)
    consultant_charges = models.IntegerField(default = 0 , null = True)
    dressing_charges = models.IntegerField(default = 0 , null = True)
    miscellaneous_charges = models.IntegerField(default = 0 , null = True)
    injection = models.IntegerField(default = 0 , null = True)
    lab = models.IntegerField(default = 0 , null = True)
    xray = models.IntegerField(default = 0 , null = True)
    scan = models.IntegerField(default = 0 , null = True)
    
    total = models.IntegerField(default = 0 , null = True)
    discount = models.IntegerField(default = 0 , null = True)
    total_after_discount = models.IntegerField(default = 0 , null = True)

    refund = models.IntegerField(default = 0 , null = True)
    refund_type = models.CharField(max_length=50 , null=True)
    refund_note = models.TextField(max_length=500 , null=True)


    paid = models.IntegerField(default = 0 , null = True)
    balance = models.IntegerField(default = 0 , null = True)
    cash = models.IntegerField(default = 0 , null = True)
    upi = models.IntegerField(default = 0 , null = True)
    card = models.IntegerField(default = 0 , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = "IN_Patient_Payments"
        ordering = ['id']
        default_permissions = ()



class IN_Patient_PaymentTransactions(models.Model):

    
    user = models.ForeignKey(User, on_delete = models.DO_NOTHING , null = True)
    department = models.CharField(max_length = 200 , null = True)
    ip_payment = models.ForeignKey(IN_Patient_Payments , on_delete = models.DO_NOTHING , null = True)
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING  , null = True)
    assignroom = models.ForeignKey(AssignRooms , on_delete = models.DO_NOTHING , null = True)
    total = models.IntegerField(default = 0 , null = True)
    discount = models.IntegerField(default = 0 , null = True)
    total_after_discount = models.IntegerField(default = 0 , null = True)
    existing_balance = models.IntegerField(default = 0 , null = True)
    paid = models.IntegerField(default = 0 , null = True)
    balance = models.IntegerField(default = 0 , null = True)
    cash = models.IntegerField(default = 0 , null = True)
    upi = models.IntegerField(default = 0 , null = True)
    card = models.IntegerField(default = 0 , null = True)
    payment_date = models.DateTimeField(auto_now = True , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)


    class Meta:
        verbose_name_plural = 'IN_Patient_PaymentTransactions'
        ordering = ['id']
        default_permissions = ()



class DischargeSummary_IN(models.Model):
    id = models.IntegerField(primary_key=True)
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING  , null = True)
    ip_no = models.ForeignKey(AssignRooms , on_delete = models.DO_NOTHING , null = True , blank = True)   
    room = models.ForeignKey(Rooms , on_delete = models.DO_NOTHING , null = True , blank = True) 
    consultant = models.ForeignKey(Doctor , on_delete = models.DO_NOTHING , null = True , blank = True)
    date_of_surgery = models.DateTimeField(auto_now=False , auto_now_add = False , null = True)
    allergies = models.CharField(max_length=500 , null=True)
    diagnosis = models.CharField(max_length=500 , null=True)
    investigation = models.CharField(max_length=500 , null=True)
    treatment = models.CharField(max_length=500 , null=True)
    advice_on_discharge = models.CharField(max_length=500 , null=True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)    

    class Meta:
        verbose_name_plural = "DischargeSummary_IN"
        ordering = ['id']
        default_permissions = ()




class TransferRoom(models.Model):
    
    assignroom = models.ForeignKey(AssignRooms , on_delete = models.DO_NOTHING , null = True)
    from_room = models.ForeignKey(Rooms , on_delete = models.DO_NOTHING , null = True, related_name='from_room')
    to_room = models.ForeignKey(Rooms , on_delete = models.DO_NOTHING , null = True, related_name='to_room')
    reason = models.TextField(null = True , default = "")
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True) 

    class Meta:
        verbose_name_plural = 'TransferRoom'
        ordering = ['id']
        default_permissions = ()


