# Generated by Django 4.0.3 on 2023-04-06 06:25

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('lab', '0036_labtestforpatient_payment_complete'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='labtestforpatient',
            name='payment_complete',
        ),
    ]
