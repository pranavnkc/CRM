# Generated by Django 2.1.3 on 2019-11-08 03:45

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('utils', '0002_settings'),
    ]

    operations = [
        migrations.AddField(
            model_name='settings',
            name='supplier_names',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, max_length=10), default=[], size=None),
            preserve_default=False,
        ),
    ]
