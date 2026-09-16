from django.urls import path
from .views import CreateReviewView, CreateCustomerReviewView, ProviderReviewsListView

urlpatterns = [
    path('reviews/', CreateReviewView.as_view(), name='review-create'),
    path('reviews/customer/', CreateCustomerReviewView.as_view(), name='customer-review-create'),
    path('providers/<int:provider_id>/reviews/', ProviderReviewsListView.as_view(), name='provider-reviews'),
]

