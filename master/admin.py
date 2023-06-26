from django.contrib import admin
from import_export.admin import ImportExportModelAdmin


# Register your models here.

from master.models import (HealthCheckupMaster)

@admin.register(HealthCheckupMaster)

class ViewAdmin(ImportExportModelAdmin):
    pass