import React, { useState, useEffect } from 'react';
import api from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import {
  LogIn,
  LogOut,
  BedDouble,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

export default function StaffDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/reports/summary');
      setSummary(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load frontdesk dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCheckIn = async (bookingId, roomNumber) => {
    setActionLoading(true);
    setMessage('');
    setError('');

    try {
      await api.patch(`/bookings/${bookingId}/check-in`);
      setMessage(`Guest checked into Room ${roomNumber} successfully.`);
      fetchDashboard();
    } catch (err) {
      setError(err.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async (bookingId, roomNumber) => {
    setActionLoading(true);
    setMessage('');
    setError('');

    try {
      await api.patch(`/bookings/${bookingId}/check-out`);
      setMessage(`Guest checked out from Room ${roomNumber}. Room occupancy released.`);
      fetchDashboard();
    } catch (err) {
      setError(err.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Syncing frontdesk operations register..." size="lg" />;
  }

  const kpis = summary?.kpis || {};
  const arrivals = summary?.todayArrivals || [];
  const departures = summary?.todayDepartures || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-slate-900">
            Operations & Frontdesk Register
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time guest arrivals, active stays, departures, and 1-click status transitions
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Refresh Ledger
        </button>
      </div>

      {/* Alert Messages */}
      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Current Occupancy
              </span>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">
                {kpis.occupancyRate}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-3">
            {kpis.todayOccupiedRooms} of {kpis.totalRooms} rooms occupied today
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Today's Arrivals
              </span>
              <div className="text-3xl font-extrabold text-blue-600 mt-1">
                {arrivals.length}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <LogIn className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-3">
            Expected check-ins scheduled today
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Today's Departures
              </span>
              <div className="text-3xl font-extrabold text-purple-600 mt-1">
                {departures.length}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-3">
            Check-outs scheduled today
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Rooms In Service
              </span>
              <div className="text-3xl font-extrabold text-emerald-600 mt-1">
                {kpis.availableRooms}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BedDouble className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-3">
            {kpis.maintenanceRooms} room(s) under maintenance
          </div>
        </div>
      </div>

      {/* Two Columns: Arrivals vs Departures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Arrivals Column */}
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <LogIn className="w-5 h-5 text-blue-600" />
              <h3 className="font-serif text-xl font-bold text-slate-900">
                Scheduled Arrivals ({arrivals.length})
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Today</span>
          </div>

          {arrivals.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No further arrivals scheduled for today.
            </div>
          ) : (
            <div className="space-y-3">
              {arrivals.map((b) => (
                <div
                  key={b._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{b.guestDetails?.name}</span>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="text-xs text-slate-500">
                      Room <strong className="text-slate-800">{b.roomId?.roomNumber}</strong> ({b.roomTypeId?.name})
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Ref: {b.bookingReference}
                    </div>
                  </div>

                  <div>
                    {b.status === 'confirmed' ? (
                      <button
                        onClick={() => handleCheckIn(b._id, b.roomId?.roomNumber)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Check In
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Checked In
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Departures Column */}
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <LogOut className="w-5 h-5 text-purple-600" />
              <h3 className="font-serif text-xl font-bold text-slate-900">
                Scheduled Departures ({departures.length})
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Today</span>
          </div>

          {departures.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No further departures scheduled for today.
            </div>
          ) : (
            <div className="space-y-3">
              {departures.map((b) => (
                <div
                  key={b._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{b.guestDetails?.name}</span>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="text-xs text-slate-500">
                      Room <strong className="text-slate-800">{b.roomId?.roomNumber}</strong> ({b.roomTypeId?.name})
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Ref: {b.bookingReference}
                    </div>
                  </div>

                  <div>
                    {b.status === 'checked-in' ? (
                      <button
                        onClick={() => handleCheckOut(b._id, b.roomId?.roomNumber)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Check Out
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-slate-500">
                        {b.status === 'checked-out' ? 'Checked Out' : 'Pending Check-in'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

