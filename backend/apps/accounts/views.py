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


import hashlib
import secrets
from django.core.mail import send_mail
from django.conf import settings

class ForgotPasswordView(APIView):
    """
    POST /api/auth/forgot-password/
    Generate and send a 6-digit OTP for password reset.
    Stores the OTP securely as a SHA-256 hash with a 10-minute expiry.
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

        print("=" * 50)
        print("FORGOT PASSWORD REQUEST RECEIVED")
        print("EMAIL:", user.email)

        # Invalidate previous password_reset OTPs for this user
        EmailOTP.objects.filter(user=user, purpose=EmailOTP.PASSWORD_RESET).delete()

        # Generate cryptographically secure 6-digit numeric OTP
        otp_code = f"{secrets.randbelow(900000) + 100000}"
        print("OTP GENERATED")
        
        hashed_otp = hashlib.sha256(otp_code.encode('utf-8')).hexdigest()
        expires_at = timezone.now() + timedelta(minutes=10)

        EmailOTP.objects.create(
            user=user,
            otp=hashed_otp,
            purpose=EmailOTP.PASSWORD_RESET,
            expires_at=expires_at,
            is_verified=False
        )

        # Send email with 6-digit OTP
        subject = "VEGA - Password Reset Verification Code"
        message = (
            f"Hello {user.first_name or user.username},\n\n"
            f"Your VEGA password reset verification code is: {otp_code}\n\n"
            f"This code will expire in 10 minutes.\n"
            f"If you did not request this code, please ignore this email.\n\n"
            f"Best regards,\n"
            f"VEGA Support Team"
        )
        html_message = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 24px; font-weight: 800; color: #4338ca; letter-spacing: 2px;">VEGA</span>
                <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Smart Local Services</p>
            </div>
            <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-bottom: 12px;">Reset Your Password</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
                Hello <strong>{user.first_name or user.username}</strong>,<br/>
                We received a request to reset your VEGA account password. Please use the following 6-digit verification code:
            </p>
            <div style="text-align: center; margin: 28px 0;">
                <div style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4338ca; background: #eef2ff; border: 1.5px solid #c7d2fe; padding: 14px 28px; border-radius: 12px;">
                    {otp_code}
                </div>
            </div>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 20px;">
                This code is valid for <strong>10 minutes</strong>. If you did not request a password reset, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
                &copy; 2026 VEGA Platform. All rights reserved.
            </p>
        </div>
        """

        print("ATTEMPTING TO SEND OTP EMAIL")
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'VEGA <noreply@vega.app>'),
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
            print("OTP EMAIL SENT SUCCESSFULLY TO:", user.email)
            print("=" * 50)
        except Exception as e:
            print("OTP EMAIL ERROR:", str(e))
            print("=" * 50)
            return Response({
                'error': 'Unable to send verification email. Please check email settings or try again later.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'message': f'A 6-digit verification code has been sent to {user.email}. Please check your email.',
            'email': user.email,
        }, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    """
    POST /api/auth/verify-otp/
    Verify 6-digit OTP for password reset and generate a short-lived reset token.
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

        print("=" * 50)
        print("OTP VERIFICATION REQUEST RECEIVED")
        print("EMAIL:", user.email)

        hashed_otp = hashlib.sha256(otp_code.encode('utf-8')).hexdigest()

        otp_record = EmailOTP.objects.filter(
            user=user,
            purpose=EmailOTP.PASSWORD_RESET,
            otp=hashed_otp,
            is_verified=False,
        ).order_by('-created_at').first()

        if not otp_record:
            print("OTP VERIFICATION FAILED: Invalid OTP")
            print("=" * 50)
            return Response({'error': 'Invalid verification code.'}, status=status.HTTP_400_BAD_REQUEST)

        if otp_record.is_expired():
            print("OTP VERIFICATION FAILED: Expired OTP")
            print("=" * 50)
            return Response({'error': 'Verification code has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate a short-lived password-reset token
        reset_token = secrets.token_urlsafe(32)
        otp_record.reset_token = reset_token
        otp_record.is_verified = True
        otp_record.save()

        print("OTP VERIFIED SUCCESSFULLY - RESET TOKEN ISSUED")
        print("=" * 50)

        return Response({
            'message': 'OTP verified successfully.',
            'valid': True,
            'email': user.email,
            'reset_token': reset_token,
        }, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    """
    POST /api/auth/reset-password/
    Reset password using verified password-reset token.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email_or_username = serializer.validated_data['email'].strip()
        reset_token = serializer.validated_data['reset_token'].strip()
        new_password = serializer.validated_data['password']

        user = None
        if '@' in email_or_username:
            user = User.objects.filter(email__iexact=email_or_username).first()
        else:
            user = User.objects.filter(username__iexact=email_or_username).first()

        if not user:
            return Response({'error': 'No account found with this email or username.'}, status=status.HTTP_404_NOT_FOUND)

        print("=" * 50)
        print("RESET PASSWORD REQUEST RECEIVED")
        print("EMAIL:", user.email)

        otp_record = EmailOTP.objects.filter(
            user=user,
            purpose=EmailOTP.PASSWORD_RESET,
            reset_token=reset_token,
            is_verified=True,
        ).order_by('-created_at').first()

        if not otp_record:
            print("RESET PASSWORD FAILED: Invalid or used reset token")
            print("=" * 50)
            return Response({'error': 'Invalid or expired password reset token.'}, status=status.HTTP_400_BAD_REQUEST)

        if otp_record.is_expired():
            print("RESET PASSWORD FAILED: Expired reset token")
            print("=" * 50)
            return Response({'error': 'Password reset token has expired. Please request a new verification code.'}, status=status.HTTP_400_BAD_REQUEST)

        # Invalidate the OTP and reset token after successful password reset
        EmailOTP.objects.filter(user=user, purpose=EmailOTP.PASSWORD_RESET).delete()

        # Update password securely
        user.set_password(new_password)
        user.save()

        print("PASSWORD UPDATED SUCCESSFULLY - OTP & TOKEN INVALIDATED")
        print("=" * 50)

        return Response({
            'message': 'Password reset successfully! You can now log in with your new password.',
            'success': True,
        }, status=status.HTTP_200_OK)

