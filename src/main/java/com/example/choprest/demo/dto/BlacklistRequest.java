package com.example.choprest.demo.dto;

import lombok.Data;

/**
 * 블랙리스트 요청 DTO
 */
@Data
public class BlacklistRequest {
    private Long userId;
    private Long restaurantId;
    private String userName;
    private String userPhone;
    private String reason;
    private Long reservationId;
    private Long createdBy;
}

