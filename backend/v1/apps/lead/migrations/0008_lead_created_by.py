# Generated by Django 2.1.3 on 2019-07-31 05:45

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('lead', '0007_auto_20190731_0457'),
    ]

    operations = [
        migrations.AddField(
            model_name='lead',
            name='created_by',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='created_leads', to=settings.AUTH_USER_MODEL),
        ),
    ]
