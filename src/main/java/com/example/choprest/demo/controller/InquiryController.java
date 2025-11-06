package com.example.choprest.demo.controller;

import com.example.choprest.demo.entity.Inquiry;
import com.example.choprest.demo.service.InquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 1:1 문의 컨트롤러
 */
@RestController
@RequestMapping("/api/demo/inquiries")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class InquiryController {
    
    private final InquiryService inquiryService;
    
    /**
     * 가게 주인별 문의 목록 조회
     */
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<Inquiry>> getInquiriesByOwner(@PathVariable Long ownerId) {
        return ResponseEntity.ok(inquiryService.getInquiriesByOwnerId(ownerId));
    }
    
    /**
     * 문의 상세 조회
     */
    @GetMapping("/{inquiryId}")
    public ResponseEntity<Inquiry> getInquiry(@PathVariable Long inquiryId) {
        return ResponseEntity.ok(inquiryService.getInquiryById(inquiryId));
    }
    
    /**
     * 문의 작성
     */
    @PostMapping
    public ResponseEntity<Inquiry> createInquiry(@RequestBody Map<String, Object> request) {
        Long ownerId = Long.valueOf(request.get("ownerId").toString());
        String title = (String) request.get("title");
        String content = (String) request.get("content");
        Long restaurantId = request.get("restaurantId") != null 
            ? Long.valueOf(request.get("restaurantId").toString()) 
            : null;
        
        Inquiry inquiry = inquiryService.createInquiry(ownerId, title, content, restaurantId);
        return ResponseEntity.ok(inquiry);
    }
    
    /**
     * 관리자 답변 작성 (관리자 전용)
     */
    @PostMapping("/{inquiryId}/reply")
    public ResponseEntity<Inquiry> replyToInquiry(
            @PathVariable Long inquiryId,
            @RequestBody Map<String, String> request) {
        String adminReply = request.get("adminReply");
        Inquiry inquiry = inquiryService.replyToInquiry(inquiryId, adminReply);
        return ResponseEntity.ok(inquiry);
    }
}

