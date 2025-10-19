package com.example.choprest.repository;

import com.example.choprest.entity.SearchKeyword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SearchKeywordRepository extends JpaRepository<SearchKeyword, Long> {
    
    Optional<SearchKeyword> findByKeyword(String keyword);
    
    Optional<SearchKeyword> findByKeywordAndUserId(String keyword, Long userId);
    
    // 인기 검색어 (최근 30일, 검색 횟수 순)
    @Query("SELECT sk FROM SearchKeyword sk " +
           "WHERE sk.lastSearchedAt >= :since " +
           "ORDER BY sk.searchCount DESC")
    List<SearchKeyword> findPopularKeywords(LocalDateTime since);
    
    // 카테고리별 인기 검색어
    @Query("SELECT sk FROM SearchKeyword sk " +
           "WHERE sk.lastSearchedAt >= :since " +
           "AND sk.category = :category " +
           "ORDER BY sk.searchCount DESC")
    List<SearchKeyword> findPopularKeywordsByCategory(@Param("since") LocalDateTime since, 
                                                      @Param("category") String category);
    
    // 지역별 인기 검색어
    @Query("SELECT sk FROM SearchKeyword sk " +
           "WHERE sk.lastSearchedAt >= :since " +
           "AND sk.region = :region " +
           "ORDER BY sk.searchCount DESC")
    List<SearchKeyword> findPopularKeywordsByRegion(@Param("since") LocalDateTime since, 
                                                    @Param("region") String region);
    
    // 검색 타입별 인기 검색어
    @Query("SELECT sk FROM SearchKeyword sk " +
           "WHERE sk.lastSearchedAt >= :since " +
           "AND sk.searchType = :searchType " +
           "ORDER BY sk.searchCount DESC")
    List<SearchKeyword> findPopularKeywordsByType(@Param("since") LocalDateTime since, 
                                                  @Param("searchType") String searchType);
    
    // 사용자별 검색 기록
    @Query("SELECT sk FROM SearchKeyword sk " +
           "WHERE sk.userId = :userId " +
           "ORDER BY sk.lastSearchedAt DESC")
    List<SearchKeyword> findUserSearchHistory(@Param("userId") Long userId);
    
    // 검색 결과가 많은 키워드 (성공적인 검색)
    @Query("SELECT sk FROM SearchKeyword sk " +
           "WHERE sk.lastSearchedAt >= :since " +
           "AND sk.resultCount > 0 " +
           "ORDER BY sk.resultCount DESC, sk.searchCount DESC")
    List<SearchKeyword> findSuccessfulKeywords(@Param("since") LocalDateTime since);
    
    // 검색 결과가 없는 키워드 (실패한 검색)
    @Query("SELECT sk FROM SearchKeyword sk " +
           "WHERE sk.lastSearchedAt >= :since " +
           "AND sk.resultCount = 0 " +
           "ORDER BY sk.searchCount DESC")
    List<SearchKeyword> findFailedKeywords(@Param("since") LocalDateTime since);
    
    // 최근 검색어 (시간순)
    @Query("SELECT sk FROM SearchKeyword sk " +
           "WHERE sk.lastSearchedAt >= :since " +
           "ORDER BY sk.lastSearchedAt DESC")
    List<SearchKeyword> findRecentKeywords(LocalDateTime since);
    
    // 검색어 자동완성을 위한 키워드 검색
    @Query("SELECT sk.keyword FROM SearchKeyword sk " +
           "WHERE sk.keyword LIKE %:keyword% " +
           "ORDER BY sk.searchCount DESC")
    List<String> findKeywordsContaining(@Param("keyword") String keyword);
}


