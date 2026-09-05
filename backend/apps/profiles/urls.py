from django.urls import path

from .views import (
    ProfileView,
    EnableProviderView,
    ProviderGoOnlineView,
    ProviderGoOfflineView,
    PublicProviderProfileView,
    ProviderCertificateListCreateView,
    ProviderCertificateDetailView,
)


urlpatterns = [

    # =========================
    # CURRENT USER PROFILE
    # =========================

    path(
        '',
        ProfileView.as_view(),
        name='profile-detail'
    ),


    # =========================
    # PROVIDER MODE
    # =========================

    path(
        'provider/enable/',
        EnableProviderView.as_view(),
        name='profile-provider-enable'
    ),

    path(
        'provider/go-online/',
        ProviderGoOnlineView.as_view(),
        name='provider-go-online'
    ),

    path(
        'provider/go-offline/',
        ProviderGoOfflineView.as_view(),
        name='provider-go-offline'
    ),


    # =========================
    # PROVIDER CERTIFICATES
    # =========================

    path(
        'certificates/',
        ProviderCertificateListCreateView.as_view(),
        name='provider-certificates'
    ),

    path(
        'certificates/<int:pk>/',
        ProviderCertificateDetailView.as_view(),
        name='provider-certificate-detail'
    ),


    # =========================
    # PUBLIC PROVIDER PROFILE
    # =========================

    path(
        'providers/<int:provider_id>/',
        PublicProviderProfileView.as_view(),
        name='provider-public-profile'
    ),
]