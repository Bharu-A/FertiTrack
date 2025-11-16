import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AddFertilizerForm from '../components/AddFertilizerForm';
import InventoryManagement from '../components/InventoryManagement';

import ShopProfile from '../components/ShopProfile';
import { Package, Plus, Store } from 'lucide-react';

export default function ShopkeeperDashboard() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [showAddForm, setShowAddForm] = useState(false);
  const { userData } = useAuth();

  if (userData?.role !== 'shopkeeper') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-600 to-green-500 flex items-center justify-center">
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-white/80">Shopkeeper role required to access this dashboard.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'profile', label: 'Shop Profile', icon: Store }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-600 to-green-500 pb-12">
      {/* Header */}
      <div className="backdrop-blur-lg bg-white/10 border-b border-white/20 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Shopkeeper Dashboard
              </h1>
              <p className="text-white/80 mt-1">
                Manage your products, orders, and shop profile
              </p>
            </div>
            {activeTab === 'inventory' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2 bg-emerald-500/80 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl backdrop-blur-sm border border-emerald-300/30 transition-all duration-300 hover:scale-105"
              >
                <Plus size={20} />
                <span>Add Product</span>
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="mt-8">
            <nav className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-2xl p-1 border border-white/20">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex-1 text-center justify-center ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'inventory' && <InventoryManagement />}
        {activeTab === 'profile' && <ShopProfile />}
      </div>

      {/* Add Fertilizer Modal */}
      {showAddForm && (
        <AddFertilizerForm onClose={() => setShowAddForm(false)} />
      )}
    </div>
  );
}