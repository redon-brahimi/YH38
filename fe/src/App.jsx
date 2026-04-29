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
import ClientLayout from '@/components/ClientLayout.jsx'; // Import the new ClientLayout
import AdminLayout from '@/components/AdminLayout.jsx';
import AllRepairs from '@/pages/AllRepairs.jsx';
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

            {/* Client Protected Routes with ClientLayout */}
            <Route path="/client" element={<ProtectedRoute><ClientLayout /></ProtectedRoute>}>
              <Route index element={<ClientDashboard />} /> {/* /client will show ClientDashboard */}
              <Route path="dashboard" element={<ClientDashboard />} />
              <Route path="repair" element={<RepairForm />} />
              <Route path="booking" element={<BookingSystem />} />
              <Route path="track" element={<TrackRepair />} /> {/* Nested TrackRepair for clients */}
              {/* The general /track route remains public, but clients can access it via specific links */}
            </Route>

            {/* Fallback for client-side pages that were previously protected directly */}
            {/* These are now covered by the /client nested routes above */}

            {/* Admin Protected Routes with AdminLayout */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminLayout />
              </ProtectedRoute>
            } />
            {/* Nested Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} /> {/* /admin will show AdminDashboard */}
              <Route path="dashboard" element={<AdminDashboard />} />
              {/* Temporarily pointing to AdminDashboard as "appointments" is not a direct page yet */}
              <Route path="appointments" element={<AdminDashboard />} /> 
              <Route path="repairs" element={<AllRepairs />} />
              <Route path="stock" element={<StockManagement />} />
              <Route path="devices/new" element={<AddDevice />} />
              <Route path="parts/new" element={<AddPart />} />
              <Route path="track" element={<TrackRepair />} /> {/* Nested TrackRepair for admins */}
            </Route>

            {/* Fallback for unhandled admin path (e.g., /admin/appointments without nested route) */}
            {/* <Route path="/admin/*" element={<ProtectedRoute adminOnly={true}><AdminLayout /></ProtectedRoute>} /> */}

          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;