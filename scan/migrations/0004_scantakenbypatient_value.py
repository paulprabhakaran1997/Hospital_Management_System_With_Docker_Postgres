# Generated by Django 4.0.6 on 2023-02-07 13:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('scan', '0003_scanforpatient_card_scanforpatient_cash_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='scantakenbypatient',
            name='value',
            field=models.TextField(null=True),
        ),
    ]