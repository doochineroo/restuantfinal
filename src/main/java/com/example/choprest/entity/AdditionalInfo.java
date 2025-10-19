package com.example.choprest.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ADDITIONAL_INFO")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdditionalInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "info_id")
    private Long infoId;
    
    @Column(name = "store_id", nullable = false)
    private Long storeId;
    
    @Column(name = "info_type", nullable = false, length = 50)
    private String infoType; // PARKING, WIFI, KIDS_ZONE, DELIVERY, ETC
    
    @Column(name = "info_title", length = 200)
    private String infoTitle;
    
    @Column(name = "info_description", length = 2000)
    private String infoDescription;
    
    @Column(name = "info_value", length = 500)
    private String infoValue;
    
    @Column(name = "is_available")
    private Boolean isAvailable;
    
    @Column(name = "icon_url", length = 500)
    private String iconUrl;
    
    @Column(name = "sort_order")
    private Integer sortOrder;
    
    @Column(name = "additional_notes", length = 1000)
    private String additionalNotes;
}
