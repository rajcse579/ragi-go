package com.example.ragi_go_api.controller;

import com.example.ragi_go_api.model.AppOrder;
import com.example.ragi_go_api.model.MenuItem;
import com.example.ragi_go_api.repository.AppOrderRepository;
import com.example.ragi_go_api.repository.MenuItemRepository;
import com.example.ragi_go_api.service.TelegramService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiController {

    @Autowired
    private MenuItemRepository menuRepo;

    @Autowired
    private AppOrderRepository orderRepo;

    @Autowired
    private TelegramService telegramService;

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

    @PostMapping("/orders")
    public AppOrder placeOrder(@RequestBody AppOrder order) {
        order.setStatus("Pending");
        AppOrder savedOrder = orderRepo.save(order);
        
        // Send Telegram notification to admin
        telegramService.sendOrderNotification(savedOrder);
        
        return savedOrder;
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<AppOrder> updateOrderStatus(@PathVariable String id, @RequestBody java.util.Map<String, String> payload) {
        AppOrder order = orderRepo.findById(id);
        if (order == null) return ResponseEntity.notFound().build();
        
        order.setStatus(payload.get("status"));
        orderRepo.save(order);
        return ResponseEntity.ok(order);
    }
}
