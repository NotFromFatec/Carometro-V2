package com.carometro.dto;

public class EmailErrorDTO {
    private String email;
    private String error;

    public EmailErrorDTO() {}
    public EmailErrorDTO(String email, String error) {
        this.email = email;
        this.error = error;
    }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}