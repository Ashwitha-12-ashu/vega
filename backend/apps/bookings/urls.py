from django.urls import path
from .views import (
    BookingListCreateView,
    BookingDetailView,
    BookingStatusUpdateView,
    BookingLocationUpdateView,
    BookingTrackingView,
)

urlpatterns = [
    path('bookings/', BookingListCreateView.as_view(), name='booking-list-create'),
    path('bookings/<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('bookings/<int:pk>/status/', BookingStatusUpdateView.as_view(), name='booking-status-update'),
    path('bookings/<int:pk>/location/', BookingLocationUpdateView.as_view(), name='booking-location-update'),
    path('bookings/<int:pk>/tracking/', BookingTrackingView.as_view(), name='booking-tracking'),
]

