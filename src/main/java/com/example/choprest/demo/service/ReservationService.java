package com.example.choprest.demo.service;

import com.example.choprest.demo.dto.ReservationRequest;
import com.example.choprest.demo.dto.VisitStatusRequest;
import com.example.choprest.demo.entity.Reservation;
import com.example.choprest.demo.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * 테스트용 예약 서비스 - 데모 종료 시 제거 예정
 */
@Service
@RequiredArgsConstructor
public class ReservationService {
    
    private final ReservationRepository reservationRepository;
    
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
        return reservationRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);
    }
    
    @Transactional(readOnly = true)
    public List<Reservation> getOwnerReservations(Long userId, Long restaurantId) {
        // 가게 주인의 식당 예약만 조회
        return reservationRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);
    }
    
    @Transactional(readOnly = true)
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Reservation getReservationById(Long reservationId) {
        return reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다."));
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
        }
        
        return reservationRepository.save(reservation);
    }
    
    @Transactional(readOnly = true)
    public List<Reservation> getReservationsByVisitStatus(Reservation.VisitStatus visitStatus) {
        return reservationRepository.findByVisitStatusOrderByCreatedAtDesc(visitStatus);
    }
    
    @Transactional(readOnly = true)
    public List<Reservation> getBlacklistedReservations() {
        return reservationRepository.findByIsBlacklistedTrueOrderByCreatedAtDesc();
    }
}

