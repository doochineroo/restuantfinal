package com.example.choprest.demo.service;

import com.example.choprest.demo.dto.ReservationRequest;
import com.example.choprest.demo.dto.VisitStatusRequest;
import com.example.choprest.demo.entity.Reservation;
import com.example.choprest.demo.entity.User;
import com.example.choprest.demo.repository.ReservationRepository;
import com.example.choprest.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 테스트용 예약 서비스 - 데모 종료 시 제거 예정
 */
@Service
@RequiredArgsConstructor
public class ReservationService {
    
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public Reservation createReservation(ReservationRequest request) {
        Reservation reservation = Reservation.builder()
                .userId(request.getUserId())
                .restaurantId(request.getRestaurantId())
                .restaurantName(request.getRestaurantName())
                .userName(request.getUserName())
                .userPhone(request.getUserPhone())
                .userEmail(request.getUserEmail())
                .reservationDate(request.getReservationDate())
                .reservationTime(request.getReservationTime())
                .guests(request.getGuests())
                .specialRequests(request.getSpecialRequests())
                .status(Reservation.ReservationStatus.PENDING)
                .build();
        
        return reservationRepository.save(reservation);
    }
    
    @Transactional(readOnly = true)
    public List<Reservation> getUserReservations(Long userId) {
        System.out.println("getUserReservations 호출됨 - userId: " + userId);
        
        // 먼저 기본 메서드 시도
        List<Reservation> reservations = reservationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        System.out.println("기본 메서드로 조회된 예약 수: " + reservations.size());
        
        // 만약 결과가 없으면 직접 쿼리 시도
        if (reservations.isEmpty()) {
            System.out.println("기본 메서드 결과가 없어서 직접 쿼리 시도");
            reservations = reservationRepository.findUserReservationsWithQuery(userId);
            System.out.println("직접 쿼리로 조회된 예약 수: " + reservations.size());
        }
        
        for (Reservation r : reservations) {
            System.out.println("예약 ID: " + r.getId() + ", 상태: " + r.getStatus() + ", 방문상태: " + r.getVisitStatus());
        }
        return reservations;
    }
    
    @Transactional(readOnly = true)
    public List<Reservation> getRestaurantReservations(Long restaurantId) {
        // 식당 ID로 예약 조회
        List<Reservation> reservations = reservationRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);
        // 각 예약에 사용자 닉네임 설정
        return enrichReservationsWithUserNickname(reservations);
    }
    
    @Transactional(readOnly = true)
    public List<Reservation> getOwnerReservations(Long userId, Long restaurantId) {
        // 가게 주인의 식당 예약만 조회
        List<Reservation> reservations = reservationRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);
        // 각 예약에 사용자 닉네임 설정
        return enrichReservationsWithUserNickname(reservations);
    }
    
    @Transactional(readOnly = true)
    public List<Reservation> getAllReservations() {
        List<Reservation> reservations = reservationRepository.findAll();
        // 각 예약에 사용자 닉네임 설정
        return enrichReservationsWithUserNickname(reservations);
    }
    
    @Transactional(readOnly = true)
    public Reservation getReservationById(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다."));
        // 사용자 닉네임 설정
        try {
            User user = userRepository.findById(reservation.getUserId()).orElse(null);
            if (user != null && user.getName() != null) {
                reservation.setUserName(user.getName());
            }
        } catch (Exception e) {
            // 사용자 조회 실패 시 기존 userName 유지
        }
        return reservation;
    }
    
    @Transactional
    public Reservation approveReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다."));
        
        reservation.setStatus(Reservation.ReservationStatus.APPROVED);
        return reservationRepository.save(reservation);
    }
    
    @Transactional
    public Reservation rejectReservation(Long reservationId, String reason) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다."));
        
        reservation.setStatus(Reservation.ReservationStatus.REJECTED);
        reservation.setRejectionReason(reason);
        return reservationRepository.save(reservation);
    }
    
    @Transactional
    public Reservation updateReservationStatus(Long reservationId, String status, String reason) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다."));
        
        // String을 ReservationStatus enum으로 변환
        Reservation.ReservationStatus reservationStatus;
        try {
            reservationStatus = Reservation.ReservationStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("유효하지 않은 예약 상태입니다: " + status);
        }
        
        reservation.setStatus(reservationStatus);
        
        // 거절인 경우 사유 설정
        if (reservationStatus == Reservation.ReservationStatus.REJECTED && reason != null && !reason.isEmpty()) {
            reservation.setRejectionReason(reason);
        }
        
        return reservationRepository.save(reservation);
    }
    
    @Transactional
    public Reservation cancelReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다."));
        
        // PENDING 상태면 즉시 취소, APPROVED 상태면 취소 요청 대기로 변경
        if (reservation.getStatus() == Reservation.ReservationStatus.PENDING) {
            reservation.setStatus(Reservation.ReservationStatus.CANCELLED);
        } else if (reservation.getStatus() == Reservation.ReservationStatus.APPROVED) {
            reservation.setStatus(Reservation.ReservationStatus.CANCELLED_PENDING);
        } else {
            throw new RuntimeException("취소할 수 없는 예약 상태입니다.");
        }
        
        return reservationRepository.save(reservation);
    }
    
    @Transactional
    public Reservation approveCancellation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다."));
        
        if (reservation.getStatus() != Reservation.ReservationStatus.CANCELLED_PENDING) {
            throw new RuntimeException("취소 요청 대기 상태가 아닙니다.");
        }
        
        reservation.setStatus(Reservation.ReservationStatus.CANCELLED);
        return reservationRepository.save(reservation);
    }
    
    @Transactional
    public Reservation rejectCancellation(Long reservationId, String reason) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다."));
        
        if (reservation.getStatus() != Reservation.ReservationStatus.CANCELLED_PENDING) {
            throw new RuntimeException("취소 요청 대기 상태가 아닙니다.");
        }
        
        reservation.setStatus(Reservation.ReservationStatus.APPROVED);
        reservation.setRejectionReason(reason);
        return reservationRepository.save(reservation);
    }
    
    @Transactional
    public Reservation updateVisitStatus(VisitStatusRequest request) {
        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다."));
        
        // String을 VisitStatus enum으로 변환
        Reservation.VisitStatus visitStatus = Reservation.VisitStatus.valueOf(request.getVisitStatus().toUpperCase());
        reservation.setVisitStatus(visitStatus);
        
        // 방문 상태가 VISITED로 변경되면 예약 상태도 COMPLETED로 변경
        if (visitStatus == Reservation.VisitStatus.VISITED) {
            reservation.setStatus(Reservation.ReservationStatus.COMPLETED);
            reservation.setVisitConfirmedAt(java.time.LocalDateTime.now());
        }
        
        // NO_SHOW인 경우 사유 저장
        if (visitStatus == Reservation.VisitStatus.NO_SHOW && request.getReason() != null && !request.getReason().isEmpty()) {
            reservation.setNoShowReason(request.getReason());
        }
        
        // BLACKLISTED인 경우 블랙리스트 플래그 및 사유 설정
        if (visitStatus == Reservation.VisitStatus.BLACKLISTED) {
            reservation.setIsBlacklisted(true);
            if (request.getReason() != null && !request.getReason().isEmpty()) {
                reservation.setBlacklistReason(request.getReason());
            }
        } else {
            // 다른 상태로 변경되면 블랙리스트 플래그 해제 (필요한 경우)
            // reservation.setIsBlacklisted(false);
        }
        
        return reservationRepository.save(reservation);
    }
    
    @Transactional(readOnly = true)
    public List<Reservation> getReservationsByVisitStatus(Reservation.VisitStatus visitStatus) {
        List<Reservation> reservations = reservationRepository.findByVisitStatusOrderByCreatedAtDesc(visitStatus);
        // 각 예약에 사용자 닉네임 설정
        return enrichReservationsWithUserNickname(reservations);
    }
    
    @Transactional(readOnly = true)
    public List<Reservation> getBlacklistedReservations() {
        List<Reservation> reservations = reservationRepository.findByIsBlacklistedTrueOrderByCreatedAtDesc();
        // 각 예약에 사용자 닉네임 설정
        return enrichReservationsWithUserNickname(reservations);
    }
    
    /**
     * 예약 리스트에 사용자 닉네임 정보를 추가합니다
     */
    private List<Reservation> enrichReservationsWithUserNickname(List<Reservation> reservations) {
        return reservations.stream().map(reservation -> {
            try {
                User user = userRepository.findById(reservation.getUserId()).orElse(null);
                if (user != null && user.getName() != null) {
                    // userName에 사용자 닉네임 설정 (기존 userName은 유지하고, 프론트엔드에서 사용할 수 있도록)
                    // 또는 userName을 닉네임으로 업데이트 (기존 값이 예약 생성 시 입력한 이름이므로)
                    // 여기서는 userName을 닉네임으로 업데이트하되, 기존 값을 보존하려면 별도 필드가 필요
                    // 임시로 userName을 닉네임으로 설정 (실제로는 별도 필드가 더 나음)
                    reservation.setUserName(user.getName());
                }
            } catch (Exception e) {
                // 사용자 조회 실패 시 기존 userName 유지
            }
            return reservation;
        }).collect(Collectors.toList());
    }
}

