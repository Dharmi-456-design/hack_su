import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LiveDataProvider } from './context/LiveDataContext';
import Layout from './components/common/Layout';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import MachinesPage from './pages/MachinesPage';
import ProductionPage from './pages/ProductionPage';
import InventoryPage from './pages/InventoryPage';
import WorkersPage from './pages/WorkersPage';
import WorkerProfile from './pages/WorkerProfile';
import AlertsPage from './pages/AlertsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import SafetyPage from './pages/SafetyPage';
import MaintenancePage from './pages/MaintenancePage';
import ScheduleMaintenancePage from './pages/ScheduleMaintenancePage';
import ChatbotPage from './pages/ChatbotPage';
import EnergyPage from './pages/EnergyPage';
import CostRevenuePage from './pages/CostRevenuePage';

import AdminPage from './pages/AdminPage'; // Added 

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/welcome" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/welcome" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="machines" element={<MachinesPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="schedule-maintenance/:machineId" element={<ScheduleMaintenancePage />} />
        <Route path="production" element={<ProductionPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="workers" element={<WorkersPage />} />
        <Route path="workers/:id" element={<WorkerProfile />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="safety" element={<SafetyPage />} />
        <Route path="chatbot" element={<ChatbotPage />} />
        <Route path="energy" element={<EnergyPage />} />
        <Route path="cost-revenue" element={<CostRevenuePage />} />

      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LiveDataProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#111E32',
                color: '#C8DCF0',
                border: '1px solid #1E3A5F',
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 500,
              },
            }}
          />
        </BrowserRouter>
      </LiveDataProvider>
    </AuthProvider>
  );
}
