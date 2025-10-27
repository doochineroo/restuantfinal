package com.example.choprest.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/proxy")
@Slf4j
@CrossOrigin(origins = "*")
public class ImageProxyController {
    
    private final WebClient webClient;
    
    public ImageProxyController(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }
    
    /**
     * 이미지 프록시 - 외부 이미지를 프록시를 통해 제공
     * GET /api/proxy/image?url=이미지URL
     */
    @GetMapping("/image")
    public Mono<ResponseEntity<byte[]>> proxyImage(@RequestParam String url) {
        log.info("Image proxy request for URL: {}", url);
        
        try {
            // URL 인코딩
            String encodedUrl = URLEncoder.encode(url, StandardCharsets.UTF_8.toString());
            
            return webClient.get()
                    .uri(encodedUrl)
                    .retrieve()
                    .toEntity(byte[].class)
                    .map(response -> {
                        HttpHeaders headers = new HttpHeaders();
                        headers.setContentType(MediaType.IMAGE_JPEG);
                        headers.setCacheControl("public, max-age=3600"); // 1시간 캐시
                        headers.set("Access-Control-Allow-Origin", "*");
                        
                        return ResponseEntity.ok()
                                .headers(headers)
                                .body(response.getBody());
                    })
                    .onErrorReturn(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
                    
        } catch (Exception e) {
            log.error("Error proxying image: {}", e.getMessage());
            return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
        }
    }
    
    /**
     * 썸네일 프록시 - 썸네일 이미지를 프록시를 통해 제공
     * GET /api/proxy/thumbnail?url=이미지URL&width=200&height=150
     */
    @GetMapping("/thumbnail")
    public Mono<ResponseEntity<byte[]>> proxyThumbnail(
            @RequestParam String url,
            @RequestParam(defaultValue = "200") int width,
            @RequestParam(defaultValue = "150") int height) {
        
        log.info("Thumbnail proxy request for URL: {}, size: {}x{}", url, width, height);
        
        try {
            // URL에 크기 파라미터 추가 (Unsplash의 경우)
            String thumbnailUrl = url;
            if (url.contains("unsplash.com")) {
                thumbnailUrl = url + "?w=" + width + "&h=" + height + "&fit=crop";
            } else if (url.contains("placeholder.com")) {
                thumbnailUrl = url.replace("400x300", width + "x" + height);
            }
            
            String encodedUrl = URLEncoder.encode(thumbnailUrl, StandardCharsets.UTF_8.toString());
            
            return webClient.get()
                    .uri(encodedUrl)
                    .retrieve()
                    .toEntity(byte[].class)
                    .map(response -> {
                        HttpHeaders headers = new HttpHeaders();
                        headers.setContentType(MediaType.IMAGE_JPEG);
                        headers.setCacheControl("public, max-age=7200"); // 2시간 캐시
                        headers.set("Access-Control-Allow-Origin", "*");
                        
                        return ResponseEntity.ok()
                                .headers(headers)
                                .body(response.getBody());
                    })
                    .onErrorReturn(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
                    
        } catch (Exception e) {
            log.error("Error proxying thumbnail: {}", e.getMessage());
            return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
        }
    }
}






