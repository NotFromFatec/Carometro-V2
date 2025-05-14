package com.carometro.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.carometro.model.Curso;

public interface CursoRepository extends JpaRepository<Curso, String> {
	void deleteAll();
}
