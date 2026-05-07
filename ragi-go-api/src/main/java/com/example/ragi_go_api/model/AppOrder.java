package com.example.ragi_go_api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppOrder {
    private String id;
    private String name;
    private String address;
    private String phone;
    private List<OrderItem> items;
    private Double total;
    private String status; // Pending, Accepted, Out for Delivery, Delivered
    private Long timestamp; // Epoch milliseconds
}
