import React from "react";
import { ShoppingBag, MapPin, Phone, Navigation } from "lucide-react";
import toast from "react-hot-toast";

// INR Format
const formatINR = (value) => {
  if (!value) return "₹0";
  return "₹" + Number(value).toLocaleString("en-IN");
};

export default function FertilizerCard({ fertilizer, isRecommended = false }) {
  const handleMapClick = (e) => {
    e.stopPropagation();
    fertilizer.shopMapLink
      ? window.open(fertilizer.shopMapLink, "_blank", "noopener,noreferrer")
      : toast.error("No map location available");
  };

  const handlePhoneClick = (e) => {
    e.stopPropagation();
    fertilizer.shopPhone
      ? window.open(`tel:${fertilizer.shopPhone}`)
      : toast.error("No phone number available");
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden hover:scale-[1.02] ${
        isRecommended ? "ring-2 ring-blue-300" : ""
      }`}
    >
      {/* Header */}
      <div className="h-28 bg-gray-100 flex items-center justify-center relative">

        {isRecommended && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            AI Recommended
          </div>
        )}

        <h2 className="text-gray-800 font-semibold text-lg truncate px-4">
          {fertilizer.name}
        </h2>

        {/* Price Badge */}
        <div className="absolute bottom-3 right-3 bg-white border border-gray-300 px-2 py-1 rounded-full text-sm text-gray-700 shadow">
          {formatINR(fertilizer.price)}
        </div>

        {/* Quantity Badge */}
        <div className="absolute top-3 left-3 bg-gray-700 text-white px-2 py-1 rounded-full text-xs">
          {fertilizer.quantity ?? 0} kg
        </div>
      </div>

      {/* Content */}
      <div className="p-5">

        {/* BRAND TYPE BADGE */}
        <div className="mb-3">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              fertilizer.type === "branded"
                ? "bg-blue-600 text-white"
                : "bg-gray-500 text-white"
            }`}
          >
            {fertilizer.type || "generic"}
          </span>
        </div>

        {/* DESCRIPTION */}
        {fertilizer.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {fertilizer.description}
          </p>
        )}

        {/* Shop Info */}
        <div className="mb-4 space-y-3">

          {/* Shop Name */}
          <div className="flex items-center text-gray-700 text-sm">
            <ShoppingBag size={14} className="mr-2" />
            <span className="font-medium truncate">
              {fertilizer.shopName || "Unknown Shop"}
            </span>
          </div>

          {/* Shop Address */}
          {fertilizer.shopAddress && (
            <div className="flex items-start space-x-2 text-gray-500 text-xs">
              <MapPin size={12} className="mt-0.5" />
              <span className="line-clamp-2">{fertilizer.shopAddress}</span>
            </div>
          )}

          {/* Visible Phone Number */}
          {fertilizer.shopPhone && (
            <div className="flex items-center text-gray-700 text-xs">
              <Phone size={12} className="mr-1" />
              <span>{fertilizer.shopPhone}</span>
            </div>
          )}

          {/* Phone + Map Buttons */}
          <div className="flex items-center justify-between pt-2">
            {fertilizer.shopPhone && (
              <button
                onClick={handlePhoneClick}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-xs transition-colors"
              >
                <Phone size={12} />
                <span>Call</span>
              </button>
            )}

            {fertilizer.shopMapLink && (
              <button
                onClick={handleMapClick}
                className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 text-xs transition-colors"
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
                className="bg-gray-200 text-gray-700 px-2 py-1 rounded-lg text-xs border border-gray-300"
              >
                {nutrient}
              </span>
            ))}

            {fertilizer.nutrients?.length > 3 && (
              <span className="bg-gray-200 text-gray-500 px-2 py-1 rounded-lg text-xs">
                +{fertilizer.nutrients.length - 3} more
              </span>
            )}
          </div>

          {/* Suitable Crops */}
          <div className="text-gray-600 text-sm mt-2">
            Suitable for:{" "}
            {fertilizer.suitableCrops?.slice(0, 2).join(", ") || "N/A"}
          </div>
        </div>

        {/* Stock Indicator */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-xs">
            Stock: {fertilizer.stock ?? 0} packets
          </span>
          <div
            className={`text-sm font-medium ${
              (fertilizer.stock ?? 0) < 10 ? "text-red-500" : "text-green-600"
            }`}
          >
            {(fertilizer.stock ?? 0) < 10 ? "Low Stock" : "In Stock"}
          </div>
        </div>
      </div>
    </div>
  );
}
