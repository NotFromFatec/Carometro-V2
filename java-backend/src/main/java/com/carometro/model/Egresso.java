package com.carometro.model;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "egresso")
@Getter
@Setter
public class Egresso {

    @Id
	@Column(name = "id", nullable = false, updatable = false)
	private String id;

    @Column(name = "nome", nullable = false)
    private String name;

    @Column(name = "imagem_perfil", length = 4096)
    private String profileImage;

    @Column(name = "imagem_face", length = 4096)
    private String faceImage;

    @Column(name = "pontos_face")
    private String facePoints;

    @Column(name = "curso")
    private String course;

    @Column(name = "ano_graduacao")
    private String graduationYear;

    @Column(name = "descricao_pessoal")
    private String personalDescription;

    @Column(name = "descricao_carreira")
    private String careerDescription;

    @Column(name = "verificado")
    private boolean verified;

    @Column(name = "username", nullable = false)
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "termos_aceitos", nullable = false)
    private boolean termsAccepted;

    @Column(name = "codigo_convite")
    private String inviteCode;

    @Column(name = "links_contato")
    private List<String> contactLinks;
}
