from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.core.exceptions import ValidationError
from .models import Booking, BookingStatus
from .serializers import BookingSerializer, CreateBookingSerializer, UpdateBookingStatusSerializer
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
                talent = Talent.objects.select_for_update().select_related('user', 'user__profile').get(id=talent_id)
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
                status__in=[BookingStatus.PENDING, BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS]
            ).exists()

            if existing_booking:
                return Response({
                    'error': 'This provider already has a booking scheduled at this specific date and time.'
                }, status=status.HTTP_409_CONFLICT)

            # Create Booking
            booking = Booking.objects.create(
                customer=request.user,
                provider=provider,
                talent=talent,
                category=talent.category,
                location_address=serializer.validated_data['location_address'],
                latitude=serializer.validated_data.get('latitude'),
                longitude=serializer.validated_data.get('longitude'),
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
    PATCH /api/bookings/<id>/status/ - Update status (Accept, Reject, Cancel, Start, Complete)
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
                booking.transition_to(new_status, request.user)
            except ValidationError as e:
                return Response({'error': str(e.message if hasattr(e, 'message') else e)}, status=status.HTTP_400_BAD_REQUEST)

            # Send Notification to other party
            recipient = booking.customer if request.user == booking.provider else booking.provider
            
            status_messages = {
                BookingStatus.ACCEPTED: (
                    "Booking Accepted!",
                    f"Provider {booking.provider.full_name} has ACCEPTED your booking for '{booking.talent.title}'."
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
                BookingStatus.COMPLETED: (
                    "Service Completed!",
                    f"Your service '{booking.talent.title}' has been marked as COMPLETED. Please leave a review!"
                ),
            }

            if new_status in status_messages:
                title, msg = status_messages[new_status]
                Notification.objects.create(
                    recipient=recipient,
                    actor=request.user,
                    booking=booking,
                    title=title,
                    message=msg,
                    notification_type=f'BOOKING_{new_status}'
                )

        response_serializer = BookingSerializer(booking, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_200_OK)
