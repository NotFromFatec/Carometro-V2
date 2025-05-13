package com.carometro.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.carometro.dto.EmailSendRequestDTO;
import com.carometro.dto.EmailSendResponseDTO;
import com.carometro.service.EmailService;

@RestController
@RequestMapping("/api/v1/email")
public class EmailController {
    @Autowired
    private EmailService emailService;

    @PostMapping(value = "/send", consumes = { "application/json", "text/plain" })
    public ResponseEntity<EmailSendResponseDTO> sendInviteEmails(@RequestBody String body) {
        com.google.gson.Gson gson = new com.google.gson.Gson();
        EmailSendRequestDTO request;
        try {
            request = gson.fromJson(body, EmailSendRequestDTO.class);
        } catch (Exception e) {
            EmailSendResponseDTO error = new EmailSendResponseDTO("JSON inválido.", null, "JSON inválido");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
        EmailSendResponseDTO response = emailService.sendInviteEmails(request);
        if (response.getDetails() != null && response.getDetails().getFailedSends() > 0) {
            if (response.getDetails().getSuccessfulSends() == 0) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            } else {
                return ResponseEntity.status(207).body(response); // Multi-Status
            }
        }
        return ResponseEntity.ok(response);
    }
}
