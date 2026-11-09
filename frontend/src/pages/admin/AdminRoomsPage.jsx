import React, { useState, useEffect } from 'react';
import api from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import {
  BedDouble,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Filter,
} from 'lucide-react';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomTypeId: '',
    floor: 1,
    status: 'available',
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, typesRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/rooms/types'),
      ]);
      setRooms(roomsRes.data || []);
      setRoomTypes(typesRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingRoom(null);
    setFormData({
      roomNumber: '',
      roomTypeId: roomTypes[0]?._id || '',
      floor: 1,
      status: 'available',
      notes: '',
    });
    setModalOpen(true);
    setMessage('');
    setError('');
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      roomTypeId: room.roomTypeId?._id || '',
      floor: room.floor,
      status: room.status,
      notes: room.notes || '',
    });
    setModalOpen(true);
    setMessage('');
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    const payload = {
      roomNumber: formData.roomNumber.toUpperCase(),
      roomTypeId: formData.roomTypeId,
      floor: Number(formData.floor),
      status: formData.status,
      notes: formData.notes,
    };

    try {
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom._id}`, payload);
        setMessage(`Room ${payload.roomNumber} updated successfully.`);
      } else {
        await api.post('/rooms', payload);
        setMessage(`Room ${payload.roomNumber} created in inventory.`);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to save room');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Physical Inventory
          </span>
          <h2 className="font-serif text-3xl font-bold text-slate-900 mt-0.5">
            Individual Rooms Register
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Map individual room numbers to room types, floor wings, and availability states
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-slate-900 hover:bg-purple-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Room Unit
        </button>
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

      {/* Rooms Table */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner text="Retrieving room units..." size="md" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Room No.</th>
                  <th className="py-3.5 px-4">Assigned Category</th>
                  <th className="py-3.5 px-4">Floor</th>
                  <th className="py-3.5 px-4">Capacity</th>
                  <th className="py-3.5 px-4">Nightly Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rooms.map((room) => (
                  <tr key={room._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                      {room.roomNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {room.roomTypeId?.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">Floor {room.floor}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {room.roomTypeId?.capacity} Guests
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{room.roomTypeId?.basePrice?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={room.status} type="room" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEditModal(room)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Room Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                  {editingRoom ? 'Update Room' : 'New Room Unit'}
                </span>
                <h3 className="font-serif text-2xl font-bold text-slate-900 mt-0.5">
                  {editingRoom ? `Room ${editingRoom.roomNumber}` : 'Add Room to Inventory'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Room Identifier / Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder="e.g. 101, 201, 301A"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Room Category / Type
                </label>
                <select
                  required
                  value={formData.roomTypeId}
                  onChange={(e) => setFormData({ ...formData, roomTypeId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Category</option>
                  {roomTypes.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} (₹{t.basePrice}/night, Cap: {t.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Floor Level
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    required
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Operational State
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Internal Notes (Optional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Corner unit with extra window"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 py-2.5 bg-slate-900 hover:bg-purple-600 text-white font-bold rounded-xl text-xs transition shadow-md disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingRoom ? 'Update Unit' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
