# Generated by Django 2.1.3 on 2019-09-09 02:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lead', '0016_leadhistory'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='leadbusinessdetails',
            name='lead',
        ),
        migrations.RemoveField(
            model_name='leadsupplydetails',
            name='lead',
        ),
        migrations.AddField(
            model_name='lead',
            name='amr',
            field=models.BooleanField(blank=True, default=True, null=True),
        ),
        migrations.AddField(
            model_name='lead',
            name='building_name',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='lead',
            name='building_number',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='lead',
            name='busines_name',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='lead',
            name='city',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='lead',
            name='contract_end_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='lead',
            name='county',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='lead',
            name='current_electricity_supplier',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='lead',
            name='email',
            field=models.EmailField(blank=True, max_length=254, null=True),
        ),
        migrations.AddField(
            model_name='lead',
            name='first_name',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='lead',
            name='last_name',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='lead',
            name='meter_serial_number',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='lead',
            name='meter_type',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='lead',
            name='meter_type_code',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='lead',
            name='middle_name',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='lead',
            name='phone_number',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AddField(
            model_name='lead',
            name='related_meter',
            field=models.BooleanField(blank=True, default=False, null=True),
        ),
        migrations.AddField(
            model_name='lead',
            name='salutation',
            field=models.CharField(blank=True, choices=[('Mr.', 'Mr.'), ('Mrs.', 'Mrs.'), ('Miss', 'Miss'), ('Dr.', 'Dr.'), ('Ms.', 'Ms.'), ('Prof.', 'Prof.'), ('Rev.', 'Rev.')], max_length=30, null=True),
        ),
        migrations.AddField(
            model_name='lead',
            name='street_name',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='lead',
            name='subb',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='lead',
            name='supply_number',
            field=models.CharField(blank=True, max_length=100, null=True, unique=True),
        ),
        migrations.AddField(
            model_name='lead',
            name='town',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='leadhistory',
            name='action',
            field=models.CharField(choices=[('created', 'Lead Created'), ('edit', 'Lead Edited'), ('status changed', 'Lead Status Changed'), ('lead assign changed', 'Lead Assign Changed'), ('lead callback scheduled', 'Lead Callback Scheduled'), ('deleted', 'Lead Deleted'), ('comment', 'Comment Added')], max_length=30),
        ),
        migrations.DeleteModel(
            name='LeadBusinessDetails',
        ),
        migrations.DeleteModel(
            name='LeadSupplyDetails',
        ),
    ]
