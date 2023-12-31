# Generated by Django 4.0.5 on 2022-08-24 11:22

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('patient', '0002_patient_gender'),
        ('appointment', '0006_appointment_initially_paid'),
        ('xray', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='XrayForPatient',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('total_amount', models.IntegerField(default=0, null=True)),
                ('from_op', models.BooleanField(default=False, null=True)),
                ('created_time', models.DateTimeField(auto_now=True, null=True)),
                ('updated_time', models.DateTimeField(auto_now_add=True, null=True)),
                ('appointment', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='appointment.appointment')),
                ('patient', models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='patient.patient')),
            ],
            options={
                'verbose_name_plural': 'XrayForPatient',
                'ordering': ['id'],
                'default_permissions': (),
            },
        ),
        migrations.CreateModel(
            name='XrayTakenByPatient',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('amount', models.IntegerField(default=0, null=True)),
                ('created_time', models.DateTimeField(auto_now=True, null=True)),
                ('updated_time', models.DateTimeField(auto_now_add=True, null=True)),
                ('xray', models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='xray.xray')),
                ('xray_for_patient', models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='xray.xrayforpatient')),
            ],
            options={
                'verbose_name_plural': 'XrayTakenByPatient',
                'ordering': ['id'],
                'default_permissions': (),
            },
        ),
    ]
