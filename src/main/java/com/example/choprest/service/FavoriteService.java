package com.example.choprest.service;

import com.example.choprest.entity.Restaurant;
import com.example.choprest.entity.UserFavorite;
import com.example.choprest.repository.RestaurantRepository;
import com.example.choprest.repository.UserFavoriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 찜 서비스
 */
@Service
@RequiredArgsConstructor
public class FavoriteService {
    
    private final UserFavoriteRepository favoriteRepository;
    private final RestaurantRepository restaurantRepository;
    
    /**
     * 찜 추가
     */
    @Transactional
    public void addFavorite(Long userId, Long restaurantId) {
        if (!favoriteRepository.existsByUserIdAndRestaurantId(userId, restaurantId)) {
            UserFavorite favorite = UserFavorite.builder()
                    .userId(userId)
                    .restaurantId(restaurantId)
                    .build();
            favoriteRepository.save(favorite);
        }
    }
    
    /**
     * 찜 제거
     */
    @Transactional
    public void removeFavorite(Long userId, Long restaurantId) {
        favoriteRepository.deleteByUserIdAndRestaurantId(userId, restaurantId);
    }
    
    /**
     * 찜 토글
     */
    @Transactional
    public boolean toggleFavorite(Long userId, Long restaurantId) {
        if (favoriteRepository.existsByUserIdAndRestaurantId(userId, restaurantId)) {
            favoriteRepository.deleteByUserIdAndRestaurantId(userId, restaurantId);
            return false; // 제거됨
        } else {
            addFavorite(userId, restaurantId);
            return true; // 추가됨
        }
    }
    
    /**
     * 사용자의 찜 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Restaurant> getUserFavorites(Long userId) {
        List<Long> restaurantIds = favoriteRepository.findByUserId(userId)
                .stream()
                .map(UserFavorite::getRestaurantId)
                .collect(Collectors.toList());
        
        return restaurantRepository.findAllById(restaurantIds);
    }
    
    /**
     * 찜 여부 확인
     */
    @Transactional(readOnly = true)
    public boolean isFavorite(Long userId, Long restaurantId) {
        return favoriteRepository.existsByUserIdAndRestaurantId(userId, restaurantId);
    }
}


