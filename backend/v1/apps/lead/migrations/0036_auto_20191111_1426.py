# Generated by Django 2.1.3 on 2019-11-11 14:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lead', '0035_auto_20191111_0742'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lead',
            name='busines_name',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='lead',
            name='phone_number',
            field=models.CharField(blank=True, max_length=12, null=True),
        ),
        migrations.AlterField(
            model_name='lead',
            name='salutation',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.AlterField(
            model_name='lead',
            name='utility_type',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
    ]
