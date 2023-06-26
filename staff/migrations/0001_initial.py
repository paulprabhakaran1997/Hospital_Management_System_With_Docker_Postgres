# Generated by Django 4.0.3 on 2022-07-28 09:56

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('hospital', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Staff',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=150, null=True)),
                ('phone', models.CharField(max_length=12, null=True)),
                ('address', models.TextField(default='', null=True)),
                ('created_time', models.DateTimeField(auto_now=True, null=True)),
                ('updated_time', models.DateTimeField(auto_now_add=True, null=True)),
                ('role', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='hospital.role')),
            ],
            options={
                'verbose_name_plural': 'Staff',
                'ordering': ['id'],
                'default_permissions': (),
            },
        ),
    ]
