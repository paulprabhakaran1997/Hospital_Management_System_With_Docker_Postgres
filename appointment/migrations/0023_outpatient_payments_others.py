# Generated by Django 4.0.6 on 2022-10-21 09:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('appointment', '0022_outpatient_payments_doctor_check_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='outpatient_payments',
            name='others',
            field=models.IntegerField(default=0, null=True),
        ),
    ]
