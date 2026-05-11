package com.example.ragi_go_api.controller;

import com.example.ragi_go_api.model.User;
import com.example.ragi_go_api.repository.UserRepository;
import com.example.ragi_go_api.security.CustomUserDetailsService;
import com.example.ragi_go_api.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private com.example.ragi_go_api.service.EmailService emailService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        if (userRepo.existsById(user.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists");
        }
        if (user.getRole() == null) {
            user.setRole("USER");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepo.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String identifier = credentials.get("identifier");
        String password = credentials.get("password");

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(identifier, password)
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(identifier);
        final String jwt = jwtUtil.generateToken(userDetails);

        User user = userRepo.findByEmail(userDetails.getUsername());
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("phone", user.getPhone());
        response.put("role", user.getRole());
        response.put("address", user.getAddress());
        response.put("gpsLocation", user.getGpsLocation());
        return ResponseEntity.ok(response);
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
            existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        
        User savedUser = userRepo.save(existingUser);
        
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("email", savedUser.getEmail());
        response.put("name", savedUser.getName());
        response.put("phone", savedUser.getPhone());
        response.put("role", savedUser.getRole());
        response.put("address", savedUser.getAddress());
        response.put("gpsLocation", savedUser.getGpsLocation());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> payload) {
        String email = payload.get("email");
        User user = userRepo.findByEmail(email);
        if (user == null) {
            return ResponseEntity.ok("If that email exists, a reset code has been sent.");
        }

        String token = java.util.UUID.randomUUID().toString().substring(0, 6); // 6 digit code
        long expiryTime = System.currentTimeMillis() + 1000 * 60 * 15; // 15 mins

        userRepo.saveResetToken(email, token, expiryTime);

        String htmlContent = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "    <style>" +
            "        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }" +
            "        .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }" +
            "        .header { background-color: #E07A5F; color: #ffffff; padding: 30px; text-align: center; }" +
            "        .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px; }" +
            "        .content { padding: 40px 30px; color: #3d4152; line-height: 1.6; }" +
            "        .content p { margin-bottom: 20px; font-size: 16px; }" +
            "        .code-box { background-color: #f8f9fa; border: 1px dashed #E07A5F; border-radius: 6px; padding: 20px; text-align: center; margin: 30px 0; }" +
            "        .code { font-size: 32px; font-weight: 800; color: #E07A5F; letter-spacing: 5px; }" +
            "        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #93959f; border-top: 1px solid #e9e9eb; }" +
            "    </style>" +
            "</head>" +
            "<body>" +
            "    <div class='container'>" +
            "        <div class='header'>" +
            "            <h1>Raagi GO</h1>" +
            "            <p style='margin: 5px 0 0; font-size: 14px; opacity: 0.9;'>Millet-Powered Wellness</p>" +
            "        </div>" +
            "        <div class='content'>" +
            "            <p>Hello,</p>" +
            "            <p>We received a request to reset your password. Use the verification code below to proceed. This code is valid for 15 minutes.</p>" +
            "            <div class='code-box'>" +
            "                <div class='code'>%s</div>" +
            "            </div>" +
            "            <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>" +
            "            <p>Best regards,<br>The Raagi GO Team</p>" +
            "        </div>" +
            "        <div class='footer'>" +
            "            &copy; 2026 Raagi GO. All rights reserved.<br>" +
            "            This is an automated email, please do not reply." +
            "        </div>" +
            "    </div>" +
            "</body>" +
            "</html>", token);

        boolean sent = emailService.sendHtmlEmail(email, "Password Reset Code - Raagi GO", htmlContent);

        if (sent) {
            return ResponseEntity.ok("Reset code sent successfully.");
        } else {
            return ResponseEntity.status(500).body("Failed to send reset code. Please check server logs.");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> payload) {
        String email = payload.get("email");
        String token = payload.get("token");
        String newPassword = payload.get("newPassword");

        java.util.Map<String, Object> tokenData = userRepo.getResetToken(email);
        if (tokenData == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired token");
        }

        String savedToken = (String) tokenData.get("token");
        long expiryTime = (long) tokenData.get("expiryTime");

        if (!savedToken.equals(token) || System.currentTimeMillis() > expiryTime) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired token");
        }

        User user = userRepo.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);
        userRepo.deleteResetToken(email);

        return ResponseEntity.ok("Password reset successfully.");
    }
}
