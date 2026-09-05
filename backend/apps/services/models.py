from django.db import models, transaction
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.text import slugify


class ServiceCategory(models.Model):
    """
    Standard service categories in VEGA (e.g. Hair Styling, Photography, Plumbing, etc.)
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    icon = models.CharField(max_length=50, default='wrench', help_text="Lucide icon name or image identifier")
    description = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vega_service_categories'
        verbose_name = 'Service Category'
        verbose_name_plural = 'Service Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Talent(models.Model):
    """
    Represents a specific talent or service offering by a user.
    A user can have multiple talents, but ONLY ONE can be active at any given moment.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='talents'
    )
    category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.CASCADE,
        related_name='talents'
    )
    title = models.CharField(max_length=150)
    description = models.TextField()
    price_per_hour = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Service fee in currency units"
    )
    experience_years = models.PositiveIntegerField(
        default=1,
        help_text="Years of professional experience in this talent"
    )
    availability_notes = models.TextField(
        blank=True,
        default='',
        help_text="Custom availability notes (e.g., Weekdays 9 AM - 6 PM)"
    )
    is_active = models.BooleanField(
        default=False,
        help_text="Designates whether this talent is currently online/active."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'vega_user_talents'
        verbose_name = 'Talent'
        verbose_name_plural = 'Talents'
        ordering = ['-is_active', '-created_at']
        constraints = [
            # CRITICAL BUSINESS RULE: Only one talent belonging to a user can be active at any given time.
            models.UniqueConstraint(
                fields=['user'],
                condition=models.Q(is_active=True),
                name='unique_active_talent_per_user'
            )
        ]

    def clean(self):
        """Model level validation for active talent uniqueness."""
        if self.is_active:
            existing_active = Talent.objects.filter(user=self.user, is_active=True).exclude(pk=self.pk)
            if existing_active.exists():
                raise ValidationError("Only one talent can be active at a time for a user.")

    def __str__(self):
        status = "ACTIVE" if self.is_active else "INACTIVE"
        return f"{self.user.username} - {self.title} [{status}]"

    @classmethod
    def activate_single_talent(cls, talent_id, user):
        """
        Thread-safe and concurrency-safe talent activation.
        Uses database row locking (select_for_update) inside an atomic transaction.
        Deactivates all other talents for the user and activates the chosen talent.
        """
        with transaction.atomic():
            # Lock all talents belonging to this user to prevent race conditions
            locked_talents = list(cls.objects.select_for_update().filter(user=user))
            
            target_talent = None
            for t in locked_talents:
                if t.id == talent_id:
                    target_talent = t
                elif t.is_active:
                    t.is_active = False
                    t.save(update_fields=['is_active', 'updated_at'])
            
            if not target_talent:
                raise cls.DoesNotExist(f"Talent with ID {talent_id} does not exist for this user.")

            target_talent.is_active = True
            target_talent.save(update_fields=['is_active', 'updated_at'])
            return target_talent

    @classmethod
    def deactivate_single_talent(cls, talent_id, user):
        """
        Thread-safe talent deactivation.
        Also turns provider offline if they have no other active talent.
        """
        with transaction.atomic():
            talent = cls.objects.select_for_update().get(id=talent_id, user=user)
            talent.is_active = False
            talent.save(update_fields=['is_active', 'updated_at'])
            
            # If provider was online, going without active talent takes them offline
            if hasattr(user, 'profile') and user.profile.is_online:
                user.profile.is_online = False
                user.profile.save(update_fields=['is_online', 'updated_at'])
                
            return talent
