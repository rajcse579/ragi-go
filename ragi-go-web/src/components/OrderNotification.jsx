import React, { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useNotifications } from '../context/NotificationContext';

export default function OrderNotification() {
  const { addNotification } = useNotifications();
  useEffect(() => {
    const userPhone = localStorage.getItem('userPhone');
    const pageLoadTime = Date.now();
    
    // Request permissions for notifications first
    LocalNotifications.requestPermissions().then((result) => {
      if (result.display !== 'granted') {
        console.warn("User denied push notification permissions");
      }
    }).catch(err => console.warn("LocalNotifications requestPermissions failed", err));

    // Create a channel for Android (Required for Android 8.0+)
    LocalNotifications.createChannel({
      id: 'orders',
      name: 'Order Updates',
      description: 'Notifications for order status updates',
      importance: 5, // High importance (heads-up notification)
      visibility: 1, // Public
      vibration: true
    }).catch(err => console.error("Error creating notification channel", err));

    // If not logged in, don't set up listeners
    if (!userPhone) return;

    let unsubscribeOrders;
    let unsubscribeBroadcasts;

    import('firebase/firestore').then(({ collection, query, where, onSnapshot }) => {
      import('../firebase').then(({ db }) => {
        // --- 1. Listen for Order Status Updates ---
        const ordersQuery = query(collection(db, 'orders'), where('phone', '==', userPhone));
        let initialOrdersLoad = true;
        
        unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
          if (initialOrdersLoad) {
            initialOrdersLoad = false;
            return;
          }
          
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'modified') {
              const order = change.doc.data();
              const status = order.status;
              
              let title = '';
              let body = '';
              
              if (status === 'Accepted') {
                title = 'Order Accepted! 🍳';
                body = `Great news! The restaurant has accepted your order #${order.id.slice(-5)} and is preparing it now.`;
              } else if (status === 'Out for Delivery') {
                title = 'Order Out for Delivery! 🚴';
                body = `Your order #${order.id.slice(-5)} is on the way to your location.`;
              } else if (status === 'Delivered') {
                title = 'Order Delivered! 🎉';
                body = `Your order #${order.id.slice(-5)} has been successfully delivered. Enjoy your meal!`;
              }

              if (title && body) {
                // Log notification in context so it shows up in the UI inbox
                addNotification({ title, body, status, orderId: order.id });

                LocalNotifications.schedule({
                  notifications: [
                    {
                      title: title,
                      body: body,
                      id: Math.floor(Math.random() * 100000),
                      schedule: { at: new Date(Date.now() + 1000) },
                      channelId: 'orders',
                      sound: null,
                      attachments: null,
                      actionTypeId: "",
                      extra: null
                    }
                  ]
                }).catch(err => console.error("Error scheduling notification", err));
              }
            }
          });
        }, (error) => {
          console.error("Order notification listener error:", error);
        });

        // --- 2. Listen for Admin Broadcasts (Promotions) ---
        const broadcastsQuery = query(collection(db, 'broadcasts'));

        unsubscribeBroadcasts = onSnapshot(broadcastsQuery, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const promo = change.doc.data();
              
              // Only trigger native push if it was sent after the app loaded
              if (promo.timestamp > pageLoadTime) {
                LocalNotifications.schedule({
                  notifications: [
                    {
                      title: promo.title,
                      body: promo.body,
                      id: Math.floor(Math.random() * 100000),
                      schedule: { at: new Date(Date.now() + 1000) },
                      channelId: 'orders',
                      sound: null,
                      attachments: null,
                      actionTypeId: "",
                      extra: null
                    }
                  ]
                }).catch(err => console.error("Error scheduling notification", err));
              }

              // ALWAYS add to in-app history (duplicates handled in context)
              addNotification({ title: promo.title, body: promo.body, status: 'Promo', orderId: change.doc.id, timestamp: promo.timestamp });
            }
          });
        }, (error) => {
          console.error("Broadcast listener error:", error);
        });

      });
    });

    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeBroadcasts) unsubscribeBroadcasts();
    };
  }, []);

  // No longer rendering a visual DOM element since these are native push notifications
  return null;
}
