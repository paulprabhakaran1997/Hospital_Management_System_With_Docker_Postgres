# Generated by Django 4.0.6 on 2023-02-13 13:28

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('appointment', '0043_remove_outpatient_payments_pulse'),
        ('lab', '0029_remove_labgroup_section_labgroup_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='labtestforpatient',
            name='op_lab_test',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='appointment.labtestforoutpatient'),
        ),
    ]