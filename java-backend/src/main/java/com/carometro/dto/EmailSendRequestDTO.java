package com.carometro.dto;

import java.util.List;

public class EmailSendRequestDTO {
    private String adminId;
    private List<EmailRecipientDTO> recipients;
    private String subject;
    private String html;
    private String text;

    public EmailSendRequestDTO() {}

    public String getAdminId() { return adminId; }
    public void setAdminId(String adminId) { this.adminId = adminId; }
    public List<EmailRecipientDTO> getRecipients() { return recipients; }
    public void setRecipients(List<EmailRecipientDTO> recipients) { this.recipients = recipients; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getHtml() { return html; }
    public void setHtml(String html) { this.html = html; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}