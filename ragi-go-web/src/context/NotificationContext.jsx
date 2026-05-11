import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('userNotifications');
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing notifications", e);
      }
    }
  }, []);

  // Save to local storage whenever notifications change
  useEffect(() => {
    localStorage.setItem('userNotifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (notif) => {
    setNotifications((prev) => {
      // Prevent duplicates by checking orderId/timestamp
      const isDuplicate = prev.some(n => 
        (n.orderId && n.orderId === notif.orderId && n.status === notif.status) || 
        (n.timestamp === notif.timestamp && n.title === notif.title)
      );
      
      if (isDuplicate) return prev;
      
      return [
        { id: Date.now().toString(), timestamp: notif.timestamp || Date.now(), read: false, ...notif },
        ...prev
      ].slice(0, 10); // Keep only the latest 10 notifications
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    console.log("Clearing all notifications");
    localStorage.setItem('userNotifications', '[]');
    setNotifications([]);
  };

  const deleteNotification = (id) => {
    console.log("Deleting notification", id);
    setNotifications((prev) => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAllAsRead, clearNotifications, deleteNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
