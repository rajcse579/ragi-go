package com.example.ragi_go_api.service;

import com.google.firebase.messaging.AndroidConfig;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.stereotype.Service;

@Service
public class FcmService {

    public void sendPushNotification(String token, String title, String body) {
        if (token == null || token.isEmpty()) {
            System.out.println("FCM Token is null or empty, skipping notification.");
            return;
        }

        Notification notification = Notification.builder()
                .setTitle(title)
                .setBody(body)
                .build();

        AndroidConfig androidConfig = AndroidConfig.builder()
                .setPriority(AndroidConfig.Priority.HIGH)
                .build();

        Message message = Message.builder()
                .setToken(token)
                .setNotification(notification)
                .setAndroidConfig(androidConfig)
                .build();

        try {
            String response = FirebaseMessaging.getInstance().send(message);
            System.out.println("Successfully sent message: " + response);
        } catch (Exception e) {
            System.err.println("Error sending FCM message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendTopicNotification(String topic, String title, String body) {
        Notification notification = Notification.builder()
                .setTitle(title)
                .setBody(body)
                .build();

        AndroidConfig androidConfig = AndroidConfig.builder()
                .setPriority(AndroidConfig.Priority.HIGH)
                .build();

        Message message = Message.builder()
                .setTopic(topic)
                .setNotification(notification)
                .setAndroidConfig(androidConfig)
                .build();

        try {
            String response = FirebaseMessaging.getInstance().send(message);
            System.out.println("Successfully sent message to topic: " + response);
        } catch (Exception e) {
            System.err.println("Error sending FCM message to topic: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void subscribeToTopic(String token, String topic) {
        if (token == null || token.isEmpty()) return;
        try {
            com.google.firebase.messaging.FirebaseMessaging.getInstance().subscribeToTopic(
                    java.util.Collections.singletonList(token), topic);
            System.out.println("Subscribed token to topic: " + topic);
        } catch (Exception e) {
            System.err.println("Error subscribing to topic: " + e.getMessage());
        }
    }
}
