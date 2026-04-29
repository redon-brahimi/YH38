import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from '@/components/Layout';
import Home from '@/pages/Home.jsx';
import RepairForm from '@/pages/RepairForm.jsx';
import BookingSystem from '@/pages/BookingSystem.jsx';
import ClientSignup from '@/pages/ClientSignup.jsx';
import ClientLogin from '@/pages/ClientLogin.jsx';
import AdminLogin from '@/pages/AdminLogin.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import AdminSignup from '@/pages/AdminSignup.jsx'; // Import the new AdminSignup page
import ClientDashboard from '@/pages/ClientDashboard.jsx';
import AdminDashboard from '@/pages/AdminDashboard.jsx';
import StockManagement from '@/pages/StockManagement.jsx';
import AddDevice from '@/pages/AddDevice.jsx';
import AddPart from '@/pages/AddPart.jsx';
import { AuthProvider } from '@/context/AuthContext.jsx';
import TrackRepair from '@/pages/TrackRepair.jsx';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout>
          <Toaster position="top-center" reverseOrder={false} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<ClientSignup />} />
            <Route path="/login" element={<ClientLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/signup" element={<AdminSignup />} /> {/* Add the new route */}
            <Route path="/booking" element={<BookingSystem />} />
            <Route path="/track" element={<TrackRepair />} />
            
            {/* Protected Routes */}
            <Route path="/repair" element={<ProtectedRoute><RepairForm /></ProtectedRoute>} />
            <Route path="/client/dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/stock" element={
              <ProtectedRoute adminOnly={true}>
                <StockManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/devices/new" element={
              <ProtectedRoute adminOnly={true}>
                <AddDevice />
              </ProtectedRoute>
            } />
            <Route path="/admin/parts/new" element={
              <ProtectedRoute adminOnly={true}>
                <AddPart />
              </ProtectedRoute>
            } />

          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;