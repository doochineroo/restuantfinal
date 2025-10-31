package com.example.choprest.demo.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * 비밀번호 암호화 서비스
 * 팀원 코드와 분리된 독립적인 서비스 파일
 * BCrypt를 사용하여 비밀번호를 안전하게 해싱합니다.
 */
@Service
public class PasswordEncoderService {
    
    private final PasswordEncoder passwordEncoder;
    
    public PasswordEncoderService() {
        // BCryptPasswordEncoder 생성
        // strength는 10-12가 권장값 (기본값은 10)
        this.passwordEncoder = new BCryptPasswordEncoder(12);
    }
    
    /**
     * 평문 비밀번호를 해시값으로 변환
     * @param rawPassword 평문 비밀번호
     * @return 해시된 비밀번호
     */
    public String encode(String rawPassword) {
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("비밀번호는 필수입니다.");
        }
        return passwordEncoder.encode(rawPassword);
    }
    
    /**
     * 평문 비밀번호와 해시된 비밀번호를 비교
     * @param rawPassword 평문 비밀번호
     * @param encodedPassword 해시된 비밀번호
     * @return 일치하면 true, 아니면 false
     */
    public boolean matches(String rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null) {
            return false;
        }
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
    
    /**
     * 비밀번호가 해시값인지 확인
     * BCrypt 해시는 항상 $2a$, $2b$, $2y$로 시작
     * @param password 확인할 비밀번호 문자열
     * @return 해시값이면 true
     */
    public boolean isEncoded(String password) {
        if (password == null) {
            return false;
        }
        return password.startsWith("$2a$") || 
               password.startsWith("$2b$") || 
               password.startsWith("$2y$");
    }
}

