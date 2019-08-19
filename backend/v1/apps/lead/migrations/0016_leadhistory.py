# Generated by Django 2.1.3 on 2019-08-19 03:04

from django.conf import settings
import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('lead', '0015_auto_20190810_0302'),
    ]

    operations = [
        migrations.CreateModel(
            name='LeadHistory',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(choices=[('created', 'Lead Created'), ('edit', 'Lead Edited'), ('status changed', 'Lead Status Changed'), ('officer assign changed', 'Lead Assign Changed'), ('deleted', 'Lead Deleted')], max_length=30)),
                ('created_on', models.DateTimeField(auto_now=True, null=True)),
                ('old_instance_meta', django.contrib.postgres.fields.jsonb.JSONField(blank=True, null=True)),
                ('new_instance_meta', django.contrib.postgres.fields.jsonb.JSONField(blank=True, null=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('lead', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='lead_history', to='lead.Lead')),
            ],
        ),
    ]
