package com.example.ragi_go_api.controller;

import com.example.ragi_go_api.model.AppOrder;
import com.example.ragi_go_api.model.MenuItem;
import com.example.ragi_go_api.repository.AppOrderRepository;
import com.example.ragi_go_api.repository.MenuItemRepository;
import com.example.ragi_go_api.service.TelegramService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import com.example.ragi_go_api.service.FcmService;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api")
public class ApiController {

    @Autowired
    private MenuItemRepository menuRepo;

    @Autowired
    private AppOrderRepository orderRepo;

    @Autowired
    private TelegramService telegramService;

    @Autowired
    private com.example.ragi_go_api.repository.SettingsRepository settingsRepo;

    @Autowired
    private com.example.ragi_go_api.repository.UserRepository userRepo;

    @Autowired
    private FcmService fcmService;

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    // --- HEALTH / KEEP ALIVE ---
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }

    // --- SETTINGS ---
    @GetMapping("/settings/status")
    public ResponseEntity<java.util.Map<String, Boolean>> getShopStatus() {
        return ResponseEntity.ok(java.util.Map.of("isOpen", settingsRepo.isShopOpen()));
    }

    @PutMapping("/settings/status")
    public ResponseEntity<java.util.Map<String, Boolean>> updateShopStatus(@RequestBody java.util.Map<String, Boolean> payload) {
        boolean isOpen = payload.getOrDefault("isOpen", true);
        settingsRepo.setShopOpen(isOpen);
        return ResponseEntity.ok(java.util.Map.of("isOpen", isOpen));
    }

    // --- BROADCASTS ---
    @PostMapping("/broadcast")
    public ResponseEntity<String> sendBroadcast(@RequestBody java.util.Map<String, String> payload) {
        String title = payload.get("title");
        String body = payload.get("body");
        
        if (title == null || title.isEmpty() || body == null || body.isEmpty()) {
            return ResponseEntity.badRequest().body("Title and body are required");
        }
        
        try {
            fcmService.sendTopicNotification("broadcasts", title, body);
            return ResponseEntity.ok("Broadcast sent successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error sending broadcast: " + e.getMessage());
        }
    }

    // --- MENU ITEMS ---
    @GetMapping("/menu")
    public List<MenuItem> getMenu() {
        return menuRepo.findAll();
    }

    @GetMapping("/menu/all")
    public List<MenuItem> getAllMenu() {
        return menuRepo.findAll();
    }

    @PostMapping("/menu")
    public MenuItem addMenuItem(@RequestBody MenuItem item) {
        return menuRepo.save(item);
    }

    @PutMapping("/menu/{id}")
    public ResponseEntity<MenuItem> updateMenuItem(@PathVariable String id, @RequestBody MenuItem item) {
        MenuItem existing = menuRepo.findById(id);
        if (existing == null) return ResponseEntity.notFound().build();
        
        item.setId(id);
        return ResponseEntity.ok(menuRepo.save(item));
    }

    @DeleteMapping("/menu/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable String id) {
        menuRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // --- ORDERS ---
    @GetMapping("/orders")
    public List<AppOrder> getOrders() {
        return orderRepo.findAllByOrderByTimestampDesc();
    }

    @GetMapping("/orders/user/{phone}")
    public List<AppOrder> getUserOrders(@PathVariable String phone) {
        return orderRepo.findByPhoneOrderByTimestampDesc(phone);
    }

    @GetMapping("/orders/stream")
    public SseEmitter streamOrders() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        return emitter;
    }

    @PostMapping("/orders")
    public AppOrder placeOrder(@RequestBody AppOrder order) {
        order.setStatus("Pending");
        AppOrder savedOrder = orderRepo.save(order);
        
        // Send Telegram notification to admin
        telegramService.sendOrderNotification(savedOrder);
        
        // Notify Admins via FCM
        try {
            java.util.List<com.example.ragi_go_api.model.User> admins = userRepo.findByRole("ADMIN");
            for (com.example.ragi_go_api.model.User admin : admins) {
                if (admin.getFcmToken() != null && !admin.getFcmToken().isEmpty()) {
                    fcmService.sendPushNotification(admin.getFcmToken(), "New Order Received! 🔔", "You have received a new order #" + (savedOrder.getId() != null ? savedOrder.getId().substring(Math.max(0, savedOrder.getId().length() - 5)) : "N/A"));
                }
            }
        } catch (Exception e) {
            System.err.println("Error sending FCM notification to admins: " + e.getMessage());
        }
        
        // Notify SSE subscribers
        notifyOrderUpdate(savedOrder);
        
        return savedOrder;
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<AppOrder> updateOrderStatus(@PathVariable String id, @RequestBody java.util.Map<String, String> payload) {
        AppOrder order = orderRepo.findById(id);
        if (order == null) return ResponseEntity.notFound().build();
        
        String status = payload.get("status");
        order.setStatus(status);
        AppOrder savedOrder = orderRepo.save(order);
        
        // Notify User via FCM
        try {
            com.example.ragi_go_api.model.User user = userRepo.findByPhone(order.getPhone());
            if (user != null && user.getFcmToken() != null && !user.getFcmToken().isEmpty()) {
                String title = "";
                String body = "";
                String orderShortId = (order.getId() != null ? order.getId().substring(Math.max(0, order.getId().length() - 5)) : "N/A");
                
                if ("Accepted".equals(status)) {
                    title = "Order Accepted! 🍳";
                    body = "Great news! The restaurant has accepted your order #" + orderShortId + " and is preparing it now.";
                } else if ("Out for Delivery".equals(status)) {
                    title = "Order Out for Delivery! 🚴";
                    body = "Your order #" + orderShortId + " is on the way to your location.";
                } else if ("Delivered".equals(status)) {
                    title = "Order Delivered! 🎉";
                    body = "Your order #" + orderShortId + " has been successfully delivered. Enjoy your meal!";
                } else if ("Cancelled".equals(status)) {
                    title = "Order Cancelled ❌";
                    body = "Sorry for the inconvenience, your order #" + orderShortId + " has been cancelled by the restaurant.";
                }
                
                if (!title.isEmpty()) {
                    fcmService.sendPushNotification(user.getFcmToken(), title, body);
                }
            }
        } catch (Exception e) {
            System.err.println("Error sending FCM notification to user: " + e.getMessage());
        }
        
        // Notify SSE subscribers
        notifyOrderUpdate(savedOrder);
        
        return ResponseEntity.ok(savedOrder);
    }

    @PutMapping("/orders/{id}/assign")
    public ResponseEntity<AppOrder> assignOrder(@PathVariable String id, @RequestBody java.util.Map<String, String> payload) {
        AppOrder order = orderRepo.findById(id);
        if (order == null) return ResponseEntity.notFound().build();
        
        String assignedTo = payload.get("assignedTo");
        order.setAssignedTo(assignedTo);
        AppOrder savedOrder = orderRepo.save(order);
        
        // Notify Delivery Guy via FCM
        try {
            com.example.ragi_go_api.model.User deliveryGuy = userRepo.findByPhone(assignedTo);
            if (deliveryGuy != null && deliveryGuy.getFcmToken() != null && !deliveryGuy.getFcmToken().isEmpty()) {
                fcmService.sendPushNotification(deliveryGuy.getFcmToken(), "New Order Assigned! 📦", "Order #" + (order.getId() != null ? order.getId().substring(Math.max(0, order.getId().length() - 5)) : "N/A") + " has been assigned to you.");
            }
        } catch (Exception e) {
            System.err.println("Error sending FCM notification to delivery guy: " + e.getMessage());
        }
        
        // Notify SSE subscribers
        notifyOrderUpdate(savedOrder);
        
        return ResponseEntity.ok(savedOrder);
    }

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String id) {
        orderRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/orders/assigned/{phone}")
    public List<AppOrder> getAssignedOrders(@PathVariable String phone) {
        return orderRepo.findByAssignedToOrderByTimestampDesc(phone);
    }

    @GetMapping("/delivery-guys")
    public List<com.example.ragi_go_api.model.User> getDeliveryGuys() {
        return userRepo.findByRole("DELIVERY");
    }

    private void notifyOrderUpdate(AppOrder order) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(order);
            } catch (Exception e) {
                emitters.remove(emitter);
            }
        }
    }
}
