package com.carometro.dto;

public class EmailSendResponseDTO {
    private String message;
    private EmailSendResponseDetailsDTO details;
    private String error;

    public EmailSendResponseDTO() {}
    public EmailSendResponseDTO(String message, EmailSendResponseDetailsDTO details) {
        this.message = message;
        this.details = details;
    }
    public EmailSendResponseDTO(String message, EmailSendResponseDetailsDTO details, String error) {
        this.message = message;
        this.details = details;
        this.error = error;
    }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public EmailSendResponseDetailsDTO getDetails() { return details; }
    public void setDetails(EmailSendResponseDetailsDTO details) { this.details = details; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}