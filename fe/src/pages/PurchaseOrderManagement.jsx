import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import toast from 'react-hot-toast';
import Button from '@/components/Button.jsx';

const statusLabels = {
  draft: 'Brouillon',
  ordered: 'Commandée',
  received: 'Reçue',
  cancelled: 'Annulée',
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  ordered: 'bg-blue-100 text-blue-700',
  received: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const PurchaseOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { authFetch } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, [authFetch]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await authFetch('http://localhost:4000/api/admin/reorders');
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error(data.error || 'Failed to fetch purchase orders.');
      }
    } catch (err) {
      toast.error('Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdating(true);
      const response = await authFetch(`http://localhost:4000/api/admin/reorders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Statut de la commande mis à jour.');
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        toast.error(data.error || 'Failed to update order status.');
      }
    } catch (err) {
      toast.error('Server connection error.');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNextStatus = (currentStatus) => {
    const workflow = {
      draft: 'ordered',
      ordered: 'received',
      received: null,
      cancelled: null,
    };
    return workflow[currentStatus];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Gestion des Commandes</h1>
      </div>

      {loading ? (
        <p className="text-neutral-600">Chargement des commandes...</p>
      ) : orders.length === 0 ? (
        <p className="text-neutral-600">Aucune commande créée.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-secondary-900">
                      Commande #{order.id.toString().padStart(4, '0')}
                    </p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600">{order.supplier_name || 'Fournisseur non spécifié'}</p>
                  <p className="text-xs text-neutral-500">{formatDate(order.created_at)}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <p className="text-lg font-semibold text-secondary-900">
                    {order.total_cost.toFixed(2)} €
                  </p>
                  <p className="text-xs text-neutral-600">
                    {order.item_count || 0} article{order.item_count !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 sticky top-0 bg-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-secondary-900">
                    Commande #{selectedOrder.id.toString().padStart(4, '0')}
                  </h2>
                  <p className="text-sm text-neutral-600 mt-1">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-neutral-400 hover:text-neutral-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[selectedOrder.status]}`}>
                  {statusLabels[selectedOrder.status]}
                </span>
                {getNextStatus(selectedOrder.status) && (
                  <button
                    onClick={() =>
                      handleStatusChange(selectedOrder.id, getNextStatus(selectedOrder.status))
                    }
                    disabled={updating}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-semibold disabled:opacity-50"
                  >
                    {updating ? 'Mise à jour...' : `Marquer comme ${statusLabels[getNextStatus(selectedOrder.status)]}`}
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Supplier Info */}
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-3">Fournisseur</h3>
                <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
                  <p className="font-semibold">{selectedOrder.supplier_name || 'Non spécifié'}</p>
                  {selectedOrder.contact_email && (
                    <p className="text-sm text-neutral-600">Email: {selectedOrder.contact_email}</p>
                  )}
                  {selectedOrder.contact_phone && (
                    <p className="text-sm text-neutral-600">Téléphone: {selectedOrder.contact_phone}</p>
                  )}
                </div>
              </div>

              {/* Order Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-3">Notes</h3>
                  <p className="text-neutral-700 bg-neutral-50 rounded-lg p-4">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-3">Articles</h3>
                <div className="space-y-2">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-neutral-50 rounded-lg p-3">
                        <div className="flex-1">
                          <p className="font-semibold text-secondary-900">{item.part_name}</p>
                          <p className="text-xs text-neutral-600">{item.device_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {item.quantity} × {item.unit_price.toFixed(2)} €
                          </p>
                          <p className="text-xs text-neutral-600">
                            Total: {(item.quantity * item.unit_price).toFixed(2)} €
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-neutral-600">Aucun article.</p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-neutral-200 pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-secondary-900">Montant total</p>
                  <p className="text-2xl font-bold text-primary-600">{selectedOrder.total_cost.toFixed(2)} €</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-neutral-50 border-t border-neutral-200 flex gap-3 justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-lg hover:bg-neutral-300 font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderManagement;
