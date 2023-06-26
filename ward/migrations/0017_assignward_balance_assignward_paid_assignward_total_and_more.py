# Generated by Django 4.0.3 on 2022-11-25 09:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ward', '0016_ward_patient_paymenttransactions_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='assignward',
            name='balance',
            field=models.IntegerField(default=0, null=True),
        ),
        migrations.AddField(
            model_name='assignward',
            name='paid',
            field=models.IntegerField(default=0, null=True),
        ),
        migrations.AddField(
            model_name='assignward',
            name='total',
            field=models.IntegerField(default=0, null=True),
        ),
        migrations.AddField(
            model_name='ward_patient_payments',
            name='payment_recived_by_xray',
            field=models.IntegerField(default=0, null=True),
        ),
    ]
