package com.carometro.dto;

import java.util.List;

public class EmailSendResponseDetailsDTO {
    private int successfulSends;
    private int failedSends;
    private List<EmailErrorDTO> errors;

    public EmailSendResponseDetailsDTO() {}
    public EmailSendResponseDetailsDTO(int successfulSends, int failedSends, List<EmailErrorDTO> errors) {
        this.successfulSends = successfulSends;
        this.failedSends = failedSends;
        this.errors = errors;
    }
    public int getSuccessfulSends() { return successfulSends; }
    public void setSuccessfulSends(int successfulSends) { this.successfulSends = successfulSends; }
    public int getFailedSends() { return failedSends; }
    public void setFailedSends(int failedSends) { this.failedSends = failedSends; }
    public List<EmailErrorDTO> getErrors() { return errors; }
    public void setErrors(List<EmailErrorDTO> errors) { this.errors = errors; }
}