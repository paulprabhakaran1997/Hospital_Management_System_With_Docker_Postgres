# Generated by Django 4.1.2 on 2023-06-26 06:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('configuration', '0010_alter_appconfiguration_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='appconfiguration',
            name='id',
            field=models.IntegerField(primary_key=True, serialize=False),
        ),
    ]