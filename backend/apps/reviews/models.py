from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from apps.bookings.models import Booking, BookingStatus


class Review(models.Model):
    """
    Review and rating given by a customer to a service provider for a COMPLETED booking.
    Strictly enforced: 1 review per completed booking, no self-reviews, valid 1-5 star rating.
    """
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name='review'
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='written_reviews'
    )
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_reviews'
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 (lowest) to 5 (highest)"
    )
    comment = models.TextField(help_text="Detailed feedback or review commentary")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vega_reviews'
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['provider', 'rating']),
            models.Index(fields=['customer']),
        ]

    def clean(self):
        if self.booking.status != BookingStatus.COMPLETED:
            raise ValidationError("Reviews can only be submitted for COMPLETED bookings.")
        
        if self.customer == self.provider:
            raise ValidationError("Users cannot review their own service.")

        if self.booking.customer != self.customer:
            raise ValidationError("Only the customer of this booking is authorized to submit a review.")

        if self.booking.provider != self.provider:
            raise ValidationError("The provider must match the provider associated with the booking.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
        # Recalculate provider's average rating & total reviews
        if hasattr(self.provider, 'profile'):
            self.provider.profile.recalculate_rating()

    def __str__(self):
        return f"Review #{self.id}: {self.rating}★ by {self.customer.username} for {self.provider.username}"
