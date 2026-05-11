package com.example.ragi_go_api.repository;

import com.example.ragi_go_api.model.User;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.concurrent.ExecutionException;

@Repository
public class UserRepository {

    @Autowired
    private Firestore firestore;

    private static final String COLLECTION_NAME = "users";

    public User findByEmail(String email) {
        try {
            DocumentSnapshot document = firestore.collection(COLLECTION_NAME).document(email).get().get();
            if (document.exists()) {
                return document.toObject(User.class);
            }
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }
        return null;
    }

    public User findByPhone(String phone) {
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("phone", phone)
                    .limit(1)
                    .get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            if (!documents.isEmpty()) {
                return documents.get(0).toObject(User.class);
            }
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error finding user by phone in Firestore: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    public List<User> findByRole(String role) {
        List<User> users = new java.util.ArrayList<>();
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("role", role)
                    .get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            for (QueryDocumentSnapshot document : documents) {
                users.add(document.toObject(User.class));
            }
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error finding users by role in Firestore: " + e.getMessage());
            e.printStackTrace();
        }
        return users;
    }

    public boolean existsById(String email) {
        try {
            DocumentSnapshot document = firestore.collection(COLLECTION_NAME).document(email).get().get();
            return document.exists();
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error checking user existence in Firestore: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    public User save(User user) {
        try {
            firestore.collection(COLLECTION_NAME).document(user.getEmail()).set(user).get();
            System.out.println("User saved successfully to Firestore: " + user.getEmail());
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error saving user to Firestore: " + e.getMessage());
            e.printStackTrace();
        }
        return user;
    }

    public void saveResetToken(String email, String token, long expiryTime) {
        try {
            java.util.Map<String, Object> data = new java.util.HashMap<>();
            data.put("token", token);
            data.put("expiryTime", expiryTime);
            firestore.collection("password_reset_tokens").document(email).set(data).get();
        } catch (InterruptedException | java.util.concurrent.ExecutionException e) {
            e.printStackTrace();
        }
    }

    public java.util.Map<String, Object> getResetToken(String email) {
        try {
            DocumentSnapshot document = firestore.collection("password_reset_tokens").document(email).get().get();
            if (document.exists()) {
                return document.getData();
            }
        } catch (InterruptedException | java.util.concurrent.ExecutionException e) {
            e.printStackTrace();
        }
        return null;
    }

    public void deleteResetToken(String email) {
        try {
            firestore.collection("password_reset_tokens").document(email).delete().get();
        } catch (InterruptedException | java.util.concurrent.ExecutionException e) {
            e.printStackTrace();
        }
    }
}
