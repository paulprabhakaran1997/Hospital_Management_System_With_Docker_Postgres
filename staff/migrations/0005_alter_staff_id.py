# Generated by Django 4.1.2 on 2023-06-26 06:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('staff', '0004_alter_staff_created_time_alter_staff_updated_time'),
    ]

    operations = [
        migrations.AlterField(
            model_name='staff',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
    ]
