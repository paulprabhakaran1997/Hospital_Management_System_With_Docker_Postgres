# Generated by Django 4.0.3 on 2022-11-29 06:44

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('ward', '0018_assignward_has_scan_and_more'),
        ('scan', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='scanforpatient',
            name='ward_scan_test',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='ward.scanforwardpatient'),
        ),
    ]
