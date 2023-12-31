# Generated by Django 4.0.6 on 2022-12-06 11:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('room', '0027_alter_roomcategory_options_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='scanforinpatient',
            name='scan_canceled',
            field=models.BooleanField(default=False, null=True),
        ),
        migrations.AddField(
            model_name='xrayforinpatient',
            name='xray_canceled',
            field=models.BooleanField(default=False, null=True),
        ),
    ]
