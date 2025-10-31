package com.example.choprest.demo.service;

import com.example.choprest.demo.dto.AuthRequest;
import com.example.choprest.demo.dto.AuthResponse;
import com.example.choprest.demo.dto.SignupRequest;
import com.example.choprest.demo.entity.User;
import com.example.choprest.demo.repository.UserRepository;
import com.example.choprest.service.RestaurantService;
import com.example.choprest.entity.Restaurant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

/**
 * 테스트용 인증 서비스 - 데모 종료 시 제거 예정
 * 실제 운영에서는 Spring Security + JWT를 사용하세요
 * 
 * 비밀번호 해싱과 이메일 인증 기능은 PasswordEncoderService와 EmailVerificationService를 통해 처리됩니다.
 */
@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final RestaurantService restaurantService;
    private final PasswordEncoderService passwordEncoderService;
    private final EmailVerificationService emailVerificationService;
    
    @Transactional
    public AuthResponse signup(SignupRequest request) {
        // 중복 체크
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("이미 존재하는 사용자명입니다.");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }
        
        // 이메일 인증 코드 검증
        if (request.getVerificationCode() == null || request.getVerificationCode().trim().isEmpty()) {
            throw new RuntimeException("이메일 인증 코드를 입력해주세요.");
        }
        
        boolean isEmailVerified = emailVerificationService.verifyCode(
            request.getEmail(), 
            request.getVerificationCode()
        );
        
        if (!isEmailVerified) {
            throw new RuntimeException("이메일 인증 코드가 유효하지 않거나 만료되었습니다.");
        }
        
        // OWNER인 경우 식당 정보 필수
        Restaurant restaurant = null;
        if (request.getRole() == User.UserRole.OWNER) {
            // 옵션 1: 기존 식당 선택
            if (request.getRestaurantId() != null) {
                restaurant = new Restaurant();
                restaurant.setId(request.getRestaurantId());
            }
            // 옵션 2: 새 식당 등록
            else if (request.getRestaurantName() != null && request.getRoadAddress() != null) {
                // 새 식당 생성 (ID는 자동 생성됨)
                restaurant = Restaurant.builder()
                    .restaurantName(request.getRestaurantName())
                    .branchName(request.getBranchName())
                    .roadAddress(request.getRoadAddress())
                    .category(request.getCategory())
                    .status("NORMAL")
                    .lat(request.getLat()) // 위도 추가
                    .lng(request.getLng()) // 경도 추가
                    .regionName(request.getRegionName()) // 지역명 추가
                    .build();
                
                // 데이터베이스에 저장 (ID가 자동으로 생성됨)
                restaurant = restaurantService.updateRestaurant(restaurant);
            }
            else {
                throw new RuntimeException("가게 주인은 기존 식당을 선택하거나 새 식당을 등록해야 합니다.");
            }
        }
        
        // 비밀번호 암호화
        String encodedPassword = passwordEncoderService.encode(request.getPassword());
        
        // 사용자 생성 (비밀번호는 해시값으로 저장, 이메일 인증 완료 상태로 설정)
        User user = User.builder()
                .username(request.getUsername())
                .password(encodedPassword) // BCrypt로 암호화된 비밀번호
                .name(request.getName())
                .email(request.getEmail())
                .emailVerified(true) // 이메일 인증 완료
                .phone(request.getPhone())
                .role(request.getRole())
                .status(User.UserStatus.ACTIVE)
                .restaurant(restaurant)
                .build();
        
        user = userRepository.save(user);
        
        return AuthResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .restaurantId(user.getRestaurant() != null ? user.getRestaurant().getId() : null)
                .token(generateToken(user))
                .build();
    }
    
    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        // 암호화된 비밀번호 비교
        if (!passwordEncoderService.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }
        
        if (user.getStatus() != User.UserStatus.ACTIVE) {
            throw new RuntimeException("계정이 비활성화되었습니다.");
        }
        
        return AuthResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .restaurantId(user.getRestaurant() != null ? user.getRestaurant().getId() : null)
                .token(generateToken(user))
                .build();
    }
    
    /**
     * 아이디 중복확인
     * @param username 확인할 아이디
     * @return 아이디가 존재하면 true, 없으면 false
     */
    @Transactional(readOnly = true)
    public boolean checkUsernameExists(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new RuntimeException("아이디를 입력해주세요.");
        }
        return userRepository.existsByUsername(username);
    }
    
    private String generateToken(User user) {
        // 실제로는 JWT 사용
        return "DEMO_TOKEN_" + UUID.randomUUID().toString();
    }
}

