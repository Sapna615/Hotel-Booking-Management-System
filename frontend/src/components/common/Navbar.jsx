import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Hotel,
  Calendar,
  BedDouble,
  User,
  LogOut,
  Shield,
  Briefcase,
  Menu,
  X,
  Compass,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 to-gold-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center group-hover:bg-transparent transition-colors">
                <Hotel className="w-6 h-6 text-gold-400 group-hover:text-white transition-colors" />
              </div>
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white block leading-tight">
                GRAND AZURE
              </span>
              <span className="text-[10px] tracking-widest uppercase text-gold-400 font-semibold block">
                Hotel & Suites
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/') ? 'text-gold-400 bg-slate-800/80' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/rooms"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/rooms') ? 'text-gold-400 bg-slate-800/80' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Rooms & Suites
            </Link>
            <Link
              to="/availability"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                isActive('/availability') ? 'text-gold-400 bg-slate-800/80' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Calendar className="w-4 h-4 text-gold-400" />
              Check Dates
            </Link>

            {/* Role-Specific Portal Links */}
            {isAuthenticated && user?.role === 'guest' && (
              <Link
                to="/guest/bookings"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  isActive('/guest/bookings') ? 'text-gold-400 bg-slate-800/80' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <BedDouble className="w-4 h-4 text-emerald-400" />
                My Bookings
              </Link>
            )}

            {isAuthenticated && (user?.role === 'staff' || user?.role === 'admin') && (
              <Link
                to="/staff/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/staff') ? 'text-amber-400 bg-slate-800/80' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Briefcase className="w-4 h-4 text-amber-400" />
                Staff Desk
              </Link>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin') ? 'text-purple-400 bg-slate-800/80' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-400" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* User Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-white">{user.name}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400">
                    Role: {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700/80 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-gold-400 hover:from-amber-300 hover:to-gold-300 rounded-lg shadow-md transition transform active:scale-95"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            Home
          </Link>
          <Link
            to="/rooms"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            Rooms & Suites
          </Link>
          <Link
            to="/availability"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            Check Availability
          </Link>
          {isAuthenticated && user?.role === 'guest' && (
            <Link
              to="/guest/bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gold-400 hover:bg-slate-800"
            >
              My Bookings
            </Link>
          )}
          {isAuthenticated && (user?.role === 'staff' || user?.role === 'admin') && (
            <Link
              to="/staff/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-amber-400 hover:bg-slate-800"
            >
              Staff Desk
            </Link>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-purple-400 hover:bg-slate-800"
            >
              Admin Dashboard
            </Link>
          )}
          <div className="pt-4 border-t border-slate-800">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">{user.name}</div>
                  <div className="text-xs text-gold-400 uppercase font-bold">{user.role}</div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 bg-rose-900/40 text-rose-300 rounded text-xs font-semibold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 bg-slate-800 text-white rounded-lg font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 bg-gold-500 text-slate-950 font-semibold rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

