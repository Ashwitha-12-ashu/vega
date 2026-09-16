import React from 'react';
import { Clock, CheckCircle, AlertCircle, Play, CheckCheck, XCircle, Navigation, MapPin, Star } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const normalized = (status || '').toUpperCase();

  const configs = {
    PENDING: { label: 'Requested', className: 'badge-pending', icon: Clock },
    ACCEPTED: { label: 'Accepted', className: 'badge-accepted', icon: CheckCircle },
    ON_THE_WAY: { label: 'On The Way', className: 'badge-pending', icon: Navigation },
    ARRIVED: { label: 'Arrived at Location', className: 'badge-accepted', icon: MapPin },
    IN_PROGRESS: { label: 'In Progress', className: 'badge-in-progress', icon: Play },
    RATING_PENDING: { label: 'Rating Pending', className: 'badge-pending', icon: Star },
    COMPLETED: { label: 'Completed', className: 'badge-completed', icon: CheckCheck },
    CLOSED: { label: 'Completed & Reviewed', className: 'badge-completed', icon: CheckCircle },
    REJECTED: { label: 'Rejected', className: 'badge-rejected', icon: XCircle },
    CANCELLED: { label: 'Cancelled', className: 'badge-cancelled', icon: AlertCircle },
  };

  const current = configs[normalized] || { label: status, className: 'badge-offline', icon: Clock };
  const IconComponent = current.icon;

  return (
    <span className={`badge ${current.className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      <IconComponent size={13} />
      {current.label}
    </span>
  );
};

export default StatusBadge;
