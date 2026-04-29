import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import toast from 'react-hot-toast';
import Button from '@/components/Button.jsx';
import Input from '@/components/Input.jsx';

const AddPart = () => {
  const [devices, setDevices] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    device_id: '',
    stock_quantity: 0,
  });
  const [loading, setLoading] = useState(false);
  const { authFetch } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await authFetch('http://localhost:4000/api/admin/devices');
        const data = await response.json();
        if (data.success) {
          setDevices(data.devices);
          // Set a default device if available
          if (data.devices.length > 0) {
            setFormData(prev => ({ ...prev, device_id: data.devices[0].id }));
          }
        } else {
          toast.error('Impossible de charger la liste des appareils.');
        }
      } catch (err) {
        toast.error('Erreur de connexion au serveur.');
      }
    };
    fetchDevices();
  }, [authFetch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authFetch('http://localhost:4000/api/admin/parts', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Pièce ajoutée avec succès !');
        navigate('/admin/stock');
      } else {
        toast.error(data.error || 'Échec de l\'ajout de la pièce.');
      }
    } catch (err) {
      toast.error('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12"> {/* Content only, AdminLayout provides overall structure */}
      <h1 className="text-3xl font-bold text-secondary-900 mb-8">Ajouter une Nouvelle Pièce</h1>
      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Appareil Associé</label>
          <select name="device_id" value={formData.device_id} onChange={handleChange} className="input-field">
            {devices.map(device => (
              <option key={device.id} value={device.id}>{device.name}</option>
            ))}
          </select>
        </div>
        <Input
          label="Nom de la pièce"
          type="text"
          name="name"
          placeholder="Ex: Écran, Batterie, Caméra arrière"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <Input
          label="Quantité en Stock (initiale)"
          type="number"
          name="stock_quantity"
          value={formData.stock_quantity}
          onChange={handleChange}
          required
        />
        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Ajout en cours...' : 'Ajouter la pièce'}
          </Button>
          <Link to="/admin/stock">
            <Button variant="outline" type="button">Annuler</Button>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AddPart;