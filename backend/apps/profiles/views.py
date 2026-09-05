from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import UserProfile, ProviderCertificate

from .serializers import (
    UserProfileSerializer,
    PublicProviderProfileSerializer,
    ProviderCertificateSerializer,
)


User = get_user_model()


class ProfileView(APIView):
    """
    GET /api/profile/

    Retrieve current user's profile.

    PATCH /api/profile/

    Update current user's profile.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):

        profile, _ = UserProfile.objects.get_or_create(
            user=request.user
        )

        serializer = UserProfileSerializer(
            profile,
            context={'request': request}
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def patch(self, request):

        profile, _ = UserProfile.objects.get_or_create(
            user=request.user
        )

        # Update basic User fields
        user_data = {}

        if 'first_name' in request.data:
            user_data['first_name'] = request.data['first_name']

        if 'last_name' in request.data:
            user_data['last_name'] = request.data['last_name']

        if 'email' in request.data:
            user_data['email'] = request.data['email']

        if user_data:

            for key, value in user_data.items():
                setattr(request.user, key, value)

            request.user.save()

        serializer = UserProfileSerializer(
            profile,
            data=request.data,
            partial=True,
            context={'request': request}
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class EnableProviderView(APIView):
    """
    POST /api/profile/provider/enable/

    Enable or disable provider mode.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):

        profile, _ = UserProfile.objects.get_or_create(
            user=request.user
        )

        enable = request.data.get(
            'enable',
            True
        )

        profile.is_provider = bool(enable)

        if not profile.is_provider:
            profile.is_online = False

        profile.save(
            update_fields=[
                'is_provider',
                'is_online',
                'updated_at'
            ]
        )

        serializer = UserProfileSerializer(
            profile,
            context={'request': request}
        )

        return Response(
            {
                'message': (
                    'Provider mode enabled.'
                    if profile.is_provider
                    else 'Provider mode disabled.'
                ),
                'profile': serializer.data
            },
            status=status.HTTP_200_OK
        )


class ProviderGoOnlineView(APIView):
    """
    POST /api/provider/go-online/

    Provider must:

    1. Have provider mode enabled
    2. Have an active talent
    3. Have a location
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):

        profile, _ = UserProfile.objects.get_or_create(
            user=request.user
        )

        if not profile.is_provider:

            return Response(
                {
                    'error':
                    'You must become a service provider first.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        has_active_talent = request.user.talents.filter(
            is_active=True
        ).exists()

        if not has_active_talent:

            return Response(
                {
                    'error':
                    'You must activate at least one talent before going online.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if (
            not hasattr(request.user, 'location')
            or request.user.location.latitude is None
            or request.user.location.longitude is None
        ):

            return Response(
                {
                    'error':
                    'Please set your service location before going online.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        profile.is_online = True

        profile.save(
            update_fields=[
                'is_online',
                'updated_at'
            ]
        )

        serializer = UserProfileSerializer(
            profile,
            context={'request': request}
        )

        return Response(
            {
                'message':
                'You are now ONLINE and discoverable by nearby customers.',
                'profile': serializer.data
            },
            status=status.HTTP_200_OK
        )


class ProviderGoOfflineView(APIView):
    """
    POST /api/provider/go-offline/
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):

        profile, _ = UserProfile.objects.get_or_create(
            user=request.user
        )

        profile.is_online = False

        profile.save(
            update_fields=[
                'is_online',
                'updated_at'
            ]
        )

        serializer = UserProfileSerializer(
            profile,
            context={'request': request}
        )

        return Response(
            {
                'message':
                'You are now OFFLINE and unavailable for new bookings.',
                'profile': serializer.data
            },
            status=status.HTTP_200_OK
        )


class ProviderCertificateListCreateView(APIView):
    """
    GET /api/profile/certificates/

    List certificates uploaded by the current provider.

    POST /api/profile/certificates/

    Upload a new certificate.
    """

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request):

        certificates = ProviderCertificate.objects.filter(
            provider=request.user
        )

        serializer = ProviderCertificateSerializer(
            certificates,
            many=True,
            context={'request': request}
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def post(self, request):

        profile, _ = UserProfile.objects.get_or_create(
            user=request.user
        )

        if not profile.is_provider:

            return Response(
                {
                    'error':
                    'Enable provider mode before uploading certificates.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ProviderCertificateSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():

            certificate = serializer.save(
                provider=request.user
            )

            return Response(
                ProviderCertificateSerializer(
                    certificate,
                    context={'request': request}
                ).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ProviderCertificateDetailView(APIView):
    """
    DELETE /api/profile/certificates/<id>/

    Delete one certificate belonging to the current provider.
    """

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def delete(self, request, pk):

        certificate = get_object_or_404(
            ProviderCertificate,
            id=pk,
            provider=request.user
        )

        certificate.delete()

        return Response(
            {
                'message':
                'Certificate deleted successfully.'
            },
            status=status.HTTP_204_NO_CONTENT
        )


class PublicProviderProfileView(APIView):
    """
    GET /api/providers/<provider_id>/

    Public provider profile containing:

    - Provider information
    - Rating
    - Reviews
    - Active services
    - Certificates
    """

    permission_classes = [
        permissions.AllowAny
    ]

    def get(self, request, provider_id):

        provider_user = get_object_or_404(
            User,
            id=provider_id
        )

        if (
            not hasattr(provider_user, 'profile')
            or not provider_user.profile.is_provider
        ):

            return Response(
                {
                    'error':
                    'Provider not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = PublicProviderProfileSerializer(
            provider_user.profile,
            context={'request': request}
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )