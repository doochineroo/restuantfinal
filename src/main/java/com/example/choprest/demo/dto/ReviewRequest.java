package com.example.choprest.demo.dto;

import lombok.Data;
import java.util.List;

/**
 * 리뷰 작성 요청 DTO
 */
@Data
public class ReviewRequest {
    private Long reservationId;
    private Long userId;
    private Long restaurantId;
    private String userName;
    private Integer rating;
    private String content;
    private List<String> images;
}