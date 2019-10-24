from rest_framework import serializers
from .models import Settings
class SettingSerilizer(serializers.ModelSerializer):
    class Meta:
        model = Settings
        fields = "__all__"
