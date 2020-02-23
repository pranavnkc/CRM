# Generated by Django 2.1.3 on 2020-02-21 02:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0009_user_campaign'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserLoginHistory',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user', models.CharField(max_length=100)),
                ('result', models.BooleanField()),
                ('ip', models.GenericIPAddressField(verbose_name='Ip Address')),
            ],
        ),
    ]
