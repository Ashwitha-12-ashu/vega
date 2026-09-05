from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.services.models import ServiceCategory, Talent
from apps.bookings.models import Booking, BookingStatus
from apps.reviews.models import Review
from datetime import date, time

User = get_user_model()


class ReviewSystemTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(
            username='cust_charlie',
            email='charlie@example.com',
            first_name='Charlie',
            last_name='Customer',
            password='Password123!'
        )
        self.provider = User.objects.create_user(
            username='prov_diana',
            email='diana@example.com',
            first_name='Diana',
            last_name='Provider',
            password='Password123!'
        )
        self.provider.profile.is_provider = True
        self.provider.profile.is_online = True
        self.provider.profile.save()

        self.category = ServiceCategory.objects.create(name='Cleaning', slug='cleaning')
        self.talent = Talent.objects.create(
            user=self.provider,
            category=self.category,
            title='Deep House Cleaning',
            description='Impeccable clean',
            price_per_hour=60.00,
            is_active=True
        )

        self.booking_completed = Booking.objects.create(
            customer=self.customer,
            provider=self.provider,
            talent=self.talent,
            category=self.category,
            location_address='456 Elm St',
            scheduled_date=date(2026, 9, 2),
            scheduled_time=time(14, 0),
            price=60.00,
            status=BookingStatus.COMPLETED
        )

        self.booking_pending = Booking.objects.create(
            customer=self.customer,
            provider=self.provider,
            talent=self.talent,
            category=self.category,
            location_address='456 Elm St',
            scheduled_date=date(2026, 9, 3),
            scheduled_time=time(14, 0),
            price=60.00,
            status=BookingStatus.PENDING
        )

    def test_review_submission_success_on_completed_booking(self):
        self.client.force_authenticate(user=self.customer)
        payload = {
            'booking_id': self.booking_completed.id,
            'rating': 5,
            'comment': 'Outstanding service, highly recommended!'
        }
        response = self.client.post('/api/reviews/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['rating'], 5)

        # Provider rating should update
        self.provider.profile.refresh_from_db()
        self.assertEqual(float(self.provider.profile.average_rating), 5.0)
        self.assertEqual(self.provider.profile.total_reviews, 1)

    def test_review_rejected_on_pending_booking(self):
        self.client.force_authenticate(user=self.customer)
        payload = {
            'booking_id': self.booking_pending.id,
            'rating': 4,
            'comment': 'Good service.'
        }
        response = self.client.post('/api/reviews/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('completed bookings', response.data['error'])

    def test_prevent_duplicate_reviews(self):
        Review.objects.create(
            booking=self.booking_completed,
            customer=self.customer,
            provider=self.provider,
            rating=5,
            comment='First review'
        )

        self.client.force_authenticate(user=self.customer)
        payload = {
            'booking_id': self.booking_completed.id,
            'rating': 4,
            'comment': 'Duplicate review attempt'
        }
        response = self.client.post('/api/reviews/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
