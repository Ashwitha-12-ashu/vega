from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """
    Unified User model for VEGA.
    Both customers and providers share this single user model.
    """

    id = models.BigAutoField(primary_key=True)

    email = models.EmailField(
        unique=True,
        db_index=True
    )

    first_name = models.CharField(
        max_length=150,
        blank=False
    )

    last_name = models.CharField(
        max_length=150,
        blank=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    REQUIRED_FIELDS = [
        'email',
        'first_name',
        'last_name'
    ]

    class Meta:
        db_table = 'vega_users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.username} ({self.email})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username


class EmailOTP(models.Model):
    """
    OTP used for:
    1. Login two-step verification
    2. Forgot-password verification
    """

    LOGIN = "login"
    PASSWORD_RESET = "password_reset"

    PURPOSE_CHOICES = [
        (LOGIN, "Login"),
        (PASSWORD_RESET, "Password Reset"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="email_otps"
    )

    otp = models.CharField(
        max_length=6
    )

    purpose = models.CharField(
        max_length=20,
        choices=PURPOSE_CHOICES
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    expires_at = models.DateTimeField()

    is_verified = models.BooleanField(
        default=False
    )

    attempts = models.PositiveIntegerField(
        default=0
    )

    def is_expired(self):
        return timezone.now() >= self.expires_at

    def __str__(self):
        return f"{self.user.email} - {self.purpose}"