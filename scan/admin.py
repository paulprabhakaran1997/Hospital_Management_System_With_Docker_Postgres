from django.contrib import admin

# Register your models here.
from django.contrib import admin
from scan.models import Scan , ScanForPatient , ScanTakenByPatient , ScanPaymentTransaction , ScanForDirectPatient
from import_export.admin import ImportExportModelAdmin

# Register your models here.
# admin.site.register(Scan)
admin.site.register(ScanForPatient)
admin.site.register(ScanTakenByPatient)
admin.site.register(ScanPaymentTransaction)
admin.site.register(ScanForDirectPatient)

@admin.register(Scan)
class ViewAdmin(ImportExportModelAdmin):
    pass