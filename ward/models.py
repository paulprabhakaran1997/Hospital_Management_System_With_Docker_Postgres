from django.db import models

# Create your models here.
from patient.models import Patient
from doctor.models import Doctor
from django.contrib.auth.models import User


class Wards(models.Model):
    
    ward_name = models.CharField(max_length = 150 , null = True)
    amount = models.IntegerField(default = 0 , null = True)
    description = models.TextField(null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = "Wards"
        ordering = ['id']
        default_permissions = ()


class WardBed(models.Model):
    
    ward = models.ForeignKey(Wards, on_delete=models.DO_NOTHING , null = True , blank = True)
    bed_no = models.CharField(max_length=100 , null = True)
    description = models.TextField(null = True)
    vacancy_status = models.IntegerField(default = 0 , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = "WardBed"
        ordering = ['id']
        default_permissions = ()


class AssignWard(models.Model):
    
    patient = models.ForeignKey(Patient, on_delete=models.DO_NOTHING, null = True , blank = True)
    checkup = models.IntegerField(default = 0 , null = True)
    has_lab = models.BooleanField(default=False , null = True)
    has_xray = models.BooleanField(default=False , null = True)
    has_scan = models.BooleanField(default=False , null = True)
    ward = models.ForeignKey(Wards, on_delete=models.DO_NOTHING , null = True , blank  = True) 
    ward_bed = models.ForeignKey(WardBed, on_delete=models.DO_NOTHING , null = True , blank = True)
    assigned_date = models.DateTimeField(auto_now=False , auto_now_add = False , null = True)
    reason = models.TextField(null = True , default = "")
    discharged_date = models.DateTimeField(auto_now=False , auto_now_add = False , null = True)
    status = models.IntegerField(default = 0 , null = True)

    total = models.IntegerField(default = 0 , null = True)
    paid = models.IntegerField(default = 0 , null = True)
    balance = models.IntegerField(default = 0 , null = True)

    payment_pending = models.BooleanField(default=True , null = True)
    initially_paid = models.BooleanField(default=False , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = "AssignWard"
        ordering = ['id']
        default_permissions = ()



class DocterCheckup_Ward(models.Model):
    
    ward = models.ForeignKey(Wards, on_delete=models.DO_NOTHING , null = True , blank  = True) 
    ward_bed = models.ForeignKey(WardBed, on_delete=models.DO_NOTHING , null = True , blank = True)
    assignward = models.ForeignKey(AssignWard , on_delete = models.DO_NOTHING , null = True , blank = True)   
    doctor = models.ForeignKey(Doctor , on_delete = models.DO_NOTHING , null = True , blank = True)
    doctor_prescription = models.TextField(default = "" , null = True)
    medical_prescription = models.TextField(default = "" , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = 'DocterCheckup_Ward'
        ordering = ['id']
        default_permissions = ()




class LabTestForWardPatient(models.Model):
    
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True , blank = True)  
    doctor_checkup = models.ForeignKey(DocterCheckup_Ward , on_delete = models.DO_NOTHING , null = True , blank = True)
    assignward = models.ForeignKey(AssignWard , on_delete = models.DO_NOTHING , null = True , blank = True)   
    lab_test = models.JSONField(null = True)
    lab_checked = models.BooleanField(default=False , null = True)
    lab_canceled = models.BooleanField(default=False , null = True)
    lab_test_date = models.DateTimeField(auto_now=False , auto_now_add = False , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = 'LabTestForWardPatient'
        ordering = ['id']
        default_permissions = ()


class XrayForWardPatient(models.Model):
    
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True , blank = True)  
    doctor_checkup = models.ForeignKey(DocterCheckup_Ward , on_delete = models.DO_NOTHING , null = True , blank = True)
    assignward = models.ForeignKey(AssignWard , on_delete = models.DO_NOTHING , null = True , blank = True)   
    xray_test = models.JSONField(null = True)
    xray_checked = models.BooleanField(default=False , null = True)
    xray_canceled = models.BooleanField(default=False , null = True)
    xray_test_date = models.DateTimeField(auto_now=False , auto_now_add = False , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = 'XrayForWardPatient'
        ordering = ['id']
        default_permissions = ()       


class ScanForWardPatient(models.Model):
    
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True , blank = True)  
    doctor_checkup = models.ForeignKey(DocterCheckup_Ward , on_delete = models.DO_NOTHING , null = True , blank = True)
    assignward = models.ForeignKey(AssignWard , on_delete = models.DO_NOTHING , null = True , blank = True)   
    scan_test = models.JSONField(null = True)
    scan_checked = models.BooleanField(default=False , null = True)
    scan_canceled = models.BooleanField(default=False , null = True)
    scan_test_date = models.DateTimeField(auto_now=False , auto_now_add = False , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = 'ScanForWardPatient'
        ordering = ['id']
        default_permissions = ()       


class MedicineForWardPatient(models.Model):
    
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True , blank = True)  
    doctor_checkup = models.ForeignKey(DocterCheckup_Ward , on_delete = models.DO_NOTHING , null = True , blank = True)
    assignward = models.ForeignKey(AssignWard , on_delete = models.DO_NOTHING , null = True , blank = True)   
    medicine_list = models.JSONField(null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = 'MedicineForWardPatient'
        ordering = ['id']
        default_permissions = ()      



class InjectionForWardPatient(models.Model):
    
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True , blank = True)  
    doctor_checkup = models.ForeignKey(DocterCheckup_Ward , on_delete = models.DO_NOTHING , null = True , blank = True)
    assignward = models.ForeignKey(AssignWard , on_delete = models.DO_NOTHING , null = True , blank = True)   
    injection_list = models.JSONField(null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = 'InjectionForWardPatient'
        ordering = ['id']
        default_permissions = ()      



class DressingForWardPatient(models.Model):
    
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True , blank = True)  
    doctor_checkup = models.ForeignKey(DocterCheckup_Ward , on_delete = models.DO_NOTHING , null = True , blank = True)
    assignward = models.ForeignKey(AssignWard , on_delete = models.DO_NOTHING , null = True , blank = True)   
    dressing = models.CharField(max_length = 100 , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = 'DressingForWardPatient'
        ordering = ['id']
        default_permissions = ()        




class Ward_Patient_Payments(models.Model):
    
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null= True)
    assignward = models.ForeignKey(AssignWard , on_delete = models.DO_NOTHING , null = True)
    payment_recived_by_lab = models.IntegerField(default = 0 , null = True)
    payment_recived_by_xray = models.IntegerField(default = 0 , null = True)
    payment_recived_by_scan = models.IntegerField(default = 0 , null = True)

    ward = models.IntegerField(default = 0 , null = True)
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
    paid = models.IntegerField(default = 0 , null = True)
    balance = models.IntegerField(default = 0 , null = True)
    cash = models.IntegerField(default = 0 , null = True)
    upi = models.IntegerField(default = 0 , null = True)
    card = models.IntegerField(default = 0 , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = "Ward_Patient_Payments"
        ordering = ['id']
        default_permissions = ()



class Ward_Patient_PaymentTransactions(models.Model):

    
    user = models.ForeignKey(User, on_delete = models.DO_NOTHING , null = True)
    department = models.CharField(max_length = 200 , null = True)
    ward_payment = models.ForeignKey(Ward_Patient_Payments , on_delete = models.DO_NOTHING , null = True)
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING  , null = True)
    assignward = models.ForeignKey(AssignWard , on_delete = models.DO_NOTHING , null = True)
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
        verbose_name_plural = 'Ward_Patient_PaymentTransactions'
        ordering = ['id']
        default_permissions = ()




class DischargeSummary_Ward(models.Model):
    id = models.IntegerField(primary_key=True)
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING  , null = True)
    ward_no = models.ForeignKey(AssignWard , on_delete = models.DO_NOTHING , null = True , blank = True)   
    ward_bed = models.ForeignKey(WardBed , on_delete = models.DO_NOTHING , null = True , blank = True) 
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
        verbose_name_plural = "DischargeSummary_Ward"
        ordering = ['id']
        default_permissions = ()







