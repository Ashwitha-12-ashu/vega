from django.urls import path
from .views import UserLocationView, NearbyProvidersView

urlpatterns = [
    path('location/', UserLocationView.as_view(), name='user-location'),
    path('location/me/', UserLocationView.as_view(), name='user-location-me'),
    path('providers/nearby/', NearbyProvidersView.as_view(), name='providers-nearby'),
]
