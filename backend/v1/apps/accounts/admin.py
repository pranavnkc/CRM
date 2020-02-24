# -*- coding: utf-8 -*-
from __future__ import absolute_import, unicode_literals

from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as AuthUserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from .models import User


class MyUserChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = User


class MyUserCreationForm(UserCreationForm):

    error_message = UserCreationForm.error_messages.update({
        'duplicate_username': 'This username has already been taken.'
    })

    class Meta(UserCreationForm.Meta):
        model = User

    def clean_username(self):
        username = self.cleaned_data["username"]
        try:
            User.objects.get(username=username)
        except User.DoesNotExist:
            return username
        raise forms.ValidationError(self.error_messages['duplicate_username'])


@admin.register(User)
class MyUserAdmin(AuthUserAdmin):
    form = MyUserChangeForm
    add_form = MyUserCreationForm
    fieldsets = (
            ('User Profile', {'fields': ('username', 'password')}),
            ('Personal info', {'fields': ('first_name', 'last_name',)},),
            ('Permissions', {'fields': ('is_active',  'is_superuser', 'groups', 'has_ip_restriction', 'view_raw_leads', 'advance_search_enable')},),
            ('Important dates', {'fields': []},),
    )
    list_display = ('username', 'first_name', 'is_superuser', 'is_active', 'has_ip_restriction', 'view_raw_leads', 'advance_search_enable')
    search_fields = ['username']
    list_filter = ['groups']
    save_on_top = True

# from django.contrib import admin
# from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

# from . import models


# class UserAdmin(BaseUserAdmin):
#     model = models.User
#     ordering = ('email', '-date_joined',)
#     search_fields = ('email',)
#     list_display = (
#         'email', 'username', 'first_name', 'last_name',
#         'is_active', 'is_admin', 'is_superuser', 'date_joined',
#     )
#     list_display_links = ['email']
#     list_filter = ('is_superuser', 'is_admin', 'is_active', 'date_joined')
#     fieldsets = (
#         ('Account info', {
#             'fields': ('email', 'password', 'is_active')
#         }),
#         ('Personal info', {
#             'fields': ('username', 'first_name', 'last_name',)
#         }),
#         ('Permissions', {
#             'fields': (('is_superuser', 'is_admin'),)
#         }),
#     )
#     add_fieldsets = (
#         ('Add user', {
#             'classes': ('wide',),
#             'fields': (
#                 'first_name', 'last_name',
#                 'username', 'email',
#                 'password1', 'password2'
#             )
#         }),
#     )

# admin.site.register(models.User)
