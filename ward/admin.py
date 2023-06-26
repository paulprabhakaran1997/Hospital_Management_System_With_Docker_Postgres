from django.contrib import admin

# Register your models here.
from ward.models import Wards , WardBed , AssignWard , DocterCheckup_Ward , LabTestForWardPatient , XrayForWardPatient , ScanForWardPatient, InjectionForWardPatient , DressingForWardPatient,  MedicineForWardPatient , Ward_Patient_Payments , Ward_Patient_PaymentTransactions , DischargeSummary_Ward

admin.site.register(Wards)
admin.site.register(WardBed)
admin.site.register(AssignWard)
admin.site.register(DocterCheckup_Ward)
admin.site.register(LabTestForWardPatient)
admin.site.register(XrayForWardPatient)
admin.site.register(ScanForWardPatient)
admin.site.register(MedicineForWardPatient)
admin.site.register(InjectionForWardPatient)
admin.site.register(Ward_Patient_Payments)
admin.site.register(Ward_Patient_PaymentTransactions)
admin.site.register(DischargeSummary_Ward)
admin.site.register(DressingForWardPatient)
