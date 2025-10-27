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
    
    @Column(name = "holiday_info", columnDefinition = "TEXT")
    private String holidayInfo;
    
    @Column(name = "opening_hours", columnDefinition = "TEXT")
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
    
    @Column(name = "main_menu", columnDefinition = "TEXT")
    private String mainMenu;
    
    @Column(name = "status")
    private String status;
    
    @Column(name = "hashtags", columnDefinition = "TEXT")
    private String hashtags;
    
    @Column(name = "area_info", columnDefinition = "TEXT")
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
    
    @Column(name = "main_image", length = 500)
    private String mainImage;
    
    @Column(name = "menu_image1", length = 500)
    private String menuImage1;
    
    @Column(name = "menu_image2", length = 500)
    private String menuImage2;
    
    @Column(name = "menu_image3", length = 500)
    private String menuImage3;
    
    @Column(name = "restaurant_photo1", length = 500)
    private String restaurantPhoto1;
    
    @Column(name = "restaurant_photo2", length = 500)
    private String restaurantPhoto2;
    
    @Column(name = "restaurant_photo3", length = 500)
    private String restaurantPhoto3;
    
    @Column(name = "restaurant_photo4", length = 500)
    private String restaurantPhoto4;
    
    @Column(name = "restaurant_photo5", length = 500)
    private String restaurantPhoto5;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "parking_info", columnDefinition = "TEXT")
    private String parkingInfo;

    @Column(name = "transportation", columnDefinition = "TEXT")
    private String transportation;

    @Column(name = "special_notes", columnDefinition = "TEXT")
    private String specialNotes;

    @Column(name = "card_payment")
    private String cardPayment;

    @Column(name = "cash_payment")
    private String cashPayment;

    @Column(name = "mobile_payment")
    private String mobilePayment;

    @Column(name = "account_transfer")
    private String accountTransfer;
}

