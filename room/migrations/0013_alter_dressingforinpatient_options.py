# Generated by Django 4.1 on 2022-09-27 07:42

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('room', '0012_dressingforinpatient'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='dressingforinpatient',
            options={'default_permissions': (), 'ordering': ['id'], 'verbose_name_plural': 'DressingForINPatient'},
        ),
    ]