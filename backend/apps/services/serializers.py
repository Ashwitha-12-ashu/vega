from rest_framework import serializers
from .models import ServiceCategory, Talent


class ServiceCategorySerializer(serializers.ModelSerializer):
    """Serializer for service categories."""
    talents_count = serializers.SerializerMethodField()

    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'slug', 'icon', 'description', 'is_active', 'talents_count']

    def get_talents_count(self, obj):
        return obj.talents.filter(is_active=True).count()


class TalentSerializer(serializers.ModelSerializer):
    """Detailed serializer for viewing Talents."""
    category = ServiceCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ServiceCategory.objects.filter(is_active=True),
        source='category',
        write_only=True
    )
    provider_name = serializers.ReadOnlyField(source='user.full_name')
    provider_id = serializers.ReadOnlyField(source='user.id')
    provider_avatar = serializers.SerializerMethodField()
    provider_rating = serializers.SerializerMethodField()
    provider_reviews_count = serializers.SerializerMethodField()
    provider_is_online = serializers.SerializerMethodField()

    class Meta:
        model = Talent
        fields = [
            'id',
            'user',
            'provider_id',
            'provider_name',
            'provider_avatar',
            'provider_rating',
            'provider_reviews_count',
            'provider_is_online',
            'category',
            'category_id',
            'title',
            'description',
            'price_per_hour',
            'experience_years',
            'availability_notes',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'is_active', 'created_at', 'updated_at']

    def get_provider_avatar(self, obj):
        if hasattr(obj.user, 'profile'):
            return obj.user.profile.avatar
        return ''

    def get_provider_rating(self, obj):
        if hasattr(obj.user, 'profile'):
            return float(obj.user.profile.average_rating)
        return 0.0

    def get_provider_reviews_count(self, obj):
        if hasattr(obj.user, 'profile'):
            return obj.user.profile.total_reviews
        return 0

    def get_provider_is_online(self, obj):
        if hasattr(obj.user, 'profile'):
            return obj.user.profile.is_online
        return False


class TalentCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating Talents."""
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ServiceCategory.objects.filter(is_active=True),
        source='category'
    )

    class Meta:
        model = Talent
        fields = [
            'id',
            'category_id',
            'title',
            'description',
            'price_per_hour',
            'experience_years',
            'availability_notes',
        ]
        read_only_fields = ['id']
