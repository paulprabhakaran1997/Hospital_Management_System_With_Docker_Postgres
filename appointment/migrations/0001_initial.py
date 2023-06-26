# Generated by Django 4.0.3 on 2022-08-09 05:34

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('doctor', '0003_alter_doctor_role'),
        ('patient', '0002_patient_gender'),
    ]

    operations = [
        migrations.CreateModel(
            name='Appointment',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('bp', models.CharField(max_length=200, null=True)),
                ('pulse', models.CharField(max_length=200, null=True)),
                ('temperature', models.CharField(max_length=200, null=True)),
                ('rr', models.CharField(max_length=200, null=True)),
                ('sp_o2', models.CharField(max_length=200, null=True)),
                ('blood_sugar', models.CharField(max_length=200, null=True)),
                ('reason', models.TextField(default='', null=True)),
                ('appointment_date', models.DateTimeField(null=True)),
                ('checkup', models.BooleanField(default=False, null=True)),
                ('payment_pending', models.BooleanField(default=True, null=True)),
                ('status', models.IntegerField(default=0, null=True)),
                ('created_time', models.DateTimeField(null=True)),
                ('updated_time', models.DateTimeField(null=True)),
                ('doctor', models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='doctor.doctor')),
                ('patient', models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='patient.patient')),
            ],
            options={
                'verbose_name_plural': 'Appointment',
                'ordering': ['id'],
                'default_permissions': (),
            },
        ),
    ]