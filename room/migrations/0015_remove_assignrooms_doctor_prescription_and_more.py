# Generated by Django 4.1 on 2022-09-30 11:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('room', '0014_in_patient_payments_total_after_discount_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='assignrooms',
            name='doctor_prescription',
        ),
        migrations.AddField(
            model_name='doctercheckup',
            name='doctor_prescription',
            field=models.TextField(default='', null=True),
        ),
    ]