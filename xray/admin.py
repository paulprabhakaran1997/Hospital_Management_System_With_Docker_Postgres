from django.contrib import admin
from xray.models import Xray , XrayForPatient , XrayTakenByPatient , XrayPaymentTransaction
from import_export.admin import ImportExportModelAdmin

# Register your models here.
# admin.site.register(Xray)
admin.site.register(XrayForPatient)
admin.site.register(XrayTakenByPatient)
admin.site.register(XrayPaymentTransaction)

@admin.register(Xray)
class ViewAdmin(ImportExportModelAdmin):
    pass