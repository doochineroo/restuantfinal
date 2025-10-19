package com.example.choprest.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "restaurant_clicks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantClick {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "restaurant_id", nullable = false)
    private Long restaurantId;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "clicked_at")
    private LocalDateTime clickedAt;
    
    @PrePersist
    protected void onCreate() {
        clickedAt = LocalDateTime.now();
    }
}


