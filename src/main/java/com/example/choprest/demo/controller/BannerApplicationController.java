package com.example.choprest.demo.controller;

import com.example.choprest.demo.entity.BannerApplication;
import com.example.choprest.demo.service.BannerApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 배너 신청 컨트롤러
 */
@RestController
@RequestMapping("/api/demo/banner-applications")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class BannerApplicationController {
    
    private final BannerApplicationService bannerApplicationService;
    
    /**
     * 식당별 배너 신청 목록 조회
     */
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<BannerApplication>> getBannerApplicationsByRestaurant(
            @PathVariable Long restaurantId) {
        return ResponseEntity.ok(bannerApplicationService.getBannerApplicationsByRestaurantId(restaurantId));
    }
    
    /**
     * 배너 신청 상세 조회
     */
    @GetMapping("/{applicationId}")
    public ResponseEntity<BannerApplication> getBannerApplication(@PathVariable Long applicationId) {
        return ResponseEntity.ok(bannerApplicationService.getBannerApplicationById(applicationId));
    }
    
    /**
     * 배너 신청 작성
     */
    @PostMapping
    public ResponseEntity<BannerApplication> createBannerApplication(@RequestBody Map<String, Object> request) {
        Long ownerId = Long.valueOf(request.get("ownerId").toString());
        Long restaurantId = Long.valueOf(request.get("restaurantId").toString());
        String title = (String) request.get("title");
        String description = (String) request.get("description");
        String bannerImageUrl = (String) request.get("bannerImageUrl");
        
        BannerApplication application = bannerApplicationService.createBannerApplication(
            ownerId, restaurantId, title, description, bannerImageUrl);
        return ResponseEntity.ok(application);
    }
    
    /**
     * 배너 신청 승인 (관리자 전용)
     */
    @PostMapping("/{applicationId}/approve")
    public ResponseEntity<BannerApplication> approveBannerApplication(@PathVariable Long applicationId) {
        BannerApplication application = bannerApplicationService.approveBannerApplication(applicationId);
        return ResponseEntity.ok(application);
    }
    
    /**
     * 배너 신청 거절 (관리자 전용)
     */
    @PostMapping("/{applicationId}/reject")
    public ResponseEntity<BannerApplication> rejectBannerApplication(
            @PathVariable Long applicationId,
            @RequestBody Map<String, String> request) {
        String rejectionReason = request.get("rejectionReason");
        BannerApplication application = bannerApplicationService.rejectBannerApplication(applicationId, rejectionReason);
        return ResponseEntity.ok(application);
    }
}

