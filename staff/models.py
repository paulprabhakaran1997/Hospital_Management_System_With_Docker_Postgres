from django.db import models
from django.contrib.auth.models import User
from hospital.models import Role

# Create your models here.

class Staff(models.Model):
    
    user = models.OneToOneField(User, on_delete=models.CASCADE , null = True)
    name = models.CharField(max_length = 150 , null = True)
    phone = models.CharField(max_length = 12 , null = True)
    address = models.TextField(default = "" , null = True)
    role = models.ForeignKey(Role, on_delete=models.DO_NOTHING , null = True)
    username = models.CharField(max_length = 150 , null = True)
    created_time = models.DateTimeField(auto_now_add = True , null = True)
    updated_time = models.DateTimeField(auto_now = True , null = True)

    class Meta:
        verbose_name_plural = "Staff"
        ordering = ['id']
        default_permissions = ()
