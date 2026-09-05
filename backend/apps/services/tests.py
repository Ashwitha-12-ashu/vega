from django.test import TestCase, TransactionTestCase
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework.test import APIClient
from rest_framework import status
from apps.services.models import ServiceCategory, Talent
import threading

User = get_user_model()


class TalentBusinessRuleTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='provider_pro',
            email='provider@example.com',
            first_name='Pro',
            last_name='Vider',
            password='TestPassword123!'
        )
        self.user.profile.is_provider = True
        self.user.profile.save()

        self.cat_hair = ServiceCategory.objects.create(name='Hair Styling', slug='hair-styling')
        self.cat_makeup = ServiceCategory.objects.create(name='Makeup', slug='makeup')
        self.cat_photo = ServiceCategory.objects.create(name='Photography', slug='photography')

    def test_user_can_have_multiple_talents(self):
        self.client.force_authenticate(user=self.user)
        
        # Add Talent 1 (Hair)
        t1 = Talent.objects.create(
            user=self.user,
            category=self.cat_hair,
            title='Pro Hair Cuts',
            description='Specialist styling',
            price_per_hour=50.00,
            is_active=True
        )

        # Add Talent 2 (Makeup - Inactive)
        t2 = Talent.objects.create(
            user=self.user,
            category=self.cat_makeup,
            title='Bridal Makeup',
            description='Event makeup',
            price_per_hour=80.00,
            is_active=False
        )

        # Add Talent 3 (Photography - Inactive)
        t3 = Talent.objects.create(
            user=self.user,
            category=self.cat_photo,
            title='Wedding Photos',
            description='Portraits & albums',
            price_per_hour=120.00,
            is_active=False
        )

        self.assertEqual(self.user.talents.count(), 3)
        self.assertEqual(self.user.talents.filter(is_active=True).count(), 1)
        self.assertEqual(self.user.talents.get(is_active=True).id, t1.id)

    def test_activating_new_talent_deactivates_previous_talent(self):
        self.client.force_authenticate(user=self.user)
        
        t1 = Talent.objects.create(user=self.user, category=self.cat_hair, title='Hair', description='Desc', price_per_hour=50, is_active=True)
        t2 = Talent.objects.create(user=self.user, category=self.cat_makeup, title='Makeup', description='Desc', price_per_hour=80, is_active=False)

        # Activate Makeup
        activate_url = f'/api/talents/{t2.id}/activate/'
        response = self.client.post(activate_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        t1.refresh_from_db()
        t2.refresh_from_db()

        self.assertFalse(t1.is_active)
        self.assertTrue(t2.is_active)
        self.assertEqual(self.user.talents.filter(is_active=True).count(), 1)

    def test_database_constraint_prevents_multiple_active_talents(self):
        Talent.objects.create(user=self.user, category=self.cat_hair, title='Hair', description='Desc', price_per_hour=50, is_active=True)
        
        # Attempting to force create another active talent bypassing logic triggers IntegrityError / UniqueConstraint
        with self.assertRaises(IntegrityError):
            Talent.objects.create(user=self.user, category=self.cat_makeup, title='Makeup', description='Desc', price_per_hour=80, is_active=True)


class TalentConcurrencyTests(TransactionTestCase):
    def test_concurrent_talent_activation(self):
        """
        Simulates two concurrent requests trying to activate two different talents at the exact same moment.
        Ensures atomic lock guarantees that only ONE talent remains active at the end.
        """
        user = User.objects.create_user(
            username='concurrency_user',
            email='concur@example.com',
            first_name='Con',
            last_name='Cur',
            password='TestPassword123!'
        )
        cat1 = ServiceCategory.objects.create(name='Cat 1', slug='cat-1')
        cat2 = ServiceCategory.objects.create(name='Cat 2', slug='cat-2')

        t1 = Talent.objects.create(user=user, category=cat1, title='Talent 1', description='Desc', price_per_hour=50, is_active=False)
        t2 = Talent.objects.create(user=user, category=cat2, title='Talent 2', description='Desc', price_per_hour=60, is_active=False)

        errors = []

        def worker1():
            try:
                Talent.activate_single_talent(t1.id, user)
            except Exception as e:
                errors.append(e)

        def worker2():
            try:
                Talent.activate_single_talent(t2.id, user)
            except Exception as e:
                errors.append(e)

        th1 = threading.Thread(target=worker1)
        th2 = threading.Thread(target=worker2)

        th1.start()
        th2.start()

        th1.join()
        th2.join()

        # Check final state: EXACTLY ONE talent must be active
        active_count = Talent.objects.filter(user=user, is_active=True).count()
        self.assertEqual(active_count, 1)
