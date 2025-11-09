import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Edit, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InventoryManagement() {
  const { currentUser } = useAuth();
  const [fertilizers, setFertilizers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'fertilizers'),
      where('shopId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFertilizers(data);
    });

    return unsubscribe;
  }, [currentUser]);

  const handleUpdate = async (id) => {
    try {
      await updateDoc(doc(db, 'fertilizers', id), {
        ...editForm,
        price: parseFloat(editForm.price),
        quantity: parseInt(editForm.quantity)
      });
      setEditingId(null);
      toast.success('Fertilizer updated successfully!');
    } catch (error) {
      toast.error('Error updating fertilizer: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this fertilizer?')) return;
    
    try {
      await deleteDoc(doc(db, 'fertilizers', id));
      toast.success('Fertilizer deleted successfully!');
    } catch (error) {
      toast.error('Error deleting fertilizer: ' + error.message);
    }
  };

  const startEditing = (fertilizer) => {
    setEditingId(fertilizer.id);
    setEditForm({
      name: fertilizer.name,
      price: fertilizer.price,
      quantity: fertilizer.quantity,
      description: fertilizer.description
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Inventory Management</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your fertilizer inventory and stock levels
        </p>
      </div>

      {fertilizers.length === 0 ? (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No fertilizers in your inventory yet.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {fertilizers.map(fertilizer => (
                <tr key={fertilizer.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={fertilizer.imageUrl}
                        alt={fertilizer.name}
                        className="h-10 w-10 rounded object-cover mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {editingId === fertilizer.id ? (
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                              className="border rounded px-2 py-1 text-sm"
                            />
                          ) : (
                            fertilizer.name
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {fertilizer.nutrients?.join(', ')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === fertilizer.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.price}
                        onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                        className="border rounded px-2 py-1 text-sm w-20"
                      />
                    ) : (
                      <div className="text-sm text-gray-900 dark:text-white">
                        ${fertilizer.price}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === fertilizer.id ? (
                      <input
                        type="number"
                        value={editForm.quantity}
                        onChange={(e) => setEditForm(prev => ({ ...prev, quantity: e.target.value }))}
                        className="border rounded px-2 py-1 text-sm w-20"
                      />
                    ) : (
                      <div className="text-sm text-gray-900 dark:text-white">
                        {fertilizer.quantity}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      fertilizer.quantity === 0 
                        ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        : fertilizer.quantity < 10
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                        : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                    }`}>
                      {fertilizer.quantity === 0 ? 'Out of Stock' : fertilizer.quantity < 10 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingId === fertilizer.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdate(fertilizer.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditing(fertilizer)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(fertilizer.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}