# Generated by Django 4.1.2 on 2023-06-26 06:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('forms', '0005_alter_forms_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='forms',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
    ]