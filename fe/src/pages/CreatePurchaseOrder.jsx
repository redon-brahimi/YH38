import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@/components/Button.jsx';
import Input from '@/components/Input.jsx';

const LOW_STOCK_THRESHOLD = 5;

const CreatePurchaseOrder = () => {
  const [orderList, setOrderList] = useState([]);
  const [removedItemIds, setRemovedItemIds] = useState([]);
  const [supplierName, setSupplierName] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [loading, setLoading] = useState(true);
  const { authFetch } = useAuth();
  const navigate = useNavigate();

  const fetchLowStockParts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authFetch(`http://localhost:4000/api/admin/reorders/low-stock?threshold=${LOW_STOCK_THRESHOLD}`);
      const data = await response.json();
      if (data.success) {
        const lowStockParts = data.parts
          .filter(part => !removedItemIds.includes(part.id))
          .map(part => ({
            id: part.id,
            name: part.name || 'Pièce inconnue',
            device_name: part.device_name || 'Appareil inconnu',
            stock_quantity: Number(part.stock_quantity) || 0,
            order_quantity: Math.max(1, LOW_STOCK_THRESHOLD - (Number(part.stock_quantity) || 0)),
            note: '',
          }));
        setOrderList(lowStockParts);
      } else {
        toast.error(data.error || 'Erreur lors de la récupération des pièces en stock faible.');
      }
    } catch (err) {
      toast.error('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  }, [authFetch, removedItemIds]);

  useEffect(() => {
    fetchLowStockParts();
  }, [fetchLowStockParts]);

  const handleOrderQuantityChange = (partId, value) => {
    const quantity = isNaN(parseInt(value, 10)) ? 0 : parseInt(value, 10);
    setOrderList(prev => prev.map(item => item.id === partId ? { ...item, order_quantity: quantity } : item));
  };

  const handleOrderNoteChange = (partId, note) => {
    setOrderList(prev => prev.map(item => item.id === partId ? { ...item, note } : item));
  };

  const handleRemoveOrderItem = (partId) => {
    setRemovedItemIds(prev => [...prev, partId]);
    setOrderList(prev => prev.filter(item => item.id !== partId));
    toast.success('Pièce retirée de la commande.');
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
          unit_price: item.unit_price,
          note: item.note,
        })),
      };
      const response = await authFetch('http://localhost:4000/api/admin/reorders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Commande d\'achat créée avec succès.');
        navigate('/admin/orders');
      } else {
        toast.error(data.error || 'Impossible de créer la commande.');
      }
    } catch (err) {
      toast.error('Erreur de connexion au serveur lors de la création de la commande.');
    } finally {
      setIsSavingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Créer une Commande</h1>
          <p className="text-sm text-neutral-600">
            Les pièces avec un stock inférieur à {LOW_STOCK_THRESHOLD} unités sont listées ci-dessous.
          </p>
        </div>
        <Link to="/admin/orders">
          <Button variant="outline">Annuler</Button>
        </Link>
      </div>

      {loading ? (
        <p>Chargement de la liste de réapprovisionnement...</p>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-3">Fournisseur</h3>
              <Input
                label="Nom du fournisseur"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Ex: Fournisseur ABC"
                required
              />
              <Input
                label="Email du fournisseur (optionnel)"
                type="email"
                value={supplierEmail}
                onChange={(e) => setSupplierEmail(e.target.value)}
                placeholder="contact@fournisseur.com"
              />
              <Input
                label="Téléphone du fournisseur (optionnel)"
                type="text"
                value={supplierPhone}
                onChange={(e) => setSupplierPhone(e.target.value)}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-3">Notes de Commande</h3>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={8}
                className="input-field w-full resize-none"
                placeholder="Saisissez un commentaire ou un contexte pour cette commande..."
              />
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Articles à Commander</h2>
            {orderList.length === 0 ? (
              <p className="text-neutral-600">Aucune pièce en-dessous du seuil de réapprovisionnement.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">Pièce</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">Appareil</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">Stock Actuel</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">Quantité à Commander</th>
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
                            min="1"
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
                          <Button variant="outline" size="small" onClick={() => handleRemoveOrderItem(item.id)}>
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

          <div className="flex justify-end gap-4 mt-8">
            <Link to="/admin/orders">
              <Button variant="outline">Annuler</Button>
            </Link>
            <Button onClick={handleCreatePurchaseOrder} disabled={isSavingOrder || orderList.length === 0}>
              {isSavingOrder ? 'Création en cours...' : 'Créer la Commande'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePurchaseOrder;