import React, { useState, useEffect } from 'react';
import  useFertilizers  from '../hooks/useFertilizers';
import  FertilizerCard from './FertilizerCard';
import { useCart } from '../hooks/useCart';
import { Sparkles, TrendingUp, Star } from 'lucide-react';

export default function Recommendations() {
  const [recommendedFertilizers, setRecommendedFertilizers] = useState([]);
  const { fertilizers } = useFertilizers();
  const { addToCart } = useCart();

  useEffect(() => {
    // Mock AI recommendation logic based on crop type, soil, and popularity
    const recommendations = fertilizers
      .filter(fertilizer => {
        // Priority for fertilizers with high ratings and good stock
        const hasGoodStock = fertilizer.quantity > 5;
        const isPopular = fertilizer.rating >= 4;
        const hasNutrients = fertilizer.nutrients?.length >= 2;
        
        return hasGoodStock && (isPopular || hasNutrients);
      })
      .sort((a, b) => {
        // Sort by rating, then by stock availability
        const scoreA = (a.rating || 3) * (a.quantity > 10 ? 1.2 : 1);
        const scoreB = (b.rating || 3) * (b.quantity > 10 ? 1.2 : 1);
        return scoreB - scoreA;
      })
      .slice(0, 8); // Top 8 recommendations

    setRecommendedFertilizers(recommendations);
  }, [fertilizers]);

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-emerald-500/20 rounded-xl">
            <Sparkles className="text-emerald-300" size={24} />
          </div>
          <div>
            <h3 className="text-white text-xl font-semibold">AI-Powered Recommendations</h3>
            <p className="text-white/70 text-sm">
              Smart suggestions based on your farming patterns and local conditions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <TrendingUp size={20} className="text-emerald-300 mb-2" />
            <p className="text-white text-sm font-medium">Personalized</p>
            <p className="text-white/60 text-xs">Based on your crop history</p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <Star size={20} className="text-yellow-300 mb-2" />
            <p className="text-white text-sm font-medium">Top Rated</p>
            <p className="text-white/60 text-xs">Highly reviewed by farmers</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recommendedFertilizers.map(fertilizer => (
          <FertilizerCard
            key={fertilizer.id}
            fertilizer={fertilizer}
            onAddToCart={addToCart}
            isRecommended={true}
          />
        ))}
        
        {recommendedFertilizers.length === 0 && (
          <div className="col-span-full text-center py-12 backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20">
            <Sparkles size={48} className="text-white/40 mx-auto mb-4" />
            <p className="text-white/80 text-lg">
              No recommendations available yet. Start browsing to get personalized suggestions!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}   