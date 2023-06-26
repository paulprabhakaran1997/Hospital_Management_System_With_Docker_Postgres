from django.db import models

# Create your models here.

class AppConfiguration(models.Model):
    
    hospital_logo = models.ImageField(upload_to = "images/",null = True,blank=True)
    hospital_name = models.CharField(max_length = 150 , null = True)
    hospital_website = models.CharField(max_length = 200 , null = True, blank=True)
    hospital_email = models.CharField(max_length = 200 , null = True, blank=True)
    hospital_phone = models.CharField(max_length = 200 , null = True, blank=True)
    hospital_slogan = models.CharField(max_length = 200 , null = True, blank=True)
    hospital_greetings = models.CharField(max_length = 200 , null = True, blank=True)
    hospital_address1 = models.CharField(max_length = 200 , null = True, blank=True)
    hospital_address2 = models.CharField(max_length = 200 , null = True, blank=True)
    hospital_pincode = models.CharField(max_length = 200 , null = True, blank=True)
    hospital_gst = models.CharField(max_length = 200 , null = True, blank=True)
    hospital_registeration_number = models.CharField(max_length = 200 , null = True, blank=True)
    hospital_druglicense_number = models.CharField(max_length = 200 , null = True, blank=True)   
    updated_time = models.DateTimeField(auto_now_add = True , null = True, blank=True)

    default_doctorfees = models.IntegerField(default = 0 ,  null  = True, blank=True)

    class Meta:
        verbose_name_plural = "App Configuration"
        ordering = ['id']
        default_permissions = ()

