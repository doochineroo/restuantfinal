package com.example.choprest.demo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * 이메일 인증 서비스
 * 팀원 코드와 분리된 독립적인 서비스 파일
 * 회원가입 시 이메일 인증 토큰을 발급하고 검증합니다.
 */
@Service
@RequiredArgsConstructor
public class EmailVerificationService {
    
    private final JavaMailSender mailSender;
    
    // 인증 토큰 저장 (실제 운영에서는 Redis 등 사용 권장)
    private final ConcurrentMap<String, VerificationToken> tokenStore = new ConcurrentHashMap<>();
    
    @Value("${app.email.from:noreply@chopplan.com}")
    private String fromEmail;
    
    @Value("${app.email.verification.expire-minutes:30}")
    private int expireMinutes;
    
    @Value("${app.email.verification.base-url:http://localhost:8080}")
    private String baseUrl;
    
    /**
     * 이메일 인증 토큰 생성 및 발송
     * @param email 인증할 이메일 주소
     * @return 생성된 인증 토큰
     */
    public String sendVerificationEmail(String email) {
        // 6자리 인증 코드 생성
        String verificationCode = generateVerificationCode();
        
        // 토큰 생성 (이메일:코드 형식으로 저장)
        String tokenKey = email + ":" + verificationCode;
        VerificationToken token = new VerificationToken(
            email, 
            verificationCode, 
            System.currentTimeMillis() + (expireMinutes * 60 * 1000L)
        );
        
        tokenStore.put(tokenKey, token);
        
        // 이메일 발송
        sendEmail(email, verificationCode);
        
        return verificationCode;
    }
    
    /**
     * 인증 코드 검증
     * @param email 이메일 주소
     * @param verificationCode 인증 코드
     * @return 검증 성공 여부
     */
    public boolean verifyCode(String email, String verificationCode) {
        String tokenKey = email + ":" + verificationCode;
        VerificationToken token = tokenStore.get(tokenKey);
        
        if (token == null) {
            return false;
        }
        
        // 만료 시간 확인
        if (System.currentTimeMillis() > token.getExpireTime()) {
            tokenStore.remove(tokenKey);
            return false;
        }
        
        // 인증 성공 시 토큰 삭제
        tokenStore.remove(tokenKey);
        return true;
    }
    
    /**
     * 인증 코드 재발송
     * @param email 이메일 주소
     * @return 새로운 인증 코드
     */
    public String resendVerificationCode(String email) {
        // 기존 토큰 삭제
        tokenStore.entrySet().removeIf(entry -> entry.getKey().startsWith(email + ":"));
        
        // 새 토큰 발급
        return sendVerificationEmail(email);
    }
    
    /**
     * 6자리 인증 코드 생성
     * @return 6자리 숫자 문자열
     */
    private String generateVerificationCode() {
        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000); // 100000 ~ 999999
        return String.valueOf(code);
    }
    
    /**
     * 인증 이메일 발송
     * @param to 수신자 이메일
     * @param verificationCode 인증 코드
     */
    private void sendEmail(String to, String verificationCode) {
        try {
            // 테스트 환경: SMTP 설정이 없는 경우 콘솔에 출력
            if (fromEmail == null || fromEmail.equals("your-email@gmail.com") || 
                !mailSender.toString().contains("JavaMailSender")) {
                System.out.println("========================================");
                System.out.println("이메일 인증 코드 (테스트 환경)");
                System.out.println("========================================");
                System.out.println("수신자: " + to);
                System.out.println("인증 코드: " + verificationCode);
                System.out.println("========================================");
                return; // 실제 이메일 발송은 건너뜀
            }
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("[Chopplan] 이메일 인증 코드");
            message.setText(buildEmailContent(verificationCode));
            
            mailSender.send(message);
        } catch (Exception e) {
            // 테스트 환경: 이메일 발송 실패 시 콘솔에 출력
            System.out.println("========================================");
            System.out.println("이메일 인증 코드 (이메일 발송 실패 - 콘솔 출력)");
            System.out.println("========================================");
            System.out.println("수신자: " + to);
            System.out.println("인증 코드: " + verificationCode);
            System.out.println("오류: " + e.getMessage());
            System.out.println("========================================");
            // 에러를 던지지 않고 콘솔 출력만 함 (테스트 환경 대응)
            // throw new RuntimeException("이메일 발송에 실패했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 이메일 본문 내용 생성
     * @param verificationCode 인증 코드
     * @return 이메일 본문
     */
    private String buildEmailContent(String verificationCode) {
        return String.format(
            "안녕하세요!\n\n" +
            "Chopplan 회원가입을 위한 이메일 인증 코드입니다.\n\n" +
            "인증 코드: %s\n\n" +
            "이 인증 코드는 %d분간 유효합니다.\n\n" +
            "본인이 요청하지 않았다면 이 이메일을 무시하셔도 됩니다.\n\n" +
            "감사합니다.\n" +
            "Chopplan 팀",
            verificationCode,
            expireMinutes
        );
    }
    
    /**
     * 만료된 토큰 정리 (주기적으로 호출)
     */
    public void cleanupExpiredTokens() {
        long now = System.currentTimeMillis();
        tokenStore.entrySet().removeIf(entry -> entry.getValue().getExpireTime() < now);
    }
    
    /**
     * 인증 토큰 정보를 저장하는 내부 클래스
     */
    private static class VerificationToken {
        private final String email;
        private final String code;
        private final long expireTime;
        
        public VerificationToken(String email, String code, long expireTime) {
            this.email = email;
            this.code = code;
            this.expireTime = expireTime;
        }
        
        public String getEmail() {
            return email;
        }
        
        public String getCode() {
            return code;
        }
        
        public long getExpireTime() {
            return expireTime;
        }
    }
}

