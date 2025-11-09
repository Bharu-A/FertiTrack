import React from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer, Droplets } from 'lucide-react';

export default function WeatherWidget({ weather, loading }) {
  const getWeatherIcon = (condition) => {
    const conditionLower = condition?.toLowerCase();
    if (conditionLower?.includes('rain')) return <CloudRain className="text-blue-300" size={24} />;
    if (conditionLower?.includes('snow')) return <CloudSnow className="text-blue-100" size={24} />;
    if (conditionLower?.includes('cloud')) return <Cloud className="text-gray-300" size={24} />;
    if (conditionLower?.includes('wind')) return <Wind className="text-gray-400" size={24} />;
    return <Sun className="text-yellow-300" size={24} />;
  };

  if (loading) {
    return (
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl animate-pulse">
        <div className="h-6 bg-white/20 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-white/20 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white text-lg font-semibold mb-2">Current Weather</h3>
          <p className="text-white/80 text-sm">{weather?.location || 'Your Location'}</p>
        </div>
        {weather?.condition && getWeatherIcon(weather.condition)}
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="flex items-center space-x-2">
          <Thermometer size={18} className="text-red-300" />
          <div>
            <p className="text-white/60 text-xs">Temperature</p>
            <p className="text-white font-semibold">{weather?.temperature || '--'}°C</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Droplets size={18} className="text-blue-300" />
          <div>
            <p className="text-white/60 text-xs">Humidity</p>
            <p className="text-white font-semibold">{weather?.humidity || '--'}%</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Wind size={18} className="text-gray-300" />
          <div>
            <p className="text-white/60 text-xs">Condition</p>
            <p className="text-white font-semibold text-sm capitalize">{weather?.condition || '--'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}