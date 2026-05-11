import React, { useEffect, useState } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useNotifications } from '../context/NotificationContext';

export default function OrderNotification() {
  const { addNotification } = useNotifications();
  const [userPhone, setUserPhone] = useState(localStorage.getItem('userPhone'));

  // 1. Request permissions and create channel once on mount
  useEffect(() => {
    LocalNotifications.requestPermissions().then((result) => {
      if (result.display !== 'granted') {
        console.warn("User denied push notification permissions");
      }
    }).catch(err => console.warn("LocalNotifications requestPermissions failed", err));

    LocalNotifications.createChannel({
      id: 'orders',
      name: 'Order Updates',
      description: 'Notifications for order status updates',
      importance: 5,
      visibility: 1,
      vibration: true
    }).catch(err => console.error("Error creating notification channel", err));
  }, []);

  // 2. Poll localStorage to detect login/logout
  useEffect(() => {
    const interval = setInterval(() => {
      const currentPhone = localStorage.getItem('userPhone');
      if (currentPhone !== userPhone) {
        setUserPhone(currentPhone);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [userPhone]);

  // 3. Set up listeners when userPhone is available
  useEffect(() => {
    const pageLoadTime = Date.now();
    const lastChecked = localStorage.getItem('lastCheckedBroadcast') 
      ? parseInt(localStorage.getItem('lastCheckedBroadcast')) 
      : Date.now();
    
    // Update it for next time
    localStorage.setItem('lastCheckedBroadcast', Date.now().toString());
    
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

              // Only add to history if it was sent after the user signed up or last checked
              if (promo.timestamp > lastChecked) {
                addNotification({ title: promo.title, body: promo.body, status: 'Promo', orderId: change.doc.id, timestamp: promo.timestamp });
              }
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
  }, [userPhone]);

  // No longer rendering a visual DOM element since these are native push notifications
  return null;
}
