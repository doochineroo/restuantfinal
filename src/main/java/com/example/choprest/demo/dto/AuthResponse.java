package com.example.choprest.demo.dto;

import com.example.choprest.demo.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

/**
 * 테스트용 인증 응답 DTO - 데모 종료 시 제거 예정
 */
@Data
@Builder
@AllArgsConstructor
public class AuthResponse {
    private Long userId;
    private String username;
    private String name;
    private String email;
    private String phone;
    private User.UserRole role;
    private Long restaurantId;
    private String token; // 간단한 세션 토큰
}

