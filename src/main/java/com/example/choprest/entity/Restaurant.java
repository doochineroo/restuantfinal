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
    
    @Column(name = "holiday_info")
    private String holidayInfo;
    
    @Column(name = "opening_hours")
    private String openingHours;
    
    @Column(name = "delivery")
    private String delivery;
    
    @Column(name = "online_reservation")
    private String onlineReservation;
    
    @Column(name = "homepage_url")
    private String homepageUrl;
    
    @Column(name = "landmark_name")
    private String landmarkName;
    
    @Column(name = "landmark_lat")
    private Double landmarkLat;
    
    @Column(name = "landmark_lng")
    private Double landmarkLng;
    
    @Column(name = "landmark_distance")
    private Double landmarkDistance;
    
    @Column(name = "smart_order")
    private String smartOrder;
    
    @Column(name = "main_menu")
    private String mainMenu;
    
    @Column(name = "status")
    private String status;
    
    @Column(name = "hashtags")
    private String hashtags;
    
    @Column(name = "area_info")
    private String areaInfo;
    
    @Column(name = "lat")
    private Double lat;
    
    @Column(name = "lng")
    private Double lng;
    
    @Column(name = "road_address")
    private String roadAddress;
}

