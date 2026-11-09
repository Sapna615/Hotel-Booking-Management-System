import React, { useState, useEffect } from 'react';
import api from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Layers,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Users,
  DollarSign,
  Sparkles,
} from 'lucide-react';

export default function AdminRoomTypesPage() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: 3000,
    capacity: 2,
    amenities: 'High-speed Wi-Fi, Air Conditioning, Smart TV',
    images: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
  });

  const fetchRoomTypes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rooms/types');
      setRoomTypes(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch room types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const openCreateModal = () => {
    setEditingType(null);
    setFormData({
      name: '',
      description: '',
      basePrice: 3500,
      capacity: 2,
      amenities: 'High-speed Wi-Fi, Air Conditioning, Smart TV, En-suite Bathroom',
      images: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    });
    setModalOpen(true);
    setMessage('');
    setError('');
  };

  const openEditModal = (type) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description,
      basePrice: type.basePrice,
      capacity: type.capacity,
      amenities: type.amenities?.join(', ') || '',
      images: type.images?.[0] || '',
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

    const amenitiesList = formData.amenities
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const imagesList = formData.images
      .split(',')
      .map((img) => img.trim())
      .filter(Boolean);

    const payload = {
      name: formData.name,
      description: formData.description,
      basePrice: Number(formData.basePrice),
      capacity: Number(formData.capacity),
      amenities: amenitiesList,
      images: imagesList,
    };

    try {
      if (editingType) {
        await api.put(`/rooms/types/${editingType._id}`, payload);
        setMessage(`Room category '${payload.name}' updated successfully.`);
      } else {
        await api.post('/rooms/types', payload);
        setMessage(`New room category '${payload.name}' created successfully.`);
      }
      setModalOpen(false);
      fetchRoomTypes();
    } catch (err) {
      setError(err.message || 'Failed to save room type');
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
            Catalog & Tariffs
          </span>
          <h2 className="font-serif text-3xl font-bold text-slate-900 mt-0.5">
            Room Categories & Nightly Rates
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure room types, guest capacities, standard nightly base prices, and amenities
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-slate-900 hover:bg-purple-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Room Category
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

      {/* Categories Cards */}
      {loading ? (
        <div className="py-20">
          <LoadingSpinner text="Loading room categories..." size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roomTypes.map((type) => (
            <div
              key={type._id}
              className="bg-white rounded-3xl overflow-hidden shadow-xs border border-slate-200/80 flex flex-col justify-between"
            >
              <div className="relative h-48 bg-slate-100">
                <img
                  src={type.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'}
                  alt={type.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  Capacity: {type.capacity} {type.capacity === 1 ? 'Guest' : 'Guests'}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900">
                    {type.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {type.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {type.amenities?.slice(0, 4).map((a, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Nightly Base Rate</span>
                    <span className="text-xl font-bold text-slate-900">
                      ₹{type.basePrice?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={() => openEditModal(type)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Rate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                  {editingType ? 'Update Category' : 'New Category'}
                </span>
                <h3 className="font-serif text-2xl font-bold text-slate-900 mt-0.5">
                  {editingType ? editingType.name : 'Create Room Category'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Presidential Penthouse Suite"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nightly Base Price (₹)
                  </label>
                  <input
                    type="number"
                    min={500}
                    required
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Guest Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed architectural and lifestyle description..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="Wi-Fi, AC, Smart TV, Mini Bar, Balcony"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  {saving ? 'Saving...' : editingType ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
