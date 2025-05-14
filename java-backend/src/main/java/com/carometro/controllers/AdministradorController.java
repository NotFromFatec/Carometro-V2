package com.carometro.controllers;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.carometro.dto.DadosAdministrador;
import com.carometro.model.Administrador;
import com.carometro.repository.AdministradorRepository;
import com.carometro.service.AdministradorService;
import com.google.gson.Gson;

@RestController
public class AdministradorController {

	@Autowired
	private AdministradorService administradorService;

	@Autowired
	private AdministradorRepository administradorRepository;

	// 8. Criar Administrador POST
	@PostMapping(value = "/api/v1/admins", consumes = { "application/json", "text/plain" })
	public ResponseEntity<DadosAdministrador> criarAdministrador(@RequestBody String body) {
		Administrador novoAdmin;
		try {
			novoAdmin = new Gson().fromJson(body, Administrador.class);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		}
		Optional<Administrador> existente = administradorService.getAdministradorByUsername(novoAdmin.getUsername());
		if (existente.isPresent()) {
			return ResponseEntity.status(HttpStatus.CONFLICT).build();
		}
		// Assign a UUID if not set
		if (novoAdmin.getId() == null || novoAdmin.getId().isBlank()) {
			novoAdmin.setId(java.util.UUID.randomUUID().toString());
		}
		novoAdmin.setPasswordHash(hashPassword(novoAdmin.getPasswordHash()));
		Administrador salvo = administradorService.save(novoAdmin);
		return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(salvo));
	}

	// 9. Login de Administrador POST
	@SuppressWarnings("unchecked")
	@PostMapping(value = "/api/v1/login/admin", consumes = { "application/json", "text/plain" })
	public ResponseEntity<DadosAdministrador> loginAdministrador(@RequestBody String body) {
		Map<String, String> logarComoAdm;
		try {
			logarComoAdm = new Gson().fromJson(body, Map.class); // NOSONAR: unchecked
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		}
		String username = logarComoAdm.get("username");
		String password = logarComoAdm.get("password");
		Optional<Administrador> adminOptional = administradorRepository.findByUsername(username);
		if (adminOptional.isPresent()) {
			Administrador admin = adminOptional.get();
			if (admin.getPasswordHash().equals(hashPassword(password))) {
				return ResponseEntity.ok(toDTO(admin));
			} else {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
			}
		} else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		}
	}

	// 10. Obter Administrador por ID GET
	@GetMapping("/api/v1/admins/{id}")
	public ResponseEntity<DadosAdministrador> getAdministradorById(@PathVariable String id) {
		Optional<Administrador> encontroAdmById = administradorRepository.findById(id);
		if (encontroAdmById.isPresent()) {
			Administrador admin = encontroAdmById.get();
			return ResponseEntity.ok(toDTO(admin));
		} else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		}
	}

	// 11. Obter Administrador por Nome de Usuário GET
	@GetMapping("/api/v1/admins")
	public ResponseEntity<DadosAdministrador> getAdministradorByUsername(@RequestParam String username) {
		Optional<Administrador> encontroAdmByUsername = administradorRepository.findByUsername(username);
		if (encontroAdmByUsername.isPresent()) {
			Administrador admin = encontroAdmByUsername.get();
			return ResponseEntity.ok(toDTO(admin));
		} else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		}
	}

	private DadosAdministrador toDTO(Administrador admin) {
		return new DadosAdministrador(admin.getId(), admin.getName(), admin.getUsername(), admin.getRole());
	}

	private String hashPassword(String password) {
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
			StringBuilder hexString = new StringBuilder();
			for (byte b : hash) {
				hexString.append(String.format("%02x", b));
			}
			return hexString.toString();
		} catch (NoSuchAlgorithmException e) {
			throw new RuntimeException("Erro ao hashear a senha", e);
		}
	}
}
