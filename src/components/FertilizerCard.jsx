import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, MapPin, Phone, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';

// INR Format
const formatINR = (value) => {
  if (!value) return "₹0";
  return "₹" + Number(value).toLocaleString("en-IN");
};

export default function FertilizerCard({ fertilizer, isRecommended = false }) {
  const handleMapClick = (e) => {
    e.stopPropagation();
    fertilizer.shopMapLink
      ? window.open(fertilizer.shopMapLink, '_blank', 'noopener,noreferrer')
      : toast.error('No map location available');
  };

  const handlePhoneClick = (e) => {
    e.stopPropagation();
    fertilizer.shopPhone
      ? window.open(`tel:${fertilizer.shopPhone}`)
      : toast.error('No phone number available');
  };

  return (
    <div
      className={`backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300 ${
        isRecommended ? 'ring-2 ring-emerald-400/50' : ''
      }`}
    >
      {/* Header */}
      <div className="h-28 bg-gradient-to-br from-emerald-600/40 to-green-400/20 relative flex items-center justify-center">
        
        {isRecommended && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            AI Recommended
          </div>
        )}

        <h2 className="text-white/90 font-semibold text-lg">{fertilizer.name}</h2>

        {/* Price Badge */}
        <div className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-sm">
          {formatINR(fertilizer.price)}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">

        {/* BRAND TYPE BADGE */}
        <div className="mb-3">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              fertilizer.type === "branded"
                ? "bg-blue-600/80 text-white"
                : "bg-gray-500/60 text-white"
            }`}
          >
            {fertilizer.type || "generic"}
          </span>
        </div>

        {/* DESCRIPTION */}
        {fertilizer.description && (
          <p className="text-white/80 text-sm mb-4 line-clamp-3">
            {fertilizer.description}
          </p>
        )}

        {/* Shop Info */}
        <div className="mb-4 space-y-3">

          {/* Shop Name */}
          <div className="flex items-center text-white/80 text-sm">
            <ShoppingBag size={14} className="mr-2" />
            <span className="font-medium truncate">{fertilizer.shopName || 'Unknown Shop'}</span>
          </div>

          {/* Shop Address */}
          {fertilizer.shopAddress && (
            <div className="flex items-start space-x-2 text-white/70 text-xs">
              <MapPin size={12} className="mt-0.5" />
              <span className="line-clamp-2">{fertilizer.shopAddress}</span>
            </div>
          )}

          {/* Phone + Map */}
          <div className="flex items-center justify-between pt-2">

            {fertilizer.shopPhone && (
              <button
                onClick={handlePhoneClick}
                className="flex items-center space-x-1 text-emerald-300 hover:text-emerald-200 text-xs transition-colors"
              >
                <Phone size={12} />
                <span>Call</span>
              </button>
            )}

            {fertilizer.shopMapLink && (
              <button
                onClick={handleMapClick}
                className="flex items-center space-x-1 text-blue-300 hover:text-blue-200 text-xs transition-colors"
              >
                <Navigation size={12} />
                <span>Map</span>
              </button>
            )}

          </div>
        </div>

        {/* Nutrients */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
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

          {/* Suitable Crops */}
          <div className="text-white/70 text-sm mt-2">
            Suitable for: {fertilizer.suitableCrops?.slice(0, 2).join(', ')}
          </div>
        </div>

        {/* Stock Indicator */}
        <div className="flex justify-end">
          <div
            className={`text-sm font-medium ${
              fertilizer.quantity < 10 ? 'text-red-300' : 'text-emerald-300'
            }`}
          >
            {fertilizer.quantity < 10 ? 'Low Stock' : 'In Stock'}
          </div>
        </div>
      </div>
    </div>
  );
}
