# Generated by Django 4.1.2 on 2023-06-26 06:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('staff', '0005_alter_staff_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='staff',
            name='id',
            field=models.IntegerField(primary_key=True, serialize=False),
        ),
    ]
