package com.example.ragi_go_api.repository;

import com.example.ragi_go_api.model.AppOrder;
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
public class AppOrderRepository {

    private static final Logger logger = LoggerFactory.getLogger(AppOrderRepository.class);

    @Autowired
    private Firestore firestore;

    private static final String COLLECTION_NAME = "orders";

    public List<AppOrder> findAllByOrderByTimestampDesc() {
        List<AppOrder> orders = new ArrayList<>();
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                    .orderBy("timestamp", Query.Direction.DESCENDING)
                    .limit(50)
                    .get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            for (QueryDocumentSnapshot document : documents) {
                AppOrder order = document.toObject(AppOrder.class);
                order.setId(document.getId());
                orders.add(order);
            }
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error fetching all orders: {}", e.getMessage(), e);
        }
        return orders;
    }

    public List<AppOrder> findByPhoneOrderByTimestampDesc(String phone) {
        List<AppOrder> orders = new ArrayList<>();
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("phone", phone)
                    .orderBy("timestamp", Query.Direction.DESCENDING)
                    .limit(50)
                    .get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            for (QueryDocumentSnapshot document : documents) {
                AppOrder order = document.toObject(AppOrder.class);
                order.setId(document.getId());
                orders.add(order);
            }
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error fetching orders for phone {}: {}", phone, e.getMessage(), e);
        }
        return orders;
    }

    public AppOrder save(AppOrder order) {
        CollectionReference orders = firestore.collection(COLLECTION_NAME);
        if (order.getTimestamp() == null) {
            order.setTimestamp(System.currentTimeMillis());
        }
        if (order.getId() == null || order.getId().isEmpty()) {
            DocumentReference docRef = orders.document();
            order.setId(docRef.getId());
            docRef.set(order);
        } else {
            orders.document(order.getId()).set(order);
        }
        return order;
    }

    public AppOrder findById(String id) {
        try {
            DocumentSnapshot document = firestore.collection(COLLECTION_NAME).document(id).get().get();
            if (document.exists()) {
                AppOrder order = document.toObject(AppOrder.class);
                order.setId(document.getId());
                return order;
            }
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error fetching order by ID {}: {}", id, e.getMessage(), e);
        }
        return null;
    }
}
