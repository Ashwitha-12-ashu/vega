import React from 'react';
import { Clock, CheckCircle, AlertCircle, Play, CheckCheck, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const normalized = (status || '').toUpperCase();

  const configs = {
    PENDING: { label: 'Pending', className: 'badge-pending', icon: Clock },
    ACCEPTED: { label: 'Accepted', className: 'badge-accepted', icon: CheckCircle },
    IN_PROGRESS: { label: 'In Progress', className: 'badge-in-progress', icon: Play },
    COMPLETED: { label: 'Completed', className: 'badge-completed', icon: CheckCheck },
    REJECTED: { label: 'Rejected', className: 'badge-rejected', icon: XCircle },
    CANCELLED: { label: 'Cancelled', className: 'badge-cancelled', icon: AlertCircle },
  };

  const current = configs[normalized] || { label: status, className: 'badge-offline', icon: Clock };
  const IconComponent = current.icon;

  return (
    <span className={`badge ${current.className}`}>
      <IconComponent size={13} />
      {current.label}
    </span>
  );
};

export default StatusBadge;
