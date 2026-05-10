package com.example.ragi_go_api.controller;

import com.example.ragi_go_api.model.User;
import com.example.ragi_go_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepo;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        if (userRepo.existsById(user.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists");
        }
        if (user.getRole() == null) {
            user.setRole("USER");
        }
        User savedUser = userRepo.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String identifier = credentials.get("identifier");
        String password = credentials.get("password");

        User user = userRepo.findByEmail(identifier);
        if (user == null) {
            user = userRepo.findByPhone(identifier);
        }

        if (user != null && user.getPassword().equals(password)) {
            Map<String, Object> response = new HashMap<>();
            response.put("email", user.getEmail());
            response.put("name", user.getName());
            response.put("phone", user.getPhone());
            response.put("role", user.getRole());
            response.put("address", user.getAddress());
            response.put("gpsLocation", user.getGpsLocation());
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody User user) {
        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            return ResponseEntity.badRequest().body("Email is required");
        }
        User existingUser = userRepo.findByEmail(user.getEmail());
        if (existingUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        existingUser.setName(user.getName());
        existingUser.setPhone(user.getPhone());
        if (user.getAddress() != null) {
            existingUser.setAddress(user.getAddress());
        }
        if (user.getGpsLocation() != null) {
            existingUser.setGpsLocation(user.getGpsLocation());
        }
        
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            existingUser.setPassword(user.getPassword());
        }
        
        User savedUser = userRepo.save(existingUser);
        
        Map<String, Object> response = new HashMap<>();
        response.put("email", savedUser.getEmail());
        response.put("name", savedUser.getName());
        response.put("phone", savedUser.getPhone());
        response.put("role", savedUser.getRole());
        response.put("address", savedUser.getAddress());
        response.put("gpsLocation", savedUser.getGpsLocation());
        return ResponseEntity.ok(response);
    }
}
