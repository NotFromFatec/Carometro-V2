package com.carometro.service;

import jakarta.mail.internet.MimeMessage;
import org.jsoup.Jsoup;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.carometro.dto.*;
import com.carometro.model.Administrador;
import com.carometro.model.Convite;
import com.carometro.repository.AdministradorRepository;
import com.carometro.repository.ConviteRepository;

import java.util.*;

@Service
public class EmailService {
    @Autowired
    private AdministradorRepository administradorRepository;
    @Autowired
    private ConviteRepository conviteRepository;
    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.invite.base-url}")
    private String baseUrl;

    @Transactional
    public EmailSendResponseDTO sendInviteEmails(EmailSendRequestDTO request) {
        // 1. Validation
        Optional<Administrador> adminOpt = Optional.empty();
        try {
            String adminId = request.getAdminId();
            adminOpt = administradorRepository.findById(adminId);
        } catch (Exception e) {
            return new EmailSendResponseDTO("AdminId inválido.", null, "AdminId inválido");
        }
        if (adminOpt.isEmpty()) {
            return new EmailSendResponseDTO("Administrador não encontrado.", null, "Administrador não encontrado");
        }
        if (request.getRecipients() == null || request.getRecipients().isEmpty()) {
            return new EmailSendResponseDTO("Lista de destinatários vazia.", null, "Lista de destinatários vazia");
        }
        if (request.getSubject() == null || request.getSubject().isBlank() || request.getHtml() == null || request.getHtml().isBlank()) {
            return new EmailSendResponseDTO("Assunto ou corpo do e-mail vazio.", null, "Assunto ou corpo do e-mail vazio");
        }

        int successfulSends = 0;
        int failedSends = 0;
        List<EmailErrorDTO> errors = new ArrayList<>();

        for (EmailRecipientDTO recipient : request.getRecipients()) {
            String code = UUID.randomUUID().toString();
            // Ensure uniqueness (should be unique by DB constraint)
            while (conviteRepository.findByCode(code).isPresent()) {
                code = UUID.randomUUID().toString();
            }
            Convite convite = new Convite();
            convite.setCode(code);
            convite.setUsed(false);
            convite.setCreatedAt(java.time.LocalDateTime.now());
            convite.setCreatedBy(request.getAdminId());
            conviteRepository.save(convite);

            String inviteLink = baseUrl + "/create-account?invite=" + code;
            String htmlContent = request.getHtml().replace("{link}", inviteLink);
            String textContent = request.getText() != null && !request.getText().isBlank()
                    ? request.getText().replace("{link}", inviteLink)
                    : Jsoup.parse(htmlContent).text();
            try {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
                helper.setTo(recipient.getEmail());
                helper.setSubject(request.getSubject());
                helper.setText(htmlContent, true); // true = HTML
                helper.setFrom("MS_95JWM5@test-vz9dlemm87p4kj50.mlsender.net");
                // Optionally, set from (if configured)
                mailSender.send(mimeMessage);
                successfulSends++;
            } catch (Exception e) {
                failedSends++;
                errors.add(new EmailErrorDTO(recipient.getEmail(), e.getMessage()));
            }
        }
        EmailSendResponseDetailsDTO details = new EmailSendResponseDetailsDTO(successfulSends, failedSends, errors);
        String msg = (failedSends == 0) ? "Todos os e-mails de convite foram processados para envio."
                : (successfulSends == 0) ? "Falha ao processar o envio de e-mails de convite."
                : "E-mails de convite processados com alguns erros.";
        return new EmailSendResponseDTO(msg, details, (failedSends == 0 ? null : "Alguns envios falharam"));
    }
}
