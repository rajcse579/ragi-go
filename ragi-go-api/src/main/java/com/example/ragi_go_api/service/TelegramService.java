package com.example.ragi_go_api.service;

import com.example.ragi_go_api.model.AppOrder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TelegramService {

    private static final Logger logger = LoggerFactory.getLogger(TelegramService.class);

    @Value("${telegram.bot.token}")
    private String botToken;

    @Value("${telegram.admin.chatId}")
    private String adminChatId;

    private final RestTemplate restTemplate = new RestTemplate();

    @Async
    public void sendOrderNotification(AppOrder order) {
        String url = "https://api.telegram.org/bot" + botToken + "/sendMessage";

        StringBuilder sb = new StringBuilder();
        sb.append("📦 *New Order Received!*\n\n");
        sb.append("*Order ID:* #").append(order.getId()).append("\n");
        sb.append("*Customer:* ").append(order.getName()).append(" (+91 ").append(order.getPhone()).append(")\n");
        sb.append("*Total:* ₹").append(order.getTotal()).append("\n");
        sb.append("*Address:* ").append(order.getAddress()).append("\n");
        if (order.getGpsLocation() != null && !order.getGpsLocation().isEmpty()) {
            sb.append("*GPS Location:* [View on Maps](https://maps.google.com/?q=").append(order.getGpsLocation()).append(")\n");
        }
        sb.append("\n*Items:*\n");
        order.getItems().forEach(item -> {
            sb.append("• ").append(item.getQuantity()).append(" x ").append(item.getName()).append("\n");
        });

        String[] chatIds = adminChatId.split(",");
        for (String chatId : chatIds) {
            Map<String, Object> request = new HashMap<>();
            request.put("chat_id", chatId.trim());
            request.put("text", sb.toString());
            request.put("parse_mode", "Markdown");

            try {
                restTemplate.postForEntity(url, request, String.class);
                logger.info("Telegram notification sent to {} for order: {}", chatId.trim(), order.getId());
            } catch (Exception e) {
                logger.error("Failed to send Telegram notification to {}: {}", chatId.trim(), e.getMessage());
            }
        }
    }
}
