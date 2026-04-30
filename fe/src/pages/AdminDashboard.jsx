import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const statusLabels = {
  pending: 'En attente',
  in_progress: 'En cours',
  fixed: 'Réparé',
  ready_for_pickup: 'Prêt',
};

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [lowStockParts, setLowStockParts] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const { authFetch } = useAuth();

  useEffect(() => {
    const fetchDashboardSummary = async () => {
      try {
        setSummaryLoading(true);
        const response = await authFetch('http://localhost:4000/api/admin/dashboard/summary');
        const data = await response.json();

        if (data.success) {
          setSummary(data.summary);
          setLowStockParts(data.lowStockParts || []);
        } else {
          toast.error(data.error || 'Failed to fetch dashboard summary.');
        }
      } catch (err) {
        toast.error('Server connection error while fetching dashboard summary.');
      } finally {
        setSummaryLoading(false);
      }
    };

    const fetchAppointments = async () => {
      try {
        setAppointmentsLoading(true);
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
        setAppointmentsLoading(false);
      }
    };

    fetchDashboardSummary();
    fetchAppointments();
  }, [authFetch]);

  const handleStatusChange = async (repairId, newStatus) => {
    try {
      const payload = { status: newStatus };
      if (newStatus === 'fixed') {
        toast('Veuillez sélectionner une pièce depuis la page de détails de la réparation pour déduire le stock.', { icon: 'ℹ️' });
      }
      const response = await authFetch(`http://localhost:4000/api/admin/repairs/${repairId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Statut de la réparation mis à jour.');
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

  const statusCounts = summary?.repairsByStatus || {};
  const maxStatusCount = Math.max(...Object.values(statusCounts), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-secondary-900 mb-8">Tableau de Bord Administrateur</h1>

      <div className="grid gap-4 lg:grid-cols-4 mb-10">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Rendez-vous</p>
          <p className="mt-4 text-4xl font-semibold text-secondary-900">{summaryLoading ? '—' : summary?.upcomingAppointments ?? 0}</p>
          <p className="text-sm text-neutral-600 mt-2">Rendez-vous programmés</p>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Réparations ouvertes</p>
          <p className="mt-4 text-4xl font-semibold text-secondary-900">{summaryLoading ? '—' : summary?.openRepairs ?? 0}</p>
          <p className="text-sm text-neutral-600 mt-2">Tickets en attente ou en cours</p>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Stock faible</p>
          <p className="mt-4 text-4xl font-semibold text-secondary-900">{summaryLoading ? '—' : summary?.lowStockParts ?? 0}</p>
          <p className="text-sm text-neutral-600 mt-2">Pièces sous le seuil</p>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Pièces</p>
          <p className="mt-4 text-4xl font-semibold text-secondary-900">{summaryLoading ? '—' : summary?.totalParts ?? 0}</p>
          <p className="text-sm text-neutral-600 mt-2">Parties suivies</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3 mb-10">
        <div className="xl:col-span-2 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-secondary-900">Statut des réparations</h2>
              <p className="text-sm text-neutral-600">Suivez l'état des tickets en temps réel.</p>
            </div>
          </div>
          {summaryLoading ? (
            <p>Chargement des statistiques...</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(statusLabels).map(([key, label]) => {
                const count = statusCounts[key] || 0;
                const width = `${(count / maxStatusCount) * 100}%`;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-sm text-neutral-700 mb-2">
                      <span>{label}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                    <div className="h-3 rounded-full bg-neutral-100 overflow-hidden">
                      <div className="h-full rounded-full bg-primary-600" style={{ width }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-secondary-900">Pièces en stock faible</h2>
            <p className="text-sm text-neutral-600">Top 6 des pièces à réapprovisionner en priorité.</p>
          </div>
          {summaryLoading ? (
            <p>Chargement...</p>
          ) : lowStockParts.length === 0 ? (
            <p className="text-neutral-600">Aucune pièce critique pour le moment.</p>
          ) : (
            <ul className="space-y-3">
              {lowStockParts.map(part => (
                <li key={part.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="font-semibold text-secondary-900">{part.name}</p>
                      <p className="text-sm text-neutral-600">{part.device_name}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${part.critical ? 'bg-error-100 text-error-700' : 'bg-warning-100 text-warning-700'}`}>
                      {part.stock_quantity} en stock
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-secondary-800 mb-6">Prochains rendez-vous</h2>
        {appointmentsLoading ? (
          <p>Chargement des rendez-vous...</p>
        ) : appointments.length === 0 ? (
          <p className="text-neutral-600">Aucun rendez-vous à venir.</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200/80 overflow-hidden">
            <ul className="divide-y divide-neutral-200">
              {appointments.map(app => (
                <li key={app.id} className="p-4 hover:bg-neutral-50">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-primary-700">{app.client_name}</p>
                      <p className="text-sm text-neutral-600">{app.device_type === 'phone' ? '📱' : '💻'} {app.device_model}</p>
                      <p className="text-xs text-neutral-500 mt-1">{app.issue_description.substring(0, 80)}...</p>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-3 text-left md:text-right">
                      <p className="font-bold text-secondary-800">
                        {new Date(app.appointment_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} à {app.appointment_time.substring(0, 5)}
                      </p>
                      <Link to={`/admin/track?code=YH38-${String(app.repair_id).padStart(6, '0')}`} className="text-sm text-primary-600 hover:underline">
                        Voir la réparation →
                      </Link>
                      <div>
                        <select
                          value={app.repair_status}
                          onChange={(e) => handleStatusChange(app.repair_id, e.target.value)}
                          className="text-xs rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                          onClick={(e) => e.stopPropagation()}
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
