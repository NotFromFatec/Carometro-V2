package com.carometro.dto;

public class EmailRecipientDTO {
    private String email;

    public EmailRecipientDTO() {}
    public EmailRecipientDTO(String email) { this.email = email; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}