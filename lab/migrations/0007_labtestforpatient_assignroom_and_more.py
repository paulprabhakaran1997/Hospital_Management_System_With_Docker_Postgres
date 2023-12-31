# Generated by Django 4.1 on 2022-09-19 06:20

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('room', '0003_in_patient_payments_in_patient_paymenttransactions'),
        ('patient', '0002_patient_gender'),
        ('lab', '0006_labtestforpatient_total_amount'),
    ]

    operations = [
        migrations.AddField(
            model_name='labtestforpatient',
            name='assignroom',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='room.assignrooms'),
        ),
        migrations.AddField(
            model_name='labtestforpatient',
            name='ip_lab_test',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='room.labtestforinpatient'),
        ),
        migrations.AddField(
            model_name='labtestforpatient',
            name='patient_type',
            field=models.CharField(max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='labtest',
            name='group',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='lab.labgroup'),
        ),
        migrations.AlterField(
            model_name='labtestforpatient',
            name='patient',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='patient.patient'),
        ),
        migrations.AlterField(
            model_name='testtakenbypatient',
            name='lab_group',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='lab.labgroup'),
        ),
        migrations.AlterField(
            model_name='testtakenbypatient',
            name='lab_test',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='lab.labtest'),
        ),
        migrations.AlterField(
            model_name='testtakenbypatient',
            name='lab_test_for_patient',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='lab.labtestforpatient'),
        ),
    ]
