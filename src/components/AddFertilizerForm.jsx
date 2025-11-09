import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddFertilizerForm({ onClose }) {
  const { currentUser, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    nutrients: [],
    suitableCrops: [],
    suitableSoil: []
  });
  const [image, setImage] = useState(null);

  // In your AddFertilizerForm component, modify the submit handler to include shop details:
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Fetch shop profile first
    const shopDoc = await getDoc(doc(db, 'shops', currentUser.uid));
    const shopData = shopDoc.exists() ? shopDoc.data() : {};

    let imageUrl = '';
    if (image) {
      const storage = getStorage();
      const imageRef = ref(storage, `fertilizers/${currentUser.uid}/${Date.now()}_${image.name}`);
      const snapshot = await uploadBytes(imageRef, image);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    await addDoc(collection(db, 'fertilizers'), {
      ...formData,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      nutrients: formData.nutrients.split(',').map(n => n.trim()),
      suitableCrops: formData.suitableCrops.split(',').map(c => c.trim()),
      suitableSoil: formData.suitableSoil.split(',').map(s => s.trim()),
      imageUrl,
      shopId: currentUser.uid,
      // Include shop details automatically
      shopName: shopData.name || userData.name,
      shopAddress: shopData.address || '',
      shopPhone: shopData.phone || '',
      shopMapLink: shopData.mapLink || '',
      createdAt: new Date()
    });

    toast.success('Fertilizer added successfully!');
    onClose();
  } catch (error) {
    toast.error('Error adding fertilizer: ' + error.message);
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Add New Fertilizer</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Price ($)</label>
              <input
                type="number"
                name="price"
                step="0.01"
                required
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <input
                type="number"
                name="quantity"
                required
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nutrients (comma separated)</label>
              <input
                type="text"
                name="nutrients"
                placeholder="N, P, K, Mg"
                value={formData.nutrients}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Suitable Crops</label>
              <input
                type="text"
                name="suitableCrops"
                placeholder="wheat, rice, corn"
                value={formData.suitableCrops}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Suitable Soil</label>
              <input
                type="text"
                name="suitableSoil"
                placeholder="clay, sandy, loamy"
                value={formData.suitableSoil}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Fertilizer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}