import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import toast from 'react-hot-toast';

const TrackRepair = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      setTrackingCode(code);
      handleFindRepair(code);
    }
  }, []);

  const handleFindRepair = async (code = trackingCode) => {
    if (!code.trim()) {
      toast.error('Veuillez saisir un code de suivi');
      return;
    }

    setLoading(true);
    setRepair(null);
    try {
      const response = await fetch(`http://localhost:4000/api/repairs/${code.toUpperCase()}`);
      const data = await response.json();

      if (data.success) {
        setRepair(data.repair);
        toast.success('Réparation trouvée !');
      } else {
        toast.error(data.error || 'Ticket de réparation non trouvé.');
      }
    } catch (error) {
      console.error('Error finding repair:', error);
      toast.error('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-secondary-900">Suivre votre Réparation</h1>
          <p className="mt-2 text-lg text-neutral-600">Entrez votre code de suivi pour voir le statut de votre appareil.</p>
        </div>

        <div className="max-w-lg mx-auto flex items-center gap-2 mb-12">
          <Input
            label="Code de suivi"
            type="text"
            placeholder="YH38-000001"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
            className="flex-grow"
          />
          <Button
            onClick={() => handleFindRepair()}
            disabled={loading}
            className="mt-7"
          >
            {loading ? '...' : 'Suivre'}
          </Button>
        </div>

        {repair && (
          <div className="card max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Détails de la Réparation</h2>
            
            {/* Prominent Status Display */}
            <div className="text-center mb-6">
              <p className="text-sm text-neutral-500 mb-1">Statut Actuel:</p>
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${
                repair.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                repair.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                repair.status === 'fixed' ? 'bg-green-100 text-green-800' :
                'bg-neutral-100 text-neutral-800'
              }`}>
                {repair.status_french}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-neutral-600">Code de suivi:</span>
                <span className="font-mono font-semibold text-primary-700">{repair.tracking_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Client:</span>
                <span className="font-medium">{repair.client.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Appareil:</span>
                <span className="font-medium">{repair.device_type === 'phone' ? '📱' : '💻'} {repair.device_model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Priorité:</span>
                <span className="font-medium capitalize">{repair.priority}</span>
              </div>
              <div className="border-t my-3"></div>
              <div>
                <span className="text-neutral-600 block mb-2">Description du problème:</span>
                <p className="text-sm bg-neutral-50 p-3 rounded-lg border">{repair.issue_description}</p>
              </div>
              <div className="border-t my-3"></div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Créé le:</span>
                <span className="font-medium">{new Date(repair.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Dernière mise à jour:</span>
                <span className="font-medium">{new Date(repair.updated_at).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
            {/* Appointment Details */}
            {repair.appointment && (
              <div className="mt-6 border-t-2 border-dashed pt-6">
                <h3 className="text-lg font-semibold text-secondary-800 mb-3 text-center">Votre Rendez-vous Programmé</h3>
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 text-center space-y-1">
                  <p className="text-lg font-bold text-primary-700">
                    📅 {new Date(repair.appointment.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                  <p className="text-lg font-medium text-primary-600">
                    à {repair.appointment.time.substring(0, 5)}
                  </p>
                  {repair.appointment.notes && (
                    <p className="text-sm text-neutral-600 pt-2 italic">"{repair.appointment.notes}"</p>
                  )}
                </div>
              </div>
            )}
            {/* Conditionally render "Prendre un Rendez-vous" button */}
            {!repair.appointment && (
              <div className="mt-8 text-center">
                <Button onClick={() => window.location.href = `/booking?code=${repair.tracking_code}`}>
                  Prendre un Rendez-vous
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
  );
};

export default TrackRepair;