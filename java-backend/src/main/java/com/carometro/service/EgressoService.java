package com.carometro.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.carometro.model.Egresso;
import com.carometro.repository.EgressoRepository;

@Service
public class EgressoService {
    @Autowired
    private EgressoRepository repository;

    public Egresso findEgressoByUsername(String username) {
        return repository.findEgressoByUsername(username);
    }

    public Egresso save(Egresso e) {
        return repository.save(e);
    } 

    public List<Egresso> listar() {
        return repository.findAll();
    }

    public Egresso getEgressoById(String id) {
        return repository.getReferenceById(id);
    }

    public void deleEgressoById(String id) {
        repository.deleteById(id);
    }
}
