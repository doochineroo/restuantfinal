package com.example.choprest.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "search_keywords", 
       indexes = {
           @Index(name = "idx_keyword", columnList = "keyword"),
           @Index(name = "idx_search_count", columnList = "search_count DESC"),
           @Index(name = "idx_last_searched", columnList = "last_searched_at DESC"),
           @Index(name = "idx_category", columnList = "category"),
           @Index(name = "idx_region", columnList = "region")
       })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchKeyword {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String keyword;
    
    @Column(name = "search_count")
    private Integer searchCount;
    
    @Column(name = "result_count")
    private Integer resultCount;
    
    @Column(name = "category", length = 50)
    private String category;
    
    @Column(name = "region", length = 100)
    private String region;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "search_type", length = 20)
    private String searchType; // KEYWORD, CATEGORY, REGION, NEARBY
    
    @Column(name = "last_searched_at")
    private LocalDateTime lastSearchedAt;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (lastSearchedAt == null) {
            lastSearchedAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (searchCount == null) {
            searchCount = 1;
        }
        if (resultCount == null) {
            resultCount = 0;
        }
        if (searchType == null) {
            searchType = "KEYWORD";
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        lastSearchedAt = LocalDateTime.now();
    }
}


