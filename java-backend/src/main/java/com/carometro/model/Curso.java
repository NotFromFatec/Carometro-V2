package com.carometro.model;

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
@Table(name = "curso")
@Getter
@Setter
public class Curso {

	@Id
	@Column(name = "id", nullable = false, updatable = false)
	private String id;

	@Column(name = "name", nullable = false)
	private String name;
	
	public Curso(String name) {
		this.name = name;
	}
}
