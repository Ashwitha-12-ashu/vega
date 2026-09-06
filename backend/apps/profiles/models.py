from django.db import models
from django.conf import settings

class UserProfile(models.Model):
    """
    Profile extension for the unified User model.

    Stores:
    - Phone number
    - Bio
    - Avatar
    - Provider status
    - Online/offline status
    - Average rating
    - Total reviews
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile'
    )

    phone_number = models.CharField(
        max_length=20,
        blank=True,
        default=''
    )

    bio = models.TextField(
        blank=True,
        default=''
    )

    avatar = models.CharField(
        max_length=500,
        blank=True,
        default=''
    )

    # Provider settings
    is_provider = models.BooleanField(
        default=False,
        help_text='Designates whether this user has activated provider features.'
    )

    is_online = models.BooleanField(
        default=False,
        help_text='Designates whether the provider is currently online and accepting bookings.'
    )

    # Aggregated ratings
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00
    )

    total_reviews = models.PositiveIntegerField(
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        db_table = 'vega_user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        role = 'Provider' if self.is_provider else 'Customer'
        status = 'Online' if self.is_online else 'Offline'

        return f"{self.user.username}'s Profile ({role} - {status})"

    def recalculate_rating(self):
        """
        Recalculate average rating and review count
        from actual reviews received by this provider.
        """

        from apps.reviews.models import Review

        reviews = Review.objects.filter(
            provider=self.user
        )

        total = reviews.count()

        if total > 0:
            avg = reviews.aggregate(
                models.Avg('rating')
            )['rating__avg'] or 0.0

            self.average_rating = round(avg, 2)
            self.total_reviews = total

        else:
            self.average_rating = 0.00
            self.total_reviews = 0

        self.save(
            update_fields=[
                'average_rating',
                'total_reviews',
                'updated_at'
            ]
        )


class ProviderCertificate(models.Model):
    """
    Certificate/document uploaded by a service provider.

    Examples:
    - Plumbing certificate
    - Beauty certification
    - Electrical license
    - Photography course certificate
    - Driving license
    """

    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='certificates'
    )

    certificate_name = models.CharField(
        max_length=200
    )

    issuing_organization = models.CharField(
        max_length=200,
        blank=True,
        default=''
    )

    certificate_file = models.FileField(
        upload_to='certificates/'
    )

    issue_date = models.DateField(
        null=True,
        blank=True
    )

    description = models.TextField(
        blank=True,
        default=''
    )

    is_verified = models.BooleanField(
        default=False
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = 'vega_provider_certificates'
        verbose_name = 'Provider Certificate'
        verbose_name_plural = 'Provider Certificates'
        ordering = ['-uploaded_at']

    def __str__(self):
        return (
            f"{self.provider.username} - "
            f"{self.certificate_name}"
        )