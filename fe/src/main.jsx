import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import RepairForm from './pages/RepairForm.jsx'
import TrackRepair from './pages/TrackRepair.jsx'
import BookingSystem from './pages/BookingSystem.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/repair" element={<RepairForm />} />
        <Route path="/track" element={<TrackRepair />} />
        <Route path="/booking" element={<BookingSystem />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </Router>
  </React.StrictMode>,
)