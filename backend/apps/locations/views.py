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
        # 1. Parse Latitude & Longitude (Strict GPS coordinates)
        lat_param = request.query_params.get('lat') or request.query_params.get('latitude')
        lng_param = request.query_params.get('lng') or request.query_params.get('longitude')

        try:
            radius_km = float(request.query_params.get('radius', 5.0))
        except ValueError:
            radius_km = 5.0

        if not lat_param or not lng_param:
            # Fallback to authenticated user's saved location if available
            if request.user.is_authenticated and hasattr(request.user, 'location') and request.user.location.latitude is not None:
                lat = float(request.user.location.latitude)
                lng = float(request.user.location.longitude)
            else:
                # Do NOT silently substitute dummy coordinates; signal NO_LOCATION to frontend
                return Response({
                    'count': 0,
                    'radius_km': radius_km,
                    'search_center': None,
                    'diagnostics': {
                        'total_matching_service': 0,
                        'active_matching_service': 0,
                        'within_radius_count': 0,
                        'empty_reason': 'NO_LOCATION'
                    },
                    'results': []
                }, status=status.HTTP_200_OK)
        else:
            try:
                lat = float(lat_param)
                lng = float(lng_param)
                if not (-90.0 <= lat <= 90.0 and -180.0 <= lng <= 180.0):
                    return Response({'error': 'Latitude must be between -90 and 90, Longitude between -180 and 180.'}, status=status.HTTP_400_BAD_REQUEST)
            except ValueError:
                return Response({'error': 'Invalid lat or lng format. Must be floating point coordinates.'}, status=status.HTTP_400_BAD_REQUEST)

        category_param = request.query_params.get('category', '').strip()
        search_query = request.query_params.get('search', '').strip() or request.query_params.get('service', '').strip()
        min_rating_param = request.query_params.get('min_rating')

        # Compute search diagnostics across DB to power informative empty states
        from apps.services.models import Talent, ServiceCategory
        
        service_filter_q = Q()
        if category_param:
            words = [w for w in category_param.replace('&', ' ').replace('-', ' ').split() if len(w) >= 3]
            cat_q = Q(category__slug__iexact=category_param) | Q(category__name__icontains=category_param)
            if category_param.isdigit():
                cat_q |= Q(category_id=int(category_param))
            for word in words:
                cat_q |= Q(category__name__icontains=word) | Q(category__slug__icontains=word)
                if len(word) >= 5:
                    cat_q |= Q(category__name__icontains=word[:5]) | Q(category__slug__icontains=word[:5])
            service_filter_q &= cat_q

        if search_query:
            search_words = [w for w in search_query.replace('&', ' ').replace('-', ' ').split() if len(w) >= 2]
            sq = (
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(category__name__icontains=search_query) |
                Q(user__first_name__icontains=search_query) |
                Q(user__last_name__icontains=search_query)
            )
            for sw in search_words:
                sq |= Q(title__icontains=sw) | Q(category__name__icontains=sw)
                if len(sw) >= 5:
                    sq |= Q(title__icontains=sw[:5]) | Q(category__name__icontains=sw[:5])
            service_filter_q &= sq

        total_matching_service = Talent.objects.filter(service_filter_q).count() if (category_param or search_query) else Talent.objects.count()
        active_matching_service = Talent.objects.filter(
            service_filter_q,
            is_active=True,
            user__profile__is_provider=True,
            user__profile__is_online=True
        ).count() if (category_param or search_query) else Talent.objects.filter(
            is_active=True,
            user__profile__is_provider=True,
            user__profile__is_online=True
        ).count()

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
            words = [w for w in category_param.replace('&', ' ').replace('-', ' ').split() if len(w) >= 3]
            loc_cat_q = Q(user__talents__category__slug__iexact=category_param) | Q(user__talents__category__name__icontains=category_param)
            if category_param.isdigit():
                loc_cat_q |= Q(user__talents__category_id=int(category_param))
            for word in words:
                loc_cat_q |= Q(user__talents__category__name__icontains=word) | Q(user__talents__category__slug__icontains=word)
                if len(word) >= 5:
                    loc_cat_q |= Q(user__talents__category__name__icontains=word[:5]) | Q(user__talents__category__slug__icontains=word[:5])
            locations_qs = locations_qs.filter(Q(user__talents__is_active=True) & loc_cat_q)

        # Search Query Filter
        if search_query:
            search_words = [w for w in search_query.replace('&', ' ').replace('-', ' ').split() if len(w) >= 2]
            loc_sq = (
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
            for sw in search_words:
                loc_sq |= (
                    Q(user__talents__title__icontains=sw) |
                    Q(user__talents__category__name__icontains=sw)
                )
            locations_qs = locations_qs.filter(loc_sq)

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
                loc.distance_km = round(dist, 1)
                nearby_results.append(loc)

        # Sort by distance ascending, then by average_rating descending
        nearby_results.sort(key=lambda x: (x.distance_km, -float(x.user.profile.average_rating)))

        # Determine diagnostic empty state reason
        empty_reason = None
        if len(nearby_results) == 0:
            if (category_param or search_query) and total_matching_service == 0:
                empty_reason = "NO_PROVIDERS_FOR_SERVICE"
            elif (category_param or search_query) and active_matching_service == 0:
                empty_reason = "NO_ACTIVE_PROVIDERS"
            elif active_matching_service > 0:
                empty_reason = "OUTSIDE_RADIUS"
            else:
                empty_reason = "NO_PROVIDERS_NEARBY"

        serializer = NearbyProviderSerializer(nearby_results, many=True, context={'request': request})
        return Response({
            'count': len(nearby_results),
            'radius_km': radius_km,
            'search_center': {'lat': lat, 'lng': lng},
            'diagnostics': {
                'total_matching_service': total_matching_service,
                'active_matching_service': active_matching_service,
                'within_radius_count': len(nearby_results),
                'empty_reason': empty_reason,
            },
            'results': serializer.data
        }, status=status.HTTP_200_OK)
