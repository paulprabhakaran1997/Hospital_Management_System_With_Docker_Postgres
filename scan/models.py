from django.db import models
from patient.models import Patient
from appointment.models import Appointment , ScanForOutPatient
from room .models import AssignRooms , ScanForINPatient
from ward.models import AssignWard , ScanForWardPatient
from django.contrib.auth.models import User

# Create your models here.

class Scan(models.Model):
    name = models.CharField(max_length = 150 , null = True)
    amount = models.IntegerField(default = 0 , null = True)
    description = models.TextField(default = "" , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = "Scan"
        ordering = ['id']
        default_permissions = ()

class ScanForPatient(models.Model):
     
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True)
    total_amount = models.IntegerField(default = 0 , null = True)
    balance = models.IntegerField(default = 0 , null = True)
    cash = models.IntegerField(default = 0 , null = True)
    upi = models.IntegerField(default = 0 , null = True)
    card = models.IntegerField(default = 0 , null = True)
    initially_paid = models.BooleanField(default=False , null = True)
    complete = models.BooleanField(default=False , null = True)
    appointment = models.ForeignKey(Appointment , on_delete = models.DO_NOTHING , null = True , blank = True)
    op_scan_test = models.ForeignKey(ScanForOutPatient, on_delete = models.DO_NOTHING , null = True , blank = True)
    patient_type = models.CharField(max_length = 100 , null = True)
    assignroom = models.ForeignKey(AssignRooms , on_delete = models.DO_NOTHING , null = True , blank = True)
    ip_scan_test = models.ForeignKey(ScanForINPatient , on_delete = models.DO_NOTHING , null = True , blank = True)
    assignward = models.ForeignKey(AssignWard , on_delete = models.DO_NOTHING , null = True , blank = True)
    ward_scan_test = models.ForeignKey(ScanForWardPatient , on_delete = models.DO_NOTHING , null = True , blank = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)   


    class Meta:
        verbose_name_plural = "ScanForPatient"
        ordering = ['id']
        default_permissions = ()    




class ScanForDirectPatient(models.Model):
    
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True , blank = True)
    patient_type = models.CharField(max_length = 100 , null = True)
    doctor_name =  models.CharField(max_length = 100 ,null = True)
    scan_test = models.JSONField(null = True)
    scan_checked = models.BooleanField(default=False , null = True)
    scan_canceled = models.BooleanField(default=False , null = True)
    payment_complete = models.IntegerField(default = 0 , null = True)
    initially_paid = models.BooleanField(default=False , null = True)
    payment_pending = models.BooleanField(default=True , null = True)
    total_amount = models.IntegerField(default = 0 , null = True)
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
        verbose_name_plural = "ScanForDirectPatient"
        ordering = ['id']
        default_permissions = ()




class ScanPaymentTransaction(models.Model):

    
    user = models.ForeignKey(User, on_delete = models.DO_NOTHING , null = True)
    patient_type = models.CharField(max_length = 200 , null = True)
    appointment = models.ForeignKey(Appointment , on_delete = models.DO_NOTHING , null = True , blank = True)
    assignroom = models.ForeignKey(AssignRooms , on_delete = models.DO_NOTHING , null = True , blank = True)
    assignward = models.ForeignKey(AssignWard , on_delete = models.DO_NOTHING , null = True , blank = True)
    scan_for_patient = models.ForeignKey(ScanForPatient , on_delete = models.DO_NOTHING , null = True)
    scan_for_direct_patient = models.ForeignKey(ScanForDirectPatient , on_delete = models.DO_NOTHING , null = True)
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING  , null = True)
    total = models.IntegerField(default = 0 , null = True)
    discount = models.IntegerField(default = 0 , null = True)
    total_after_discount = models.IntegerField(default = 0 , null = True)
    existing_balance = models.IntegerField(default = 0 , null = True)
    paid = models.IntegerField(default = 0 , null = True)
    balance = models.IntegerField(default = 0 , null = True)
    cash = models.IntegerField(default = 0 , null = True)
    upi = models.IntegerField(default = 0 , null = True)
    card = models.IntegerField(default = 0 , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)


    class Meta:
        verbose_name_plural = 'ScanPaymentTransaction'
        ordering = ['id']
        default_permissions = ()





class ScanTakenByPatient(models.Model):
    
    scan_for_patient = models.ForeignKey(ScanForPatient , on_delete = models.DO_NOTHING , null = True, blank = True)
    scan_for_direct_patient = models.ForeignKey(ScanForDirectPatient , on_delete = models.DO_NOTHING , null = True ,blank = True)
    scan = models.ForeignKey(Scan , on_delete = models.DO_NOTHING , null = True)
    value = models.TextField(null=True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)


    class Meta:
        verbose_name_plural = "ScanTakenByPatient"
        ordering = ['id']
        default_permissions = ()   




