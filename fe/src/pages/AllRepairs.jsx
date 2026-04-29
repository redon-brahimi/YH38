import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const AllRepairs = () => {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authFetch } = useAuth();

  useEffect(() => {
    const fetchAllRepairs = async () => {
      try {
        setLoading(true);
        const response = await authFetch('http://localhost:4000/api/admin/repairs');
        const data = await response.json();

        if (data.success) {
          setRepairs(data.repairs);
        } else {
          setError(data.error || 'Erreur lors de la récupération des réparations.');
          toast.error(data.error || 'Impossible de charger les réparations.');
        }
      } catch (err) {
        console.error('Failed to fetch all repairs:', err);
        setError('Erreur de connexion au serveur. Impossible de charger les réparations.');
        toast.error('Erreur de connexion au serveur.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllRepairs();
  }, [authFetch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-neutral-600">Chargement de toutes les réparations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-error-600 mb-4">Erreur</h2>
        <p className="text-neutral-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"> {/* Content only, AdminLayout provides overall structure */}
      <h1 className="text-3xl font-bold text-secondary-900 mb-8">Toutes les Réparations</h1>

      {repairs.length === 0 ? (
        <p className="text-neutral-600">Aucun ticket de réparation trouvé.</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200/80 overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">Code de Suivi</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">Appareil</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">Statut</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">Priorité</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">Créé le</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {repairs.map(repair => (
                <tr key={repair.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-700">{repair.tracking_code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{repair.client.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {repair.device_type === 'phone' ? '📱' : '💻'} {repair.device_model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      repair.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      repair.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      repair.status === 'fixed' ? 'bg-green-100 text-green-800' :
                      'bg-neutral-100 text-neutral-800'
                    }`}>
                      {repair.status_french}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 capitalize">{repair.priority}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {new Date(repair.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/admin/track?code=${repair.tracking_code}`} className="text-primary-600 hover:text-primary-900">
                      Voir les détails
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllRepairs;