package com.example.ragi_go_api.config;

import com.example.ragi_go_api.model.MenuItem;
import com.example.ragi_go_api.repository.MenuItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(MenuItemRepository repository) {
        return args -> {
            // Check if there are any items in Firestore
            List<MenuItem> existingItems = repository.findAll();
            if (existingItems.isEmpty()) {
                System.out.println("No items found in Firestore. Seeding database...");
                
                MenuItem m1 = new MenuItem(null, "Ragi Java", 20.0, "https://images.unsplash.com/photo-1596450514735-2d002f0434b4?auto=format&fit=crop&w=400&h=400", true);
                MenuItem m2 = new MenuItem(null, "Molakettina Pesalu", 40.0, "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=400&h=400", true);
                MenuItem m3 = new MenuItem(null, "Kommu Senagalu", 40.0, "https://images.unsplash.com/photo-1585438058914-3d7f0ba33ec2?auto=format&fit=crop&w=400&h=400", true);
                MenuItem m4 = new MenuItem(null, "Sweet Corn", 30.0, "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=400&h=400", false);
                MenuItem m5 = new MenuItem(null, "Carrot", 30.0, "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=400&h=400", false);
                MenuItem m6 = new MenuItem(null, "Beet Root", 30.0, "https://images.unsplash.com/photo-1528137850689-d51b51130bc4?auto=format&fit=crop&w=400&h=400", true);
                MenuItem m7 = new MenuItem(null, "Pachhi Verusenagalu", 50.0, "https://images.unsplash.com/photo-1534442220468-24b4f8551676?auto=format&fit=crop&w=400&h=400", true);
                MenuItem m8 = new MenuItem(null, "Fruit Salad", 60.0, "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&h=400", true);
                MenuItem m9 = new MenuItem(null, "Healthy Breakfast Bowl", 80.0, "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&h=400", true);

                List<MenuItem> itemsToSave = Arrays.asList(m1, m2, m3, m4, m5, m6, m7, m8, m9);
                for (MenuItem item : itemsToSave) {
                    repository.save(item);
                }
                System.out.println("Database seeding complete.");
            }
        };
    }
}
