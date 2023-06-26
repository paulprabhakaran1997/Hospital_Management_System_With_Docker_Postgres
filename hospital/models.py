from django.db import models
from django.contrib.auth.models import Group

# Create your models here.

class Role(Group):
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Roles"
        ordering = ['id']
        default_permissions = ()

    def __str__(self):
        return self.name