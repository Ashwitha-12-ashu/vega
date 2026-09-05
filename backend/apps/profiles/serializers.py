from rest_framework import serializers

from .models import UserProfile, ProviderCertificate


class ProviderCertificateSerializer(serializers.ModelSerializer):
    """
    Serializer for provider certificates.
    """

    provider_username = serializers.CharField(
        source='provider.username',
        read_only=True
    )

    certificate_url = serializers.SerializerMethodField()

    class Meta:
        model = ProviderCertificate

        fields = [
            'id',
            'provider',
            'provider_username',
            'certificate_name',
            'issuing_organization',
            'certificate_file',
            'certificate_url',
            'issue_date',
            'description',
            'is_verified',
            'uploaded_at',
        ]

        read_only_fields = [
            'id',
            'provider',
            'provider_username',
            'certificate_url',
            'is_verified',
            'uploaded_at',
        ]

    def get_certificate_url(self, obj):
        request = self.context.get('request')

        if not obj.certificate_file:
            return None

        url = obj.certificate_file.url

        if request:
            return request.build_absolute_uri(url)

        return url


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the user's profile.
    """

    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    email = serializers.EmailField(
        source='user.email',
        read_only=True
    )

    first_name = serializers.CharField(
        source='user.first_name',
        read_only=True
    )

    last_name = serializers.CharField(
        source='user.last_name',
        read_only=True
    )

    full_name = serializers.SerializerMethodField()

    certificates = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile

        fields = [
            'id',
            'user',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',

            'phone_number',
            'bio',
            'avatar',

            'is_provider',
            'is_online',

            'average_rating',
            'total_reviews',

            'certificates',

            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'user',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'average_rating',
            'total_reviews',
            'certificates',
            'created_at',
            'updated_at',
        ]

    def get_full_name(self, obj):
        return obj.user.get_full_name()

    def get_certificates(self, obj):
        certificates = ProviderCertificate.objects.filter(
            provider=obj.user
        )

        return ProviderCertificateSerializer(
            certificates,
            many=True,
            context=self.context
        ).data


class PublicProviderProfileSerializer(serializers.ModelSerializer):
    """
    Public provider profile.

    This serializer is used when a customer opens
    a provider's profile.
    """

    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    first_name = serializers.CharField(
        source='user.first_name',
        read_only=True
    )

    last_name = serializers.CharField(
        source='user.last_name',
        read_only=True
    )

    full_name = serializers.SerializerMethodField()

    certificates = serializers.SerializerMethodField()

    talents = serializers.SerializerMethodField()

    reviews = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile

        fields = [
            'id',
            'user',
            'username',
            'first_name',
            'last_name',
            'full_name',

            'phone_number',
            'bio',
            'avatar',

            'is_provider',
            'is_online',

            'average_rating',
            'total_reviews',

            'talents',
            'certificates',
            'reviews',

            'created_at',
            'updated_at',
        ]

        read_only_fields = fields

    def get_full_name(self, obj):
        return obj.user.get_full_name()

    def get_talents(self, obj):
        from apps.services.serializers import TalentSerializer

        talents = obj.user.talents.filter(
            is_active=True
        )

        return TalentSerializer(
            talents,
            many=True,
            context=self.context
        ).data

    def get_certificates(self, obj):
        certificates = ProviderCertificate.objects.filter(
            provider=obj.user
        )

        return ProviderCertificateSerializer(
            certificates,
            many=True,
            context=self.context
        ).data

    def get_reviews(self, obj):
        from apps.reviews.models import Review
        from apps.reviews.serializers import ReviewSerializer

        reviews = Review.objects.filter(
            provider=obj.user
        ).select_related(
            'customer'
        )

        return ReviewSerializer(
            reviews,
            many=True,
            context=self.context
        ).data