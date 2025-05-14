package com.carometro.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.carometro.model.Administrador;

public interface AdministradorRepository extends JpaRepository<Administrador, String> {
	public Optional<Administrador> findByUsername(String username);
}
