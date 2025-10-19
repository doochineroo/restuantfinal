package com.example.choprest.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "MENU")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Menu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "menu_id")
    private Long menuId;
    
    @Column(name = "store_id", nullable = false)
    private Long storeId;
    
    @Column(name = "name", nullable = false, length = 200)
    private String name;
    
    @Column(name = "description", length = 1000)
    private String description;
    
    @Column(name = "price")
    private Integer price;
    
    @Column(name = "image_url", length = 500)
    private String imageUrl;
    
    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;
    
    @Column(name = "category", length = 100)
    private String category;
    
    @Column(name = "is_available")
    private Boolean isAvailable;
    
    @Column(name = "is_popular")
    private Boolean isPopular;
    
    @Column(name = "is_recommended")
    private Boolean isRecommended;
    
    @Column(name = "allergen_info", length = 500)
    private String allergenInfo;
    
    @Column(name = "nutrition_info", length = 1000)
    private String nutritionInfo;
    
    @Column(name = "preparation_time")
    private Integer preparationTime; // 분 단위
    
    @Column(name = "spice_level")
    private Integer spiceLevel; // 1-5 단계
    
    @Column(name = "sort_order")
    private Integer sortOrder;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
