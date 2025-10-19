package com.example.choprest.demo.service;

import com.example.choprest.demo.dto.ReviewRequest;
import com.example.choprest.demo.entity.Review;
import com.example.choprest.demo.repository.ReviewRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 리뷰 서비스
 */
@Service
@RequiredArgsConstructor
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final ObjectMapper objectMapper;
    
    private static final String UPLOAD_DIR = "uploads/reviews/";
    
    @Transactional
    public Review createReview(ReviewRequest request) {
        try {
            String imagesJson = objectMapper.writeValueAsString(request.getImages());
            
            Review review = Review.builder()
                    .reservationId(request.getReservationId())
                    .userId(request.getUserId())
                    .restaurantId(request.getRestaurantId())
                    .userName(request.getUserName())
                    .rating(request.getRating())
                    .content(request.getContent())
                    .images(imagesJson)
                    .build();
            
            return reviewRepository.save(review);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("이미지 정보 저장 실패", e);
        }
    }
    
    @Transactional(readOnly = true)
    public List<Review> getRestaurantReviews(Long restaurantId) {
        return reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);
    }
    
    @Transactional(readOnly = true)
    public List<Review> getUserReviews(Long userId) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public String uploadImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }
        
        // 파일 확장자 검증
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !isImageFile(originalFilename)) {
            throw new IllegalArgumentException("이미지 파일만 업로드 가능합니다.");
        }
        
        // 파일 크기 검증 (5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("파일 크기는 5MB를 초과할 수 없습니다.");
        }
        
        // 업로드 디렉토리 생성
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // 고유한 파일명 생성
        String fileExtension = getFileExtension(originalFilename);
        String fileName = UUID.randomUUID().toString() + fileExtension;
        Path filePath = uploadPath.resolve(fileName);
        
        // 파일 저장
        Files.copy(file.getInputStream(), filePath);
        
        // URL 반환
        return "/uploads/reviews/" + fileName;
    }
    
    @Transactional
    public Review addOwnerComment(Long reviewId, String comment) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다."));
        
        review.setOwnerComment(comment);
        review.setOwnerCommentAt(LocalDateTime.now());
        
        return reviewRepository.save(review);
    }
    
    private boolean isImageFile(String filename) {
        String extension = getFileExtension(filename).toLowerCase();
        return extension.equals(".jpg") || extension.equals(".jpeg") || 
               extension.equals(".png") || extension.equals(".gif") || 
               extension.equals(".webp");
    }
    
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf(".");
        return lastDotIndex > 0 ? filename.substring(lastDotIndex) : "";
    }
}