import React, { useState, useEffect } from 'react';
import api from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import {
  BedDouble,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Filter,
  X,
  Settings2,
} from 'lucide-react';

export default function StaffRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [statusInput, setStatusInput] = useState('available');
  const [notesInput, setNotesInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rooms');
      setRooms(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openStatusModal = (room) => {
    setSelectedRoom(room);
    setStatusInput(room.status);
    setNotesInput(room.notes || '');
    setMessage('');
    setError('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedRoom) return;

    setSaving(true);
    setMessage('');
    setError('');

    try {
      await api.patch(`/rooms/${selectedRoom._id}/status`, {
        status: statusInput,
        notes: notesInput,
      });

      setMessage(`Room ${selectedRoom.roomNumber} status updated to '${statusInput}'`);
      setSelectedRoom(null);
      fetchRooms();
    } catch (err) {
      setError(err.message || 'Failed to update room status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-slate-900">
          Room Status & Housekeeping Grid
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Monitor real-time room availability, put rooms in maintenance, and log housekeeping notes
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="py-20">
          <LoadingSpinner text="Loading physical room inventory..." size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="bg-white rounded-2xl p-5 shadow-xs hover:shadow-md transition-all border border-slate-200/80 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-black text-slate-900">
                    {room.roomNumber}
                  </span>
                  <StatusBadge status={room.status} type="room" />
                </div>

                <div className="text-xs font-bold text-slate-700 mt-2">
                  {room.roomTypeId?.name}
                </div>
                <div className="text-[11px] text-slate-400">
                  Floor {room.floor} • Capacity: {room.roomTypeId?.capacity} Guests
                </div>

                {room.notes && (
                  <div className="mt-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 flex items-start gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{room.notes}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => openStatusModal(room)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Settings2 className="w-3.5 h-3.5 text-slate-500" /> Change Status
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Edit Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Housekeeping & Operations
                </span>
                <h3 className="font-serif text-2xl font-bold text-slate-900 mt-0.5">
                  Update Room {selectedRoom.roomNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRoom(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Operational Status
                </label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="available">Available (Vacant & Ready)</option>
                  <option value="maintenance">Maintenance (Blocked from search)</option>
                  <option value="inactive">Inactive (Offline)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Housekeeping / Maintenance Notes
                </label>
                <textarea
                  rows={3}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="e.g., Deep cleaning required, HVAC filter check, mini-bar restock..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRoom(null)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition shadow-md disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

