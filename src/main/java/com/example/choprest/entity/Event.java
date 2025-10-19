package com.example.choprest.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "EVENTS")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id")
    private Long eventId;
    
    @Column(name = "store_id", nullable = false)
    private Long storeId;
    
    @Column(name = "event_name", nullable = false, length = 200)
    private String eventName;
    
    @Column(name = "event_description", length = 2000)
    private String eventDescription;
    
    @Column(name = "event_type", length = 50)
    private String eventType; // DISCOUNT, GIFT, SPECIAL, SEASONAL
    
    @Column(name = "discount_rate")
    private Integer discountRate; // 할인율 (%)
    
    @Column(name = "discount_amount")
    private Integer discountAmount; // 할인 금액
    
    @Column(name = "min_order_amount")
    private Integer minOrderAmount; // 최소 주문 금액
    
    @Column(name = "image_url", length = 500)
    private String imageUrl;
    
    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;
    
    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;
    
    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;
    
    @Column(name = "is_active")
    private Boolean isActive;
    
    @Column(name = "is_popular")
    private Boolean isPopular;
    
    @Column(name = "terms_and_conditions", length = 2000)
    private String termsAndConditions;
    
    @Column(name = "sort_order")
    private Integer sortOrder;
}
