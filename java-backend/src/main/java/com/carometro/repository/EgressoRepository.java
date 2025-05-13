package com.carometro.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.carometro.model.Egresso;

public interface EgressoRepository extends JpaRepository<Egresso, Integer> {
    Egresso findEgressoByUsername(String nome);
}