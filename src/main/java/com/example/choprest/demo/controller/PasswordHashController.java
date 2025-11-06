package com.example.choprest.demo.controller;

import com.example.choprest.demo.service.PasswordEncoderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 비밀번호 해시 생성용 컨트롤러 (개발/테스트용)
 * 프로덕션 환경에서는 제거하거나 보안을 강화해야 합니다.
 */
@RestController
@RequestMapping("/api/demo/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PasswordHashController {
    
    private final PasswordEncoderService passwordEncoderService;
    
    /**
     * 비밀번호 해시 생성 (개발/테스트용)
     * POST /api/demo/auth/generate-hash
     * Body: {"password": "원하는비밀번호"}
     */
    @PostMapping("/generate-hash")
    public Map<String, Object> generateHash(@RequestBody Map<String, String> request) {
        String password = request.get("password");
        if (password == null || password.trim().isEmpty()) {
            throw new RuntimeException("비밀번호를 입력해주세요.");
        }
        
        String hashedPassword = passwordEncoderService.encode(password);
        
        Map<String, Object> response = new HashMap<>();
        response.put("originalPassword", password);
        response.put("hashedPassword", hashedPassword);
        response.put("sql", String.format(
            "UPDATE demo_users SET password = '%s' WHERE username = 'admin';",
            hashedPassword
        ));
        
        return response;
    }
    
    /**
     * 비밀번호 해시 검증 (개발/테스트용)
     * POST /api/demo/auth/verify-hash
     * Body: {"password": "테스트할비밀번호", "hash": "해시값"}
     */
    @PostMapping("/verify-hash")
    public Map<String, Object> verifyHash(@RequestBody Map<String, String> request) {
        String password = request.get("password");
        String hash = request.get("hash");
        
        if (password == null || hash == null) {
            throw new RuntimeException("비밀번호와 해시값을 모두 입력해주세요.");
        }
        
        boolean matches = passwordEncoderService.matches(password, hash);
        
        Map<String, Object> response = new HashMap<>();
        response.put("password", password);
        response.put("hash", hash);
        response.put("matches", matches);
        response.put("message", matches ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다.");
        
        return response;
    }
}

