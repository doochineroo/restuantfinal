package com.example.choprest.demo.service;

import com.example.choprest.demo.dto.BlacklistRequest;
import com.example.choprest.demo.entity.Blacklist;
import com.example.choprest.demo.repository.BlacklistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * 블랙리스트 서비스
 */
@Service
@RequiredArgsConstructor
public class BlacklistService {
    
    private final BlacklistRepository blacklistRepository;
    
    @Transactional
    public Blacklist addToBlacklist(BlacklistRequest request) {
        // 이미 블랙리스트에 있는지 확인
        if (blacklistRepository.existsByUserIdAndRestaurantId(request.getUserId(), request.getRestaurantId())) {
            throw new RuntimeException("이미 블랙리스트에 등록된 사용자입니다.");
        }
        
        Blacklist blacklist = Blacklist.builder()
                .userId(request.getUserId())
                .restaurantId(request.getRestaurantId())
                .userName(request.getUserName())
                .userPhone(request.getUserPhone())
                .reason(request.getReason())
                .reservationId(request.getReservationId())
                .createdBy(request.getCreatedBy())
                .build();
        
        return blacklistRepository.save(blacklist);
    }
    
    @Transactional(readOnly = true)
    public List<Blacklist> getRestaurantBlacklist(Long restaurantId) {
        return blacklistRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);
    }
    
    @Transactional(readOnly = true)
    public List<Blacklist> getUserBlacklist(Long userId) {
        return blacklistRepository.findByUserId(userId);
    }
    
    @Transactional(readOnly = true)
    public boolean isBlacklisted(Long userId, Long restaurantId) {
        return blacklistRepository.existsByUserIdAndRestaurantId(userId, restaurantId);
    }
    
    @Transactional
    public void removeFromBlacklist(Long blacklistId) {
        blacklistRepository.deleteById(blacklistId);
    }
}

