# Generated by Django 4.1.2 on 2023-06-26 06:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('upload_reports', '0007_alter_uploadedreports_id_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='uploadedreports',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='uploadedreportsfiles',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
    ]