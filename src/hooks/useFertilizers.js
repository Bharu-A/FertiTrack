// src/hooks/useFertilizers.js
import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export default function useFertilizers(filters = {}) {
  const [fertilizers, setFertilizers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, 'fertilizers'), where('quantity', '>', 0));

    if (filters.cropType) {
      q = query(q, where('suitableCrops', 'array-contains', filters.cropType));
    }
    if (filters.soilType) {
      q = query(q, where('suitableSoil', 'array-contains', filters.soilType));
    }
    if (filters.shopId) {
      q = query(q, where('shopId', '==', filters.shopId));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fertilizersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFertilizers(fertilizersData);
      setLoading(false);
    });

    return unsubscribe;
  }, [filters]);

  return { fertilizers, loading };
}