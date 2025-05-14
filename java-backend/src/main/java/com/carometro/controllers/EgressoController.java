package com.carometro.controllers;

import com.carometro.dto.EgressoDTO;
import com.carometro.model.Convite;
import com.carometro.model.Egresso;
import com.carometro.repository.ConviteRepository;
import com.carometro.service.EgressoService;
import com.google.gson.Gson;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
public class EgressoController {

    @Autowired
    private EgressoService egressoService;

    @Autowired
    private ConviteRepository conviteRepository;

    private EgressoDTO toDTO(Egresso egresso) {
        return new EgressoDTO(
            egresso.getId(),
            egresso.getName(),
            egresso.getProfileImage(),
            egresso.getFaceImage(),
            egresso.getFacePoints(),
            egresso.getCourse(),
            egresso.getGraduationYear(),
            egresso.getPersonalDescription(),
            egresso.getCareerDescription(),
            egresso.isVerified(),
            egresso.getUsername(),
            egresso.isTermsAccepted(),
            egresso.getInviteCode(),
            egresso.getContactLinks()
        );
    }

    // 1. Cadastrar o Egresso POST
    @PostMapping(value = "/api/v1/egressos", consumes = { "application/json", "text/plain" })
    public ResponseEntity<EgressoDTO> criarEgresso(@RequestBody String body) {
        Egresso novoEgresso;
        try {
            novoEgresso = new Gson().fromJson(body, Egresso.class);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        // Assign a UUID if not set
        if (novoEgresso.getId() == null || novoEgresso.getId().isBlank()) {
            novoEgresso.setId(java.util.UUID.randomUUID().toString());
        }
        String inviteCode = novoEgresso.getInviteCode();
        if (inviteCode == null || inviteCode.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        Optional<Convite> convite = conviteRepository.findByCode(inviteCode);
        if (convite.isEmpty() || convite.get().isUsed()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        Optional<Egresso> existente = Optional.ofNullable(egressoService.findEgressoByUsername(novoEgresso.getUsername()));
        if (existente.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        Convite conviteToUpdate = convite.get();
        conviteToUpdate.setUsed(true);
        conviteRepository.save(conviteToUpdate);
        novoEgresso.setPasswordHash(hashPassword(novoEgresso.getPasswordHash()));
        Egresso salvo = egressoService.save(novoEgresso);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(salvo));
    }

    // 2. Login do Egresso POST
    @PostMapping(value = "/api/v1/login/egresso", consumes = { "application/json", "text/plain" })
    @SuppressWarnings("unchecked")
    public ResponseEntity<EgressoDTO> loginEgresso(@RequestBody String body) {
        Map<String, String> logarComoEgresso;
        try {
            logarComoEgresso = new Gson().fromJson(body, Map.class); // NOSONAR: unchecked
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        String username = logarComoEgresso.get("username");
        String password = logarComoEgresso.get("password");
        Optional<Egresso> egressOptional = Optional.ofNullable(egressoService.findEgressoByUsername(username));
        if (egressOptional.isPresent()) {
            Egresso egresso = egressOptional.get();
            if (egresso.getPasswordHash().equals(hashPassword(password))) {
                return ResponseEntity.ok(toDTO(egresso));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // 3. Listar Egressos GET e 5. Obter Egresso por Nome de Usuário GET
    @GetMapping("/api/v1/egressos")
    public ResponseEntity<?> handleEgressos(@RequestParam(required = false) String username) {
        if (username != null && !username.isBlank()) {
            Optional<Egresso> encontroEgressoByUsername = Optional.ofNullable(egressoService.findEgressoByUsername(username));
            if (encontroEgressoByUsername.isPresent()) {
                return ResponseEntity.ok(toDTO(encontroEgressoByUsername.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } else {
            List<Egresso> egressos = egressoService.listar();
            List<EgressoDTO> dtos = egressos.stream().map(this::toDTO).toList();
            return ResponseEntity.ok(dtos);
        }
    }

    // 4. Obter Egresso por ID GET
    @GetMapping("/api/v1/egressos/{id}")
    public ResponseEntity<EgressoDTO> getEgressoById(@PathVariable String id) {
        Optional<Egresso> encontro = Optional.ofNullable(egressoService.getEgressoById(id));
        if (encontro.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        Egresso egresso = encontro.get();
        return ResponseEntity.ok(toDTO(egresso));
    }

    // 6. Atualizar Egresso
    @PutMapping(value = "/api/v1/egressos/{id}", consumes = { "application/json", "text/plain" })
    @SuppressWarnings("unchecked")
    public ResponseEntity<EgressoDTO> atualizarEgresso(@PathVariable String id, @RequestBody String body) {
        Optional<Egresso> egressoOptional = Optional.ofNullable(egressoService.getEgressoById(id));
        if (egressoOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        Egresso egresso = egressoOptional.get();
        Map<String, Object> atualizacoes;
        try {
            atualizacoes = new Gson().fromJson(body, Map.class); // NOSONAR: unchecked
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        if (atualizacoes.containsKey("name"))
            egresso.setName((String) atualizacoes.get("name"));
        if (atualizacoes.containsKey("profileImage")) {
            String profileImage = (String) atualizacoes.get("profileImage");
            if (isBase64Image(profileImage)) {
                String path = saveBase64Image(profileImage, "profile", egresso.getId());
                egresso.setProfileImage(path);
            } else {
                egresso.setProfileImage(profileImage);
            }
        }
        if (atualizacoes.containsKey("faceImage")) {
            String faceImage = (String) atualizacoes.get("faceImage");
            if (isBase64Image(faceImage)) {
                String path = saveBase64Image(faceImage, "face", egresso.getId());
                egresso.setFaceImage(path);
            } else {
                egresso.setFaceImage(faceImage);
            }
        }
        if (atualizacoes.containsKey("facePoints"))
            egresso.setFacePoints((String) atualizacoes.get("facePoints"));
        if (atualizacoes.containsKey("course"))
            egresso.setCourse((String) atualizacoes.get("course"));
        if (atualizacoes.containsKey("graduationYear"))
            egresso.setGraduationYear((String) atualizacoes.get("graduationYear"));
        if (atualizacoes.containsKey("personalDescription"))
            egresso.setPersonalDescription((String) atualizacoes.get("personalDescription"));
        if (atualizacoes.containsKey("careerDescription"))
            egresso.setCareerDescription((String) atualizacoes.get("careerDescription"));
        if (atualizacoes.containsKey("verified"))
            egresso.setVerified((Boolean) atualizacoes.get("verified"));
        if (atualizacoes.containsKey("username"))
            egresso.setUsername((String) atualizacoes.get("username"));
        if (atualizacoes.containsKey("termsAccepted"))
            egresso.setTermsAccepted((Boolean) atualizacoes.get("termsAccepted"));
        if (atualizacoes.containsKey("inviteCode"))
            egresso.setInviteCode((String) atualizacoes.get("inviteCode"));
        if (atualizacoes.containsKey("contactLinks"))
            egresso.setContactLinks((List<String>) atualizacoes.get("contactLinks")); // NOSONAR: unchecked
        if (atualizacoes.containsKey("passwordHash")) {
            String novaSenha = (String) atualizacoes.get("passwordHash");
            if (novaSenha != null && !novaSenha.isBlank() && !novaSenha.equals(egresso.getPasswordHash())) {
                egresso.setPasswordHash(hashPassword(novaSenha));
            }
        }
        Egresso salvo = egressoService.save(egresso);
        return ResponseEntity.ok(toDTO(salvo));
    }

    // 7. Deletar Egresso
    @DeleteMapping("/api/v1/egressos/{id}")
    public ResponseEntity<Void> deletarEgresso(@PathVariable String id) {
        Optional<Egresso> egressoOptional = Optional.ofNullable(egressoService.getEgressoById(id));
        if (egressoOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        egressoService.deleEgressoById(id);
        return ResponseEntity.noContent().build();
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

    private boolean isBase64Image(String str) {
        if (str == null) return false;
        return str.startsWith("data:image/");
    }

    private String saveBase64Image(String base64, String type, String egressoId) {
        try {
            String[] parts = base64.split(",", 2);
            String meta = parts[0];
            String ext = ".png";
            if (meta.contains("image/jpeg")) ext = ".jpg";
            else if (meta.contains("image/webp")) ext = ".webp";
            else if (meta.contains("image/gif")) ext = ".gif";
            String data = parts[1];
            byte[] imageBytes = Base64.getDecoder().decode(data);
            String folderPath = "src/main/resources/static/egresso-images/";
            File folder = new File(folderPath);
            if (!folder.exists()) folder.mkdirs();
            String filename = type + "_egresso_" + egressoId + "_" + System.currentTimeMillis() + ext;
            File file = new File(folder, filename);
            try (FileOutputStream fos = new FileOutputStream(file)) {
                fos.write(imageBytes);
            }
            // Return the static path for frontend usage
            return "/egresso-images/" + filename;
        } catch (IOException | ArrayIndexOutOfBoundsException e) {
            return null;
        }
    }
}
