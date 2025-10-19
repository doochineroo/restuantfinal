package com.example.batchupdater.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Slf4j
public class ApiRotationService {
    
    private final List<String> apiKeys;
    private final AtomicInteger currentIndex = new AtomicInteger(0);
    
    public ApiRotationService(
            @Value("${kakao.api.key1}") String key1,
            @Value("${kakao.api.key2}") String key2,
            @Value("${kakao.api.key3}") String key3) {
        
        this.apiKeys = List.of(key1, key2, key3);
        log.info("API Rotation Service initialized with {} keys", apiKeys.size());
    }
    
    /**
     * 다음 API 키를 순환하여 반환
     */
    public String getNextApiKey() {
        int index = currentIndex.getAndIncrement() % apiKeys.size();
        String key = apiKeys.get(index);
        log.debug("Using API key index: {} (total: {})", index, apiKeys.size());
        return key;
    }
    
    /**
     * 현재 사용 중인 API 키 인덱스 반환
     */
    public int getCurrentIndex() {
        return currentIndex.get() % apiKeys.size();
    }
    
    /**
     * 사용 가능한 API 키 수 반환
     */
    public int getApiKeyCount() {
        return apiKeys.size();
    }
    
    /**
     * 특정 인덱스의 API 키 반환
     */
    public String getApiKeyByIndex(int index) {
        if (index < 0 || index >= apiKeys.size()) {
            throw new IllegalArgumentException("Invalid API key index: " + index);
        }
        return apiKeys.get(index);
    }
}
