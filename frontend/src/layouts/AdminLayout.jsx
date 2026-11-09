import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  BedDouble,
  CalendarCheck,
  TrendingUp,
  ShieldCheck,
  Users,
  LogOut,
  Hotel,
  ArrowLeft,
  Menu,
  X,
  Briefcase,
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Executive Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Room Categories', path: '/admin/room-types', icon: Layers },
    { label: 'Rooms Inventory', path: '/admin/rooms', icon: BedDouble },
    { label: 'Master Reservations', path: '/admin/bookings', icon: CalendarCheck },
    { label: 'Reports & Revenue', path: '/admin/reports', icon: TrendingUp },
    { label: 'Audit Trail Logs', path: '/admin/audit-logs', icon: ShieldCheck },
    { label: 'User & Staff Accounts', path: '/admin/users', icon: Users },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 text-white flex flex-col transition-transform transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800`}
      >
        {/* Brand */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Hotel className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold text-white block">GRAND AZURE</span>
              <span className="text-[10px] tracking-widest uppercase text-purple-400 font-semibold block">
                Administrator
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <div className="text-xs uppercase font-bold text-slate-500 tracking-wider px-3 mb-2">
            System Administration
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  active
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-purple-400' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-6">
            <div className="text-xs uppercase font-bold text-slate-500 tracking-wider px-3 mb-2">
              Portals
            </div>
            <Link
              to="/staff/dashboard"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-amber-400 hover:bg-amber-950/30 transition"
            >
              <Briefcase className="w-4 h-4" /> Frontdesk Staff View
            </Link>
            <Link
              to="/"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Guest View (Live Site)
            </Link>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white truncate">{user?.name}</span>
              <span className="text-[10px] text-purple-400 font-bold uppercase">{user?.role}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-800">Admin Control Center</h1>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/api/docs"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              API Swagger Docs ↗
            </a>
            <span className="text-xs text-slate-500 font-medium">
              System Live
            </span>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
