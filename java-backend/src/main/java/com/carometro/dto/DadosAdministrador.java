package com.carometro.dto;

import jakarta.validation.constraints.NotBlank;

public record DadosAdministrador(
		@NotBlank
		int id,
		String name,
		String username,
		String role) {

}
