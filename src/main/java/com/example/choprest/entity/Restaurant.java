package com.example.choprest.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "restaurants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "restaurant_name")
    private String restaurantName;
    
    @Column(name = "branch_name")
    private String branchName;
    
    @Column(name = "region_name")
    private String regionName;
    
    @Column(name = "parking")
    private String parking;
    
    @Column(name = "wifi")
    private String wifi;
    
    @Column(name = "kids_zone")
    private String kidsZone;
    
    @Column(name = "multilingual_menu")
    private String multilingualMenu;
    
    @Column(name = "restroom_info")
    private String restroomInfo;
    
    @Column(name = "holiday_info", length = 1000)
    private String holidayInfo;
    
    @Column(name = "opening_hours", length = 1000)
    private String openingHours;
    
    @Column(name = "delivery")
    private String delivery;
    
    @Column(name = "online_reservation")
    private String onlineReservation;
    
    @Column(name = "homepage_url", length = 500)
    private String homepageUrl;
    
    @Column(name = "landmark_name", length = 500)
    private String landmarkName;
    
    @Column(name = "landmark_lat")
    private Double landmarkLat;
    
    @Column(name = "landmark_lng")
    private Double landmarkLng;
    
    @Column(name = "landmark_distance")
    private Double landmarkDistance;
    
    @Column(name = "smart_order")
    private String smartOrder;
    
    @Column(name = "main_menu", length = 1000)
    private String mainMenu;
    
    @Column(name = "status")
    private String status;
    
    @Column(name = "hashtags", length = 1000)
    private String hashtags;
    
    @Column(name = "area_info", length = 2000)
    private String areaInfo;
    
    @Column(name = "lat")
    private Double lat;
    
    @Column(name = "lng")
    private Double lng;
    
    @Column(name = "road_address", length = 500)
    private String roadAddress;
    
    @Column(name = "phone_number", length = 50)
    private String phoneNumber;
    
    @Column(name = "category", length = 200)
    private String category;
    
    @Column(name = "image_url", length = 500)
    private String imageUrl;
    
    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;
}

