# Generated by Django 2.1.3 on 2020-02-24 06:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0010_userloginhistory'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='has_ip_restriction',
            field=models.BooleanField(default=True),
        ),
    ]
