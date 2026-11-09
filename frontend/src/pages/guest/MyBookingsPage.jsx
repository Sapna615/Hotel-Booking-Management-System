import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import {
  BedDouble,
  Calendar,
  CreditCard,
  Ban,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
} from 'lucide-react';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change of travel schedule');
  const [cancelling, setCancelling] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/my-bookings');
      setBookings(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch your bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openCancelModal = (booking) => {
    setSelectedBooking(booking);
    setCancelReason('Change of travel schedule');
    setCancelModalOpen(true);
    setActionSuccess('');
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setCancelling(true);
    setActionSuccess('');

    try {
      const res = await api.patch(`/bookings/${selectedBooking._id}/cancel`, {
        cancellationReason: cancelReason,
      });

      setCancelModalOpen(false);
      setActionSuccess(
        `Reservation ${selectedBooking.bookingReference} has been cancelled. Simulated refund of ₹${selectedBooking.pricing?.totalAmount?.toLocaleString('en-IN')} processed.`
      );
      fetchBookings();
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'all') return true;
    return b.status === filterStatus;
  });

  return (
    <div className="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
            Guest Portal
          </span>
          <h1 className="font-serif text-3xl font-bold text-slate-900 mt-1">
            My Reservation Portfolio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your current stays, past visits, and manage cancellations
          </p>
        </div>

        <Link
          to="/availability"
          className="px-4 py-2.5 bg-slate-900 hover:bg-gold-500 hover:text-slate-950 text-white font-bold text-xs rounded-xl transition shadow-md"
        >
          Book Another Room
        </Link>
      </div>

      {/* Action Success Alert */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {['all', 'confirmed', 'checked-in', 'checked-out', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
              filterStatus === status
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20">
          <LoadingSpinner text="Retrieving your reservation history..." size="lg" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-xs">
          <BedDouble className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Reservations Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any reservations matching this status filter.
          </p>
          <Link
            to="/rooms"
            className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Explore Available Suites
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const canCancel = ['pending', 'confirmed'].includes(b.status);
            return (
              <div
                key={b._id}
                className="bg-white rounded-2xl p-6 shadow-xs hover:shadow-md transition-all border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Left: Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {b.bookingReference}
                    </span>
                    <StatusBadge status={b.status} />
                    <StatusBadge status={b.paymentStatus} type="payment" />
                  </div>

                  <h3 className="font-serif text-xl font-bold text-slate-900">
                    Room {b.roomId?.roomNumber} — {b.roomTypeId?.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gold-500" />
                      {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>{b.nights} {b.nights === 1 ? 'Night' : 'Nights'}</span>
                    <span>•</span>
                    <span>{b.numberOfGuests} Guests</span>
                  </div>
                </div>

                {/* Right: Price & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto justify-between border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Stay</span>
                    <span className="text-lg font-bold text-slate-900">
                      ₹{b.pricing?.totalAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/confirmation/${b._id}`}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" /> Voucher
                    </Link>

                    {canCancel && (
                      <button
                        onClick={() => openCancelModal(b)}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                      >
                        <Ban className="w-3.5 h-3.5" /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                  Cancel Reservation
                </span>
                <h3 className="font-serif text-2xl font-bold text-slate-900 mt-0.5">
                  Confirm Cancellation
                </h3>
              </div>
              <button
                onClick={() => setCancelModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you wish to cancel reservation{' '}
              <strong className="font-mono text-slate-900">{selectedBooking.bookingReference}</strong> for Room{' '}
              <strong>{selectedBooking.roomId?.roomNumber}</strong>?
            </p>

            {selectedBooking.paymentStatus === 'paid' && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                <strong>Simulated Refund:</strong> A full refund of ₹
                {selectedBooking.pricing?.totalAmount?.toLocaleString('en-IN')} will be credited immediately to your simulated payment record.
              </div>
            )}

            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Change of travel schedule">Change of travel schedule</option>
                  <option value="Booked another property">Booked another property</option>
                  <option value="Flight or transit delay">Flight or transit delay</option>
                  <option value="Personal / Medical reasons">Personal / Medical reasons</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Keep Reservation
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {cancelling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

