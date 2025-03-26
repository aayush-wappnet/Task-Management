import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { AuthState } from '../features/auth/types';
import Dashboard from '../pages/Dashboard';
import TaskForm from '../pages/TaskForm';
import AccessDenied from '../pages/AccessDenied';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AdminDashboard from '../pages/AdminDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactElement; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { accessToken, user } = useSelector((state: RootState) => state.auth as AuthState);

  if (!accessToken) return <Navigate to="/login" />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/access-denied" />;
  return children;
};

// Custom redirect component to handle admin vs regular user redirects
const HomeRedirect: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth as AuthState);
  
  // Redirect admin users to admin dashboard, regular users to regular dashboard
  return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} />;
};

const AppRoutes: React.FC = () => {
  const { accessToken, user } = useSelector((state: RootState) => state.auth as AuthState);
  const isAdmin = user?.role === 'admin';

  return (
    <Routes>
      <Route 
        path="/login" 
        element={accessToken ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={accessToken ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} /> : <Register />} 
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {isAdmin ? <Navigate to="/admin" /> : <Dashboard />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/task-form"
        element={
          <ProtectedRoute>
            <TaskForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/task-form/:id"
        element={
          <ProtectedRoute>
            <TaskForm />
          </ProtectedRoute>
        }
      />
      <Route path="/access-denied" element={<AccessDenied />} />
      <Route path="/" element={<HomeRedirect />} />
    </Routes>
  );
};

export default AppRoutes;