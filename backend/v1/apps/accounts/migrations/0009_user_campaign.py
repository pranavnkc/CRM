# Generated by Django 2.1.3 on 2019-11-11 03:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0008_auto_20190911_0301'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='campaign',
            field=models.CharField(blank=True, choices=[('valda-login-hour', 'ValdaLoginHour'), ('ormerod&adam', 'Armerod & Adam'), ('broker', 'Broker')], max_length=30, null=True),
        ),
    ]
