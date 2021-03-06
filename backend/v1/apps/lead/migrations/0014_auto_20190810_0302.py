# Generated by Django 2.1.3 on 2019-08-10 03:02

from django.db import migrations, models
import v1.apps.lead.models


class Migration(migrations.Migration):

    dependencies = [
        ('lead', '0013_auto_20190809_0332'),
    ]

    operations = [
        migrations.AddField(
            model_name='lead',
            name='lead_internal_hash',
            field=models.SlugField(max_length=140, null=True),
        ),
        migrations.AlterField(
            model_name='lead',
            name='lead_hash',
            field=models.SlugField(default=v1.apps.lead.models.get_unique_slug, max_length=140),
        ),
        migrations.AlterField(
            model_name='leadsupplydetails',
            name='supply_number',
            field=models.CharField(blank=True, max_length=100, null=True, unique=True),
        ),
    ]
