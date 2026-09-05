from django.urls import path
from .views import (
    CategoryListView,
    TalentListCreateView,
    TalentDetailView,
    TalentActivateView,
    TalentDeactivateView,
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('talents/', TalentListCreateView.as_view(), name='talent-list-create'),
    path('talents/<int:pk>/', TalentDetailView.as_view(), name='talent-detail'),
    path('talents/<int:pk>/activate/', TalentActivateView.as_view(), name='talent-activate'),
    path('talents/<int:pk>/deactivate/', TalentDeactivateView.as_view(), name='talent-deactivate'),
]
