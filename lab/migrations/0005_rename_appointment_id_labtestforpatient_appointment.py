# Generated by Django 4.0.5 on 2022-08-24 05:29

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('lab', '0004_labtestforpatient_testtakenbypatient'),
    ]

    operations = [
        migrations.RenameField(
            model_name='labtestforpatient',
            old_name='appointment_id',
            new_name='appointment',
        ),
    ]