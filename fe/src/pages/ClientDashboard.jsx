import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ClientDashboard = () => {
  const { user, authFetch, isAuthenticated, loading: authLoading } = useAuth();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.type === 'client') {
      const fetchClientRepairs = async () => {
        try {
          setLoading(true);
          const response = await authFetch('http://localhost:4000/api/repairs/client');
          const data = await response.json();

          if (data.success) {
            setRepairs(data.repairs);
          } else {
            setError(data.error || 'Erreur lors de la récupération de vos réparations.');
            toast.error(data.error || 'Impossible de charger vos réparations.');
          }
        } catch (err) {
          console.error('Failed to fetch client repairs:', err);
          setError('Erreur de connexion au serveur. Impossible de charger vos réparations.');
          toast.error('Erreur de connexion au serveur.');
        } finally {
          setLoading(false);
        }
      };
      fetchClientRepairs();
    } else if (!authLoading && (!isAuthenticated || user?.type !== 'client')) {
      // If not authenticated or not a client, redirect or show a message
      setLoading(false);
      setError('Vous devez être connecté en tant que client pour voir ce tableau de bord.');
    }
  }, [isAuthenticated, authLoading, user, authFetch]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-neutral-600">Chargement de vos réparations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-error-600 mb-4">Erreur</h2>
        <p className="text-neutral-600">{error}</p>
        <Link to="/login" className="mt-6 inline-block text-primary-600 hover:text-primary-700">
          Se connecter
        </Link>
      </div>
    );
  }

  if (repairs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">Aucune réparation en cours</h2>
        <p className="text-neutral-600 mb-6">Vous n'avez pas encore de tickets de réparation enregistrés.</p>
        <Link to="/repair" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
          Créer un nouveau ticket de réparation
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-secondary-900 mb-8 text-center">Mes Réparations</h1>
      <div className="space-y-6">
        {repairs.map((repair) => (
          <div key={repair.id} className="card flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex-grow">
              <h3 className="text-xl font-semibold text-primary-700 mb-2">
                {repair.device_type === 'phone' ? '📱 Téléphone' : '💻 Ordinateur'} {repair.device_model}
              </h3>
              <p className="text-neutral-600 text-sm mb-1">Code de suivi: <span className="font-mono font-medium">{repair.tracking_code}</span></p>
              <p className="text-neutral-600 text-sm">Problème: {repair.issue_description.substring(0, 70)}{repair.issue_description.length > 70 ? '...' : ''}</p>
            </div>
            <div className="mt-4 md:mt-0 md:ml-6 text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                repair.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                repair.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                repair.status === 'fixed' ? 'bg-green-100 text-green-800' :
                'bg-neutral-100 text-neutral-800'
              }`}>
                {repair.status_french}
              </span>
              <div className="text-sm text-neutral-500 mt-1">Créé le: {new Date(repair.created_at).toLocaleDateString('fr-FR')}</div>
              <Link to={`/client/track?code=${repair.tracking_code}`} className="mt-3 inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium">
                Voir les détails &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientDashboard;