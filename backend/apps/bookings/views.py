from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.core.exceptions import ValidationError
from .models import Booking, BookingStatus
from django.utils import timezone
from .serializers import (
    BookingSerializer,
    CreateBookingSerializer,
    UpdateBookingStatusSerializer,
    UpdateBookingLocationSerializer,
)
from apps.services.models import Talent
from apps.notifications.models import Notification


class BookingListCreateView(APIView):
    """
    GET /api/bookings/ - List bookings for current user as customer or provider
    POST /api/bookings/ - Create a new booking request with concurrency protection
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        role = request.query_params.get('role', 'all')  # 'customer', 'provider', 'all'
        status_filter = request.query_params.get('status')

        if role == 'customer':
            qs = Booking.objects.filter(customer=request.user)
        elif role == 'provider':
            qs = Booking.objects.filter(provider=request.user)
        else:
            qs = Booking.objects.filter(models.Q(customer=request.user) | models.Q(provider=request.user))

        if status_filter:
            if status_filter == 'COMPLETED':
                qs = qs.filter(status__in=[BookingStatus.COMPLETED, BookingStatus.RATING_PENDING, BookingStatus.CLOSED])
            else:
                qs = qs.filter(status=status_filter)

        qs = qs.select_related('customer', 'provider', 'talent', 'category', 'customer__profile', 'provider__profile')
        serializer = BookingSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CreateBookingSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        talent_id = serializer.validated_data['talent_id']

        with transaction.atomic():
            # Lock talent and provider row to ensure concurrency safety
            try:
                talent = Talent.objects.select_for_update().get(id=talent_id)
            except Talent.DoesNotExist:
                return Response({'error': 'The requested talent/service does not exist.'}, status=status.HTTP_404_NOT_FOUND)

            provider = talent.user

            # 1. Prevent self-booking
            if request.user == provider:
                return Response({'error': 'You cannot book your own service.'}, status=status.HTTP_400_BAD_REQUEST)

            # 2. Check if provider is still a provider and online
            if not hasattr(provider, 'profile') or not provider.profile.is_provider:
                return Response({'error': 'This user is not registered as a service provider.'}, status=status.HTTP_400_BAD_REQUEST)

            if not provider.profile.is_online:
                return Response({'error': 'This provider is currently OFFLINE and not accepting bookings.'}, status=status.HTTP_400_BAD_REQUEST)

            # 3. Check if talent is currently active
            if not talent.is_active:
                return Response({'error': 'This talent is currently inactive or provider changed active service.'}, status=status.HTTP_400_BAD_REQUEST)

            # 4. Check for double booking at exact same date & time with same provider
            scheduled_date = serializer.validated_data['scheduled_date']
            scheduled_time = serializer.validated_data['scheduled_time']
            
            existing_booking = Booking.objects.filter(
                provider=provider,
                scheduled_date=scheduled_date,
                scheduled_time=scheduled_time,
                status__in=[
                    BookingStatus.PENDING,
                    BookingStatus.ACCEPTED,
                    BookingStatus.ON_THE_WAY,
                    BookingStatus.ARRIVED,
                    BookingStatus.IN_PROGRESS
                ]
            ).exists()

            if existing_booking:
                return Response({
                    'error': 'This provider already has a booking scheduled at this specific date and time.'
                }, status=status.HTTP_409_CONFLICT)

            # Initial provider coordinates if available
            p_lat = provider.location.latitude if hasattr(provider, 'location') else None
            p_lng = provider.location.longitude if hasattr(provider, 'location') else None

            # Create Booking
            booking = Booking.objects.create(
                customer=request.user,
                provider=provider,
                talent=talent,
                category=talent.category,
                location_address=serializer.validated_data['location_address'],
                latitude=serializer.validated_data.get('latitude'),
                longitude=serializer.validated_data.get('longitude'),
                provider_latitude=p_lat,
                provider_longitude=p_lng,
                provider_location_updated_at=timezone.now() if p_lat else None,
                scheduled_date=scheduled_date,
                scheduled_time=scheduled_time,
                price=talent.price_per_hour,
                notes=serializer.validated_data.get('notes', ''),
                status=BookingStatus.PENDING
            )

            # In-App Notification for provider
            Notification.objects.create(
                recipient=provider,
                actor=request.user,
                booking=booking,
                title="New Booking Request!",
                message=f"{request.user.full_name} has requested a booking for '{talent.title}' on {scheduled_date} at {scheduled_time}.",
                notification_type='BOOKING_CREATED'
            )

        response_serializer = BookingSerializer(booking, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class BookingDetailView(APIView):
    """
    GET /api/bookings/<id>/ - View booking details
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        booking = get_object_or_404(
            Booking.objects.select_related('customer', 'provider', 'talent', 'category'),
            pk=pk
        )
        if booking.customer != request.user and booking.provider != request.user and not request.user.is_staff:
            return Response({'error': 'You do not have permission to view this booking.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = BookingSerializer(booking, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class BookingStatusUpdateView(APIView):
    """
    PATCH /api/bookings/<id>/status/ - Update status (Accept, Reject, On The Way, Arrived, In Progress, Complete, Close)
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        serializer = UpdateBookingStatusSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        new_status = serializer.validated_data['status']

        with transaction.atomic():
            booking = get_object_or_404(
                Booking.objects.select_for_update().select_related('customer', 'provider', 'talent'),
                pk=pk
            )

            try:
                # If provider completes service, move to RATING_PENDING
                if new_status == BookingStatus.COMPLETED and request.user == booking.provider:
                    target_status = BookingStatus.RATING_PENDING
                else:
                    target_status = new_status

                booking.transition_to(target_status, request.user)
            except ValidationError as e:
                return Response({'error': str(e.message if hasattr(e, 'message') else e)}, status=status.HTTP_400_BAD_REQUEST)

            # Send Notification to other party
            recipient = booking.customer if request.user == booking.provider else booking.provider
            
            status_messages = {
                BookingStatus.ACCEPTED: (
                    "Booking Accepted!",
                    f"Provider {booking.provider.full_name} has ACCEPTED your booking for '{booking.talent.title}'."
                ),
                BookingStatus.ON_THE_WAY: (
                    "Provider On The Way!",
                    f"{booking.provider.full_name} has started the journey and is on the way to your location."
                ),
                BookingStatus.ARRIVED: (
                    "Provider Arrived!",
                    f"{booking.provider.full_name} has arrived at your service location."
                ),
                BookingStatus.REJECTED: (
                    "Booking Declined",
                    f"Provider {booking.provider.full_name} was unable to accept your booking for '{booking.talent.title}'."
                ),
                BookingStatus.CANCELLED: (
                    "Booking Cancelled",
                    f"Booking #{booking.id} for '{booking.talent.title}' was cancelled by {request.user.full_name}."
                ),
                BookingStatus.IN_PROGRESS: (
                    "Service In Progress",
                    f"Provider {booking.provider.full_name} has STARTED the service '{booking.talent.title}'."
                ),
                BookingStatus.RATING_PENDING: (
                    "Service Completed - Review Required",
                    f"Your service '{booking.talent.title}' has been marked as COMPLETED. Please rate and review your experience!"
                ),
                BookingStatus.CLOSED: (
                    "Booking Completed & Closed",
                    f"Booking #{booking.id} is now complete. Thank you for using VEGA!"
                ),
            }

            if target_status in status_messages:
                title, msg = status_messages[target_status]
                Notification.objects.create(
                    recipient=recipient,
                    actor=request.user,
                    booking=booking,
                    title=title,
                    message=msg,
                    notification_type=f'BOOKING_{target_status}'
                )

        response_serializer = BookingSerializer(booking, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class BookingLocationUpdateView(APIView):
    """
    PATCH /api/bookings/<id>/location/ - Provider updates live location while on active booking
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk)

        # Only the provider assigned to this booking can update tracking location
        if booking.provider != request.user:
            return Response({'error': 'Only the assigned provider can update tracking location.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = UpdateBookingLocationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        booking.provider_latitude = serializer.validated_data['latitude']
        booking.provider_longitude = serializer.validated_data['longitude']
        booking.provider_location_updated_at = timezone.now()
        booking.save(update_fields=['provider_latitude', 'provider_longitude', 'provider_location_updated_at', 'updated_at'])

        # Also update provider's general UserLocation if they have one
        if hasattr(request.user, 'location'):
            request.user.location.latitude = booking.provider_latitude
            request.user.location.longitude = booking.provider_longitude
            request.user.location.save(update_fields=['latitude', 'longitude', 'updated_at'])

        response_serializer = BookingSerializer(booking, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class BookingTrackingView(APIView):
    """
    GET /api/bookings/<id>/tracking/ - Get tracking details for customer or provider
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        booking = get_object_or_404(
            Booking.objects.select_related('customer', 'provider', 'talent', 'category', 'customer__profile', 'provider__profile'),
            pk=pk
        )
        if booking.customer != request.user and booking.provider != request.user and not request.user.is_staff:
            return Response({'error': 'You do not have permission to view tracking for this booking.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = BookingSerializer(booking, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
