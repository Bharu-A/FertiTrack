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
      <div className="min-h-screen bg-white pb-12 text-black">
        <div className="bg-white border-b border-gray-300 shadow-lg text-black">
          <h2 className="text-2xl font-bold text-black mb-4">Access Denied</h2>
          <p className="text-white/80">Farmer role required to access this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-100 pb-12">
    
    {/* Header */}
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">

          {/* Greeting */}
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Welcome back, {userData?.name}!
            </h1>
            <p className="text-gray-500 text-lg">
              Smart farming solutions at your fingertips
            </p>
          </div>

          {/* Icons
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowChat(!showChat)}
              className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-all duration-200"
            >
              <MessageCircle size={20} className="text-gray-700" />
            </button>
          </div> */}
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex space-x-1 bg-gray-100 rounded-xl p-1 border border-gray-300">
          <button
            onClick={() => setActiveTab("browse")}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === "browse"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Search size={18} />
            <span>Browse Products</span>
          </button>
        </div>

      </div>
    </div>

    {/* Main Content */}
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Filters Section */}
      {activeTab === "browse" && (
        <div className="mb-8 space-y-4">

          {/* Search Bar + Filter Button */}
          <div className="flex flex-col lg:flex-row gap-4">

            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Search fertilizers, nutrients, brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-300"
              />

              {/* Suggestions */}
              {searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-10">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchTerm(suggestion)}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 first:rounded-t-xl last:rounded-b-xl"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-white border border-gray-300 hover:bg-gray-200 transition"
            >
              <Filter size={18} className="text-gray-700" />
              <span className="text-gray-800">Filters</span>
            </button>

            {/* Clear */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-white border border-gray-300 hover:bg-gray-200 transition"
              >
                <X size={18} className="text-gray-700" />
                <span className="text-gray-800">Clear</span>
              </button>
            )}
          </div>

          {/* Active Filters */}
          {showFilters && (
            <div className="bg-white border border-gray-300 rounded-2xl p-6 shadow-sm">
              {/* Filters grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Crop Selector */}
                <div>
                  <label className="text-gray-700 font-medium mb-2 block">Crop Type</label>
                  <select
                    value={filters.cropType}
                    onChange={(e) => setFilters(prev => ({ ...prev, cropType: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-700"
                  >
                    <option value="">All Crops</option>
                    {filterOptions.crops.map(crop => (
                      <option key={crop.value} value={crop.value}>{crop.label}</option>
                    ))}
                  </select>
                </div>

                {/* Purpose */}
                <div>
                  <label className="text-gray-700 font-medium mb-2 block">Purpose</label>
                  <select
                    value={filters.purpose}
                    onChange={(e) => setFilters(prev => ({ ...prev, purpose: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-700"
                  >
                    <option value="">All Purposes</option>
                    {filterOptions.purposes.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="text-gray-700 font-medium mb-2 block">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-700"
                  >
                    <option value="">All Categories</option>
                    {filterOptions.categories.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="text-gray-700 font-medium mb-2 block">Brand Type</label>
                  <select
                    value={filters.brandType}
                    onChange={(e) => setFilters(prev => ({ ...prev, brandType: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-700"
                  >
                    <option value="">All Brands</option>
                    {filterOptions.brandTypes.map(b => (
                      <option key={b.value} value={b.value}>{b.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Products Grid */}
      <div className="min-h-[500px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {loading ? (
            <div className="col-span-full flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
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
            <div className="col-span-full text-center py-12 bg-white border border-gray-300 rounded-2xl shadow-sm">
              <Filter size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 text-lg mb-2">
                No products found
              </p>
              <p className="text-gray-500 text-sm">Try adjusting filters or search</p>
            </div>
          )}

        </div>
      </div>

    </div>

    {showChat && <ChatBox onClose={() => setShowChat(false)} />}
  </div>
);

}