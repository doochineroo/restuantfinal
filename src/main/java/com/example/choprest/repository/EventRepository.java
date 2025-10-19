package com.example.choprest.repository;

import com.example.choprest.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    List<Event> findByStoreIdOrderBySortOrderAsc(Long storeId);
    
    List<Event> findByStoreIdAndIsActiveTrueOrderBySortOrderAsc(Long storeId);
    
    @Query("SELECT e FROM Event e WHERE e.storeId = :storeId AND e.isActive = true AND e.startDate <= :currentDate AND e.endDate >= :currentDate ORDER BY e.sortOrder ASC")
    List<Event> findActiveEventsByStoreId(@Param("storeId") Long storeId, @Param("currentDate") LocalDateTime currentDate);
    
    List<Event> findByStoreIdAndIsPopularTrueOrderBySortOrderAsc(Long storeId);
    
    List<Event> findByEventTypeOrderBySortOrderAsc(String eventType);
    
    @Query("SELECT DISTINCT e.eventType FROM Event e WHERE e.storeId = :storeId AND e.eventType IS NOT NULL ORDER BY e.eventType")
    List<String> findDistinctEventTypesByStoreId(@Param("storeId") Long storeId);
}
