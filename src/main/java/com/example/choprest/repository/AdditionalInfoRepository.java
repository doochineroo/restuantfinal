package com.example.choprest.repository;

import com.example.choprest.entity.AdditionalInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdditionalInfoRepository extends JpaRepository<AdditionalInfo, Long> {
    
    List<AdditionalInfo> findByStoreIdOrderBySortOrderAsc(Long storeId);
    
    List<AdditionalInfo> findByStoreIdAndIsAvailableTrueOrderBySortOrderAsc(Long storeId);
    
    List<AdditionalInfo> findByStoreIdAndInfoTypeOrderBySortOrderAsc(Long storeId, String infoType);
    
    @Query("SELECT DISTINCT a.infoType FROM AdditionalInfo a WHERE a.storeId = :storeId AND a.infoType IS NOT NULL ORDER BY a.infoType")
    List<String> findDistinctInfoTypesByStoreId(@Param("storeId") Long storeId);
}
