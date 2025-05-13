package com.carometro.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.carometro.dto.CursoDTO;
import com.carometro.model.Curso;
import com.carometro.service.CursoService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
public class CursoController {

	@Autowired
	private CursoService cursoService;

	// 15. Listar Cursos GET
	@GetMapping("/api/v1/courses")
	public ResponseEntity<List<String>> listarCursos() {
		List<String> nomes = cursoService.listarNomes();
		return ResponseEntity.ok(nomes);
	}

	// 16. Salvar (Atualizar) Curso
	@PutMapping(value = "/api/v1/courses", consumes = { "application/json", "text/plain" })
	public ResponseEntity<Void> salvarCursos(@RequestBody String cursosBody) {
		if (cursosBody == null || cursosBody.isBlank()) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		}
		try {
			ObjectMapper objectMapper = new ObjectMapper();
			List<String> nomes;
			// Try parsing as array of strings first
			try {
				nomes = objectMapper.readValue(cursosBody, new TypeReference<List<String>>() {
				});
			} catch (Exception e) {
				// If fails, try parsing as array of CursoDTO
				List<CursoDTO> cursosDto = objectMapper.readValue(cursosBody, new TypeReference<List<CursoDTO>>() {
				});
				nomes = cursosDto.stream().map(CursoDTO::name).toList();
			}
			if (nomes == null || nomes.isEmpty()) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
			}
			cursoService.save(nomes);
			return ResponseEntity.noContent().build();
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		}
	}

}
