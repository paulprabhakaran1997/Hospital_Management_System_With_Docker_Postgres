from django.contrib import admin
from appointment.models import (Appointment , DoctorCheckupAmount,  LabTestForOutPatient , XrayForOutPatient, 
ScanForOutPatient,MedicineForOutPatient ,InjectionForOutPatient, OutPatient_Payments , OutPatient_PaymentTransactions ,Transfer_TO_IP, OP_UploadedReportsFiles)

# Register your models here.
admin.site.register(Appointment)
admin.site.register(DoctorCheckupAmount)
admin.site.register(InjectionForOutPatient)
admin.site.register(MedicineForOutPatient)
admin.site.register(OutPatient_Payments)
admin.site.register(LabTestForOutPatient)
admin.site.register(XrayForOutPatient)
admin.site.register(ScanForOutPatient)
admin.site.register(OutPatient_PaymentTransactions)
admin.site.register(Transfer_TO_IP)
admin.site.register(OP_UploadedReportsFiles)
