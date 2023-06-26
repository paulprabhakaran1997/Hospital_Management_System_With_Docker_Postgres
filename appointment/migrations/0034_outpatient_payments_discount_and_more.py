# Generated by Django 4.0.6 on 2023-01-06 08:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('appointment', '0033_transfer_to_ip'),
    ]

    operations = [
        migrations.AddField(
            model_name='outpatient_payments',
            name='discount',
            field=models.IntegerField(default=0, null=True),
        ),
        migrations.AddField(
            model_name='outpatient_payments',
            name='total_after_discount',
            field=models.IntegerField(default=0, null=True),
        ),
        migrations.AddField(
            model_name='outpatient_paymenttransactions',
            name='discount',
            field=models.IntegerField(default=0, null=True),
        ),
        migrations.AddField(
            model_name='outpatient_paymenttransactions',
            name='total_after_discount',
            field=models.IntegerField(default=0, null=True),
        ),
    ]
