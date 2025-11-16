import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import  useFertilizers  from '../hooks/useFertilizers';
import  FertilizerCard  from '../components/FertilizerCard';
import ChatBox from '../components/ChatBox';
import { 
  Search, Filter, Target, TrendingUp, MessageCircle, Bell,
  Wheat, Sprout, Shield, TrendingUp as Growth, Bug, Leaf, Tag, DollarSign,
  Star, ArrowUpDown, X
} from 'lucide-react';

export default function FarmerDashboard() {
  const [filters, setFilters] = useState({
    cropType: '',
    purpose: '',
    category: '',
    brandType: '',
    minPrice: '',
    maxPrice: '',
    sortBy: ''
  });
  const [showChat, setShowChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('browse');
  const [showFilters, setShowFilters] = useState(false);
  
  const { userData } = useAuth();
  const { fertilizers, loading } = useFertilizers(filters);



  // Filter options configuration
  const filterOptions = {
    crops: [
      { value: 'rice', label: 'Rice', icon: Wheat },
      { value: 'wheat', label: 'Wheat', icon: Wheat },
      { value: 'corn', label: 'Corn', icon: Sprout },
      { value: 'cotton', label: 'Cotton', icon: Leaf },
      { value: 'vegetables', label: 'Vegetables', icon: Sprout },
      { value: 'fruits', label: 'Fruits', icon: Leaf }
    ],
    purposes: [
      { value: 'high-yield', label: 'High Yield', icon: TrendingUp },
      { value: 'soil-health', label: 'Soil Health', icon: Leaf },
      { value: 'pest-control', label: 'Pest Control', icon: Bug },
      { value: 'growth-booster', label: 'Growth Booster', icon: Growth },
      { value: 'disease-resistance', label: 'Disease Resistance', icon: Shield }
    ],
    categories: [
      { value: 'fertilizers', label: 'Fertilizers', icon: Sprout },
      { value: 'pesticides', label: 'Pesticides', icon: Shield },
      { value: 'herbicides', label: 'Herbicides', icon: Leaf },
      { value: 'organic', label: 'Organic', icon: Leaf },
      { value: 'bio-products', label: 'Bio Products', icon: Sprout }
    ],
    brandTypes: [
      { value: 'branded', label: 'Branded', icon: Tag },
      { value: 'non-branded', label: 'Non-Branded', icon: Tag }
    ],
    sortOptions: [
      { value: 'price-low-high', label: 'Price: Low to High', icon: DollarSign },
      { value: 'price-high-low', label: 'Price: High to Low', icon: DollarSign },
      { value: 'rating', label: 'Highest Rating', icon: Star },
      { value: 'popular', label: 'Most Popular', icon: TrendingUp }
    ]
  };

  // Enhanced Search + Filter Logic
  const normalize = (text) => (text || '').toString().toLowerCase().trim();

  const filteredFertilizers = fertilizers
    .map(fertilizer => {
      // Calculate relevance score for search term
      let relevanceScore = 0;
      
      if (searchTerm) {
        const search = normalize(searchTerm);
        const nameMatch = normalize(fertilizer.name).includes(search);
        const shopMatch = normalize(fertilizer.shopName).includes(search);
        const nutrientMatch = fertilizer.nutrients?.some(n => normalize(n).includes(search));
        const cropMatch = fertilizer.suitableCrops?.some(c => normalize(c).includes(search));
        const soilMatch = fertilizer.suitableSoil?.some(s => normalize(s).includes(search));
        const descriptionMatch = fertilizer.description ? normalize(fertilizer.description).includes(search) : false;

        // Weighted relevance scoring
        relevanceScore =
          (nameMatch ? 5 : 0) +                    // Highest weight for name
          (shopMatch ? 3 : 0) +                    // High weight for shop name
          (nutrientMatch ? 2 : 0) +                // Medium weight for nutrients
          (cropMatch ? 2 : 0) +                    // Medium weight for crops
          (soilMatch ? 1 : 0) +                    // Low weight for soil
          (descriptionMatch ? 1 : 0);              // Low weight for description

        // Bonus for exact matches
        if (normalize(fertilizer.name) === search) relevanceScore += 2;
        if (normalize(fertilizer.shopName) === search) relevanceScore += 1;
      }

      return {
        ...fertilizer,
        _relevance: relevanceScore,
        _hasSearchMatch: relevanceScore > 0
      };
    })
    .filter(fertilizer => {
      // ---- Search term matching ----
      if (searchTerm && !fertilizer._hasSearchMatch) {
        return false;
      }

      // ---- Crop filter ----
      const matchesCrop = !filters.cropType || 
        fertilizer.suitableCrops?.some(crop => 
          normalize(crop) === normalize(filters.cropType)
        );

      // ---- Purpose filter (mock implementation) ----
      const matchesPurpose = !filters.purpose || true; // Implement based on your data

      // ---- Category filter ----
      const matchesCategory = !filters.category || 
        normalize(fertilizer.category) === normalize(filters.category);

      // ---- Brand type filter (mock implementation) ----
      const matchesBrand = !filters.brandType || true; // Implement based on your data

      // ---- Price range filter ----
      const price = fertilizer.price || 0;
      const matchesMinPrice = !filters.minPrice || price >= parseFloat(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || price <= parseFloat(filters.maxPrice);

      return matchesCrop && matchesPurpose && matchesCategory && 
             matchesBrand && matchesMinPrice && matchesMaxPrice;
    })
    .sort((a, b) => {
      // Primary: Relevance-based sorting when search term is active
      if (searchTerm) {
        const relevanceDiff = (b._relevance || 0) - (a._relevance || 0);
        if (relevanceDiff !== 0) return relevanceDiff;
      }

      // Secondary: User-selected sort filter
      switch (filters.sortBy) {
        case 'price-low-high':
          return (a.price || 0) - (b.price || 0);
        case 'price-high-low':
          return (b.price || 0) - (a.price || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'popular':
          return (b.popularity || 0) - (a.popularity || 0);
        default:
          // Default: Newest first, then by relevance if search is active
          if (searchTerm) {
            return (b._relevance || 0) - (a._relevance || 0);
          }
          return 0;
      }
    });

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      cropType: '',
      purpose: '',
      category: '',
      brandType: '',
      minPrice: '',
      maxPrice: '',
      sortBy: ''
    });
    setSearchTerm('');
  };

  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some(value => value !== '') || searchTerm !== '';

  // Search suggestions (optional feature)
  const getSearchSuggestions = () => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    const suggestions = new Set();
    const search = normalize(searchTerm);
    
    fertilizers.forEach(fertilizer => {
      // Add matching fertilizer names
      if (normalize(fertilizer.name).includes(search)) {
        suggestions.add(fertilizer.name);
      }
      
      // Add matching shop names
      if (normalize(fertilizer.shopName).includes(search)) {
        suggestions.add(fertilizer.shopName);
      }
      
      // Add matching nutrients
      fertilizer.nutrients?.forEach(nutrient => {
        if (normalize(nutrient).includes(search)) {
          suggestions.add(nutrient);
        }
      });
      
      // Add matching crops
      fertilizer.suitableCrops?.forEach(crop => {
        if (normalize(crop).includes(search)) {
          suggestions.add(crop);
        }
      });
    });
    
    return Array.from(suggestions).slice(0, 5); // Limit to 5 suggestions
  };

  const searchSuggestions = getSearchSuggestions();

  if (userData?.role !== 'farmer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-300 via-green-400 to-green-500 flex items-center justify-center">
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-white/80">Farmer role required to access this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-600 to-green-500 pb-12">
      {/* Header Section */}
      <div className="backdrop-blur-lg bg-white/10 border-b border-white/20 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, {userData?.name}!
              </h1>
              <p className="text-white/80 text-lg">
                Smart farming solutions at your fingertips
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
             

              {/* Chat Toggle */}
              <button 
                onClick={() => setShowChat(!showChat)}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:scale-105 transition-all duration-300 group"
              >
                <MessageCircle size={20} className="text-white" />
              </button>

              
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex space-x-1 bg-white/10 backdrop-blur-sm rounded-2xl p-1 border border-white/20">
            {[
              { id: 'browse', label: 'Browse Products', icon: Search },

            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        

        {/* Smart Filter Panel */}
        {activeTab === 'browse' && (
          <div className="mb-8 space-y-4">
            {/* Search Bar and Filter Toggle */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-white/70" size={20} />
                <input
                  type="text"
                  placeholder="Search products, nutrients, brands, shops, crops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-300"
                />
                
                {/* Search Suggestions */}
                {searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow-xl z-10">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchTerm(suggestion)}
                        className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                {/* Filter Toggle Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                    showFilters || hasActiveFilters
                      ? 'bg-emerald-500/80 border-emerald-300/30 text-white'
                      : 'bg-white/10 border-white/20 text-white/80 hover:text-white'
                  }`}
                >
                  <Filter size={18} />
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <span className="bg-white/20 rounded-full w-5 h-5 text-xs flex items-center justify-center">
                      ✓
                    </span>
                  )}
                </button>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center space-x-2 px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl text-white/80 hover:text-white transition-all duration-300 hover:scale-105"
                  >
                    <X size={18} />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Search Results Info */}
            {searchTerm && (
              <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-4">
                <p className="text-white/80 text-sm">
                  Found <span className="text-emerald-300 font-semibold">{filteredFertilizers.length}</span> products matching "<span className="text-emerald-300">{searchTerm}</span>"
                  {filteredFertilizers.length > 0 && ' • Showing most relevant first'}
                </p>
              </div>
            )}

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Crop Selector */}
                  <div>
                    <label className="flex items-center space-x-2 text-white/80 text-sm font-medium mb-3">
                      <Wheat size={16} />
                      <span>Crop Type</span>
                    </label>
                    <select
                      value={filters.cropType}
                      onChange={(e) => setFilters(prev => ({ ...prev, cropType: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300"
                    >
                      <option value="" className="bg-gray-800">All Crops</option>
                      {filterOptions.crops.map(crop => (
                        <option key={crop.value} value={crop.value} className="bg-gray-800">
                          {crop.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Purpose Selector */}
                  <div>
                    <label className="flex items-center space-x-2 text-white/80 text-sm font-medium mb-3">
                      <Target size={16} />
                      <span>Purpose</span>
                    </label>
                    <select
                      value={filters.purpose}
                      onChange={(e) => setFilters(prev => ({ ...prev, purpose: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300"
                    >
                      <option value="" className="bg-gray-800">All Purposes</option>
                      {filterOptions.purposes.map(purpose => (
                        <option key={purpose.value} value={purpose.value} className="bg-gray-800">
                          {purpose.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category Selector */}
                  <div>
                    <label className="flex items-center space-x-2 text-white/80 text-sm font-medium mb-3">
                      <Sprout size={16} />
                      <span>Category</span>
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300"
                    >
                      <option value="" className="bg-gray-800">All Categories</option>
                      {filterOptions.categories.map(category => (
                        <option key={category.value} value={category.value} className="bg-gray-800">
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Brand Type Selector */}
                  <div>
                    <label className="flex items-center space-x-2 text-white/80 text-sm font-medium mb-3">
                      <Tag size={16} />
                      <span>Brand Type</span>
                    </label>
                    <select
                      value={filters.brandType}
                      onChange={(e) => setFilters(prev => ({ ...prev, brandType: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300"
                    >
                      <option value="" className="bg-gray-800">All Brands</option>
                      {filterOptions.brandTypes.map(brand => (
                        <option key={brand.value} value={brand.value} className="bg-gray-800">
                          {brand.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price Range and Sort Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {/* Price Range */}
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2 text-white/80 text-sm font-medium mb-3">
                      <DollarSign size={16} />
                      <span>Price Range ($)</span>
                    </label>
                    <div className="flex space-x-4">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                        className="flex-1 px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                        className="flex-1 px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Sort Dropdown */}
                  <div>
                    <label className="flex items-center space-x-2 text-white/80 text-sm font-medium mb-3">
                      <ArrowUpDown size={16} />
                      <span>Sort By</span>
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300"
                    >
                      <option value="" className="bg-gray-800">Relevance (Default)</option>
                      {filterOptions.sortOptions.map(option => (
                        <option key={option.value} value={option.value} className="bg-gray-800">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                  <div className="mt-6 pt-4 border-t border-white/20">
                    <p className="text-white/70 text-sm mb-3">Active Filters:</p>
                    <div className="flex flex-wrap gap-2">
                      {searchTerm && (
                        <span className="bg-emerald-500/50 text-white px-3 py-1 rounded-full text-xs flex items-center space-x-1">
                          <Search size={12} />
                          <span>Search: "{searchTerm}"</span>
                        </span>
                      )}
                      {filters.cropType && (
                        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs flex items-center space-x-1">
                          <Wheat size={12} />
                          <span>Crop: {filterOptions.crops.find(c => c.value === filters.cropType)?.label}</span>
                        </span>
                      )}
                      {filters.purpose && (
                        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs flex items-center space-x-1">
                          <Target size={12} />
                          <span>Purpose: {filterOptions.purposes.find(p => p.value === filters.purpose)?.label}</span>
                        </span>
                      )}
                      {filters.category && (
                        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs flex items-center space-x-1">
                          <Sprout size={12} />
                          <span>Category: {filterOptions.categories.find(c => c.value === filters.category)?.label}</span>
                        </span>
                      )}
                      {filters.brandType && (
                        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs flex items-center space-x-1">
                          <Tag size={12} />
                          <span>Brand: {filterOptions.brandTypes.find(b => b.value === filters.brandType)?.label}</span>
                        </span>
                      )}
                      {(filters.minPrice || filters.maxPrice) && (
                        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs flex items-center space-x-1">
                          <DollarSign size={12} />
                          <span>Price: {filters.minPrice || '0'} - {filters.maxPrice || '∞'}</span>
                        </span>
                      )}
                      {filters.sortBy && (
                        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs flex items-center space-x-1">
                          <ArrowUpDown size={12} />
                          <span>Sort: {filterOptions.sortOptions.find(s => s.value === filters.sortBy)?.label}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'browse' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {loading ? (
                <div className="col-span-full flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              ) : (
                filteredFertilizers.map(fertilizer => (
                  <FertilizerCard
                    key={fertilizer.id}
                    fertilizer={fertilizer}
                    
                  />
                ))
              )}

              {!loading && filteredFertilizers.length === 0 && (
                <div className="col-span-full text-center py-12 backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20">
                  <Filter size={48} className="text-white/40 mx-auto mb-4" />
                  <p className="text-white/80 text-lg mb-2">
                    {searchTerm 
                      ? `No products found for "${searchTerm}"` 
                      : 'No products found matching your criteria.'
                    }
                  </p>
                  <p className="text-white/60 text-sm">
                    Try adjusting your search terms or filters.
                  </p>
                  {searchTerm && (
                    <button
                      onClick={clearAllFilters}
                      className="mt-4 bg-emerald-500/80 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105"
                    >
                      Clear Search & Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          )}


        </div>
      </div>

      {showChat && <ChatBox onClose={() => setShowChat(false)} />}
    </div>
  );
}