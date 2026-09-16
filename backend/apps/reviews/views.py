from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Review, CustomerReview
from .serializers import ReviewSerializer, CreateReviewSerializer, CreateCustomerReviewSerializer
from apps.bookings.models import Booking, BookingStatus
from apps.notifications.models import Notification

User = get_user_model()


class CreateReviewView(APIView):
    """
    POST /api/reviews/
    Submit a review and rating for a COMPLETED or RATING_PENDING booking.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateReviewSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        booking = serializer.validated_data['booking']

        # 1. Booking must be in completed or rating pending state
        valid_statuses = [BookingStatus.COMPLETED, BookingStatus.RATING_PENDING, BookingStatus.CLOSED]
        if booking.status not in valid_statuses:
            return Response({
                'error': f'Reviews can only be submitted for completed bookings. Current status is {booking.status}.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # 2. Reviewer must be the customer
        if booking.customer != request.user:
            return Response({
                'error': 'Only the customer who booked this service can submit a review.'
            }, status=status.HTTP_403_FORBIDDEN)

        # 3. Check if already reviewed
        if hasattr(booking, 'review'):
            return Response({
                'error': 'A review has already been submitted for this booking.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create Review
        review = Review.objects.create(
            booking=booking,
            customer=request.user,
            provider=booking.provider,
            rating=serializer.validated_data['rating'],
            comment=serializer.validated_data['comment']
        )

        # Notify provider
        Notification.objects.create(
            recipient=booking.provider,
            actor=request.user,
            booking=booking,
            title="New Review Received!",
            message=f"{request.user.full_name} left you a {review.rating}★ review: \"{review.comment[:60]}...\"",
            notification_type='REVIEW_RECEIVED'
        )

        response_serializer = ReviewSerializer(review, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class CreateCustomerReviewView(APIView):
    """
    POST /api/reviews/customer/
    Provider submits optional rating and feedback for customer on a completed booking.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateCustomerReviewSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        booking = serializer.validated_data.get('booking') or serializer.validated_data.get('booking_id')

        valid_statuses = [BookingStatus.COMPLETED, BookingStatus.RATING_PENDING, BookingStatus.CLOSED]
        if booking.status not in valid_statuses:
            return Response({
                'error': f'Feedback can only be submitted for completed services. Current status is {booking.status}.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if booking.provider != request.user:
            return Response({'error': 'Only the assigned provider can review the customer.'}, status=status.HTTP_403_FORBIDDEN)

        if hasattr(booking, 'customer_feedback'):
            return Response({'error': 'Customer feedback has already been submitted for this booking.'}, status=status.HTTP_400_BAD_REQUEST)

        feedback = CustomerReview.objects.create(
            booking=booking,
            provider=request.user,
            customer=booking.customer,
            rating=serializer.validated_data['rating'],
            comment=serializer.validated_data.get('comment', '')
        )

        return Response({
            'message': 'Customer feedback submitted successfully.',
            'feedback': {
                'id': feedback.id,
                'rating': feedback.rating,
                'comment': feedback.comment,
            }
        }, status=status.HTTP_201_CREATED)


class ProviderReviewsListView(generics.ListAPIView):
    """
    GET /api/providers/<id>/reviews/
    List all public reviews received by a provider.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = ReviewSerializer

    def get_queryset(self):
        provider_id = self.kwargs.get('provider_id')
        provider = get_object_or_404(User, id=provider_id)
        return Review.objects.filter(provider=provider).select_related('customer', 'customer__profile', 'booking', 'booking__talent', 'booking__category')
