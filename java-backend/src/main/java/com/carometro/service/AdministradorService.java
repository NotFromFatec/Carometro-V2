package com.carometro.service;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.carometro.model.Administrador;
import com.carometro.repository.AdministradorRepository;

@Service
public class AdministradorService {
	@Autowired
	private AdministradorRepository repository;
	
	public Administrador getAdministradorById(int id) {
		return repository.getReferenceById(id);
	}
	
	public Optional<Administrador> getAdministradorByUsername(String username){
		return repository.findByUsername(username);
	}
	
	public Administrador save(Administrador adm) {
		return repository.save(adm);
	}
	
}
