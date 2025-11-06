package com.example.choprest.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

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
    
    @Column(name = "restaurant_code", unique = true)
    private Long restaurantCode; // CSV의 식당 ID (회원가입 시 식당 연결용)
    
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
    
    // 요일별 운영시간
    @Column(name = "monday_opening_hours", columnDefinition = "TEXT")
    private String mondayOpeningHours;
    
    @Column(name = "tuesday_opening_hours", columnDefinition = "TEXT")
    private String tuesdayOpeningHours;
    
    @Column(name = "wednesday_opening_hours", columnDefinition = "TEXT")
    private String wednesdayOpeningHours;
    
    @Column(name = "thursday_opening_hours", columnDefinition = "TEXT")
    private String thursdayOpeningHours;
    
    @Column(name = "friday_opening_hours", columnDefinition = "TEXT")
    private String fridayOpeningHours;
    
    @Column(name = "saturday_opening_hours", columnDefinition = "TEXT")
    private String saturdayOpeningHours;
    
    @Column(name = "sunday_opening_hours", columnDefinition = "TEXT")
    private String sundayOpeningHours;
    
    // 요일별 브레이크 타임
    @Column(name = "monday_break_time", columnDefinition = "TEXT")
    private String mondayBreakTime;
    
    @Column(name = "tuesday_break_time", columnDefinition = "TEXT")
    private String tuesdayBreakTime;
    
    @Column(name = "wednesday_break_time", columnDefinition = "TEXT")
    private String wednesdayBreakTime;
    
    @Column(name = "thursday_break_time", columnDefinition = "TEXT")
    private String thursdayBreakTime;
    
    @Column(name = "friday_break_time", columnDefinition = "TEXT")
    private String fridayBreakTime;
    
    @Column(name = "saturday_break_time", columnDefinition = "TEXT")
    private String saturdayBreakTime;
    
    @Column(name = "sunday_break_time", columnDefinition = "TEXT")
    private String sundayBreakTime;
    
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

    @Column(name = "break_time", columnDefinition = "TEXT")
    private String breakTime; // 브레이크 타임 (예: "15:00-17:00")

    @Transient
    @JsonProperty("reviewCount") // JSON 응답에 포함되도록 명시
    private Long reviewCount; // 리뷰 개수 (DB 컬럼 없음, 실시간 계산)

    @Transient
    @JsonProperty("rating") // JSON 응답에 포함되도록 명시
    private Double rating; // 평점 (DB 컬럼 없음, 실시간 계산)

    // 가게 설정
    @Column(name = "auto_approve")
    private Boolean autoApprove; // 자동 예약 승인 여부

    @Column(name = "regular_customer_threshold")
    private Integer regularCustomerThreshold; // 단골 고객 기준 (방문 횟수)
}

