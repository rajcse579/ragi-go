package com.example.ragi_go_api.repository;

import com.example.ragi_go_api.model.MenuItem;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Repository
public class MenuItemRepository {

    private static final Logger logger = LoggerFactory.getLogger(MenuItemRepository.class);

    @Autowired
    private Firestore firestore;

    private static final String COLLECTION_NAME = "menu_items";

    public List<MenuItem> findByAvailableTrue() {
        List<MenuItem> items = new ArrayList<>();
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("available", true)
                    .get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            for (QueryDocumentSnapshot document : documents) {
                MenuItem item = document.toObject(MenuItem.class);
                item.setId(document.getId());
                items.add(item);
            }
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error fetching available menu items: {}", e.getMessage(), e);
        }
        return items;
    }

    public MenuItem save(MenuItem item) {
        CollectionReference menuItems = firestore.collection(COLLECTION_NAME);
        if (item.getId() == null || item.getId().isEmpty()) {
            DocumentReference docRef = menuItems.document();
            item.setId(docRef.getId());
            docRef.set(item);
        } else {
            menuItems.document(item.getId()).set(item);
        }
        return item;
    }

    public List<MenuItem> findAll() {
        List<MenuItem> items = new ArrayList<>();
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME).get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            for (QueryDocumentSnapshot document : documents) {
                MenuItem item = document.toObject(MenuItem.class);
                item.setId(document.getId());
                items.add(item);
            }
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error fetching all menu items: {}", e.getMessage(), e);
        }
        return items;
    }

    public MenuItem findById(String id) {
        try {
            DocumentSnapshot document = firestore.collection(COLLECTION_NAME).document(id).get().get();
            if (document.exists()) {
                MenuItem item = document.toObject(MenuItem.class);
                item.setId(document.getId());
                return item;
            }
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error fetching menu item by ID {}: {}", id, e.getMessage(), e);
        }
        return null;
    }

    public void deleteById(String id) {
        firestore.collection(COLLECTION_NAME).document(id).delete();
    }
}
