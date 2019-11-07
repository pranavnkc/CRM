# Generated by Django 2.1.3 on 2019-11-07 06:51

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('lead', '0023_auto_20191107_0450'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProspectLead',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('pr', 'Prospect'), ('unapproved', 'Unapproved'), ('hold', 'On Hold')], max_length=30)),
                ('created_on', models.DateTimeField(auto_now_add=True)),
                ('is_hot_transfer', models.BooleanField(default=False)),
                ('lead', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='prospect', to='lead.Lead')),
                ('submitted_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='submitted_prospects', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AlterField(
            model_name='leadhistory',
            name='action',
            field=models.CharField(choices=[('created', 'Lead Created'), ('edit', 'Lead Edited'), ('status changed', 'Lead Status Changed'), ('lead assign changed', 'Lead Assign Changed'), ('lead callback scheduled', 'Lead Callback Scheduled'), ('deleted', 'Lead Deleted'), ('comment', 'Comment Added'), ('submission status changed', 'Submission Status Changed')], max_length=30),
        ),
    ]
