# Generated by Django 2.1.3 on 2019-11-08 03:48

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('utils', '0003_settings_supplier_names'),
    ]

    operations = [
        migrations.AlterField(
            model_name='settings',
            name='supplier_names',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, max_length=50), size=None),
        ),
    ]
