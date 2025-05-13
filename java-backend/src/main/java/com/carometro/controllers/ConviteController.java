package com.carometro.controllers;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import com.carometro.dto.DadosConvite;
import com.carometro.model.Administrador;
import com.carometro.model.Convite;
import com.carometro.repository.AdministradorRepository;
import com.carometro.repository.ConviteRepository;
import com.carometro.service.ConviteService;
import com.google.gson.Gson;

@RestController
public class ConviteController {
	
	@Autowired
	private ConviteService conviteService;

	@Autowired
	private ConviteRepository conviteRepository;
	
	@Autowired
	private AdministradorRepository administradorRepository;

	// 12. Criar Código de Convite POST
	@SuppressWarnings("unchecked")
	@PostMapping(value = "/api/v1/invites", consumes = {"application/json", "text/plain"})
	public ResponseEntity<?> criarCodigoConvite(@RequestBody String body) {
        Map<String, Object> mapeamento;
        try {
            mapeamento = new com.google.gson.Gson().fromJson(body, Map.class);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid request"));
        }
        Object adminIdObj = mapeamento.get("adminId");
        if (adminIdObj == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid request"));
        }
        int adminId;
        if (adminIdObj instanceof Number) {
            adminId = ((Number) adminIdObj).intValue();
        } else {
            try {
                adminId = Integer.parseInt(adminIdObj.toString().replace(".0", ""));
            } catch (NumberFormatException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid adminId"));
            }
        }
        Optional<Administrador> adminOpc = administradorRepository.findById(adminId);
        if (!adminOpc.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Admin not found"));
        }
        String code = UUID.randomUUID().toString();
        Convite convite = new Convite();
        convite.setCode(code);
        convite.setUsed(false);
        convite.setCreatedAt(java.time.LocalDateTime.now());
        convite.setCreatedBy(adminId);
        conviteRepository.save(convite);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("code", code));
    }

	// 13. Listar Códigos de Convite GET
	@GetMapping(value = "/api/v1/invites")
	public ResponseEntity<?> getConvites() {
        List<Convite> listaDeConvites = conviteRepository.findAll();
        List<DadosConvite> dtos = listaDeConvites.stream()
            .map(c -> new DadosConvite(
                c.getCode(),
                c.isUsed(),
                c.getCreatedBy(),
                c.getCreatedAt() != null ? c.getCreatedAt().toString() : null
            ))
            .toList();
        return ResponseEntity.ok(dtos);
	}

	// 14. Cancelar Código de Convite PUT
	@PutMapping(value = "/api/v1/invites", consumes = { "application/json", "text/plain" })
	public ResponseEntity<?> cancelarConvite(@RequestBody String body) {
        Map<String, String> codeJson = new Gson().fromJson(body, Map.class);
        String code = codeJson.get("code");
        if (code == null || code.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid request"));
        }
        boolean cancelado = conviteService.CancelarConvite(code);
        if (cancelado) {
            return ResponseEntity.ok(Map.of("message", "Invite successfully cancelled."));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Invite not found"));
        }
    }
}
