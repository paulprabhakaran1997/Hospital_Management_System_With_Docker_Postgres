# Generated by Django 4.0.6 on 2023-02-18 06:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('scan', '0012_scanpaymenttransaction_scan_test'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='scanpaymenttransaction',
            name='scan_test',
        ),
    ]
