from django.contrib import admin
from upload_reports.models import UploadedReports , UploadedReportsFiles

# Register your models here.

admin.site.register(UploadedReports)
admin.site.register(UploadedReportsFiles)
