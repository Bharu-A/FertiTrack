import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, ShoppingBag, Star, MapPin, Sparkles, Phone, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FertilizerCard({ fertilizer, onAddToCart, isRecommended = false }) {
  const { userData } = useAuth();
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = () => {
    if (userData?.role !== 'farmer') {
      toast.error('Only farmers can add to cart');
      return;
    }
    onAddToCart(fertilizer);
    toast.success('Added to cart!');
  };

  const handleMapClick = (e) => {
    e.stopPropagation();
    if (fertilizer.shopMapLink) {
      window.open(fertilizer.shopMapLink, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('No map location available for this shop');
    }
  };

  const handlePhoneClick = (e) => {
    e.stopPropagation();
    if (fertilizer.shopPhone) {
      window.open(`tel:${fertilizer.shopPhone}`);
    } else {
      toast.error('No phone number available for this shop');
    }
  };

  return (
    <div className={`backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300 ${
      isRecommended ? 'ring-2 ring-emerald-400/50' : ''
    }`}>
      {/* Header with Image */}
      <div className="h-48 bg-gradient-to-br from-white/10 to-white/5 relative overflow-hidden">
        {fertilizer.imageUrl && !imageError ? (
          <img
            src={fertilizer.imageUrl}
            alt={fertilizer.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/40">
            <div className="text-center">
              <div className="text-4xl mb-2">🌱</div>
              <p className="text-sm">No Image</p>
            </div>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          {isRecommended && (
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Sparkles size={12} />
              <span>AI Recommended</span>
            </div>
          )}
          <div className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-sm">
            ${fertilizer.price}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-white mb-2 line-clamp-1">{fertilizer.name}</h3>
        
        {/* Shop Info */}
        <div className="mb-4 space-y-3">
          {/* Shop Name */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-white/80 text-sm">
              <ShoppingBag size={14} className="mr-2" />
              <span className="font-medium truncate">{fertilizer.shopName || 'Unknown Shop'}</span>
            </div>
          </div>

          {/* Shop Address */}
          {fertilizer.shopAddress && (
            <div className="flex items-start space-x-2 text-white/70 text-xs">
              <MapPin size={12} className="mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{fertilizer.shopAddress}</span>
            </div>
          )}

          {/* Contact and Map Actions */}
          <div className="flex items-center justify-between pt-2">
            {/* Phone */}
            {fertilizer.shopPhone && (
              <button
                onClick={handlePhoneClick}
                className="flex items-center space-x-1 text-emerald-300 hover:text-emerald-200 text-xs transition-colors group"
              >
                <Phone size={12} />
                <span>Call</span>
              </button>
            )}

            {/* Map Link */}
            {fertilizer.shopMapLink && (
              <button
                onClick={handleMapClick}
                className="flex items-center space-x-1 text-blue-300 hover:text-blue-200 text-xs transition-colors group"
              >
                <Navigation size={12} />
                <span>View on Map</span>
              </button>
            )}
          </div>
        </div>

        {/* Nutrients */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1 mb-2">
            {fertilizer.nutrients?.slice(0, 3).map((nutrient, index) => (
              <span
                key={index}
                className="bg-white/20 backdrop-blur-sm text-white/90 px-2 py-1 rounded-lg text-xs border border-white/20"
              >
                {nutrient}
              </span>
            ))}
            {fertilizer.nutrients?.length > 3 && (
              <span className="bg-white/10 text-white/70 px-2 py-1 rounded-lg text-xs">
                +{fertilizer.nutrients.length - 3} more
              </span>
            )}
          </div>

          <div className="text-white/70 text-sm space-y-1">
            <div>Suitable for: {fertilizer.suitableCrops?.slice(0, 2).join(', ')}</div>
            <div>Soil type: {fertilizer.suitableSoil?.join(', ')}</div>
          </div>
        </div>

        {/* Rating and Stock */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-1">
            <Star size={14} className="text-yellow-300 fill-current" />
            <span className="text-white/80 text-sm">{fertilizer.rating || '4.2'}</span>
          </div>
          <div className={`text-sm font-medium ${
            fertilizer.quantity < 10 ? 'text-red-300' : 'text-emerald-300'
          }`}>
            {fertilizer.quantity < 10 ? 'Low Stock' : 'In Stock'}
          </div>
        </div>

        {/* Add to Cart Button */}
        {userData?.role === 'farmer' && (
          <button
            onClick={handleAddToCart}
            disabled={fertilizer.quantity === 0}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center justify-center space-x-2"
          >
            <ShoppingCart size={18} />
            <span>Add to Cart</span>
          </button>
        )}
      </div>
    </div>
  );
}
