import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import toast from 'react-hot-toast';

const TrackRepair = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for tracking code in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      setTrackingCode(code);
      handleTrackRepair(code);
    }
  }, []);

  const handleTrackRepair = async (code = trackingCode) => {
    if (!code.trim()) {
      setError('Veuillez saisir un code de suivi');
      return;
    }

    setLoading(true);
    setError('');
    setRepair(null);

    try {
      const response = await fetch(`http://localhost:4000/api/repairs/${code}`);
      const data = await response.json();

      if (data.success) {
        setRepair(data.repair);
        toast.success('Statut de réparation trouvé');
      } else {
        setError(data.error || 'Ticket non trouvé');
        toast.error('Ticket non trouvé');
      }
    } catch (err) {
      console.error('Error tracking repair:', err);
      setError('Erreur de connexion. Veuillez réessayer.');
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-warning-100 text-warning-800',
      'in_progress': 'bg-primary-100 text-primary-800',
      'fixed': 'bg-success-100 text-success-800',
      'ready_for_pickup': 'bg-success-100 text-success-800'
    };
    return colors[status] || 'bg-neutral-100 text-neutral-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': '⏳',
      'in_progress': '🔧',
      'fixed': '✅',
      'ready_for_pickup': '📦'
    };
    return icons[status] || '❓';
  };

  const getStatusSteps = (currentStatus) => {
    const steps = [
      { key: 'pending', label: 'En attente', desc: 'Ticket créé, en attente de traitement' },
      { key: 'in_progress', label: 'En cours', desc: 'Réparation en cours' },
      { key: 'fixed', label: 'Réparé', desc: 'Réparation terminée' },
      { key: 'ready_for_pickup', label: 'Prêt', desc: 'Prêt pour récupération' }
    ];

    return steps.map(step => ({
      ...step,
      completed: getStepOrder(step.key) <= getStepOrder(currentStatus),
      current: step.key === currentStatus
    }));
  };

  const getStepOrder = (status) => {
    const order = { 'pending': 1, 'in_progress': 2, 'fixed': 3, 'ready_for_pickup': 4 };
    return order[status] || 0;
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Suivre ma Réparation
          </h1>
          <p className="text-xl text-neutral-600">
            Entrez votre code de suivi pour connaître l'état de votre réparation
          </p>
        </div>

        {/* Tracking Form */}
        <div className="card mb-8">
          <div className="max-w-md mx-auto">
            <Input
              label="Code de suivi"
              type="text"
              placeholder="YH38-000001"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
              error={error}
              className="text-center text-lg font-mono"
            />
            <Button
              onClick={() => handleTrackRepair()}
              disabled={loading}
              className="w-full mt-4"
              size="large"
            >
              {loading ? 'Recherche...' : 'Suivre ma Réparation'}
            </Button>
          </div>
        </div>

        {/* Repair Status */}
        {repair && (
          <div className="space-y-8">
            {/* Status Overview */}
            <div className="card">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">{getStatusIcon(repair.status)}</div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                  {repair.status_french}
                </h2>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(repair.status)}`}>
                  {repair.status_french}
                </div>
              </div>

              {/* Progress Steps */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  {getStatusSteps(repair.status).map((step, index) => (
                    <div key={step.key} className="flex items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        step.completed
                          ? 'bg-success-500 text-white'
                          : step.current
                          ? 'bg-primary-500 text-white'
                          : 'bg-neutral-300 text-neutral-600'
                      }`}>
                        {step.completed ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-sm font-bold">{index + 1}</span>
                        )}
                      </div>
                      {index < getStatusSteps(repair.status).length - 1 && (
                        <div className={`w-12 h-1 mx-2 ${
                          step.completed ? 'bg-success-500' : 'bg-neutral-300'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {getStatusSteps(repair.status).map((step) => (
                    <div key={step.key} className={`p-3 rounded-lg text-center ${
                      step.completed
                        ? 'bg-success-50 border border-success-200'
                        : step.current
                        ? 'bg-primary-50 border border-primary-200'
                        : 'bg-neutral-50 border border-neutral-200'
                    }`}>
                      <div className={`font-medium ${
                        step.completed
                          ? 'text-success-800'
                          : step.current
                          ? 'text-primary-800'
                          : 'text-neutral-600'
                      }`}>
                        {step.label}
                      </div>
                      <div className="text-xs text-neutral-600 mt-1">
                        {step.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Repair Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Informations sur l'Appareil</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Type:</span>
                    <span className="font-medium">
                      {repair.device_type === 'phone' ? '📱 Téléphone' : '💻 Ordinateur'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Modèle:</span>
                    <span className="font-medium">{repair.device_model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Priorité:</span>
                    <span className="font-medium capitalize">{repair.priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Date de création:</span>
                    <span className="font-medium">
                      {new Date(repair.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Informations Client</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Nom:</span>
                    <span className="font-medium">{repair.client.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Email:</span>
                    <span className="font-medium">{repair.client.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Téléphone:</span>
                    <span className="font-medium">{repair.client.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Issue Description */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Description du Problème</h3>
              <p className="text-neutral-700 bg-neutral-50 p-4 rounded">
                {repair.issue_description}
              </p>
            </div>

            {/* Appointment Info */}
            {repair.appointment && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Rendez-vous Programmée</h3>
                <div className="bg-primary-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">📅</span>
                    <div>
                      <div className="font-medium">
                        {new Date(repair.appointment.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-sm text-neutral-600">
                        à {new Date(`1970-01-01T${repair.appointment.time}`).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  {repair.appointment.notes && (
                    <div className="mt-3 p-3 bg-white rounded border-l-4 border-primary-500">
                      <div className="text-sm text-neutral-600">Notes:</div>
                      <div className="text-sm">{repair.appointment.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="text-center space-y-4">
              <p className="text-neutral-600">
                Besoin d'aide ou souhaitez modifier votre rendez-vous ?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!repair.appointment && (
                  <Button onClick={() => window.location.href = `/booking?code=${repair.tracking_code}`}>
                    Prendre Rendez-vous
                  </Button>
                )}
                <Button variant="outline" onClick={() => window.location.href = '/contact'}>
                  Nous Contacter
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        {!repair && !loading && (
          <div className="card text-center">
            <h3 className="text-lg font-semibold mb-4">Besoin d'aide ?</h3>
            <p className="text-neutral-600 mb-4">
              Votre code de suivi se trouve sur votre confirmation de ticket.
              Il commence toujours par "YH38-" suivi de 6 chiffres.
            </p>
            <div className="text-sm text-neutral-500">
              Exemple: YH38-000001, YH38-000042, YH38-001234
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TrackRepair;