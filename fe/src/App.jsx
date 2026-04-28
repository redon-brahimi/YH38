import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import RepairForm from './pages/RepairForm';
import BookingSystem from './pages/BookingSystem';
import ClientSignup from './pages/ClientSignup';
import ClientLogin from './pages/ClientLogin';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<ClientSignup />} />
            <Route path="/login" element={<ClientLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/booking" element={<BookingSystem />} />
            
            {/* Protected Routes */}
            <Route path="/repair" element={<ProtectedRoute><RepairForm /></ProtectedRoute>} />

          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;