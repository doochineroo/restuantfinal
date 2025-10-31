package com.example.choprest.demo.controller;

import com.example.choprest.demo.dto.AuthRequest;
import com.example.choprest.demo.dto.AuthResponse;
import com.example.choprest.demo.dto.EmailVerificationRequest;
import com.example.choprest.demo.dto.SignupRequest;
import com.example.choprest.demo.service.AuthService;
import com.example.choprest.demo.service.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 테스트용 인증 컨트롤러 - 데모 종료 시 제거 예정
 */
@RestController
@RequestMapping("/api/demo/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    private final EmailVerificationService emailVerificationService;
    
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        try {
            AuthResponse response = authService.signup(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * 이메일 인증 코드 발송
     */
    @PostMapping("/send-verification")
    public ResponseEntity<?> sendVerificationEmail(@RequestBody EmailVerificationRequest request) {
        try {
            if (request == null || request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("이메일 주소를 입력해주세요.");
            }
            
            String email = request.getEmail().trim();
            
            // 이메일 형식 검증
            if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                return ResponseEntity.badRequest().body("올바른 이메일 형식을 입력해주세요.");
            }
            
            String code = emailVerificationService.sendVerificationEmail(email);
            return ResponseEntity.ok().body("인증 코드가 발송되었습니다. (테스트 환경: " + code + ")");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("이메일 인증 코드 발송에 실패했습니다: " + e.getMessage());
        }
    }
    
    /**
     * 이메일 인증 코드 재발송
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerificationEmail(@RequestBody EmailVerificationRequest request) {
        try {
            if (request == null || request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("이메일 주소를 입력해주세요.");
            }
            
            String email = request.getEmail().trim();
            
            // 이메일 형식 검증
            if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                return ResponseEntity.badRequest().body("올바른 이메일 형식을 입력해주세요.");
            }
            
            String code = emailVerificationService.resendVerificationCode(email);
            return ResponseEntity.ok().body("인증 코드가 재발송되었습니다. (테스트 환경: " + code + ")");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("이메일 인증 코드 재발송에 실패했습니다: " + e.getMessage());
        }
    }
    
    /**
     * 아이디 중복확인
     */
    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        try {
            boolean exists = authService.checkUsernameExists(username);
            if (exists) {
                return ResponseEntity.status(409).body("이미 사용 중인 아이디입니다.");
            }
            return ResponseEntity.ok().body("사용 가능한 아이디입니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

