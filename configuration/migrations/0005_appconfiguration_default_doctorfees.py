# Generated by Django 4.0.6 on 2022-11-15 12:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('configuration', '0004_remove_appconfiguration_hospital_logo1'),
    ]

    operations = [
        migrations.AddField(
            model_name='appconfiguration',
            name='default_doctorfees',
            field=models.IntegerField(default=0, null=True),
        ),
    ]
