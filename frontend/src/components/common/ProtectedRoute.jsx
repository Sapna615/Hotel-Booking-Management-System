import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner text="Authenticating session..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-rose-100 text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Restricted</h2>
          <p className="text-slate-600 mb-6 text-sm">
            This area requires <span className="font-semibold uppercase text-rose-600">{allowedRoles.join(' or ')}</span> privileges.
            Your current account role is <span className="font-semibold uppercase text-slate-800">{user.role}</span>.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
