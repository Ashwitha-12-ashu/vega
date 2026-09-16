from datetime import timedelta
import re
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core import mail
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from .models import EmailOTP

User = get_user_model()


class AccountsAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/auth/register/'
        self.login_url = '/api/auth/login/'
        self.me_url = '/api/auth/me/'

    def test_user_registration_success(self):
        payload = {
            'username': 'john_doe',
            'email': 'john@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'password': 'SecurePassword123!',
            'password_confirm': 'SecurePassword123!'
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertEqual(response.data['user']['email'], 'john@example.com')
        self.assertTrue(User.objects.filter(username='john_doe').exists())
        # Check auto profile creation
        user = User.objects.get(username='john_doe')
        self.assertTrue(hasattr(user, 'profile'))
        self.assertFalse(user.profile.is_provider)

    def test_user_registration_password_mismatch(self):
        payload = {
            'username': 'john_doe2',
            'email': 'john2@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'password': 'SecurePassword123!',
            'password_confirm': 'DifferentPassword456!'
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_with_username_and_email(self):
        user = User.objects.create_user(
            username='jane_doe',
            email='jane@example.com',
            first_name='Jane',
            last_name='Doe',
            password='TestPassword123!'
        )
        
        # Test login via username
        res1 = self.client.post(self.login_url, {'username': 'jane_doe', 'password': 'TestPassword123!'}, format='json')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', res1.data)

        # Test login via email
        res2 = self.client.post(self.login_url, {'username': 'jane@example.com', 'password': 'TestPassword123!'}, format='json')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', res2.data)

    def test_current_user_authenticated_endpoint(self):
        user = User.objects.create_user(
            username='sam_smith',
            email='sam@example.com',
            first_name='Sam',
            last_name='Smith',
            password='TestPassword123!'
        )
        self.client.force_authenticate(user=user)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'sam_smith')
        self.assertEqual(response.data['full_name'], 'Sam Smith')

    def test_forgot_password_and_reset_flow(self):
        user = User.objects.create_user(
            username='alex_reset',
            email='alex@example.com',
            first_name='Alex',
            last_name='Reset',
            password='OldPassword123!'
        )

        # 1. Request forgot password OTP
        forgot_res = self.client.post('/api/auth/forgot-password/', {'email': 'alex@example.com'}, format='json')
        self.assertEqual(forgot_res.status_code, status.HTTP_200_OK)
        self.assertNotIn('otp', forgot_res.data)  # Ensure OTP is not exposed in API response

        # Verify email was sent via Django outbox
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('alex@example.com', mail.outbox[0].to)
        match = re.search(r'\b\d{6}\b', mail.outbox[0].body)
        self.assertIsNotNone(match)
        raw_otp = match.group(0)

        # Verify OTP is stored as a 64-character SHA-256 hash
        otp_record = EmailOTP.objects.filter(user=user, purpose=EmailOTP.PASSWORD_RESET).latest('created_at')
        self.assertEqual(len(otp_record.otp), 64)
        self.assertNotEqual(otp_record.otp, raw_otp)
        self.assertFalse(otp_record.is_verified)

        # 2. Test invalid OTP verification
        invalid_res = self.client.post('/api/auth/verify-otp/', {'email': 'alex@example.com', 'otp': '000000'}, format='json')
        self.assertEqual(invalid_res.status_code, status.HTTP_400_BAD_REQUEST)

        # 3. Verify valid OTP
        verify_res = self.client.post('/api/auth/verify-otp/', {'email': 'alex@example.com', 'otp': raw_otp}, format='json')
        self.assertEqual(verify_res.status_code, status.HTTP_200_OK)
        self.assertTrue(verify_res.data['valid'])
        self.assertIn('reset_token', verify_res.data)
        reset_token = verify_res.data['reset_token']

        # 4. Reset password with reset_token
        reset_res = self.client.post('/api/auth/reset-password/', {
            'email': 'alex@example.com',
            'reset_token': reset_token,
            'password': 'NewSecurePassword123!',
            'confirm_password': 'NewSecurePassword123!'
        }, format='json')
        self.assertEqual(reset_res.status_code, status.HTTP_200_OK)
        self.assertTrue(reset_res.data.get('success'))

        # Verify OTP/reset_token record was deleted after successful reset
        self.assertFalse(EmailOTP.objects.filter(user=user, purpose=EmailOTP.PASSWORD_RESET).exists())

        # 5. Verify login works with new password
        login_res = self.client.post(self.login_url, {'username': 'alex@example.com', 'password': 'NewSecurePassword123!'}, format='json')
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', login_res.data)

        # 6. Verify old password fails
        old_login_res = self.client.post(self.login_url, {'username': 'alex@example.com', 'password': 'OldPassword123!'}, format='json')
        self.assertEqual(old_login_res.status_code, status.HTTP_401_UNAUTHORIZED)



