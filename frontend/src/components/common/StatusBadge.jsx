import React from 'react';

export default function StatusBadge({ status, type = 'booking' }) {
  if (!status) return null;

  const normalized = status.toLowerCase();

  const bookingStyles = {
    'confirmed': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'checked-in': 'bg-blue-100 text-blue-800 border-blue-300',
    'checked-out': 'bg-slate-100 text-slate-700 border-slate-300',
    'pending': 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse',
    'cancelled': 'bg-rose-100 text-rose-800 border-rose-300',
    'expired': 'bg-slate-200 text-slate-600 border-slate-300',
    'failed': 'bg-red-100 text-red-800 border-red-300',
  };

  const roomStyles = {
    'available': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'maintenance': 'bg-amber-100 text-amber-800 border-amber-300',
    'inactive': 'bg-rose-100 text-rose-800 border-rose-300',
  };

  const paymentStyles = {
    'paid': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'success': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'unpaid': 'bg-amber-100 text-amber-800 border-amber-300',
    'refunded': 'bg-purple-100 text-purple-800 border-purple-300',
    'failed': 'bg-rose-100 text-rose-800 border-rose-300',
  };

  let colorStyle = 'bg-slate-100 text-slate-800 border-slate-200';
  if (type === 'room') {
    colorStyle = roomStyles[normalized] || colorStyle;
  } else if (type === 'payment') {
    colorStyle = paymentStyles[normalized] || colorStyle;
  } else {
    colorStyle = bookingStyles[normalized] || colorStyle;
  }

  const label = normalized.replace('-', ' ').toUpperCase();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorStyle}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {label}
    </span>
  );
}
