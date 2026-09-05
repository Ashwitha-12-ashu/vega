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
            return obj.customer.profile.avatar
        return ''


class CreateReviewSerializer(serializers.ModelSerializer):
    """Serializer for submitting a new review."""
    booking_id = serializers.PrimaryKeyRelatedField(
        queryset=Booking.objects.all(),
        source='booking'
    )

    class Meta:
        model = Review
        fields = ['booking_id', 'rating', 'comment']
