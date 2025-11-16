import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Edit, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const formatINR = (value) => {
  if (!value) return "₹0";
  return "₹" + Number(value).toLocaleString("en-IN");
};

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
        price: parseFloat(editForm.price) || 0,
        quantity: parseInt(editForm.quantity) || 0,
        stock: parseInt(editForm.stock) || 0,
        type: editForm.type || "generic",
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
      stock: fertilizer.stock || 0,
      description: fertilizer.description,
      type: fertilizer.type || "generic",
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
  <table className="min-w-full table-fixed border-collapse">
    <thead className="bg-gray-50 dark:bg-gray-700">
      <tr>
        <th className="w-1/5 px-6 py-3 text-left">Product</th>
        <th className="w-1/6 px-6 py-3 text-left">Type</th>
        <th className="w-1/6 px-6 py-3 text-left">Price (₹)</th>
        <th className="w-1/6 px-6 py-3 text-left">Quantity (kg/l)</th>
        <th className="w-1/6 px-6 py-3 text-left">Stock</th>
        <th className="w-1/6 px-6 py-3 text-left">Actions</th>
      </tr>
    </thead>

    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {fertilizers.map((fertilizer) => (
        <tr key={fertilizer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
          
          {/* PRODUCT */}
          <td className="px-6 py-4 truncate">
            {editingId === fertilizer.id ? (
              <input
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="border rounded px-2 py-1 text-sm w-full"
              />
            ) : (
              <span className="font-medium text-gray-900 dark:text-white">
                {fertilizer.name}
              </span>
            )}
          </td>

          {/* TYPE */}
          <td className="px-6 py-4">
            {editingId === fertilizer.id ? (
              <div className="flex space-x-2">
                <button
                  type="button"
                  className={`px-3 py-1 rounded-lg text-sm ${
                    editForm.type === "generic"
                      ? "bg-gray-700 text-white"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  onClick={() =>
                    setEditForm((prev) => ({ ...prev, type: "generic" }))
                  }
                >
                  Generic
                </button>

                <button
                  type="button"
                  className={`px-3 py-1 rounded-lg text-sm ${
                    editForm.type === "branded"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  onClick={() =>
                    setEditForm((prev) => ({ ...prev, type: "branded" }))
                  }
                >
                  Branded
                </button>
              </div>
            ) : (
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  fertilizer.type === "branded"
                    ? "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                    : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {fertilizer.type || "generic"}
              </span>
            )}
          </td>

          {/* PRICE */}
          <td className="px-6 py-4">
            {editingId === fertilizer.id ? (
              <input
                type="number"
                value={editForm.price}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, price: e.target.value }))
                }
                className="border rounded px-2 py-1 text-sm w-24"
              />
            ) : (
              <span className="text-gray-900 dark:text-white">
                {formatINR(fertilizer.price)}
              </span>
            )}
          </td>

          {/* QUANTITY */}
          <td className="px-6 py-4">
            {editingId === fertilizer.id ? (
              <input
                type="number"
                value={editForm.quantity}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, quantity: e.target.value }))
                }
                className="border rounded px-2 py-1 text-sm w-20"
              />
            ) : (
              fertilizer.quantity
            )}
          </td>

          {/* STOCK */}
          <td className="px-6 py-4">
            {editingId === fertilizer.id ? (
              <input
                type="number"
                value={editForm.stock}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, stock: e.target.value }))
                }
                className="border rounded px-2 py-1 text-sm w-20"
              />
            ) : (
              fertilizer.stock || 0
            )}
          </td>

          {/* ACTIONS */}
          <td className="px-6 py-4 flex space-x-3">
            {editingId === fertilizer.id ? (
              <>
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
              </>
            ) : (
              <>
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
              </>
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
