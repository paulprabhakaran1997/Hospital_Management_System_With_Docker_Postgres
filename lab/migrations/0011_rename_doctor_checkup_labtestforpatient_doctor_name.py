# Generated by Django 4.0.6 on 2022-11-04 07:00

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('lab', '0010_labtestforpatient_doctor_checkup'),
    ]

    operations = [
        migrations.RenameField(
            model_name='labtestforpatient',
            old_name='doctor_checkup',
            new_name='doctor_name',
        ),
    ]
