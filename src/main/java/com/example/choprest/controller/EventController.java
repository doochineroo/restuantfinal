package com.example.choprest.controller;

import com.example.choprest.entity.Event;
import com.example.choprest.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class EventController {
    
    private final EventRepository eventRepository;
    private final WebClient webClient;
    
    /**
     * 특정 매장의 이벤트 목록 조회
     * GET /api/events?storeId=1
     */
    @GetMapping
    public ResponseEntity<List<Event>> getEventsByStore(@RequestParam Long storeId) {
        log.info("Getting events for store: {}", storeId);
        
        try {
            List<Event> events = eventRepository.findByStoreIdOrderBySortOrderAsc(storeId);
            log.info("Found {} events for store: {}", events.size(), storeId);
            
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            log.error("Error getting events for store {}: {}", storeId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 특정 매장의 활성 이벤트 조회
     * GET /api/events/active?storeId=1
     */
    @GetMapping("/active")
    public ResponseEntity<List<Event>> getActiveEvents(@RequestParam Long storeId) {
        log.info("Getting active events for store: {}", storeId);
        
        try {
            List<Event> events = eventRepository.findActiveEventsByStoreId(storeId, LocalDateTime.now());
            log.info("Found {} active events for store: {}", events.size(), storeId);
            
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            log.error("Error getting active events for store {}: {}", storeId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 특정 매장의 인기 이벤트 조회
     * GET /api/events/popular?storeId=1
     */
    @GetMapping("/popular")
    public ResponseEntity<List<Event>> getPopularEvents(@RequestParam Long storeId) {
        log.info("Getting popular events for store: {}", storeId);
        
        try {
            List<Event> events = eventRepository.findByStoreIdAndIsPopularTrueOrderBySortOrderAsc(storeId);
            log.info("Found {} popular events for store: {}", events.size(), storeId);
            
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            log.error("Error getting popular events for store {}: {}", storeId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 특정 매장의 이벤트 타입별 조회
     * GET /api/events/type?storeId=1&eventType=DISCOUNT
     */
    @GetMapping("/type")
    public ResponseEntity<List<Event>> getEventsByType(
            @RequestParam Long storeId, 
            @RequestParam String eventType) {
        log.info("Getting events for store: {} and type: {}", storeId, eventType);
        
        try {
            List<Event> events = eventRepository.findByEventTypeOrderBySortOrderAsc(eventType);
            // 매장별로 필터링
            events = events.stream()
                    .filter(event -> event.getStoreId().equals(storeId))
                    .toList();
            
            log.info("Found {} events for store: {} and type: {}", events.size(), storeId, eventType);
            
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            log.error("Error getting events for store {} and type {}: {}", storeId, eventType, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 특정 매장의 이벤트 타입 목록 조회
     * GET /api/events/types?storeId=1
     */
    @GetMapping("/types")
    public ResponseEntity<List<String>> getEventTypes(@RequestParam Long storeId) {
        log.info("Getting event types for store: {}", storeId);
        
        try {
            List<String> eventTypes = eventRepository.findDistinctEventTypesByStoreId(storeId);
            log.info("Found {} event types for store: {}", eventTypes.size(), storeId);
            
            return ResponseEntity.ok(eventTypes);
        } catch (Exception e) {
            log.error("Error getting event types for store {}: {}", storeId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 특정 이벤트 상세 조회
     * GET /api/events/{eventId}
     */
    @GetMapping("/{eventId}")
    public ResponseEntity<Event> getEventById(@PathVariable Long eventId) {
        log.info("Getting event by id: {}", eventId);
        
        try {
            Optional<Event> event = eventRepository.findById(eventId);
            if (event.isPresent()) {
                log.info("Found event: {}", event.get().getEventName());
                return ResponseEntity.ok(event.get());
            } else {
                log.warn("Event not found with id: {}", eventId);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error getting event by id {}: {}", eventId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}









