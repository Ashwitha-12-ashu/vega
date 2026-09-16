from rest_framework import serializers
from .models import Review
from apps.bookings.models import Booking


class ReviewSerializer(serializers.ModelSerializer):
    """Detailed serializer for viewing reviews."""
    customer_name = serializers.ReadOnlyField(source='customer.full_name')
    customer_avatar = serializers.SerializerMethodField()
    talent_title = serializers.ReadOnlyField(source='booking.talent.title')
    service_category = serializers.ReadOnlyField(source='booking.category.name')

    class Meta:
        model = Review
        fields = [
            'id',
            'booking',
            'customer',
            'customer_name',
            'customer_avatar',
            'provider',
            'talent_title',
            'service_category',
            'rating',
            'comment',
            'created_at',
        ]
        read_only_fields = ['id', 'customer', 'provider', 'created_at']

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


class CreateReviewSerializer(serializers.ModelSerializer):
    """Serializer for customer submitting a new review."""
    booking_id = serializers.PrimaryKeyRelatedField(
        queryset=Booking.objects.all(),
        source='booking'
    )

    class Meta:
        model = Review
        fields = ['booking_id', 'rating', 'comment']


class CreateCustomerReviewSerializer(serializers.Serializer):
    """Serializer for provider submitting feedback on customer."""
    booking_id = serializers.PrimaryKeyRelatedField(
        queryset=Booking.objects.all(),
        source='booking'
    )
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(required=False, allow_blank=True, default='')
