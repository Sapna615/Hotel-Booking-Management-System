import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import StaffLayout from './layouts/StaffLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import RoomsPage from './pages/public/RoomsPage';
import RoomDetailPage from './pages/public/RoomDetailPage';
import AvailabilityPage from './pages/public/AvailabilityPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Guest Pages
import BookingFlowPage from './pages/guest/BookingFlowPage';
import PaymentSimulationPage from './pages/guest/PaymentSimulationPage';
import ConfirmationPage from './pages/guest/ConfirmationPage';
import MyBookingsPage from './pages/guest/MyBookingsPage';

// Staff Pages
import StaffDashboardPage from './pages/staff/StaffDashboardPage';
import StaffBookingsPage from './pages/staff/StaffBookingsPage';
import StaffRoomsPage from './pages/staff/StaffRoomsPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminRoomTypesPage from './pages/admin/AdminRoomTypesPage';
import AdminRoomsPage from './pages/admin/AdminRoomsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';

export default function App() {
  return (
    <Routes>
      {/* Public & Guest Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="rooms/:id" element={<RoomDetailPage />} />
        <Route path="availability" element={<AvailabilityPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Guest Protected Routes */}
        <Route
          path="booking/:roomId"
          element={
            <ProtectedRoute allowedRoles={['guest', 'staff', 'admin']}>
              <BookingFlowPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="payment/:bookingId"
          element={
            <ProtectedRoute allowedRoles={['guest', 'staff', 'admin']}>
              <PaymentSimulationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="confirmation/:bookingId"
          element={
            <ProtectedRoute allowedRoles={['guest', 'staff', 'admin']}>
              <ConfirmationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="guest/bookings"
          element={
            <ProtectedRoute allowedRoles={['guest', 'staff', 'admin']}>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Staff Portal Routes */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/staff/dashboard" replace />} />
        <Route path="dashboard" element={<StaffDashboardPage />} />
        <Route path="bookings" element={<StaffBookingsPage />} />
        <Route path="rooms" element={<StaffRoomsPage />} />
      </Route>

      {/* Admin Portal Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="room-types" element={<AdminRoomTypesPage />} />
        <Route path="rooms" element={<AdminRoomsPage />} />
        <Route path="bookings" element={<StaffBookingsPage />} />
        <Route path="reports" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
