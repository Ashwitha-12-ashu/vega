from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from apps.services.models import Talent, ServiceCategory


class BookingStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    ACCEPTED = 'ACCEPTED', 'Accepted'
    REJECTED = 'REJECTED', 'Rejected'
    CANCELLED = 'CANCELLED', 'Cancelled'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    COMPLETED = 'COMPLETED', 'Completed'


class Booking(models.Model):
    """
    Booking record between a customer and a service provider.
    Enforces a strict state machine on transitions.
    """
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='customer_bookings'
    )
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='provider_bookings'
    )
    talent = models.ForeignKey(
        Talent,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.PROTECT,
        related_name='bookings'
    )
    location_address = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True, default='')
    
    status = models.CharField(
        max_length=20,
        choices=BookingStatus.choices,
        default=BookingStatus.PENDING,
        db_index=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'vega_bookings'
        verbose_name = 'Booking'
        verbose_name_plural = 'Bookings'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['provider', 'status']),
            models.Index(fields=['scheduled_date', 'status']),
        ]

    def __str__(self):
        return f"Booking #{self.id}: {self.customer.username} -> {self.provider.username} [{self.status}]"

    def can_transition_to(self, new_status, actor_user):
        """
        Validates if the status transition is permitted based on current state and actor.
        """
        # Current transitions matrix
        allowed_transitions = {
            BookingStatus.PENDING: {
                BookingStatus.ACCEPTED: {'provider'},
                BookingStatus.REJECTED: {'provider'},
                BookingStatus.CANCELLED: {'customer', 'provider'},
            },
            BookingStatus.ACCEPTED: {
                BookingStatus.IN_PROGRESS: {'provider'},
                BookingStatus.CANCELLED: {'customer', 'provider'},
            },
            BookingStatus.IN_PROGRESS: {
                BookingStatus.COMPLETED: {'provider'},
            },
            BookingStatus.REJECTED: {},
            BookingStatus.CANCELLED: {},
            BookingStatus.COMPLETED: {},
        }

        roles_allowed = allowed_transitions.get(self.status, {}).get(new_status, set())
        if not roles_allowed:
            return False, f"Invalid transition from {self.status} to {new_status}."

        is_customer = actor_user == self.customer
        is_provider = actor_user == self.provider
        is_admin = actor_user.is_staff or actor_user.is_superuser

        if is_admin:
            return True, "Allowed by admin"
        if 'customer' in roles_allowed and is_customer:
            return True, "Allowed"
        if 'provider' in roles_allowed and is_provider:
            return True, "Allowed"

        return False, f"User does not have permission to transition booking to {new_status}."

    def transition_to(self, new_status, actor_user):
        """
        Applies a state transition with validation and audit log/notification hooks.
        """
        allowed, reason = self.can_transition_to(new_status, actor_user)
        if not allowed:
            raise ValidationError(reason)
        
        self.status = new_status
        self.save(update_fields=['status', 'updated_at'])
        return self
