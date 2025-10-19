package com.example.choprest.demo.controller;

import com.example.choprest.demo.dto.BlacklistRequest;
import com.example.choprest.demo.entity.Blacklist;
import com.example.choprest.demo.service.BlacklistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * 블랙리스트 컨트롤러
 */
@RestController
@RequestMapping("/api/demo/blacklist")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class BlacklistController {
    
    private final BlacklistService blacklistService;
    
    @PostMapping
    public ResponseEntity<?> addToBlacklist(@RequestBody BlacklistRequest request) {
        try {
            Blacklist blacklist = blacklistService.addToBlacklist(request);
            return ResponseEntity.ok(blacklist);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<Blacklist>> getRestaurantBlacklist(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(blacklistService.getRestaurantBlacklist(restaurantId));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Blacklist>> getUserBlacklist(@PathVariable Long userId) {
        return ResponseEntity.ok(blacklistService.getUserBlacklist(userId));
    }
    
    @GetMapping("/check/{userId}/{restaurantId}")
    public ResponseEntity<Boolean> isBlacklisted(@PathVariable Long userId, @PathVariable Long restaurantId) {
        return ResponseEntity.ok(blacklistService.isBlacklisted(userId, restaurantId));
    }
    
    @DeleteMapping("/{blacklistId}")
    public ResponseEntity<?> removeFromBlacklist(@PathVariable Long blacklistId) {
        try {
            blacklistService.removeFromBlacklist(blacklistId);
            return ResponseEntity.ok("블랙리스트에서 제거되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

