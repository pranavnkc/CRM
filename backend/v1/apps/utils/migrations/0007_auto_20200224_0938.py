# Generated by Django 2.1.3 on 2020-02-24 09:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('utils', '0006_auto_20200224_0911'),
    ]

    operations = [
        migrations.AlterField(
            model_name='businessnames',
            name='name',
            field=models.CharField(max_length=200, unique=True),
        ),
    ]