import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import Button from '@/components/Button.jsx';
import Input from '@/components/Input.jsx';
import toast from 'react-hot-toast';

const TrackRepair = () => {
  const { user, authFetch } = useAuth();
  const [trackingCode, setTrackingCode] = useState('');
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({
    status: '',
    estimated_cost: '',
    actual_cost: '',
  });

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
    setIsEditing(false);
    try {
      const response = await fetch(`http://localhost:4000/api/repairs/${code.toUpperCase()}`);
      const data = await response.json();
      if (data.success) {
        setRepair(data.repair);
        setEditableData({
          status: data.repair.status,
          estimated_cost: data.repair.estimated_cost || '',
          actual_cost: data.repair.actual_cost || '',
        });
        toast.success('Réparation trouvée !');
      } else {
        toast.error(data.error || 'Ticket de réparation non trouvé.');
      }
    } catch (error) {
      toast.error('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await authFetch(`http://localhost:4000/api/admin/repairs/${repair.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: editableData.status,
          estimated_cost: editableData.estimated_cost === '' ? null : editableData.estimated_cost,
          actual_cost: editableData.actual_cost === '' ? null : editableData.actual_cost,
        }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Détails de la réparation mis à jour.');
        setIsEditing(false);
        // Update local state to show changes immediately
        setRepair(data.repair);
      } else {
        toast.error(data.error || 'Échec de la mise à jour.');
      }
    } catch (err) {
      toast.error('Erreur de connexion lors de la mise à jour.');
    } finally {
      setLoading(false);
    }
  };

  const renderAdminEditSection = () => (
    <div className="mt-6 border-t-2 border-dashed pt-6">
      <h3 className="text-lg font-semibold text-secondary-800 mb-4">Modifier la Réparation</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700">Statut</label>
          <select name="status" value={editableData.status} onChange={handleInputChange} className="input-field">
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="fixed">Réparé</option>
            <option value="ready_for_pickup">Prêt pour récupération</option>
          </select>
        </div>
        <Input
          label="Coût Estimé (€)"
          name="estimated_cost"
          type="number"
          placeholder="150.00"
          value={editableData.estimated_cost}
          onChange={handleInputChange}
        />
        <Input
          label="Coût Réel (€)"
          name="actual_cost"
          type="number"
          placeholder="145.50"
          value={editableData.actual_cost}
          onChange={handleInputChange}
        />
      </div>
      <div className="flex gap-4 mt-6">
        <Button onClick={handleSave} disabled={loading}>{loading ? 'Sauvegarde...' : 'Sauvegarder'}</Button>
        <Button variant="outline" onClick={() => setIsEditing(false)}>Annuler</Button>
      </div>
    </div>
  );

  const renderRepairDetails = () => (
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
        <span className="text-neutral-600">Coût Estimé:</span>
        <span className="font-medium">{repair.estimated_cost ? `${repair.estimated_cost} €` : 'N/A'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-neutral-600">Coût Réel:</span>
        <span className="font-medium">{repair.actual_cost ? `${repair.actual_cost} €` : 'N/A'}</span>
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
  );

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
        <Button onClick={() => handleFindRepair()} disabled={loading} className="mt-7">
          {loading ? '...' : 'Suivre'}
        </Button>
      </div>

      {repair && (
        <div className="card max-w-2xl mx-auto">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold mb-4">Détails de la Réparation</h2>
            {user?.type === 'admin' && !isEditing && (
              <Button onClick={() => setIsEditing(true)} size="small">Modifier</Button>
            )}
          </div>

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

          {isEditing ? renderAdminEditSection() : renderRepairDetails()}

          {/* Appointment Section */}
          {repair.appointment && !isEditing && (
            <div className="mt-6 border-t-2 border-dashed pt-6">
              <h3 className="text-lg font-semibold text-secondary-800 mb-3 text-center">Rendez-vous Programmé</h3>
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 text-center space-y-1">
                <p className="text-lg font-bold text-primary-700">
                  📅 {new Date(repair.appointment.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <p className="text-lg font-medium text-primary-600">
                  à {repair.appointment.time.substring(0, 5)}
                </p>
              </div>
            </div>
          )}

          {!repair.appointment && !isEditing && (
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