# Generated by Django 2.1.3 on 2019-08-05 15:26

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('lead', '0009_auto_20190805_0236'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lead',
            name='status',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='lead.Status'),
        ),
    ]
