# Generated by Django 4.0.6 on 2022-12-07 06:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('room', '0029_transferroom'),
    ]

    operations = [
        migrations.AddField(
            model_name='transferroom',
            name='created_time',
            field=models.DateTimeField(auto_now=True, null=True),
        ),
        migrations.AddField(
            model_name='transferroom',
            name='updated_time',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
    ]