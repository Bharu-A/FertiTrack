import { useState, useEffect } from 'react';

export function useWeather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Mock weather data - in production, use OpenWeatherMap API
        const mockWeather = {
          location: 'Farm Location',
          temperature: 22,
          humidity: 65,
          condition: 'Partly Cloudy',
          windSpeed: 12
        };
        
        setTimeout(() => {
          setWeather(mockWeather);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching weather:', error);
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  return { weather, loading };
}