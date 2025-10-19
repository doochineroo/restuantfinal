package com.example.choprest.demo.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * 테스트용 예약 요청 DTO - 데모 종료 시 제거 예정
 */
@Data
public class ReservationRequest {
    private Long userId;
    private Long restaurantId;
    private String restaurantName;
    private String userName;
    private String userPhone;
    private String userEmail;
    private LocalDate reservationDate;
    private LocalTime reservationTime;
    private Integer guests;
    private String specialRequests;
}

