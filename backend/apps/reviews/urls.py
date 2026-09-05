from django.urls import path
from .views import CreateReviewView, ProviderReviewsListView

urlpatterns = [
    path('reviews/', CreateReviewView.as_view(), name='review-create'),
    path('providers/<int:provider_id>/reviews/', ProviderReviewsListView.as_view(), name='provider-reviews'),
]
