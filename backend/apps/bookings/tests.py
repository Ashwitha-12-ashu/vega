from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.services.models import ServiceCategory, Talent
from apps.bookings.models import Booking, BookingStatus
from apps.notifications.models import Notification
from datetime import date, time

User = get_user_model()


class BookingStateMachineAndConcurrencyTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(
            username='customer_bob',
            email='bob@example.com',
            first_name='Bob',
            last_name='Customer',
            password='Password123!'
        )
        self.provider = User.objects.create_user(
            username='provider_alice',
            email='alice@example.com',
            first_name='Alice',
            last_name='Provider',
            password='Password123!'
        )
        self.provider.profile.is_provider = True
        self.provider.profile.is_online = True
        self.provider.profile.save()

        self.category = ServiceCategory.objects.create(name='Electrician', slug='electrician')
        self.talent = Talent.objects.create(
            user=self.provider,
            category=self.category,
            title='Master Electrician',
            description='Safe wiring',
            price_per_hour=75.00,
            is_active=True
        )

    def test_booking_creation_success(self):
        self.client.force_authenticate(user=self.customer)
        payload = {
            'talent_id': self.talent.id,
            'location_address': '123 Main St, Apt 4B',
            'scheduled_date': '2026-09-01',
            'scheduled_time': '10:00:00',
            'notes': 'Please ring the bell.'
        }
        response = self.client.post('/api/bookings/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], BookingStatus.PENDING)
        self.assertEqual(float(response.data['price']), 75.00)
        
        # Check provider received notification
        notif = Notification.objects.filter(recipient=self.provider).first()
        self.assertIsNotNone(notif)
        self.assertEqual(notif.notification_type, 'BOOKING_CREATED')

    def test_prevent_self_booking(self):
        # Provider cannot book themselves
        self.client.force_authenticate(user=self.provider)
        payload = {
            'talent_id': self.talent.id,
            'location_address': '123 Main St',
            'scheduled_date': '2026-09-01',
            'scheduled_time': '10:00:00'
        }
        response = self.client.post('/api/bookings/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cannot book your own service', response.data['error'])

    def test_prevent_booking_offline_provider(self):
        self.provider.profile.is_online = False
        self.provider.profile.save()

        self.client.force_authenticate(user=self.customer)
        payload = {
            'talent_id': self.talent.id,
            'location_address': '123 Main St',
            'scheduled_date': '2026-09-01',
            'scheduled_time': '10:00:00'
        }
        response = self.client.post('/api/bookings/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('OFFLINE', response.data['error'])

    def test_valid_state_transitions(self):
        booking = Booking.objects.create(
            customer=self.customer,
            provider=self.provider,
            talent=self.talent,
            category=self.category,
            location_address='123 Main St',
            scheduled_date=date(2026, 9, 1),
            scheduled_time=time(10, 0),
            price=75.00,
            status=BookingStatus.PENDING
        )

        # 1. Provider Accepts
        self.client.force_authenticate(user=self.provider)
        res1 = self.client.patch(f'/api/bookings/{booking.id}/status/', {'status': BookingStatus.ACCEPTED}, format='json')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertEqual(res1.data['status'], BookingStatus.ACCEPTED)

        # 2. Provider Starts Service
        res2 = self.client.patch(f'/api/bookings/{booking.id}/status/', {'status': BookingStatus.IN_PROGRESS}, format='json')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(res2.data['status'], BookingStatus.IN_PROGRESS)

        # 3. Provider Completes Service
        res3 = self.client.patch(f'/api/bookings/{booking.id}/status/', {'status': BookingStatus.COMPLETED}, format='json')
        self.assertEqual(res3.status_code, status.HTTP_200_OK)
        self.assertEqual(res3.data['status'], BookingStatus.COMPLETED)

    def test_invalid_state_transitions_rejected(self):
        booking = Booking.objects.create(
            customer=self.customer,
            provider=self.provider,
            talent=self.talent,
            category=self.category,
            location_address='123 Main St',
            scheduled_date=date(2026, 9, 1),
            scheduled_time=time(10, 0),
            price=75.00,
            status=BookingStatus.COMPLETED
        )

        # COMPLETED cannot transition to ACCEPTED
        self.client.force_authenticate(user=self.provider)
        res = self.client.patch(f'/api/bookings/{booking.id}/status/', {'status': BookingStatus.ACCEPTED}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
