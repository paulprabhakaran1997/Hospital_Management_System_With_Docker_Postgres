# Generated by Django 4.0.3 on 2022-11-26 05:33

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('appointment', '0029_outpatient_payments_payment_recived_by_xray'),
        ('ward', '0017_assignward_balance_assignward_paid_assignward_total_and_more'),
        ('room', '0022_assignrooms_balance_assignrooms_paid_and_more'),
        ('lab', '0021_rename_directpatient_paymenttransactions_labpaymenttransaction_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='labpaymenttransaction',
            old_name='direct_payment',
            new_name='lab_for_direct_patient',
        ),
        migrations.AddField(
            model_name='labpaymenttransaction',
            name='appointment',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='appointment.appointment'),
        ),
        migrations.AddField(
            model_name='labpaymenttransaction',
            name='assignroom',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='room.assignrooms'),
        ),
        migrations.AddField(
            model_name='labpaymenttransaction',
            name='assignward',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='ward.assignward'),
        ),
        migrations.AddField(
            model_name='labpaymenttransaction',
            name='lab_for_general_patient',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='lab.labtestforpatient'),
        ),
        migrations.AddField(
            model_name='labpaymenttransaction',
            name='patient_type',
            field=models.CharField(max_length=200, null=True),
        ),
    ]