from django.db import models

# Create your models here.
class Forms(models.Model):
    
    prefix = models.CharField(max_length = 100 , null = True)
    name = models.CharField(max_length = 150 , null = True)
    gender = models.CharField(max_length = 150 , null = True)
    father_name = models.CharField(max_length = 150 , null = True)
    dob = models.DateField(null = True)
    village = models.CharField(max_length = 150 , null = True)
    district = models.CharField(max_length = 150 , null = True)
    state = models.CharField(max_length = 150 , null = True)
    pincode = models.CharField(max_length = 150 , null = True)
    purpose_of = models.CharField(max_length = 150 , null = True)
    date = models.DateField(null = True)

    class Meta:
        verbose_name_plural = 'Forms'
        ordering = ['id']
        default_permissions = ()