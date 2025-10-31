package com.example.choprest.demo.dto;

import lombok.Data;

/**
 * 이메일 인증 요청 DTO
 */
@Data
public class EmailVerificationRequest {
    private String email;
}

