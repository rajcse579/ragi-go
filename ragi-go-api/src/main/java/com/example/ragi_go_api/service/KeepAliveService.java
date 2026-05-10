package com.example.ragi_go_api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class KeepAliveService {

    private static final Logger logger = LoggerFactory.getLogger(KeepAliveService.class);

    @Value("${app.url:http://localhost:8080}")
    private String appUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // Run every 10 minutes (600,000 milliseconds)
    @Scheduled(fixedRate = 600000)
    public void pingSelf() {
        try {
            String url = appUrl + "/api/ping";
            String response = restTemplate.getForObject(url, String.class);
            logger.info("Keep-alive ping successful: {}", response);
        } catch (Exception e) {
            logger.error("Keep-alive ping failed: {}", e.getMessage());
        }
    }
}
