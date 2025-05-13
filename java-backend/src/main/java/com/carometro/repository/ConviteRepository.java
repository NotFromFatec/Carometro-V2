package com.carometro.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.carometro.model.Convite;


public interface ConviteRepository extends JpaRepository<Convite, String>{
	
	Optional<Convite> findByCode(String code);
	
}
