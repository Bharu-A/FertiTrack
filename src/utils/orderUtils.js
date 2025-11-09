    // src/utils/orderUtils.js
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export async function createOrder(cartItems, userId, userData) {
  const orderData = {
    items: cartItems,
    total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    status: 'pending',
    farmerId: userId,
    farmerName: userData.name,
    farmerLocation: userData.location,
    createdAt: serverTimestamp(),
    shopId: cartItems[0]?.shopId, // Assuming all items from same shop
    shopName: cartItems[0]?.shopName
  };

  await addDoc(collection(db, 'orders'), orderData);
}