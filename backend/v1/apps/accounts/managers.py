from django.contrib.auth.models import BaseUserManager, Group

class UserManager(BaseUserManager):

    use_in_migrations = True

    def create_user(self, username, password, **kwargs):
        is_superuser = kwargs.pop('is_superuser', False)

        user = self.model(
            username=username,
            is_active=True,
            is_superuser=is_superuser,
            **kwargs
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password, **kwargs):
        super_user = self.create_user(username=username, password=password
        )
        super_user.is_admin = True
        super_user.is_superuser = True
        super_user.is_active = True
        super_user.save(using=self._db)
        super_user.groups.add(Group.objects.get(name='admin'))
        return super_user
