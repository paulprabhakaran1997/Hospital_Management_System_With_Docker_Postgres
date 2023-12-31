# Generated by Django 4.1 on 2022-10-08 09:06

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('patient', '0003_patient_pos_id'),
        ('appointment', '0019_remove_outpatient_payments_ecg'),
    ]

    operations = [
        migrations.CreateModel(
            name='DoctorCheckupAmount',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('doctor_fees', models.IntegerField(default=0, null=True)),
                ('dressing', models.IntegerField(default=0, null=True)),
                ('neb', models.IntegerField(default=0, null=True)),
                ('created_time', models.DateTimeField(auto_now=True, null=True)),
                ('updated_time', models.DateTimeField(auto_now_add=True, null=True)),
                ('appointment', models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='appointment.appointment')),
                ('patient', models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='patient.patient')),
            ],
            options={
                'verbose_name_plural': 'LabTestForOutPatient',
                'ordering': ['id'],
                'default_permissions': (),
            },
        ),
    ]
