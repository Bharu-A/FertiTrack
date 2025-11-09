import { useState, useEffect } from 'react';

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Mock notifications
    const mockNotifications = [
      { id: 1, type: 'info', message: 'New organic fertilizers available', read: false },
      { id: 2, type: 'sale', message: 'Special discount on nitrogen fertilizers', read: false },
      { id: 3, type: 'alert', message: 'Weather alert: Rain expected tomorrow', read: true }
    ];
    
    setNotifications(mockNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount };
}