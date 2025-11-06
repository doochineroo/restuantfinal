package com.example.choprest.demo.service;

import com.example.choprest.demo.entity.Inquiry;
import com.example.choprest.demo.entity.User;
import com.example.choprest.demo.repository.InquiryRepository;
import com.example.choprest.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 1:1 문의 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InquiryService {
    
    private final InquiryRepository inquiryRepository;
    private final UserRepository userRepository;
    
    /**
     * 가게 주인별 문의 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Inquiry> getInquiriesByOwnerId(Long ownerId) {
        return inquiryRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId);
    }
    
    /**
     * 문의 상세 조회
     */
    @Transactional(readOnly = true)
    public Inquiry getInquiryById(Long inquiryId) {
        return inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("문의를 찾을 수 없습니다."));
    }
    
    /**
     * 문의 작성
     */
    @Transactional
    public Inquiry createInquiry(Long ownerId, String title, String content, Long restaurantId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        if (owner.getRole() != User.UserRole.OWNER) {
            throw new RuntimeException("가게 주인만 문의를 작성할 수 있습니다.");
        }
        
        Inquiry inquiry = Inquiry.builder()
                .ownerId(ownerId)
                .restaurantId(restaurantId)
                .title(title)
                .content(content)
                .status(Inquiry.InquiryStatus.PENDING)
                .build();
        
        return inquiryRepository.save(inquiry);
    }
    
    /**
     * 관리자 답변 작성
     */
    @Transactional
    public Inquiry replyToInquiry(Long inquiryId, String adminReply) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("문의를 찾을 수 없습니다."));
        
        inquiry.setAdminReply(adminReply);
        inquiry.setStatus(Inquiry.InquiryStatus.ANSWERED);
        inquiry.setRepliedAt(LocalDateTime.now());
        
        return inquiryRepository.save(inquiry);
    }
}

