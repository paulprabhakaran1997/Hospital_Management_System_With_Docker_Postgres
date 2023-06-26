from django.db import models

# Create your models here.

class HealthCheckupMaster(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=150 , null=True)
    unit = models.CharField(max_length=150 , null=True)
    description = models.TextField(max_length=500 , null=True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = 'HealthCheckupMaster'
        ordering = ['id']
        default_permissions = ()
