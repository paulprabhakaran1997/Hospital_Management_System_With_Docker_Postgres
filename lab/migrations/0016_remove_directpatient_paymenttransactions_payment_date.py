# Generated by Django 4.0.6 on 2022-11-04 15:48

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('lab', '0015_remove_labtestfordirectpatient_total_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='directpatient_paymenttransactions',
            name='payment_date',
        ),
    ]
