import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { MapPin, Phone, Link, Save, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShopProfile() {
  const { currentUser, userData } = useAuth();
  const [shopProfile, setShopProfile] = useState({
    name: '',
    address: '',
    phone: '',
    mapLink: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch shop profile data
  useEffect(() => {
    const fetchShopProfile = async () => {
      if (!currentUser) return;

      try {
        const shopDoc = await getDoc(doc(db, 'shops', currentUser.uid));
        if (shopDoc.exists()) {
          setShopProfile(shopDoc.data());
        } else {
          // Initialize with user data if no shop profile exists
          setShopProfile({
            name: userData?.name || '',
            address: userData?.location || '',
            phone: userData?.phone || '',
            mapLink: ''
          });
        }
      } catch (error) {
        console.error('Error fetching shop profile:', error);
        toast.error('Failed to load shop profile');
      } finally {
        setLoading(false);
      }
    };

    fetchShopProfile();
  }, [currentUser, userData]);

  const handleSave = async () => {
    if (!currentUser) return;

    setSaving(true);
    try {
      // Save to shops collection
      await setDoc(doc(db, 'shops', currentUser.uid), {
        ...shopProfile,
        updatedAt: new Date(),
        ownerId: currentUser.uid,
        ownerName: userData?.name
      });

      // Update all existing fertilizers with new shop details
      const updateFertilizers = async () => {
        const { collection, query, where, getDocs, updateDoc } = await import('firebase/firestore');
        const fertilizersQuery = query(
          collection(db, 'fertilizers'),
          where('shopId', '==', currentUser.uid)
        );

        const snapshot = await getDocs(fertilizersQuery);
        const updatePromises = snapshot.docs.map(docRef =>
          updateDoc(docRef.ref, {
            shopName: shopProfile.name,
            shopAddress: shopProfile.address,
            shopPhone: shopProfile.phone,
            shopMapLink: shopProfile.mapLink
          })
        );

        await Promise.all(updatePromises);
      };

      await updateFertilizers();

      setIsEditing(false);
      toast.success('Shop profile saved successfully!');
    } catch (error) {
      console.error('Error saving shop profile:', error);
      toast.error('Failed to save shop profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setShopProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Shop Profile</h2>
            <p className="text-white/70">Manage your shop information and contact details</p>
          </div>

          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={saving}
            className="flex items-center space-x-2 bg-emerald-500/80 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : isEditing ? (
              <Save size={18} />
            ) : (
              <Edit size={18} />
            )}
            <span>{isEditing ? (saving ? 'Saving...' : 'Save Changes') : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {/* Profile Form */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shop Name */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-white/80 text-sm font-medium">
              <span>Shop Name *</span>
            </label>
            {isEditing ? (
              <input
                type="text"
                value={shopProfile.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300"
                placeholder="Enter your shop name"
              />
            ) : (
              <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white">
                {shopProfile.name || 'Not set'}
              </div>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-white/80 text-sm font-medium">
              <Phone size={16} />
              <span>Phone Number *</span>
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={shopProfile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300"
                placeholder="Enter phone number"
              />
            ) : (
              <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white">
                {shopProfile.phone || 'Not set'}
              </div>
            )}
          </div>

          {/* Address */}
          <div className="lg:col-span-2 space-y-2">
            <label className="flex items-center space-x-2 text-white/80 text-sm font-medium">
              <MapPin size={16} />
              <span>Shop Address *</span>
            </label>
            {isEditing ? (
              <textarea
                value={shopProfile.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 resize-none"
                placeholder="Enter your shop address"
              />
            ) : (
              <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white min-h-[80px]">
                {shopProfile.address || 'Not set'}
              </div>
            )}
          </div>

          {/* Google Maps Link */}
          <div className="lg:col-span-2 space-y-2">
            <label className="flex items-center space-x-2 text-white/80 text-sm font-medium">
              <Link size={16} />
              <span>Google Maps Link</span>
            </label>
            {isEditing ? (
              <input
                type="url"
                value={shopProfile.mapLink}
                onChange={(e) => handleChange('mapLink', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300"
                placeholder="https://maps.google.com/..."
              />
            ) : shopProfile.mapLink ? (
              <a
                href={shopProfile.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-emerald-300 hover:text-emerald-200 transition-colors break-all"
              >
                {shopProfile.mapLink}
              </a>
            ) : (
              <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white/60">
                No map link provided
              </div>
            )}
            <p className="text-white/50 text-xs">
              Add a Google Maps link to help customers find your shop easily
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-white/20">
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 hover:scale-105"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !shopProfile.name || !shopProfile.address || !shopProfile.phone}
              className="px-6 py-3 bg-emerald-500/80 hover:bg-emerald-500 text-white rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}
      </div>

      {/* Information Card */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white/80">
          <div>
            <p className="text-sm mb-2">
              Your shop profile information will be automatically included with all fertilizers you add to the marketplace.
            </p>
            <p className="text-sm">
              Farmers will see your shop details when browsing products and can contact you directly or visit your location.
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span>Update your profile before adding products</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span>Changes apply to existing and new products</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span>Map link helps customers find your location</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
