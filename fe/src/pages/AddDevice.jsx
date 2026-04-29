import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import toast from 'react-hot-toast';
import Button from '@/components/Button.jsx';
import Input from '@/components/Input.jsx';

const AddDevice = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState('phone');
  const [loading, setLoading] = useState(false);
  const { authFetch } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authFetch('http://localhost:4000/api/admin/devices', {
        method: 'POST',
        body: JSON.stringify({ name, type }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Appareil ajouté avec succès !');
        navigate('/admin/stock');
      } else {
        toast.error(data.error || 'Échec de l\'ajout de l\'appareil.');
      }
    } catch (err) {
      toast.error('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-secondary-900 mb-8">Ajouter un Nouvel Appareil</h1>
      <form onSubmit={handleSubmit} className="card space-y-6">
        <Input
          label="Nom de l'appareil"
          type="text"
          placeholder="Ex: iPhone 14 Pro"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Type d'appareil</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="input-field"
          >
            <option value="phone">Téléphone</option>
            <option value="pc">Ordinateur</option>
          </select>
        </div>
        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Ajout en cours...' : 'Ajouter l\'appareil'}
          </Button>
          <Link to="/admin/stock">
            <Button variant="outline" type="button">
              Annuler
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AddDevice;