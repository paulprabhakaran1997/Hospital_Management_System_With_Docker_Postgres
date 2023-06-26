from django.db import models

# Create your models here.

class Patient(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length = 150 , null = True)
    dob = models.DateField(null = True)
    gender = models.CharField(max_length = 100 , null = True)
    phone = models.CharField(max_length = 150 , null = True)
    father_name = models.CharField(max_length = 150 , null = True)
    address = models.TextField(default = "" , null = True)
    pos_id = models.CharField(max_length = 150 , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)


    class Meta:
        verbose_name_plural = 'Patient'
        ordering = ['id']
        default_permissions = ()
