# Generated by Django 4.1 on 2022-09-28 10:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ward', '0010_dressingforwardpatient'),
    ]

    operations = [
        migrations.AddField(
            model_name='ward_patient_payments',
            name='total_after_discount',
            field=models.IntegerField(default=0, null=True),
        ),
        migrations.AddField(
            model_name='ward_patient_paymenttransactions',
            name='total_after_discount',
            field=models.IntegerField(default=0, null=True),
        ),
    ]
