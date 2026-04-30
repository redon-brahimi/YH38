import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Button from '@/components/Button.jsx';
import Input from '@/components/Input.jsx';

const LOW_STOCK_THRESHOLD = 5;

const StockManagement = () => {
  const [parts, setParts] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [removedItemIds, setRemovedItemIds] = useState([]);
  const [supplierName, setSupplierName] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState('all');
  const { authFetch } = useAuth();

  const buildOrderListFromParts = useCallback((currentParts, previousOrderList = []) => {
    return currentParts
      .filter(part => Number(part.stock_quantity) < LOW_STOCK_THRESHOLD && !removedItemIds.includes(part.id))
      .map(part => {
        const existing = previousOrderList.find(item => item.id === part.id);
        return {
          id: part.id,
          name: part.name || 'Pièce inconnue',
          device_name: part.device_name || 'Appareil inconnu',
          stock_quantity: Number(part.stock_quantity) || 0,
          order_quantity: existing?.order_quantity ?? Math.max(1, LOW_STOCK_THRESHOLD - (Number(part.stock_quantity) || 0)),
          note: existing?.note ?? '',
        };
      });
  }, [removedItemIds]);

  const fetchParts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authFetch('http://localhost:4000/api/admin/parts');
      const data = await response.json();
      if (data.success) {
        const loadedParts = data.parts.map(p => ({ ...p, _changeAmount: 0 }));
        setParts(loadedParts);
        setOrderList(prev => buildOrderListFromParts(loadedParts, prev));
      } else {
        const message = data.error || 'Erreur lors de la récupération des pièces.';
        setError(message);
        toast.error(message);
      }
    } catch (err) {
      const message = 'Erreur de connexion au serveur lors de la récupération des pièces.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [authFetch, buildOrderListFromParts]);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  useEffect(() => {
    const saved = localStorage.getItem('stockManagement_removedItems');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRemovedItemIds(parsed);
        } else {
          setRemovedItemIds([]);
        }
      } catch (err) {
        localStorage.removeItem('stockManagement_removedItems');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('stockManagement_removedItems', JSON.stringify(removedItemIds));
  }, [removedItemIds]);

  useEffect(() => {
    setOrderList(prev => buildOrderListFromParts(parts, prev));
  }, [parts, removedItemIds, buildOrderListFromParts]);

  const handleStockUpdate = async (partId, changeAmount) => {
    if (changeAmount === 0) return;

    try {
      const response = await authFetch(`http://localhost:4000/api/admin/parts/${partId}/stock`, {
        method: 'PUT',
        body: JSON.stringify({ quantity_change: changeAmount }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Stock mis à jour.');
        setParts(prevParts =>
          prevParts.map(p =>
            p.id === partId ? { ...p, stock_quantity: data.part.stock_quantity, _changeAmount: 0 } : p
          )
        );
      } else {
        toast.error(data.error || 'Failed to update stock.');
      }
    } catch (err) {
      toast.error('Server connection error while updating stock.');
    }
  };

  const handleEditedQuantityChange = (partId, value) => {
    setParts(prevParts =>
      prevParts.map(p =>
        p.id === partId ? { ...p, _changeAmount: parseInt(value, 10) || 0 } : p
      )
    );
  };

  const handleOrderQuantityChange = (partId, value) => {
    const quantity = isNaN(parseInt(value, 10)) ? 0 : parseInt(value, 10);
    setOrderList(prev => prev.map(item => item.id === partId ? { ...item, order_quantity: quantity } : item));
  };

  const handleOrderNoteChange = (partId, note) => {
    setOrderList(prev => prev.map(item => item.id === partId ? { ...item, note } : item));
  };

  const handleRemoveOrderItem = (partId, partName) => {
    const shouldRemove = window.confirm(
      `Voulez-vous vraiment retirer "${partName}" de la liste de réapprovisionnement ?`
    );
    if (!shouldRemove) return;

    setRemovedItemIds(prev => (prev.includes(partId) ? prev : [...prev, partId]));
    setOrderList(prev => prev.filter(item => item.id !== partId));
    toast.success('Pièce retirée de la liste de réapprovisionnement.');
  };

  const handleCreatePurchaseOrder = async () => {
    if (!supplierName.trim()) {
      toast.error('Veuillez renseigner le nom du fournisseur.');
      return;
    }
    if (!orderList.length) {
      toast.error('Aucune pièce sélectionnée pour la commande.');
      return;
    }

    setIsSavingOrder(true);
    try {
      const payload = {
        supplier_name: supplierName.trim(),
        contact_email: supplierEmail.trim() || null,
        contact_phone: supplierPhone.trim() || null,
        notes: orderNotes.trim() || null,
        items: orderList.map(item => ({
          part_id: item.id,
          quantity: item.order_quantity,
          unit_price: 0,
          note: item.note,
        })),
      };
      const response = await authFetch('http://localhost:4000/api/admin/reorders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.success) {
        setCreatedOrder(data.order);
        setRemovedItemIds(prev => [...prev, ...orderList.map(item => item.id)]);
        setOrderList([]);
        setSupplierName('');
        setSupplierEmail('');
        setSupplierPhone('');
        setOrderNotes('');
        toast.success('Commande d\'achat créée avec succès.');
      } else {
        toast.error(data.error || 'Impossible de créer la commande.');
      }
    } catch (err) {
      toast.error('Erreur de connexion au serveur lors de la création de la commande.');
    } finally {
      setIsSavingOrder(false);
    }
  };

  const downloadOrderListCsv = () => {
    if (!orderList.length) return;

    const headers = ['Nom de la pièce', 'Modèle d\'appareil', 'Stock actuel', 'Quantité à commander', 'Note'];
    const csvRows = [headers.join(',')];

    orderList.forEach(item => {
      const row = [
        `"${item.name}"`,
        `"${item.device_name}"`,
        item.stock_quantity,
        item.order_quantity,
        `"${item.note.replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'liste_reapprovisionnement.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredParts = useMemo(() => {
    return parts.filter(part => {
      const matchesType = deviceTypeFilter === 'all' || part.device_type === deviceTypeFilter;
      const search = searchTerm.trim().toLowerCase();
      const partName = String(part.name || '').toLowerCase();
      const deviceName = String(part.device_name || '').toLowerCase();
      const matchesSearch = search === '' || partName.includes(search) || deviceName.includes(search);
      return matchesType && matchesSearch;
    });
  }, [parts, searchTerm, deviceTypeFilter]);

  if (loading) {
    return <p className="text-center mt-12">Chargement du stock...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Gestion de Stock</h1>
          <p className="text-sm text-neutral-600">Liste des pièces et réapprovisionnement automatique</p>
        </div>
        <div className="flex gap-4">
          <Link to="/admin/devices/new">
            <Button>Ajouter un Appareil</Button>
          </Link>
          <Link to="/admin/parts/new">
            <Button variant="outline">Ajouter une Pièce</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-error-200 bg-error-50 p-4 text-error-700">
          {error}
        </div>
      )}

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

      <div className="card mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-secondary-900">Liste de réapprovisionnement</h2>
              <p className="text-sm text-neutral-600">Les pièces en dessous de {LOW_STOCK_THRESHOLD} unités apparaissent ici automatiquement.</p>
            </div>
            <Button onClick={downloadOrderListCsv} disabled={orderList.length === 0}>
              Télécharger la liste
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <h3 className="text-lg font-semibold text-secondary-900 mb-3">Fournisseur de la commande</h3>
              <Input
                label="Nom du fournisseur"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Ex: Fournisseur ABC"
              />
              <Input
                label="Email du fournisseur"
                type="email"
                value={supplierEmail}
                onChange={(e) => setSupplierEmail(e.target.value)}
                placeholder="contact@fournisseur.com"
              />
              <Input
                label="Téléphone du fournisseur"
                type="text"
                value={supplierPhone}
                onChange={(e) => setSupplierPhone(e.target.value)}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <h3 className="text-lg font-semibold text-secondary-900 mb-3">Notes de la commande</h3>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={6}
                className="input-field w-full resize-none"
                placeholder="Saisissez un commentaire ou un contexte pour cette commande..."
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={handleCreatePurchaseOrder} disabled={isSavingOrder || orderList.length === 0}>
                  {isSavingOrder ? 'Création en cours...' : 'Créer une commande d\'achat'}
                </Button>
                <Button variant="outline" onClick={downloadOrderListCsv} disabled={orderList.length === 0}>
                  Télécharger la liste
                </Button>
              </div>
            </div>
          </div>

          {createdOrder && (
            <div className="rounded-2xl border border-success-200 bg-success-50 p-4 text-success-800">
              <p className="font-semibold">Commande créée :</p>
              <p>Référence : #{createdOrder.id}</p>
              <p>Fournisseur : {createdOrder.supplier_name || 'Sans fournisseur'}</p>
              <p>Articles : {createdOrder.items?.length || 0}</p>
            </div>
          )}

          {orderList.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-neutral-600">
              Aucune pièce en-dessous du seuil de réapprovisionnement.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">Pièce</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">Appareil</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">Stock actuel</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">Quantité à commander</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">Note</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {orderList.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-secondary-900 font-medium">{item.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-neutral-600">{item.device_name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-neutral-900">{item.stock_quantity}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          value={item.order_quantity}
                          onChange={(e) => handleOrderQuantityChange(item.id, e.target.value)}
                          className="input-field w-24"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="text"
                          value={item.note}
                          onChange={(e) => handleOrderNoteChange(item.id, e.target.value)}
                          className="input-field w-full"
                          placeholder="Remarque..."
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Button variant="outline" size="small" onClick={() => handleRemoveOrderItem(item.id, item.name)}>
                          Retirer
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                        <Input
                          type="number"
                          value={part._changeAmount}
                          onChange={(e) => handleEditedQuantityChange(part.id, e.target.value)}
                          className="w-24 text-center"
                          name={`stock-change-input-${part.id}`}
                          placeholder="+/-"
                        />
                        <Button
                          size="small"
                          onClick={() => handleStockUpdate(part.id, part._changeAmount)}
                          disabled={part._changeAmount === 0}
                          aria-label={`Appliquer le changement de stock de ${part._changeAmount} pour ${part.name}`}
                        >
                          Mettre à jour
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
