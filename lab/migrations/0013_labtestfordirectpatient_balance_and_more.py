# Generated by Django 4.0.6 on 2022-11-04 08:24

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('patient', '0003_patient_pos_id'),
        ('lab', '0012_remove_labtestforpatient_doctor_name_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='labtestfordirectpatient',
            name='balance',
            field=models.IntegerField(default=0, null=True),
        ),
        migrations.AddField(
            model_name='labtestfordirectpatient',
            name='card',
            field=models.IntegerField(default=0, null=True),
        ),
        migrations.AddField(
            model_name='labtestfordirectpatient',
            name='cash',
            field=models.IntegerField(default=0, null=True),
        ),
        migrations.AddField(
            model_name='labtestfordirectpatient',
            name='initially_paid',
            field=models.BooleanField(default=False, null=True),
        ),
        migrations.AddField(
            model_name='labtestfordirectpatient',
            name='paid',
            field=models.IntegerField(default=0, null=True),
        ),
        migrations.AddField(
            model_name='labtestfordirectpatient',
            name='payment_pending',
            field=models.BooleanField(default=True, null=True),
        ),
        migrations.AddField(
            model_name='labtestfordirectpatient',
            name='total',
            field=models.IntegerField(default=0, null=True),
        ),
        migrations.AddField(
            model_name='labtestfordirectpatient',
            name='upi',
            field=models.IntegerField(default=0, null=True),
        ),
        migrations.CreateModel(
            name='DirectPatient_PaymentTransactions',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('total', models.IntegerField(default=0, null=True)),
                ('existing_balance', models.IntegerField(default=0, null=True)),
                ('paid', models.IntegerField(default=0, null=True)),
                ('balance', models.IntegerField(default=0, null=True)),
                ('cash', models.IntegerField(default=0, null=True)),
                ('upi', models.IntegerField(default=0, null=True)),
                ('card', models.IntegerField(default=0, null=True)),
                ('payment_date', models.DateTimeField(auto_now=True, null=True)),
                ('created_time', models.DateTimeField(auto_now=True, null=True)),
                ('updated_time', models.DateTimeField(auto_now_add=True, null=True)),
                ('direct_payment', models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='lab.labtestfordirectpatient')),
                ('patient', models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='patient.patient')),
            ],
            options={
                'verbose_name_plural': 'DirectPatient_PaymentTransactions',
                'ordering': ['id'],
                'default_permissions': (),
            },
        ),
    ]
