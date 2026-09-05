from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class UserLocation(models.Model):
    """
    Geospatial location model for users (both customers and providers).
    Stores precise latitude, longitude, and address information.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='location'
    )
    latitude = models.FloatField(
        validators=[MinValueValidator(-90.0), MaxValueValidator(90.0)],
        help_text="Latitude in decimal degrees (-90 to +90)"
    )
    longitude = models.FloatField(
        validators=[MinValueValidator(-180.0), MaxValueValidator(180.0)],
        help_text="Longitude in decimal degrees (-180 to +180)"
    )
    address = models.CharField(max_length=255, blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='')
    state = models.CharField(max_length=100, blank=True, default='')
    postal_code = models.CharField(max_length=20, blank=True, default='')
    country = models.CharField(max_length=100, blank=True, default='')
    
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vega_user_locations'
        verbose_name = 'User Location'
        verbose_name_plural = 'User Locations'
        indexes = [
            models.Index(fields=['latitude', 'longitude']),
        ]

    def __str__(self):
        return f"{self.user.username} @ ({self.latitude}, {self.longitude}) - {self.city}"
