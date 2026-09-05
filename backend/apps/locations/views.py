from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .models import UserLocation
from .utils import calculate_haversine_distance, get_bounding_box
from .serializers import UserLocationSerializer, NearbyProviderSerializer


class UserLocationView(APIView):
    """
    POST /api/location/ - Update or create current user's location
    GET /api/location/me/ - Retrieve current user's saved location
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            location = request.user.location
            serializer = UserLocationSerializer(location)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserLocation.DoesNotExist:
            return Response({'detail': 'No location saved yet.'}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        location, created = UserLocation.objects.get_or_create(
            user=request.user,
            defaults={
                'latitude': float(request.data.get('latitude', 0.0)),
                'longitude': float(request.data.get('longitude', 0.0)),
            }
        )
        serializer = UserLocationSerializer(location, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NearbyProvidersView(APIView):
    """
    GET /api/providers/nearby/
    Finds and discovers service providers near the given coordinates.
    Enforces all core business rules:
      1. User is a provider (is_provider=True)
      2. Provider is ONLINE (is_online=True)
      3. Provider has an active talent (is_active=True)
      4. Provider has valid location coordinates
      5. Provider matches category/search if requested
      6. Distance is within radius (km)
      7. Provider is not the requesting user (optional / self excluded)
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # 1. Parse Latitude & Longitude
        lat_param = request.query_params.get('lat')
        lng_param = request.query_params.get('lng')

        if not lat_param or not lng_param:
            # Fallback to authenticated user's location if available
            if request.user.is_authenticated and hasattr(request.user, 'location'):
                lat = request.user.location.latitude
                lng = request.user.location.longitude
            else:
                return Response(
                    {'error': 'Latitude (lat) and Longitude (lng) query parameters are required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            try:
                lat = float(lat_param)
                lng = float(lng_param)
            except ValueError:
                return Response({'error': 'Invalid lat or lng format.'}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Parse Radius (default: 5.0 km, supported: 1, 2, 5, 10, 20, or custom)
        try:
            radius_km = float(request.query_params.get('radius', 5.0))
        except ValueError:
            radius_km = 5.0

        category_param = request.query_params.get('category', '').strip()
        search_query = request.query_params.get('search', '').strip()
        min_rating_param = request.query_params.get('min_rating')

        # 3. Bounding box pre-filtering
        bbox = get_bounding_box(lat, lng, radius_km)

        # 4. Query locations of active providers
        locations_qs = UserLocation.objects.select_related(
            'user', 'user__profile'
        ).prefetch_related(
            'user__talents', 'user__talents__category'
        ).filter(
            user__profile__is_provider=True,
            user__profile__is_online=True,
            user__talents__is_active=True,
            latitude__gte=bbox['min_lat'],
            latitude__lte=bbox['max_lat'],
            longitude__gte=bbox['min_lon'],
            longitude__lte=bbox['max_lon'],
        ).distinct()

        # Exclude self if authenticated
        if request.user.is_authenticated:
            locations_qs = locations_qs.exclude(user=request.user)

        # Category Filter
        if category_param:
            locations_qs = locations_qs.filter(
                Q(user__talents__is_active=True) &
                (Q(user__talents__category__slug__iexact=category_param) |
                 Q(user__talents__category__name__icontains=category_param) |
                 Q(user__talents__category_id=category_param if category_param.isdigit() else -1))
            )

        # Search Query Filter
        if search_query:
            locations_qs = locations_qs.filter(
                Q(user__first_name__icontains=search_query) |
                Q(user__last_name__icontains=search_query) |
                Q(user__username__icontains=search_query) |
                Q(user__profile__bio__icontains=search_query) |
                (Q(user__talents__is_active=True) & (
                    Q(user__talents__title__icontains=search_query) |
                    Q(user__talents__description__icontains=search_query) |
                    Q(user__talents__category__name__icontains=search_query)
                ))
            )

        # Rating Filter
        if min_rating_param:
            try:
                min_rating = float(min_rating_param)
                locations_qs = locations_qs.filter(user__profile__average_rating__gte=min_rating)
            except ValueError:
                pass

        # 5. Precise Haversine distance filtering & sorting
        nearby_results = []
        for loc in locations_qs:
            dist = calculate_haversine_distance(lat, lng, loc.latitude, loc.longitude)
            if dist <= radius_km:
                loc.distance_km = dist
                nearby_results.append(loc)

        # Sort by distance ascending, then by average_rating descending
        nearby_results.sort(key=lambda x: (x.distance_km, -float(x.user.profile.average_rating)))

        serializer = NearbyProviderSerializer(nearby_results, many=True, context={'request': request})
        return Response({
            'count': len(nearby_results),
            'radius_km': radius_km,
            'search_center': {'lat': lat, 'lng': lng},
            'results': serializer.data
        }, status=status.HTTP_200_OK)
