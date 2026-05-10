package com.example.ragi_go_api.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Repository
public class SettingsRepository {

    private static final Logger logger = LoggerFactory.getLogger(SettingsRepository.class);

    @Autowired
    private Firestore firestore;

    private static final String COLLECTION_NAME = "settings";
    private static final String DOC_ID = "shop_status";

    public boolean isShopOpen() {
        try {
            DocumentSnapshot document = firestore.collection(COLLECTION_NAME).document(DOC_ID).get().get();
            if (document.exists() && document.contains("isOpen")) {
                return document.getBoolean("isOpen");
            }
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error fetching shop status: {}", e.getMessage(), e);
        }
        return true; // Default to open if not set
    }

    public void setShopOpen(boolean isOpen) {
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(DOC_ID);
            Map<String, Object> data = new HashMap<>();
            data.put("isOpen", isOpen);
            docRef.set(data);
        } catch (Exception e) {
            logger.error("Error updating shop status: {}", e.getMessage(), e);
        }
    }
}
