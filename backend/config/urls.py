"""
URL configuration for VEGA project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Database and application health check.
    Executes 'SELECT 1' and queries user count via Django ORM.
    Never exposes passwords, keys, or secrets.
    """
    from django.db import connection
    from django.contrib.auth import get_user_model
    from rest_framework import status as http_status

    db_status = 'unknown'
    db_vendor = connection.vendor
    orm_accessible = False
    error_msg = None

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            row = cursor.fetchone()
            if row and row[0] == 1:
                db_status = 'connected'

        # Test ORM
        User = get_user_model()
        User.objects.count()
        orm_accessible = True
    except Exception as e:
        db_status = 'disconnected'
        error_msg = str(e)

    is_healthy = (db_status == 'connected' and orm_accessible)
    status_code = http_status.HTTP_200_OK if is_healthy else http_status.HTTP_503_SERVICE_UNAVAILABLE

    return Response({
        'app': 'VEGA Smart Local Service Booking Platform',
        'status': 'healthy' if is_healthy else 'unhealthy',
        'database': {
            'status': db_status,
            'vendor': db_vendor,
            'orm_accessible': orm_accessible,
            **({'error': error_msg} if error_msg else {})
        }
    }, status=status_code)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """API health check and directory index."""
    return Response({
        'app': 'VEGA Smart Local Service Booking Platform',
        'version': '1.0.0',
        'status': 'healthy',
        'endpoints': {
            'health': '/api/health/',
            'auth': '/api/auth/',
            'profile': '/api/profile/',
            'categories': '/api/categories/',
            'talents': '/api/talents/',
            'location': '/api/location/',
            'providers_nearby': '/api/providers/nearby/',
            'bookings': '/api/bookings/',
            'reviews': '/api/reviews/',
            'notifications': '/api/notifications/',
        }
    })


urlpatterns = [
    path('', api_root, name='root'),
    path('health/', health_check, name='health-check-root'),
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api-root'),
    path('api/health/', health_check, name='api-health'),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/profile/', include('apps.profiles.urls')),
    path('api/', include('apps.profiles.urls')),  # for /api/provider/go-online/ and /api/providers/<id>/
    path('api/', include('apps.services.urls')),
    path('api/', include('apps.locations.urls')),
    path('api/', include('apps.bookings.urls')),
    path('api/', include('apps.reviews.urls')),
    path('api/', include('apps.notifications.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
