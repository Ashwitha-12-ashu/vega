from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.services.models import ServiceCategory, Talent
from apps.locations.models import UserLocation
from apps.locations.utils import calculate_haversine_distance

User = get_user_model()


class GeospatialNearbyDiscoveryTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cat_plumbing = ServiceCategory.objects.create(name='Plumbing', slug='plumbing')
        self.cat_electrician = ServiceCategory.objects.create(name='Electrician', slug='electrician')

        # Provider 1: 2 km away (Online, Active Talent)
        self.p1 = User.objects.create_user(username='prov1', email='p1@example.com', first_name='P1', last_name='Smith', password='Pass123!')
        self.p1.profile.is_provider = True
        self.p1.profile.is_online = True
        self.p1.profile.save()
        Talent.objects.create(user=self.p1, category=self.cat_plumbing, title='Expert Plumber', description='Fast fix', price_per_hour=40, is_active=True)
        # Coordinates ~2.2 km north of origin (12.9716, 77.5946)
        UserLocation.objects.create(user=self.p1, latitude=12.9916, longitude=77.5946, city='Bangalore')

        # Provider 2: 8 km away (Online, Active Talent)
        self.p2 = User.objects.create_user(username='prov2', email='p2@example.com', first_name='P2', last_name='Jones', password='Pass123!')
        self.p2.profile.is_provider = True
        self.p2.profile.is_online = True
        self.p2.profile.save()
        Talent.objects.create(user=self.p2, category=self.cat_plumbing, title='Master Plumber', description='Large jobs', price_per_hour=60, is_active=True)
        # Coordinates ~8.8 km north
        UserLocation.objects.create(user=self.p2, latitude=13.0516, longitude=77.5946, city='Bangalore')

        # Provider 3: 3 km away but OFFLINE
        self.p3 = User.objects.create_user(username='prov3', email='p3@example.com', first_name='P3', last_name='Brown', password='Pass123!')
        self.p3.profile.is_provider = True
        self.p3.profile.is_online = False
        self.p3.profile.save()
        Talent.objects.create(user=self.p3, category=self.cat_plumbing, title='Emergency Plumber', description='24/7', price_per_hour=70, is_active=True)
        UserLocation.objects.create(user=self.p3, latitude=12.9986, longitude=77.5946, city='Bangalore')

        # Provider 4: 2 km away, Online, but talent is INACTIVE
        self.p4 = User.objects.create_user(username='prov4', email='p4@example.com', first_name='P4', last_name='White', password='Pass123!')
        self.p4.profile.is_provider = True
        self.p4.profile.is_online = True
        self.p4.profile.save()
        Talent.objects.create(user=self.p4, category=self.cat_plumbing, title='Apprentice Plumber', description='Assistance', price_per_hour=30, is_active=False)
        UserLocation.objects.create(user=self.p4, latitude=12.9916, longitude=77.5946, city='Bangalore')

    def test_haversine_distance_calculation(self):
        # Bangalore Center (12.9716, 77.5946) to (12.9916, 77.5946) is approx 2.22 km
        dist = calculate_haversine_distance(12.9716, 77.5946, 12.9916, 77.5946)
        self.assertAlmostEqual(dist, 2.22, delta=0.1)

    def test_nearby_discovery_5km_radius(self):
        # Origin: (12.9716, 77.5946) with 5km radius
        # Should return ONLY Provider 1 (within 5km, online, active talent).
        # Provider 2 is > 5km (8.8km). Provider 3 is offline. Provider 4 has inactive talent.
        url = '/api/providers/nearby/?lat=12.9716&lng=77.5946&radius=5'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['provider_id'], self.p1.id)
        self.assertLessEqual(response.data['results'][0]['distance_km'], 5.0)

    def test_nearby_discovery_10km_radius(self):
        # 10km radius should return Provider 1 and Provider 2
        url = '/api/providers/nearby/?lat=12.9716&lng=77.5946&radius=10'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)
        provider_ids = [r['provider_id'] for r in response.data['results']]
        self.assertIn(self.p1.id, provider_ids)
        self.assertIn(self.p2.id, provider_ids)

    def test_nearby_discovery_category_filter(self):
        # Category filter: Electrician (should return 0 because providers are Plumbers)
        url = '/api/providers/nearby/?lat=12.9716&lng=77.5946&radius=10&category=electrician'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 0)
