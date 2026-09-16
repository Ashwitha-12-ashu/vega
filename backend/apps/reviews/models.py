from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from apps.bookings.models import Booking, BookingStatus


class Review(models.Model):
    """
    Review and rating given by a customer to a service provider for a completed booking.
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
        valid_statuses = [BookingStatus.COMPLETED, BookingStatus.RATING_PENDING, BookingStatus.CLOSED]
        if self.booking.status not in valid_statuses:
            raise ValidationError("Reviews can only be submitted for completed bookings.")
        
        if self.customer == self.provider:
            raise ValidationError("Users cannot review their own service.")

        if self.booking.customer != self.customer:
            raise ValidationError("Only the customer of this booking is authorized to submit a review.")

        if self.booking.provider != self.provider:
            raise ValidationError("The provider must match the provider associated with the booking.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
        # Update booking customer_reviewed flag and close booking if applicable
        if not self.booking.customer_reviewed:
            self.booking.customer_reviewed = True
            if self.booking.status in [BookingStatus.COMPLETED, BookingStatus.RATING_PENDING]:
                self.booking.status = BookingStatus.CLOSED
            self.booking.save(update_fields=['customer_reviewed', 'status', 'updated_at'])

        # Recalculate provider's average rating & total reviews
        if hasattr(self.provider, 'profile'):
            self.provider.profile.recalculate_rating()

    def __str__(self):
        return f"Review #{self.id}: {self.rating}★ by {self.customer.username} for {self.provider.username}"


class CustomerReview(models.Model):
    """
    Review and rating given by a service provider to a customer for a completed booking.
    """
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name='customer_feedback'
    )
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='given_customer_reviews'
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_customer_reviews'
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 (lowest) to 5 (highest)"
    )
    comment = models.TextField(blank=True, default='', help_text="Optional feedback from provider")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vega_customer_reviews'
        verbose_name = 'Customer Review'
        verbose_name_plural = 'Customer Reviews'
        ordering = ['-created_at']

    def clean(self):
        valid_statuses = [BookingStatus.COMPLETED, BookingStatus.RATING_PENDING, BookingStatus.CLOSED]
        if self.booking.status not in valid_statuses:
            raise ValidationError("Reviews can only be submitted for completed bookings.")

        if self.provider == self.customer:
            raise ValidationError("Users cannot review themselves.")

        if self.booking.provider != self.provider:
            raise ValidationError("Only the provider of this booking is authorized to submit customer feedback.")

        if self.booking.customer != self.customer:
            raise ValidationError("The customer must match the customer associated with the booking.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
        if not self.booking.provider_reviewed:
            self.booking.provider_reviewed = True
            self.booking.save(update_fields=['provider_reviewed', 'updated_at'])

    def __str__(self):
        return f"Customer Review #{self.id}: {self.rating}★ by {self.provider.username} for {self.customer.username}"
