from django.db import models
from patient.models import Patient
from appointment.models import Appointment ,LabTestForOutPatient
from room.models import AssignRooms , LabTestForINPatient
from ward.models import AssignWard , LabTestForWardPatient
from django.contrib.auth.models import User

# Create your models here.


class LabCategory(models.Model):
    
    name = models.CharField(max_length = 150 , null = True)
    description = models.TextField(default = "" , null = True)
    status = models.BooleanField(default=False , null=True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = "LabCategory"
        ordering = ['id']
        default_permissions = ()


class LabGroup(models.Model):
    
    name = models.CharField(max_length = 150 , null = True)
    amount = models.IntegerField(default = 0 , null = True)
    category = models.ForeignKey(LabCategory , on_delete = models.DO_NOTHING , null = True , blank = True)
    description = models.TextField(default = "" , null = True)
    status = models.BooleanField(default=False , null=True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = "LabGroup"
        ordering = ['id']
        default_permissions = ()


class LabTest(models.Model):
    
    name = models.CharField(max_length = 150 , null = True)
    group = models.ForeignKey(LabGroup , on_delete = models.DO_NOTHING , null = True , blank = True)
    input_type = models.CharField(max_length = 100 , null = True)
    normal_range = models.CharField(max_length = 100 , null = True)
    unit = models.CharField(max_length = 100 , null = True)
    is_radio = models.BooleanField(default = False , null = True)
    status = models.BooleanField(default=False , null=True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = "LabTest"
        ordering = ['id']
        default_permissions = ()






class LabTestForPatient(models.Model):
    
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True , blank = True)
    total_amount = models.IntegerField(default = 0 , null = True)
    balance = models.IntegerField(default = 0 , null = True)
    cash = models.IntegerField(default = 0 , null = True)
    upi = models.IntegerField(default = 0 , null = True)
    card = models.IntegerField(default = 0 , null = True)
    initially_paid = models.BooleanField(default=False , null = True)
    complete = models.BooleanField(default=False , null = True)
    patient_type = models.CharField(max_length = 100 , null = True)
    appointment = models.ForeignKey(Appointment , on_delete = models.DO_NOTHING , null = True , blank = True)
    op_lab_test = models.ForeignKey(LabTestForOutPatient , on_delete = models.DO_NOTHING , null = True , blank = True)
    assignroom = models.ForeignKey(AssignRooms , on_delete = models.DO_NOTHING , null = True , blank = True)
    ip_lab_test = models.ForeignKey(LabTestForINPatient , on_delete = models.DO_NOTHING , null = True , blank = True)
    assignward = models.ForeignKey(AssignWard , on_delete = models.DO_NOTHING , null = True , blank = True)
    ward_lab_test = models.ForeignKey(LabTestForWardPatient , on_delete = models.DO_NOTHING , null = True , blank = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = "LabTestForPatient"
        ordering = ['id']
        default_permissions = ()


class LabTestForDirectPatient(models.Model):
    
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True , blank = True)
    patient_type = models.CharField(max_length = 100 , null = True)
    doctor_name =  models.CharField(max_length = 100 ,null = True)
    lab_test = models.JSONField(null = True)
    lab_checked = models.BooleanField(default=False , null = True)
    lab_canceled = models.BooleanField(default=False , null = True)
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
        verbose_name_plural = "LabTestForDirectPatient"
        ordering = ['id']
        default_permissions = ()


class LabPaymentTransaction(models.Model):

    
    user = models.ForeignKey(User, on_delete = models.DO_NOTHING , null = True)
    patient_type = models.CharField(max_length = 200 , null = True)
    appointment = models.ForeignKey(Appointment , on_delete = models.DO_NOTHING , null = True , blank = True)
    assignroom = models.ForeignKey(AssignRooms , on_delete = models.DO_NOTHING , null = True , blank = True)
    assignward = models.ForeignKey(AssignWard , on_delete = models.DO_NOTHING , null = True , blank = True)
    lab_for_general_patient = models.ForeignKey(LabTestForPatient , on_delete = models.DO_NOTHING , null = True)
    lab_for_direct_patient = models.ForeignKey(LabTestForDirectPatient , on_delete = models.DO_NOTHING , null = True)
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
        verbose_name_plural = 'LabPaymentTransaction'
        ordering = ['id']
        default_permissions = ()



class TestTakenByPatient(models.Model):
    
    lab_test_for_patient = models.ForeignKey(LabTestForPatient , on_delete = models.DO_NOTHING , null = True ,blank = True)
    lab_test_for_direct_patient = models.ForeignKey(LabTestForDirectPatient , on_delete = models.DO_NOTHING , null = True ,blank = True)
    lab_group = models.ForeignKey(LabGroup , on_delete = models.DO_NOTHING , null = True, blank = True)
    lab_test = models.ForeignKey(LabTest , on_delete = models.DO_NOTHING , null = True, blank = True)
    testunit = models.CharField(max_length = 100)
    testvalue = models.CharField(max_length = 100)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)


    class Meta:
        verbose_name_plural = "TestTakenByPatient"
        ordering = ['id']
        default_permissions = ()