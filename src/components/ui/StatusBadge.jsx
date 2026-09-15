import React from 'react';

const statusConfig = {
  waiting: {
    label: 'Menunggu',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  calling: {
    label: 'Dipanggil',
    bg: 'bg-blue-100',
    text: 'text-blue-900',
    border: 'border-blue-200',
    dot: 'bg-blue-800 animate-ping',
  },
  serving: {
    label: 'Dilayani',
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  completed: {
    label: 'Selesai',
    bg: 'bg-teal-100',
    text: 'text-teal-800',
    border: 'border-teal-200',
    dot: 'bg-teal-600',
  },
  skipped: {
    label: 'Dilewati',
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
};

const StatusBadge = ({ status, className = '' }) => {
  const config = statusConfig[status?.toLowerCase()] || {
    label: status || 'Unknown',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
