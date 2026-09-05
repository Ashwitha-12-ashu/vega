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
def api_root(request):
    """API health check and directory index."""
    return Response({
        'app': 'VEGA Smart Local Service Booking Platform',
        'version': '1.0.0',
        'status': 'healthy',
        'endpoints': {
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
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api-root'),
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
