from rest_framework import serializers
from .models import Booking, BookingStatus
from apps.services.models import Talent
from apps.services.serializers import TalentSerializer, ServiceCategorySerializer


class BookingSerializer(serializers.ModelSerializer):
    """Detailed booking serializer."""
    customer_id = serializers.ReadOnlyField(source='customer.id')
    customer_name = serializers.ReadOnlyField(source='customer.full_name')
    customer_email = serializers.ReadOnlyField(source='customer.email')
    customer_avatar = serializers.SerializerMethodField()
    customer_phone = serializers.SerializerMethodField()

    provider_id = serializers.ReadOnlyField(source='provider.id')
    provider_name = serializers.ReadOnlyField(source='provider.full_name')
    provider_email = serializers.ReadOnlyField(source='provider.email')
    provider_avatar = serializers.SerializerMethodField()
    provider_phone = serializers.SerializerMethodField()

    talent = TalentSerializer(read_only=True)
    category = ServiceCategorySerializer(read_only=True)
    has_review = serializers.SerializerMethodField()
    review = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id',
            'customer_id',
            'customer_name',
            'customer_email',
            'customer_avatar',
            'customer_phone',
            'provider_id',
            'provider_name',
            'provider_email',
            'provider_avatar',
            'provider_phone',
            'talent',
            'category',
            'location_address',
            'latitude',
            'longitude',
            'scheduled_date',
            'scheduled_time',
            'price',
            'notes',
            'status',
            'has_review',
            'review',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'customer_id',
            'provider_id',
            'status',
            'has_review',
            'review',
            'created_at',
            'updated_at',
        ]

    def get_customer_avatar(self, obj):
        if hasattr(obj.customer, 'profile'):
            return obj.customer.profile.avatar
        return ''

    def get_customer_phone(self, obj):
        if hasattr(obj.customer, 'profile'):
            return obj.customer.profile.phone_number
        return ''

    def get_provider_avatar(self, obj):
        if hasattr(obj.provider, 'profile'):
            return obj.provider.profile.avatar
        return ''

    def get_provider_phone(self, obj):
        if hasattr(obj.provider, 'profile'):
            return obj.provider.profile.phone_number
        return ''

    def get_has_review(self, obj):
        return hasattr(obj, 'review')

    def get_review(self, obj):
        if hasattr(obj, 'review'):
            from apps.reviews.serializers import ReviewSerializer
            return ReviewSerializer(obj.review).data
        return None


class CreateBookingSerializer(serializers.ModelSerializer):
    """Serializer for creating a new booking."""
    talent_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Booking
        fields = [
            'talent_id',
            'location_address',
            'latitude',
            'longitude',
            'scheduled_date',
            'scheduled_time',
            'notes',
        ]


class UpdateBookingStatusSerializer(serializers.Serializer):
    """Serializer for updating booking status."""
    status = serializers.ChoiceField(choices=BookingStatus.choices)
