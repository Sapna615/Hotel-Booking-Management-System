import React, { useState, useEffect } from 'react';
import api from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  TrendingUp,
  DollarSign,
  BedDouble,
  Users,
  CalendarCheck,
  Ban,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [occupancyTrend, setOccupancyTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    try {
      const [sumRes, revRes, occRes] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/reports/revenue'),
        api.get('/reports/occupancy'),
      ]);
      setSummary(sumRes.data);
      setRevenueTrend(revRes.data || []);
      setOccupancyTrend(occRes.data?.trend || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Computing real-time analytics & KPIs..." size="lg" />;
  }

  const kpis = summary?.kpis || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Executive Intelligence
          </span>
          <h2 className="font-serif text-3xl font-bold text-slate-900 mt-0.5">
            Performance & Financial Overview
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Reconciled revenue, room occupancy utilization, and transactional health
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Refresh KPIs
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Net Revenue */}
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200/80">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Net Settled Revenue
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                ₹{kpis.netRevenue?.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-3 flex justify-between">
            <span>Gross: ₹{kpis.grossRevenue?.toLocaleString('en-IN')}</span>
            <span className="text-rose-500">Refunds: ₹{kpis.totalRefunds?.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200/80">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Occupancy Rate
              </span>
              <div className="text-2xl font-black text-gold-600 mt-1">
                {kpis.occupancyRate}
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-gold-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-3">
            {kpis.todayOccupiedRooms} of {kpis.totalRooms} rooms occupied today
          </div>
        </div>

        {/* Confirmed Bookings */}
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200/80">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Confirmed Reservations
              </span>
              <div className="text-2xl font-black text-blue-600 mt-1">
                {kpis.confirmedBookings + kpis.activeStays + kpis.completedStays}
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-3">
            {kpis.activeStays} currently active stays
          </div>
        </div>

        {/* Cancellations */}
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200/80">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Cancellations
              </span>
              <div className="text-2xl font-black text-rose-600 mt-1">
                {kpis.cancelledBookings}
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Ban className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-3">
            Occupancies automatically released
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Performance Chart */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-serif text-xl font-bold text-slate-900">
                Revenue Settlements
              </h3>
              <p className="text-[11px] text-slate-400">Monthly gross vs net payment income</p>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              INR (₹)
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            {revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Amount']}
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="grossRevenue" fill="#0f172a" radius={[6, 6, 0, 0]} name="Gross" />
                  <Bar dataKey="netRevenue" fill="#d97706" radius={[6, 6, 0, 0]} name="Net" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Awaiting historical payment cycles to plot monthly trend.
              </div>
            )}
          </div>
        </div>

        {/* Occupancy Trend Chart */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-serif text-xl font-bold text-slate-900">
                Occupancy Rate (%)
              </h3>
              <p className="text-[11px] text-slate-400">Occupied room nights vs physical inventory</p>
            </div>
            <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              Trend
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            {occupancyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={occupancyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Occupancy']}
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="occupancyPercentage"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#8b5cf6' }}
                    activeDot={{ r: 6 }}
                    name="Occupancy %"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No occupied room night data recorded in this range.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
