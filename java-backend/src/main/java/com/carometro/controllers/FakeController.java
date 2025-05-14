package com.carometro.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.carometro.model.Administrador;
import com.carometro.model.Convite;
import com.carometro.model.Curso;
import com.carometro.model.Egresso;
import com.carometro.repository.AdministradorRepository;
import com.carometro.repository.ConviteRepository;
import com.carometro.repository.CursoRepository;
import com.carometro.repository.EgressoRepository;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
public class FakeController {
    @Autowired
    private AdministradorRepository administradorRepository;
    @Autowired
    private ConviteRepository conviteRepository;
    @Autowired
    private CursoRepository cursoRepository;
    @Autowired
    private EgressoRepository egressoRepository;

    @GetMapping("/api/v1/fake")
    public ResponseEntity<String> popularBancoComFakes() {
        // Função para hashear senha
        java.util.function.Function<String, String> hashPassword = senha -> {
            try {
                java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
                byte[] hash = digest.digest(senha.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                StringBuilder hexString = new StringBuilder();
                for (byte b : hash) {
                    hexString.append(String.format("%02x", b));
                }
                return hexString.toString();
            } catch (java.security.NoSuchAlgorithmException e) {
                throw new RuntimeException("Erro ao hashear a senha", e);
            }
        };

        // Criar administradores
        Administrador admin1 = new Administrador(java.util.UUID.randomUUID().toString(), "Administrador Um", "admin1", hashPassword.apply("admin1pass"), "Coordenador");
        Administrador admin2 = new Administrador(java.util.UUID.randomUUID().toString(), "Administrador Dois", "admin2", hashPassword.apply("admin2pass"), "Professor");
        administradorRepository.saveAll(Arrays.asList(admin1, admin2));

        // Criar cursos
        Curso curso1 = new Curso(java.util.UUID.randomUUID().toString(), "Engenharia de Software");
        Curso curso2 = new Curso(java.util.UUID.randomUUID().toString(), "Direito");
        Curso curso3 = new Curso(java.util.UUID.randomUUID().toString(), "Medicina");
        Curso curso4 = new Curso(java.util.UUID.randomUUID().toString(), "Arquitetura");
        cursoRepository.saveAll(Arrays.asList(curso1, curso2, curso3, curso4));

        // Criar convites
        Convite convite1 = new Convite();
        convite1.setCode(UUID.randomUUID().toString());
        convite1.setUsed(true);
        convite1.setCreatedAt(java.time.LocalDateTime.now());
        convite1.setCreatedBy(admin1.getId());

        Convite convite2 = new Convite();
        convite2.setCode(UUID.randomUUID().toString());
        convite2.setUsed(true);
        convite2.setCreatedAt(java.time.LocalDateTime.now());
        convite2.setCreatedBy(admin1.getId());

        Convite convite3 = new Convite();
        convite3.setCode(UUID.randomUUID().toString());
        convite3.setUsed(true);
        convite3.setCreatedAt(java.time.LocalDateTime.now());
        convite3.setCreatedBy(admin2.getId());

        Convite convite4 = new Convite();
        convite4.setCode(UUID.randomUUID().toString());
        convite4.setUsed(true);
        convite4.setCreatedAt(java.time.LocalDateTime.now());
        convite4.setCreatedBy(admin2.getId());

        Convite convite5 = new Convite();
        convite5.setCode(UUID.randomUUID().toString());
        convite5.setUsed(true);
        convite5.setCreatedAt(java.time.LocalDateTime.now());
        convite5.setCreatedBy(admin1.getId());

        Convite convite6 = new Convite();
        convite6.setCode(UUID.randomUUID().toString());
        convite6.setUsed(true);
        convite6.setCreatedAt(java.time.LocalDateTime.now());
        convite6.setCreatedBy(admin2.getId());

        Convite convite7 = new Convite();
        convite7.setCode(UUID.randomUUID().toString());
        convite7.setUsed(true);
        convite7.setCreatedAt(java.time.LocalDateTime.now());
        convite7.setCreatedBy(admin1.getId());

        Convite convite8 = new Convite();
        convite8.setCode(UUID.randomUUID().toString());
        convite8.setUsed(true);
        convite8.setCreatedAt(java.time.LocalDateTime.now());
        convite8.setCreatedBy(admin2.getId());
        conviteRepository.saveAll(Arrays.asList(convite1, convite2, convite3, convite4, convite5, convite6, convite7, convite8));

        // Criar egressos verificados (usando os convites)
        Egresso egresso1 = new Egresso(java.util.UUID.randomUUID().toString(), "João Silva", null, null, null, "Engenharia de Software", "2020", "Descrição pessoal do João", "Descrição carreira do João", true, "joaosilva", hashPassword.apply("senha123"), true, convite1.getCode(), List.of("https://linkedin.com/joao", "https://github.com/joao"));
        Egresso egresso2 = new Egresso(java.util.UUID.randomUUID().toString(), "Maria Souza", null, null, null, "Direito", "2019", "Descrição pessoal da Maria", "Descrição carreira da Maria", true, "mariasouza", hashPassword.apply("senha456"), true, convite2.getCode(), List.of("https://linkedin.com/maria"));
        Egresso egresso3 = new Egresso(java.util.UUID.randomUUID().toString(), "Carlos Pereira", null, null, null, "Medicina", "2018", "Descrição pessoal do Carlos", "Descrição carreira do Carlos", true, "carlosp", hashPassword.apply("senha789"), true, convite3.getCode(), List.of("https://linkedin.com/carlos"));
        Egresso egresso4 = new Egresso(java.util.UUID.randomUUID().toString(), "Ana Lima", null, null, null, "Arquitetura", "2021", "Descrição pessoal da Ana", "Descrição carreira da Ana", true, "analima", hashPassword.apply("senha321"), true, convite4.getCode(), List.of("https://linkedin.com/ana"));
        Egresso egresso5 = new Egresso(java.util.UUID.randomUUID().toString(), "Pedro Alves", null, null, null, "Engenharia de Software", "2022", "Descrição pessoal do Pedro", "Descrição carreira do Pedro", true, "pedroalves", hashPassword.apply("senha654"), true, convite5.getCode(), List.of("https://linkedin.com/pedro"));
        Egresso egresso6 = new Egresso(java.util.UUID.randomUUID().toString(), "Juliana Costa", null, null, null, "Direito", "2023", "Descrição pessoal da Juliana", "Descrição carreira da Juliana", true, "julianacosta", hashPassword.apply("senha987"), true, convite6.getCode(), List.of("https://linkedin.com/juliana"));
        // Criar egressos não verificados
        Egresso egresso7 = new Egresso(java.util.UUID.randomUUID().toString(), "Lucas Rocha", null, null, null, "Medicina", "2024", "Descrição pessoal do Lucas", "Descrição carreira do Lucas", false, "lucasrocha", hashPassword.apply("senha111"), true, null, List.of("https://linkedin.com/lucas"));
        Egresso egresso8 = new Egresso(java.util.UUID.randomUUID().toString(), "Fernanda Dias", null, null, null, "Arquitetura", "2024", "Descrição pessoal da Fernanda", "Descrição carreira da Fernanda", false, "fernandadias", hashPassword.apply("senha222"), true, null, List.of("https://linkedin.com/fernanda"));
        egressoRepository.saveAll(Arrays.asList(egresso1, egresso2, egresso3, egresso4, egresso5, egresso6, egresso7, egresso8));

        return ResponseEntity.ok("Banco populado com dados fake em português.");
    }
}
