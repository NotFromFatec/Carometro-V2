package com.carometro.dto;

import jakarta.validation.constraints.NotBlank;

public record DadosAdministrador(
		@NotBlank
		String id,
		String name,
		String username,
		String role) {

}
