import React, { useState, useEffect } from 'react';
import api from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Search,
  Filter,
  LogIn,
  LogOut,
  Calendar,
  Eye,
  X,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function StaffBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (statusFilter) query.set('status', statusFilter);

      const res = await api.get(`/bookings?${query.toString()}`);
      setBookings(res.data || []);
    } catch (err) {
      setActionError(err.message || 'Failed to retrieve bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchBookings();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, statusFilter]);

  const handleCheckIn = async (bookingId) => {
    setActionMessage('');
    setActionError('');
    try {
      await api.patch(`/bookings/${bookingId}/check-in`);
      setActionMessage('Guest checked in successfully');
      fetchBookings();
      if (selectedBooking) {
        setSelectedBooking((prev) => ({ ...prev, status: 'checked-in' }));
      }
    } catch (err) {
      setActionError(err.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async (bookingId) => {
    setActionMessage('');
    setActionError('');
    try {
      await api.patch(`/bookings/${bookingId}/check-out`);
      setActionMessage('Guest checked out successfully');
      fetchBookings();
      if (selectedBooking) {
        setSelectedBooking((prev) => ({ ...prev, status: 'checked-out' }));
      }
    } catch (err) {
      setActionError(err.message || 'Check-out failed');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-slate-900">
          Reservations Master Register
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Search and manage all hotel bookings, state transitions, and guest details
        </p>
      </div>

      {/* Notifications */}
      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference, guest name or email..."
            className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked-in">Checked-in</option>
            <option value="checked-out">Checked-out</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending Hold</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner text="Loading reservations..." size="md" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No reservations found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Booking Ref</th>
                  <th className="py-3.5 px-4">Guest</th>
                  <th className="py-3.5 px-4">Room</th>
                  <th className="py-3.5 px-4">Dates</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {b.bookingReference}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{b.guestDetails?.name}</div>
                      <div className="text-[11px] text-slate-400">{b.guestDetails?.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">Room {b.roomId?.roomNumber}</span>
                      <div className="text-[11px] text-slate-500">{b.roomTypeId?.name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>
                        {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-slate-400">{b.nights} nights</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{b.pricing?.totalAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          title="View Details"
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => handleCheckIn(b._id)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[11px] transition flex items-center gap-1"
                          >
                            <LogIn className="w-3 h-3" /> Check-in
                          </button>
                        )}

                        {b.status === 'checked-in' && (
                          <button
                            onClick={() => handleCheckOut(b._id)}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[11px] transition flex items-center gap-1"
                          >
                            <LogOut className="w-3 h-3" /> Check-out
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-slate-400">
                  {selectedBooking.bookingReference}
                </span>
                <h3 className="font-serif text-2xl font-bold text-slate-900 mt-0.5">
                  Reservation Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Current Status:</span>
                <StatusBadge status={selectedBooking.status} />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                <div className="font-bold text-slate-800 text-sm">{selectedBooking.guestDetails?.name}</div>
                <div className="text-slate-600">Email: {selectedBooking.guestDetails?.email}</div>
                <div className="text-slate-600">Phone: {selectedBooking.guestDetails?.phone}</div>
                {selectedBooking.guestDetails?.specialRequests && (
                  <div className="text-slate-500 italic mt-1">
                    Special Request: "{selectedBooking.guestDetails.specialRequests}"
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                <div className="text-slate-600">
                  Room: <strong>Room {selectedBooking.roomId?.roomNumber}</strong> ({selectedBooking.roomTypeId?.name})
                </div>
                <div className="text-slate-600">
                  Stay: {new Date(selectedBooking.checkIn).toLocaleDateString()} → {new Date(selectedBooking.checkOut).toLocaleDateString()} ({selectedBooking.nights} nights)
                </div>
                <div className="text-slate-600">
                  Guests: {selectedBooking.numberOfGuests}
                </div>
                <div className="text-slate-600 font-bold pt-1">
                  Total Bill: ₹{selectedBooking.pricing?.totalAmount?.toLocaleString('en-IN')} (Status: {selectedBooking.paymentStatus})
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Close
              </button>
              {selectedBooking.status === 'confirmed' && (
                <button
                  onClick={() => handleCheckIn(selectedBooking._id)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" /> Check In
                </button>
              )}
              {selectedBooking.status === 'checked-in' && (
                <button
                  onClick={() => handleCheckOut(selectedBooking._id)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" /> Check Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
