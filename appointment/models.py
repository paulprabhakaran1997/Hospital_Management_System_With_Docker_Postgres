from django.db import models
from patient.models import Patient
from doctor.models import Doctor
from django.contrib.auth.models import User
from room.models import AssignRooms , Rooms

# Create your models here.

class Appointment(models.Model):
    
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True , blank = True)
    bp = models.CharField(max_length = 200 , null = True)
    pulse = models.CharField(max_length = 200 , null = True)
    temperature = models.CharField(max_length = 200 , null = True)
    rr = models.CharField(max_length = 200 , null = True)
    sp_o2 = models.CharField(max_length = 200 , null = True)
    blood_sugar = models.CharField(max_length = 200 , null = True)
    doctor = models.ForeignKey(Doctor, on_delete=models.DO_NOTHING , null = True)
    health_checkup_details = models.JSONField(null=True)
    reason = models.TextField(default = "" , null = True)
    appointment_date = models.DateTimeField(auto_now=False , auto_now_add = False , null = True)
    is_emergency = models.BooleanField(default = False , null = True)
    checkup = models.IntegerField(default = 0 , null = True)
    has_lab = models.BooleanField(default=False , null = True)
    has_xray = models.BooleanField(default=False , null = True)
    has_scan = models.BooleanField(default=False , null = True)
    compliance = models.CharField(max_length = 200 , null = True)
    comorbids = models.CharField(max_length = 200 , null = True)
    review_next_visit = models.DateTimeField(auto_now=False , auto_now_add = False , null = True)
    doctor_prescription = models.TextField(default = "" , null = True)
    medical_prescription = models.TextField(default = "" , null = True)
    initially_paid = models.BooleanField(default=False , null = True)
    payment_pending = models.BooleanField(default=True , null = True)
    status = models.IntegerField(default = 0 , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = "Appointment"
        ordering = ['id']
        default_permissions = ()



class DoctorCheckupAmount(models.Model):

    
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True)  
    appointment = models.ForeignKey(Appointment , on_delete = models.DO_NOTHING , null = True)  
    doctor_fees = models.IntegerField(default = 0 , null = True)
    dressing = models.IntegerField(default = 0 , null = True)
    neb = models.IntegerField(default = 0 , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = 'DoctorCheckupAmount'
        ordering = ['id']
        default_permissions = ()



class LabTestForOutPatient(models.Model):
    
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True)  
    appointment = models.ForeignKey(Appointment , on_delete = models.DO_NOTHING , null = True)   
    lab_test = models.JSONField(null = True)
    lab_checked = models.BooleanField(default=False , null = True)
    lab_canceled = models.BooleanField(default=False , null = True)
    lab_test_date = models.DateTimeField(auto_now=False , auto_now_add = False , null = True)
    payment_complete = models.IntegerField(default = 0 , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = 'LabTestForOutPatient'
        ordering = ['id']
        default_permissions = ()


class XrayForOutPatient(models.Model):
    
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True)  
    appointment = models.ForeignKey(Appointment , on_delete = models.DO_NOTHING , null = True)   
    xray_test = models.JSONField(null = True)
    xray_checked = models.BooleanField(default=False , null = True)
    xray_canceled = models.BooleanField(default=False , null = True)
    xray_test_date = models.DateTimeField(auto_now=False , auto_now_add = False , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = 'XrayForOutPatient'
        ordering = ['id']
        default_permissions = ()       

class ScanForOutPatient(models.Model):
    
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True)  
    appointment = models.ForeignKey(Appointment , on_delete = models.DO_NOTHING , null = True)   
    scan_test = models.JSONField(null = True)
    scan_checked = models.BooleanField(default=False , null = True)
    scan_canceled = models.BooleanField(default=False , null = True)
    scan_test_date = models.DateTimeField(auto_now=False , auto_now_add = False , null = True)
    payment_complete = models.IntegerField(default = 0 , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = 'ScanForOutPatient'
        ordering = ['id']
        default_permissions = ()       


class MedicineForOutPatient(models.Model):
    
    sale_id = models.IntegerField(default=0 , null=True)
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True)  
    appointment = models.ForeignKey(Appointment , on_delete = models.DO_NOTHING , null = True)   
    medicine_list = models.JSONField(null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = 'MedicineForOutPatient'
        ordering = ['id']
        default_permissions = ()      



class InjectionForOutPatient(models.Model):
    
    sale_id = models.IntegerField(default=0 , null=True)
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null = True)  
    appointment = models.ForeignKey(Appointment , on_delete = models.DO_NOTHING , null = True)   
    injection_list = models.JSONField(null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = 'InjectionForOutPatient'
        ordering = ['id']
        default_permissions = ()             





class OutPatient_Payments(models.Model):
    
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING , null= True)
    appointment = models.ForeignKey(Appointment , on_delete = models.DO_NOTHING , null = True)
    doctor_check = models.BooleanField(default=False , null = True)
    payment_recived_by_doctor = models.IntegerField(default = 0 , null = True)
    payment_recived_by_lab = models.IntegerField(default = 0 , null = True)
    payment_recived_by_xray = models.IntegerField(default = 0 , null = True)
    payment_recived_by_scan = models.IntegerField(default = 0 , null = True)
    doctor_fees = models.IntegerField(default = 0 , null = True)
    dressing = models.IntegerField(default = 0 , null = True)
    neb = models.IntegerField(default = 0 , null = True)
    injection = models.IntegerField(default = 0 , null = True)
    one_touch = models.IntegerField(default = 0 , null = True)
    others = models.IntegerField(default = 0 , null = True)
    lab = models.IntegerField(default = 0 , null = True)
    xray = models.IntegerField(default = 0 , null = True)
    scan = models.IntegerField(default = 0 , null = True)


    total = models.IntegerField(default = 0 , null = True)
    discount = models.IntegerField(default = 0 , null = True)
    total_after_discount = models.IntegerField(default = 0 , null = True)

    refund = models.IntegerField(default = 0 , null = True)
    total_after_refund = models.IntegerField(default = 0 , null = True)
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
        verbose_name_plural = "OutPatient_Payments"
        ordering = ['id']
        default_permissions = ()



class OutPatient_PaymentTransactions(models.Model):

    
    user = models.ForeignKey(User, on_delete = models.DO_NOTHING , null = True)
    department = models.CharField(max_length = 200 , null = True)
    op_payment = models.ForeignKey(OutPatient_Payments , on_delete = models.DO_NOTHING , null = True)
    patient = models.ForeignKey(Patient , on_delete = models.DO_NOTHING  , null = True)
    appointment = models .ForeignKey(Appointment , on_delete = models.DO_NOTHING , null  = True)
    total = models.IntegerField(default = 0 , null = True)
    discount = models.IntegerField(default = 0 , null = True)
    total_after_discount = models.IntegerField(default = 0 , null = True)
    refund = models.IntegerField(default = 0 , null = True)
    total_after_refund = models.IntegerField(default = 0 , null = True)
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
        verbose_name_plural = 'OutPatient_PaymentTransactions'
        ordering = ['id']
        default_permissions = ()



class Transfer_TO_IP(models.Model):
    
    from_op = models.ForeignKey(Appointment , on_delete = models.DO_NOTHING , null = True,)
    to_ip = models.ForeignKey(AssignRooms , on_delete = models.DO_NOTHING , null = True, )
    to_room = models.ForeignKey(Rooms , on_delete = models.DO_NOTHING , null = True, )
    reason = models.TextField(null = True , default = "")
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True) 

    class Meta:
        verbose_name_plural = 'Transfer_TO_IP'
        ordering = ['id']
        default_permissions = ()

    
class OP_UploadedReportsFiles(models.Model):
    
    appointment = models .ForeignKey(Appointment , on_delete = models.DO_NOTHING , null  = True)
    reports = models.ImageField(upload_to = "images/op_uploaded_reports/%Y" , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = "OP_UploadedReportsFiles"
        ordering = ['id']
        default_permissions = ()



