package com.example.batchupdater.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Slf4j
public class RateLimitService {
    
    private final long delayMs;
    private final int maxRequestsPerMinute;
    private final AtomicInteger requestCount = new AtomicInteger(0);
    private volatile LocalDateTime lastMinuteReset = LocalDateTime.now();
    
    public RateLimitService(
            @Value("${batch.rate-limit.delay-ms:1000}") long delayMs,
            @Value("${batch.rate-limit.max-requests-per-minute:30}") int maxRequestsPerMinute) {
        
        this.delayMs = delayMs;
        this.maxRequestsPerMinute = maxRequestsPerMinute;
        log.info("Rate limit service initialized: {}ms delay, {} requests/minute", delayMs, maxRequestsPerMinute);
    }
    
    /**
     * API 호출 전 레이트 리미팅 체크 및 대기
     */
    public void waitForRateLimit() {
        // 분당 요청 수 체크
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(lastMinuteReset.plusMinutes(1))) {
            requestCount.set(0);
            lastMinuteReset = now;
            log.debug("Rate limit counter reset");
        }
        
        // 분당 최대 요청 수 초과 시 대기
        if (requestCount.get() >= maxRequestsPerMinute) {
            long waitTime = 60 - (now.getSecond() + (now.getNano() / 1_000_000_000L));
            if (waitTime > 0) {
                log.info("Rate limit reached, waiting {} seconds", waitTime);
                try {
                    Thread.sleep((long) (waitTime * 1000));
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    log.warn("Rate limit wait interrupted");
                }
                requestCount.set(0);
                lastMinuteReset = LocalDateTime.now();
            }
        }
        
        // 기본 지연 시간 적용
        try {
            Thread.sleep(delayMs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Rate limit delay interrupted");
        }
        
        // 요청 카운트 증가
        int currentCount = requestCount.incrementAndGet();
        log.debug("API request count: {}/{}", currentCount, maxRequestsPerMinute);
    }
    
    /**
     * 429 에러 발생 시 추가 대기
     */
    public void waitForRetry() {
        log.warn("429 error detected, waiting 60 seconds before retry");
        try {
            Thread.sleep(60000); // 1분 대기
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Retry wait interrupted");
        }
        requestCount.set(0);
        lastMinuteReset = LocalDateTime.now();
    }
    
    /**
     * 현재 요청 카운트 반환
     */
    public int getCurrentRequestCount() {
        return requestCount.get();
    }
}
