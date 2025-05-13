package com.carometro.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.carometro.model.Convite;
import com.carometro.repository.ConviteRepository;

@Service
public class ConviteService {
	
	@Autowired
	private ConviteRepository repository;
	
	public List<Convite> getAllConvite(){
		return repository.findAll();
	}
	
	public boolean CancelarConvite(String codigo) {
		Optional<Convite> convite = repository.findByCode(codigo);
		if(convite.isPresent()){
			Convite conviteUsado = convite.get();
			conviteUsado.setUsed(true);
			repository.save(conviteUsado);
			return true;
		}else {
			return false;
		}
	}
}
