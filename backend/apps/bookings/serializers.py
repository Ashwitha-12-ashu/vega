from rest_framework import serializers
from .models import Booking, BookingStatus
from apps.services.models import Talent
from apps.services.serializers import TalentSerializer, ServiceCategorySerializer


class BookingSerializer(serializers.ModelSerializer):
    """Detailed booking serializer with tracking and avatar resolution."""
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
    customer_feedback = serializers.SerializerMethodField()
    distance_km = serializers.SerializerMethodField()

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
            'provider_latitude',
            'provider_longitude',
            'provider_location_updated_at',
            'distance_km',
            'customer_reviewed',
            'provider_reviewed',
            'scheduled_date',
            'scheduled_time',
            'price',
            'notes',
            'status',
            'has_review',
            'review',
            'customer_feedback',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'customer_id',
            'provider_id',
            'status',
            'customer_reviewed',
            'provider_reviewed',
            'has_review',
            'review',
            'customer_feedback',
            'distance_km',
            'created_at',
            'updated_at',
        ]

    def get_customer_avatar(self, obj):
        if hasattr(obj.customer, 'profile'):
            profile = obj.customer.profile
            if profile.profile_photo:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(profile.profile_photo.url)
                return profile.profile_photo.url
            return profile.avatar or ''
        return ''

    def get_customer_phone(self, obj):
        if hasattr(obj.customer, 'profile'):
            return obj.customer.profile.phone_number
        return ''

    def get_provider_avatar(self, obj):
        if hasattr(obj.provider, 'profile'):
            profile = obj.provider.profile
            if profile.profile_photo:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(profile.profile_photo.url)
                return profile.profile_photo.url
            return profile.avatar or ''
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
            return ReviewSerializer(obj.review, context=self.context).data
        return None

    def get_customer_feedback(self, obj):
        if hasattr(obj, 'customer_feedback'):
            return {
                'rating': obj.customer_feedback.rating,
                'comment': obj.customer_feedback.comment,
                'created_at': obj.customer_feedback.created_at,
            }
        return None

    def get_distance_km(self, obj):
        from apps.locations.utils import calculate_haversine_distance
        # Calculate distance between customer location and provider's current or registered location
        c_lat = obj.latitude
        c_lng = obj.longitude

        p_lat = obj.provider_latitude
        p_lng = obj.provider_longitude

        if not p_lat and hasattr(obj.provider, 'location') and obj.provider.location.latitude:
            p_lat = obj.provider.location.latitude
            p_lng = obj.provider.location.longitude

        if c_lat and c_lng and p_lat and p_lng:
            return round(calculate_haversine_distance(c_lat, c_lng, p_lat, p_lng), 1)
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


class UpdateBookingLocationSerializer(serializers.Serializer):
    """Serializer for provider updating real-time location on active booking."""
    latitude = serializers.FloatField(required=True)
    longitude = serializers.FloatField(required=True)
