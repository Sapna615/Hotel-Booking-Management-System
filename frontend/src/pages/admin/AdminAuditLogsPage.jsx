import React, { useState, useEffect } from 'react';
import api from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ShieldCheck,
  Search,
  Filter,
  Eye,
  X,
  FileCode,
  Clock,
  User,
} from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [error, setError] = useState('');

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (actionFilter) query.set('action', actionFilter);

      const res = await api.get(`/admin/audit-logs?${query.toString()}`);
      setLogs(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch audit trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
          Security & Compliance
        </span>
        <h2 className="font-serif text-3xl font-bold text-slate-900 mt-0.5">
          System Audit Trail Explorer
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Immutable forensic log of all material business events, state transitions, and actor identities
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="">All Business Actions</option>
            <option value="BOOKING_HOLD_CREATED">BOOKING_HOLD_CREATED</option>
            <option value="BOOKING_CONFIRMED">BOOKING_CONFIRMED</option>
            <option value="GUEST_CHECKED_IN">GUEST_CHECKED_IN</option>
            <option value="GUEST_CHECKED_OUT">GUEST_CHECKED_OUT</option>
            <option value="BOOKING_CANCELLED">BOOKING_CANCELLED</option>
            <option value="ROOM_STATUS_CHANGED">ROOM_STATUS_CHANGED</option>
            <option value="USER_ROLE_OR_STATUS_UPDATED">USER_ROLE_OR_STATUS_UPDATED</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Showing latest {logs.length} audit records
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner text="Retrieving forensic logs..." size="md" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No audit records found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Action Event</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Actor Role</th>
                  <th className="py-3.5 px-4">IP Address</th>
                  <th className="py-3.5 px-4 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 font-sans">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-sans">
                      {log.entityType} ({log.entityId?.slice(-6)})
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-sans font-medium">
                      {log.actorName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-sans">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{log.ipAddress}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        title="Inspect Payload"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Payload Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-600 uppercase">
                  {selectedLog.action}
                </span>
                <h3 className="font-serif text-xl font-bold text-slate-900 mt-0.5">
                  Audit Entry Details
                </h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Timestamp:</span>
                <span className="font-mono">{new Date(selectedLog.createdAt).toISOString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Actor:</span>
                <span className="font-semibold">{selectedLog.actorName} ({selectedLog.actorRole})</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Entity:</span>
                <span>{selectedLog.entityType} ID: {selectedLog.entityId}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Event Payload & Metadata
              </span>
              <pre className="p-4 bg-slate-900 text-emerald-400 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-60">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

