from django.db import models
from patient.models import Patient
from appointment.models import Appointment
from room .models import AssignRooms , XrayForINPatient
from django.contrib.auth.models import User
from ward.models import AssignWard , XrayForWardPatient

# Create your models here.

class Xray(models.Model):
    
    name = models.CharField(max_length = 150 , null = True)
    amount = models.IntegerField(default = 0 , null = True)
    description = models.TextField(default = "" , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = "Xray"
        ordering = ['id']
        default_permissions = ()

class XrayForPatient(models.Model):
     
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True)
    total_amount = models.IntegerField(default = 0 , null = True)
    balance = models.IntegerField(default = 0 , null = True)
    cash = models.IntegerField(default = 0 , null = True)
    upi = models.IntegerField(default = 0 , null = True)
    card = models.IntegerField(default = 0 , null = True)
    initially_paid = models.BooleanField(default=False , null = True)
    complete = models.BooleanField(default=False , null = True)
    appointment = models.ForeignKey(Appointment , on_delete = models.DO_NOTHING , null = True , blank = True)
    patient_type = models.CharField(max_length = 100 , null = True)
    assignroom = models.ForeignKey(AssignRooms , on_delete = models.DO_NOTHING , null = True , blank = True)
    ip_xray_test = models.ForeignKey(XrayForINPatient , on_delete = models.DO_NOTHING , null = True , blank = True)
    assignward = models.ForeignKey(AssignWard , on_delete = models.DO_NOTHING , null = True , blank = True)
    ward_xray_test = models.ForeignKey(XrayForWardPatient , on_delete = models.DO_NOTHING , null = True , blank = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)   


    class Meta:
        verbose_name_plural = "XrayForPatient"
        ordering = ['id']
        default_permissions = ()    


class XrayPaymentTransaction(models.Model):

    
    user = models.ForeignKey(User, on_delete = models.DO_NOTHING , null = True)
    patient_type = models.CharField(max_length = 200 , null = True)
    appointment = models.ForeignKey(Appointment , on_delete = models.DO_NOTHING , null = True , blank = True)
    assignroom = models.ForeignKey(AssignRooms , on_delete = models.DO_NOTHING , null = True , blank = True)
    assignward = models.ForeignKey(AssignWard , on_delete = models.DO_NOTHING , null = True , blank = True)
    xray_for_patient = models.ForeignKey(XrayForPatient , on_delete = models.DO_NOTHING , null = True)
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING  , null = True)
    total = models.IntegerField(default = 0 , null = True)
    existing_balance = models.IntegerField(default = 0 , null = True)
    paid = models.IntegerField(default = 0 , null = True)
    balance = models.IntegerField(default = 0 , null = True)
    cash = models.IntegerField(default = 0 , null = True)
    upi = models.IntegerField(default = 0 , null = True)
    card = models.IntegerField(default = 0 , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)


    class Meta:
        verbose_name_plural = 'XrayPaymentTransaction'
        ordering = ['id']
        default_permissions = ()


class XrayTakenByPatient(models.Model):
    
    xray_for_patient = models.ForeignKey(XrayForPatient , on_delete = models.DO_NOTHING , null = True)
    xray = models.ForeignKey(Xray , on_delete = models.DO_NOTHING , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)


    class Meta:
        verbose_name_plural = "XrayTakenByPatient"
        ordering = ['id']
        default_permissions = ()   




