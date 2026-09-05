from rest_framework import serializers
from .models import UserLocation
from apps.services.serializers import TalentSerializer


class UserLocationSerializer(serializers.ModelSerializer):
    """Serializer for user location data."""
    class Meta:
        model = UserLocation
        fields = [
            'id',
            'latitude',
            'longitude',
            'address',
            'city',
            'state',
            'postal_code',
            'country',
            'updated_at',
        ]
        read_only_fields = ['id', 'updated_at']


class NearbyProviderSerializer(serializers.Serializer):
    """Serializer for nearby provider discovery results."""
    provider_id = serializers.IntegerField(source='user.id')
    provider_name = serializers.CharField(source='user.full_name')
    username = serializers.CharField(source='user.username')
    email = serializers.CharField(source='user.email')
    avatar = serializers.CharField(source='user.profile.avatar', default='')
    bio = serializers.CharField(source='user.profile.bio', default='')
    phone_number = serializers.CharField(source='user.profile.phone_number', default='')
    is_online = serializers.BooleanField(source='user.profile.is_online')
    average_rating = serializers.FloatField(source='user.profile.average_rating')
    total_reviews = serializers.IntegerField(source='user.profile.total_reviews')
    
    # Distance in KM
    distance_km = serializers.FloatField()
    
    # Location
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    address = serializers.CharField(default='')
    city = serializers.CharField(default='')
    
    # Active Talent
    active_talent = serializers.SerializerMethodField()

    def get_active_talent(self, obj):
        active = obj.user.talents.filter(is_active=True).first()
        if active:
            return TalentSerializer(active, context=self.context).data
        return None
