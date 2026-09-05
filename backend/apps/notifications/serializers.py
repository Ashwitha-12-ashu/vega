from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for in-app notifications."""
    actor_name = serializers.ReadOnlyField(source='actor.full_name')
    actor_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id',
            'recipient',
            'actor',
            'actor_name',
            'actor_avatar',
            'booking',
            'title',
            'message',
            'notification_type',
            'is_read',
            'created_at',
        ]
        read_only_fields = ['id', 'recipient', 'actor', 'booking', 'title', 'message', 'notification_type', 'created_at']

    def get_actor_avatar(self, obj):
        if obj.actor and hasattr(obj.actor, 'profile'):
            return obj.actor.profile.avatar
        return ''
