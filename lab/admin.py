from django.contrib import admin
from lab.models import LabGroup , LabTest , LabCategory , LabTestForPatient , TestTakenByPatient , LabTestForDirectPatient , LabPaymentTransaction
from import_export.admin import ImportExportModelAdmin

# Register your models here.
# admin.site.register(LabGroup)
# admin.site.register(LabTest)
admin.site.register(LabTestForPatient)
admin.site.register(TestTakenByPatient)
admin.site.register(LabTestForDirectPatient)
admin.site.register(LabPaymentTransaction)


@admin.register(LabGroup)
@admin.register(LabTest)
@admin.register(LabCategory)
class ViewAdmin(ImportExportModelAdmin):
    pass