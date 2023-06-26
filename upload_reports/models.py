from django.db import models
from patient.models import Patient

# Create your models here.

class UploadedReports(models.Model):
    
    patient = models.ForeignKey(Patient, on_delete=models.DO_NOTHING , null = True)
    name = models.CharField(max_length = 200 , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = "Uploaded Reports"
        ordering = ['id']
        default_permissions = ()


class UploadedReportsFiles(models.Model):
    
    uploded_reports = models.ForeignKey(UploadedReports, on_delete=models.DO_NOTHING , null = True)
    url = models.ImageField(upload_to = "images/uploaded_reports/%Y" , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = "Uploaded Reports Files"
        ordering = ['id']
        default_permissions = ()
