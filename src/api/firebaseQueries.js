import { db } from "../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function searchFertilizerByName(name) {
  try {
    const q = query(
      collection(db, "fertilizers"),
      where("keywords", "array-contains", name.toLowerCase())
    );

    const snapshot = await getDocs(q);

    const results = [];
    snapshot.forEach(doc => results.push({ id: doc.id, ...doc.data() }));

    return results;
  } catch (error) {
    console.error("Firebase search error:", error);
    return [];
  }
}
