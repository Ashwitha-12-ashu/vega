from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details."""
    full_name = serializers.ReadOnlyField()
    profile = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    active_talent = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'profile',
            'location',
            'active_talent',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_profile(self, obj):
        if hasattr(obj, 'profile'):
            from apps.profiles.serializers import UserProfileSerializer
            return UserProfileSerializer(obj.profile, context=self.context).data
        return None

    def get_location(self, obj):
        if hasattr(obj, 'location'):
            from apps.locations.serializers import UserLocationSerializer
            return UserLocationSerializer(obj.location).data
        return None

    def get_active_talent(self, obj):
        active_talent = obj.talents.filter(is_active=True).first()
        if active_talent:
            from apps.services.serializers import TalentSerializer
            return TalentSerializer(active_talent, context=self.context).data
        return None


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'password_confirm']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login with either username or email."""
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class ForgotPasswordSerializer(serializers.Serializer):
    """Serializer for initiating forgot-password OTP request."""
    email = serializers.CharField(required=True)


class VerifyOTPSerializer(serializers.Serializer):
    """Serializer for verifying 6-digit OTP."""
    email = serializers.CharField(required=True)
    otp = serializers.CharField(required=True, min_length=6, max_length=6)


class ResetPasswordSerializer(serializers.Serializer):
    """Serializer for resetting password and auto-authenticating."""
    email = serializers.CharField(required=True)
    otp = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(required=True, write_only=True, min_length=8)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')

        if password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        if len(password) < 8:
            raise serializers.ValidationError({"password": "Password must contain at least 8 characters."})

        if not any(char.isalpha() for char in password) or not any(char.isdigit() for char in password):
            raise serializers.ValidationError({"password": "Password must contain both letters and numbers."})

        return attrs

