# Generated by Django 4.1.3 on 2023-01-05 19:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('configuration', '0006_alter_appconfiguration_hospital_greetings'),
    ]

    operations = [
        migrations.AlterField(
            model_name='appconfiguration',
            name='default_doctorfees',
            field=models.IntegerField(blank=True, default=0, null=True),
        ),
        migrations.AlterField(
            model_name='appconfiguration',
            name='hospital_address1',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='appconfiguration',
            name='hospital_address2',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='appconfiguration',
            name='hospital_druglicense_number',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='appconfiguration',
            name='hospital_email',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='appconfiguration',
            name='hospital_gst',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='appconfiguration',
            name='hospital_phone',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='appconfiguration',
            name='hospital_pincode',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='appconfiguration',
            name='hospital_registeration_number',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='appconfiguration',
            name='hospital_slogan',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='appconfiguration',
            name='hospital_website',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
    ]