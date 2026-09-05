from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import ServiceCategory, Talent
from .serializers import (
    ServiceCategorySerializer,
    TalentSerializer,
    TalentCreateUpdateSerializer,
)


class CategoryListView(generics.ListAPIView):
    """
    GET /api/categories/
    List all active service categories.
    """
    permission_classes = [permissions.AllowAny]
    queryset = ServiceCategory.objects.filter(is_active=True)
    serializer_class = ServiceCategorySerializer
    pagination_class = None


class TalentListCreateView(APIView):
    """
    GET /api/talents/ - List all talents of the current user
    POST /api/talents/ - Create a new talent for the current user
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        talents = Talent.objects.filter(user=request.user)
        serializer = TalentSerializer(talents, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        if not hasattr(request.user, 'profile') or not request.user.profile.is_provider:
            return Response(
                {'error': 'You must enable provider mode before creating talents.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = TalentCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            # If this is the user's first talent, automatically activate it
            is_first = not Talent.objects.filter(user=request.user).exists()
            talent = serializer.save(user=request.user, is_active=is_first)
            response_serializer = TalentSerializer(talent, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TalentDetailView(APIView):
    """
    GET /api/talents/<id>/
    PATCH /api/talents/<id>/
    DELETE /api/talents/<id>/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        talent = get_object_or_404(Talent, pk=pk)
        # Allow viewing talent if it's the owner or if talent is active and belongs to an online provider
        if talent.user != request.user and not (talent.is_active and talent.user.profile.is_online):
            return Response({'error': 'Talent not accessible.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = TalentSerializer(talent, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        talent = get_object_or_404(Talent, pk=pk, user=request.user)
        serializer = TalentCreateUpdateSerializer(talent, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            updated_serializer = TalentSerializer(talent, context={'request': request})
            return Response(updated_serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        talent = get_object_or_404(Talent, pk=pk, user=request.user)
        was_active = talent.is_active
        talent.delete()
        
        # If the deleted talent was active, provider should be offline unless another is activated
        if was_active and hasattr(request.user, 'profile') and request.user.profile.is_online:
            request.user.profile.is_online = False
            request.user.profile.save(update_fields=['is_online', 'updated_at'])

        return Response({'message': 'Talent deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


class TalentActivateView(APIView):
    """
    POST /api/talents/<id>/activate/
    Atomic activation: Sets this talent as ACTIVE, deactivates all other talents of the user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            talent = Talent.activate_single_talent(pk, request.user)
            serializer = TalentSerializer(talent, context={'request': request})
            return Response({
                'message': f"Talent '{talent.title}' is now ACTIVE. All other talents deactivated.",
                'talent': serializer.data
            }, status=status.HTTP_200_OK)
        except Talent.DoesNotExist:
            return Response({'error': 'Talent not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class TalentDeactivateView(APIView):
    """
    POST /api/talents/<id>/deactivate/
    Deactivates this talent.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            talent = Talent.deactivate_single_talent(pk, request.user)
            serializer = TalentSerializer(talent, context={'request': request})
            return Response({
                'message': f"Talent '{talent.title}' is now INACTIVE.",
                'talent': serializer.data
            }, status=status.HTTP_200_OK)
        except Talent.DoesNotExist:
            return Response({'error': 'Talent not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
