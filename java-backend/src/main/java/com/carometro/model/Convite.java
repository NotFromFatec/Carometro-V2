package com.carometro.model;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "convite")
@Getter
@Setter
public class Convite {
    
    @Id
    @Column(name = "code", nullable = false)
    private String code;
    
    @Column(name = "used", nullable = false)
    private boolean used;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "created_by", nullable = false)
    private Integer createdBy; // store only the admin id

}