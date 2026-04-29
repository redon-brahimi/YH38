import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authFetch } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await authFetch('http://localhost:4000/api/admin/appointments');
        const data = await response.json();

        if (data.success) {
          setAppointments(data.appointments);
        } else {
          toast.error(data.error || 'Failed to fetch appointments.');
        }
      } catch (err) {
        toast.error('Server connection error while fetching appointments.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [authFetch]);

  const handleStatusChange = async (repairId, newStatus) => {
    try {
      const response = await authFetch(`http://localhost:4000/api/admin/repairs/${repairId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Statut de la réparation mis à jour.');
        // Update the status in the local state to reflect the change immediately
        setAppointments(prevAppointments =>
          prevAppointments.map(app =>
            app.repair_id === repairId ? { ...app, repair_status: newStatus } : app
          )
        );
      } else {
        toast.error(data.error || 'Failed to update status.');
      }
    } catch (err) {
      toast.error('Server connection error while updating status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-secondary-900 mb-8">Tableau de Bord Administrateur</h1>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/appointments" className="card hover:bg-primary-50">
          <h3 className="font-bold text-lg">Rendez-vous à venir</h3>
          <p className="text-3xl font-extrabold text-primary-600">{appointments.length}</p>
        </Link>
        <Link to="/admin/repairs" className="card hover:bg-primary-50">
          <h3 className="font-bold text-lg">Toutes les réparations</h3>
          <p className="text-neutral-500">Voir et gérer tous les tickets.</p>
        </Link>
        <Link to="/admin/stock" className="card hover:bg-primary-50">
          <h3 className="font-bold text-lg">Gestion de stock</h3>
          <p className="text-neutral-500">Ajouter des appareils et des pièces.</p>
        </Link>
      </div>

      {/* Upcoming Appointments Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-secondary-800 mb-6">Prochains rendez-vous</h2>
        {loading ? (
          <p>Chargement des rendez-vous...</p>
        ) : appointments.length === 0 ? (
          <p className="text-neutral-600">Aucun rendez-vous à venir.</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200/80 overflow-hidden">
            <ul className="divide-y divide-neutral-200">
              {appointments.map(app => (
                <li key={app.id} className="p-4 hover:bg-neutral-50">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="flex-grow">
                      <p className="font-semibold text-primary-700">{app.client_name}</p>
                      <p className="text-sm text-neutral-600">{app.device_type === 'phone' ? '📱' : '💻'} {app.device_model}</p>
                      <p className="text-xs text-neutral-500 mt-1">{app.issue_description.substring(0, 80)}...</p>
                    </div>
                    <div className="mt-3 md:mt-0 md:ml-6 text-left md:text-right">
                      <p className="font-bold text-secondary-800">
                        {new Date(app.appointment_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} à {app.appointment_time.substring(0, 5)}
                      </p>
                      <Link to={`/track?code=YH38-${String(app.repair_id).padStart(6, '0')}`} className="text-sm text-primary-600 hover:underline">
                        Voir la réparation &rarr;
                      </Link>
                      <div className="mt-2">
                        <select
                          value={app.repair_status}
                          onChange={(e) => handleStatusChange(app.repair_id, e.target.value)}
                          className="text-xs rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                          onClick={(e) => e.stopPropagation()} // Prevent link navigation when clicking dropdown
                        >
                          <option value="pending">En attente</option>
                          <option value="in_progress">En cours</option>
                          <option value="fixed">Réparé</option>
                          <option value="ready_for_pickup">Prêt pour récupération</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;