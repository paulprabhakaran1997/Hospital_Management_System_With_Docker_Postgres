from django.contrib import admin

from room.models import (Rooms , AssignRooms , DocterCheckup, LabTestForINPatient , XrayForINPatient,ScanForINPatient ,MedicineForINPatient , 
InjectionForINPatient , DressingForINPatient, IN_Patient_Payments , IN_Patient_PaymentTransactions , DischargeSummary_IN , RoomCategory , TransferRoom)


# Register your models here.
admin.site.register(Rooms)
admin.site.register(AssignRooms)
admin.site.register(DocterCheckup)
admin.site.register(LabTestForINPatient)
admin.site.register(XrayForINPatient)
admin.site.register(ScanForINPatient)
admin.site.register(MedicineForINPatient)
admin.site.register(InjectionForINPatient)
admin.site.register(IN_Patient_Payments)
admin.site.register(IN_Patient_PaymentTransactions)
admin.site.register(DischargeSummary_IN)
admin.site.register(DressingForINPatient)
admin.site.register(RoomCategory)
admin.site.register(TransferRoom)


