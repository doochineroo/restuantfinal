package com.example.choprest.demo.dto;

import com.example.choprest.demo.entity.User;
import lombok.Data;

/**
 * 테스트용 회원가입 요청 DTO - 데모 종료 시 제거 예정
 */
@Data
public class SignupRequest {
    private String username;
    private String password;
    private String name;
    private String email;
    private String phone;
    private User.UserRole role;
    
    // OWNER 회원가입 시 기존 식당 선택 (옵션 1)
    private Long restaurantId;
    
    // OWNER 회원가입 시 새 식당 등록 (옵션 2)
    private String restaurantName;
    private String branchName;
    private String roadAddress; // 도로명 주소
    private String category; // 음식 카테고리
    
    // 주소 검색으로 자동 설정되는 필드들
    private Double lat; // 위도
    private Double lng; // 경도
    private String regionName; // 지역명
}

