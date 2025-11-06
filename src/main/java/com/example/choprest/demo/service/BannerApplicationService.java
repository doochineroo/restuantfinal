package com.example.choprest.demo.service;

import com.example.choprest.demo.entity.BannerApplication;
import com.example.choprest.demo.entity.User;
import com.example.choprest.demo.repository.BannerApplicationRepository;
import com.example.choprest.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 배너 신청 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BannerApplicationService {
    
    private final BannerApplicationRepository bannerApplicationRepository;
    private final UserRepository userRepository;
    
    /**
     * 식당별 배너 신청 목록 조회
     */
    @Transactional(readOnly = true)
    public List<BannerApplication> getBannerApplicationsByRestaurantId(Long restaurantId) {
        return bannerApplicationRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);
    }
    
    /**
     * 배너 신청 상세 조회
     */
    @Transactional(readOnly = true)
    public BannerApplication getBannerApplicationById(Long applicationId) {
        return bannerApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("배너 신청을 찾을 수 없습니다."));
    }
    
    /**
     * 배너 신청 작성
     */
    @Transactional
    public BannerApplication createBannerApplication(
            Long ownerId, Long restaurantId, String title, String description, String bannerImageUrl) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        if (owner.getRole() != User.UserRole.OWNER) {
            throw new RuntimeException("가게 주인만 배너를 신청할 수 있습니다.");
        }
        
        BannerApplication application = BannerApplication.builder()
                .ownerId(ownerId)
                .restaurantId(restaurantId)
                .title(title)
                .description(description)
                .bannerImageUrl(bannerImageUrl)
                .status(BannerApplication.ApplicationStatus.PENDING)
                .build();
        
        return bannerApplicationRepository.save(application);
    }
    
    /**
     * 배너 신청 승인
     */
    @Transactional
    public BannerApplication approveBannerApplication(Long applicationId) {
        BannerApplication application = bannerApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("배너 신청을 찾을 수 없습니다."));
        
        application.setStatus(BannerApplication.ApplicationStatus.APPROVED);
        application.setApprovedAt(LocalDateTime.now());
        
        return bannerApplicationRepository.save(application);
    }
    
    /**
     * 배너 신청 거절
     */
    @Transactional
    public BannerApplication rejectBannerApplication(Long applicationId, String rejectionReason) {
        BannerApplication application = bannerApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("배너 신청을 찾을 수 없습니다."));
        
        application.setStatus(BannerApplication.ApplicationStatus.REJECTED);
        application.setRejectionReason(rejectionReason);
        
        return bannerApplicationRepository.save(application);
    }
}

