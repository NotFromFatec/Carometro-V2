package com.carometro.dto;

public record DadosConvite(
		String code,
		boolean used,
		Integer createdBy,
		String createdAt) {

}
