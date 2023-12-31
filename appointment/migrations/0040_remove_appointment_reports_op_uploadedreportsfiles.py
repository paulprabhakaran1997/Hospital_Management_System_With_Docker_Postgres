# Generated by Django 4.0.6 on 2023-01-14 07:21

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('appointment', '0039_appointment_reports'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='appointment',
            name='reports',
        ),
        migrations.CreateModel(
            name='OP_UploadedReportsFiles',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('reports', models.ImageField(null=True, upload_to='images/op_uploaded_reports/%Y')),
                ('created_time', models.DateTimeField(auto_now=True, null=True)),
                ('updated_time', models.DateTimeField(auto_now_add=True, null=True)),
                ('appointment', models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='appointment.appointment')),
            ],
            options={
                'verbose_name_plural': 'OP_UploadedReportsFiles',
                'ordering': ['id'],
                'default_permissions': (),
            },
        ),
    ]
