package com.example.choprest.controller;

import com.example.choprest.entity.AdditionalInfo;
import com.example.choprest.repository.AdditionalInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/additional-info")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AdditionalInfoController {
    
    private final AdditionalInfoRepository additionalInfoRepository;
    private final WebClient webClient;
    
    /**
     * 특정 매장의 추가 정보 목록 조회
     * GET /api/additional-info?storeId=1
     */
    @GetMapping
    public ResponseEntity<List<AdditionalInfo>> getAdditionalInfoByStore(@RequestParam Long storeId) {
        log.info("Getting additional info for store: {}", storeId);
        
        try {
            List<AdditionalInfo> additionalInfos = additionalInfoRepository.findByStoreIdOrderBySortOrderAsc(storeId);
            log.info("Found {} additional info items for store: {}", additionalInfos.size(), storeId);
            
            return ResponseEntity.ok(additionalInfos);
        } catch (Exception e) {
            log.error("Error getting additional info for store {}: {}", storeId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 특정 매장의 활성 추가 정보 조회
     * GET /api/additional-info/available?storeId=1
     */
    @GetMapping("/available")
    public ResponseEntity<List<AdditionalInfo>> getAvailableAdditionalInfo(@RequestParam Long storeId) {
        log.info("Getting available additional info for store: {}", storeId);
        
        try {
            List<AdditionalInfo> additionalInfos = additionalInfoRepository.findByStoreIdAndIsAvailableTrueOrderBySortOrderAsc(storeId);
            log.info("Found {} available additional info items for store: {}", additionalInfos.size(), storeId);
            
            return ResponseEntity.ok(additionalInfos);
        } catch (Exception e) {
            log.error("Error getting available additional info for store {}: {}", storeId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 특정 매장의 정보 타입별 조회
     * GET /api/additional-info/type?storeId=1&infoType=PARKING
     */
    @GetMapping("/type")
    public ResponseEntity<List<AdditionalInfo>> getAdditionalInfoByType(
            @RequestParam Long storeId, 
            @RequestParam String infoType) {
        log.info("Getting additional info for store: {} and type: {}", storeId, infoType);
        
        try {
            List<AdditionalInfo> additionalInfos = additionalInfoRepository.findByStoreIdAndInfoTypeOrderBySortOrderAsc(storeId, infoType);
            log.info("Found {} additional info items for store: {} and type: {}", additionalInfos.size(), storeId, infoType);
            
            return ResponseEntity.ok(additionalInfos);
        } catch (Exception e) {
            log.error("Error getting additional info for store {} and type {}: {}", storeId, infoType, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 특정 매장의 정보 타입 목록 조회
     * GET /api/additional-info/types?storeId=1
     */
    @GetMapping("/types")
    public ResponseEntity<List<String>> getInfoTypes(@RequestParam Long storeId) {
        log.info("Getting info types for store: {}", storeId);
        
        try {
            List<String> infoTypes = additionalInfoRepository.findDistinctInfoTypesByStoreId(storeId);
            log.info("Found {} info types for store: {}", infoTypes.size(), storeId);
            
            return ResponseEntity.ok(infoTypes);
        } catch (Exception e) {
            log.error("Error getting info types for store {}: {}", storeId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 특정 추가 정보 상세 조회
     * GET /api/additional-info/{infoId}
     */
    @GetMapping("/{infoId}")
    public ResponseEntity<AdditionalInfo> getAdditionalInfoById(@PathVariable Long infoId) {
        log.info("Getting additional info by id: {}", infoId);
        
        try {
            Optional<AdditionalInfo> additionalInfo = additionalInfoRepository.findById(infoId);
            if (additionalInfo.isPresent()) {
                log.info("Found additional info: {}", additionalInfo.get().getInfoTitle());
                return ResponseEntity.ok(additionalInfo.get());
            } else {
                log.warn("Additional info not found with id: {}", infoId);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error getting additional info by id {}: {}", infoId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}






