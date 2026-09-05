from datetime import timedelta
import random
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate, get_user_model
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from .models import EmailOTP
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    ForgotPasswordSerializer,
    VerifyOTPSerializer,
    ResetPasswordSerializer,
)

User = get_user_model()


def get_tokens_for_user(user):
    """Generate JWT refresh and access tokens for a user."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(APIView):
    """
    POST /api/auth/register/
    Register a new user and return JWT tokens.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            user_data = UserSerializer(user, context={'request': request}).data
            return Response({
                'message': 'User registered successfully',
                'user': user_data,
                'tokens': tokens,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    POST /api/auth/login/
    Authenticate user via username or email and return JWT tokens.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        username_or_email = serializer.validated_data['username']
        password = serializer.validated_data['password']

        # Support login by email or username
        user = None
        if '@' in username_or_email:
            try:
                user_obj = User.objects.get(email=username_or_email)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None
        else:
            user = authenticate(request, username=username_or_email, password=password)

        if user is not None:
            if not user.is_active:
                return Response({'error': 'This account is deactivated.'}, status=status.HTTP_403_FORBIDDEN)
            
            tokens = get_tokens_for_user(user)
            user_data = UserSerializer(user, context={'request': request}).data
            return Response({
                'message': 'Login successful',
                'user': user_data,
                'tokens': tokens,
            }, status=status.HTTP_200_OK)
        
        return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Blacklist the refresh token to logout securely.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"message": "Logged out."}, status=status.HTTP_200_OK)


class CurrentUserView(APIView):
    """
    GET /api/auth/me/
    Return the authenticated user's profile and state.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    """
    POST /api/auth/forgot-password/
    Generate and send a 6-digit OTP for password reset.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email_or_username = serializer.validated_data['email'].strip()
        user = None
        if '@' in email_or_username:
            user = User.objects.filter(email__iexact=email_or_username).first()
        else:
            user = User.objects.filter(username__iexact=email_or_username).first()

        if not user:
            return Response({
                'error': 'No account found with this email or username.'
            }, status=status.HTTP_404_NOT_FOUND)

        # Invalidate previous password_reset OTPs for this user
        EmailOTP.objects.filter(user=user, purpose=EmailOTP.PASSWORD_RESET).delete()

        # Generate 6-digit numeric OTP
        otp_code = f"{random.randint(100000, 999999)}"
        expires_at = timezone.now() + timedelta(minutes=10)

        EmailOTP.objects.create(
            user=user,
            otp=otp_code,
            purpose=EmailOTP.PASSWORD_RESET,
            expires_at=expires_at
        )

        return Response({
            'message': f'Verification code sent to {user.email}',
            'email': user.email,
            'otp_dev': otp_code,
        }, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    """
    POST /api/auth/verify-otp/
    Verify 6-digit OTP for password reset.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email_or_username = serializer.validated_data['email'].strip()
        otp_code = serializer.validated_data['otp'].strip()

        user = None
        if '@' in email_or_username:
            user = User.objects.filter(email__iexact=email_or_username).first()
        else:
            user = User.objects.filter(username__iexact=email_or_username).first()

        if not user:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        otp_record = EmailOTP.objects.filter(
            user=user,
            purpose=EmailOTP.PASSWORD_RESET,
            otp=otp_code
        ).order_by('-created_at').first()

        if not otp_record:
            return Response({'error': 'Invalid verification code.'}, status=status.HTTP_400_BAD_REQUEST)

        if otp_record.is_expired():
            return Response({'error': 'Verification code has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        otp_record.is_verified = True
        otp_record.save()

        return Response({
            'message': 'OTP verified successfully.',
            'valid': True,
            'email': user.email,
            'otp': otp_code
        }, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    """
    POST /api/auth/reset-password/
    Reset password using verified OTP or email, and immediately log in with JWT tokens.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email_or_username = serializer.validated_data['email'].strip()
        otp_code = serializer.validated_data.get('otp', '').strip()
        new_password = serializer.validated_data['password']

        user = None
        if '@' in email_or_username:
            user = User.objects.filter(email__iexact=email_or_username).first()
        else:
            user = User.objects.filter(username__iexact=email_or_username).first()

        if not user:
            return Response({'error': 'No account found with this email or username.'}, status=status.HTTP_404_NOT_FOUND)

        if otp_code:
            otp_record = EmailOTP.objects.filter(
                user=user,
                purpose=EmailOTP.PASSWORD_RESET,
                otp=otp_code
            ).order_by('-created_at').first()

            if not otp_record:
                return Response({'error': 'Invalid verification code.'}, status=status.HTTP_400_BAD_REQUEST)
            if otp_record.is_expired():
                return Response({'error': 'Verification code has expired.'}, status=status.HTTP_400_BAD_REQUEST)
            
            otp_record.delete()

        # Update password
        user.set_password(new_password)
        user.save()

        # Automatically authenticate user and return tokens
        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user, context={'request': request}).data

        return Response({
            'message': 'Password reset successfully! You are now logged in.',
            'user': user_data,
            'tokens': tokens,
        }, status=status.HTTP_200_OK)

