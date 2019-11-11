from django.db import models

from django.utils.translation import gettext_lazy as _

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin

from . import managers


class User(AbstractBaseUser,  PermissionsMixin):
    VALDA_LOGIN_HOUR = 'valda-login-hour'
    ORMEROD_AND_ADAM = 'ormerod&adam'
    BROKER = 'broker'
    CAMPAIGN_CHOICES = ((VALDA_LOGIN_HOUR, 'ValdaLoginHour'),
                        (ORMEROD_AND_ADAM, 'Armerod & Adam'),
                        (BROKER, 'Broker'),
    )
    username = models.CharField(_('Username'), max_length=120, unique=True)
    first_name = models.CharField(_('Firt Name'), max_length=255)
    last_name = models.CharField(_('Last Name'), max_length=255)
    date_joined = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    phone_number = models.CharField(max_length=10, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    parent = models.ForeignKey("self", null=True, on_delete=models.CASCADE)
    campaign = models.CharField(
        choices=CAMPAIGN_CHOICES, max_length=30, null=True, blank=True)
    objects = managers.UserManager()

    USERNAME_FIELD = 'username'

    class Meta:
        app_label = 'accounts'
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        db_table = 'tb_accounts_user'

    def get_full_name(self):
        return f'{self.first_name} {self.last_name}'

    def get_short_name(self):
        return f'{self.first_name}'

    def has_perm(self, perm, obj=None):
        "Does the user have a specific permission?"
        return True

    def has_module_perms(self, app_label):
        "Does the user have permissions to view the app `app_label`?"
        return True

    @property
    def get_nickname(self):
        return f'{self.username}'

    @property
    def is_staff(self):
        "Is the user a member of staff?"
        return self.is_admin

    def __str__(self):
        return f'{self.username}'
