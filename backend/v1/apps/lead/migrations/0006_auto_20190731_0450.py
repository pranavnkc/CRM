# Generated by Django 2.1.3 on 2019-07-31 04:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lead', '0005_auto_20190731_0258'),
    ]

    operations = [
        migrations.AlterField(
            model_name='leadbusinessdetails',
            name='phone_number',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
    ]
