import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Button from '@/components/Button.jsx';
import Input from '@/components/Input.jsx';

const StockManagement = () => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState('all');
  const { authFetch } = useAuth();

  const fetchParts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authFetch('http://localhost:4000/api/admin/parts');
      const data = await response.json();
      if (data.success) {
        setParts(data.parts);
      } else {
        toast.error(data.error || 'Failed to fetch parts.');
      }
    } catch (err) {
      toast.error('Server connection error while fetching parts.');
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  const handleStockUpdate = async (partId, newQuantity) => {
    if (newQuantity < 0) return;

    try {
      const response = await authFetch(`http://localhost:4000/api/admin/parts/${partId}/stock`, {
        method: 'PUT',
        body: JSON.stringify({ stock_quantity: newQuantity }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Stock mis à jour.');
        setParts(prevParts =>
          prevParts.map(p => (p.id === partId ? { ...p, stock_quantity: newQuantity } : p))
        );
      } else {
        toast.error(data.error || 'Failed to update stock.');
      }
    } catch (err) {
      toast.error('Server connection error while updating stock.');
    }
  };

  const filteredParts = useMemo(() => {
    return parts.filter(part => {
      const matchesType = deviceTypeFilter === 'all' || part.device_type === deviceTypeFilter;
      const matchesSearch = searchTerm === '' ||
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.device_name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [parts, searchTerm, deviceTypeFilter]);

  if (loading) {
    return <p className="text-center mt-12">Chargement du stock...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Gestion de Stock</h1>
        <div className="flex gap-4">
          <Link to="/admin/devices/new">
            <Button>Ajouter un Appareil</Button>
          </Link>
          <Link to="/admin/parts/new">
            <Button variant="outline">Ajouter une Pièce</Button>
          </Link>
        </div>
      </div>

      {/* Filters Section */}
      <div className="card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Rechercher une pièce ou un appareil"
            type="text"
            placeholder="Ex: Écran iPhone 12..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Filtrer par type</label>
            <select
              value={deviceTypeFilter}
              onChange={(e) => setDeviceTypeFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">Tous les types</option>
              <option value="phone">Téléphone</option>
              <option value="pc">Ordinateur</option>
            </select>
          </div>
        </div>
      </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200/80 overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">Nom de la pièce</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">Modèle d'appareil</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">Quantité</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredParts.length > 0 ? (
                filteredParts.map(part => {
                const isLowStock = part.stock_quantity < 3;
                return (
                  <tr key={part.id} className={isLowStock ? 'bg-warning-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-secondary-900">{part.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-neutral-600">{part.device_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-lg font-bold ${isLowStock ? 'text-error-600' : 'text-secondary-900'}`}>
                        {isLowStock && <span className="mr-2" aria-hidden="true">⚠️</span>}
                        {part.stock_quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button
                          size="small"
                          variant="outline"
                          onClick={() => handleStockUpdate(part.id, part.stock_quantity - 1)}
                          aria-label={`Diminuer le stock de ${part.name}`}
                          className="min-w-11 min-h-11"
                        >
                          -
                        </Button>
                        <Button
                          size="small"
                          variant="outline"
                          onClick={() => handleStockUpdate(part.id, part.stock_quantity + 1)}
                          aria-label={`Augmenter le stock de ${part.name}`}
                          className="min-w-11 min-h-11"
                        >
                          +
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-neutral-500">
                    Aucune pièce ne correspond à vos critères de recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
    </div>
  );
};

export default StockManagement;