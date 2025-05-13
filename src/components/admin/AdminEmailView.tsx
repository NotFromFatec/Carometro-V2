// src/components/admin/AdminEmailView.tsx
import React, { useState } from 'react';
import { api, EmailSendData, EmailRecipient } from '../../api'; // Added EmailRecipient
import { Container, Form, Button, Card, Spinner, Alert as BootstrapAlert, Row, Col } from 'react-bootstrap';
import { useAppContext } from '../../AppContext';

interface AdminEmailViewProps {
    showAlert: (message: string, variant?: 'success' | 'danger' | 'warning' | string) => void;
}

// Updated template with invite text and {link} placeholder
const defaultInviteTemplate = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Convite para o Carômetro 🎓</title>
    <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .email-container { max-width: 600px; margin: 20px auto; padding: 0; border: 1px solid #dddddd; border-radius: 8px; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .email-header { background-color: var(--bs-primary, #0d6efd); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .email-header h1 { margin: 0; font-size: 24px; }
        .email-content { padding: 25px; text-align: left; }
        .email-content p { margin-bottom: 15px; font-size: 16px; }
        .email-content a { color: var(--bs-primary-darker, #0a58ca); text-decoration: none; }
        .email-content a:hover { text-decoration: underline; }
        .email-button { display: inline-block; background-color: var(--bs-success, #198754); color: white !important; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; margin-top: 10px; margin-bottom: 15px; text-align: center; }
        .email-footer { text-align: center; padding: 20px; font-size: 0.85em; color: #777777; border-top: 1px solid #eeeeee; }
        .email-footer p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>Convite para o Carômetro 🎓</h1>
        </div>
        <div class="email-content">
            <p>Olá!</p>
            <p>Você foi convidado(a) a criar sua conta no <strong>Carômetro</strong>, a plataforma de conexão para egressos da nossa instituição.</p>
            <p>Use o link abaixo para se cadastrar e começar a se conectar com colegas:</p>
            <p style="text-align: center;">
                <a href="{link}" class="email-button">Criar Minha Conta</a>
            </p>
            <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <p><a href="{link}">{link}</a></p>
            <p>Esperamos ver você lá!</p>
            <p>Atenciosamente,<br>Equipe Carômetro</p>
        </div>
        <div class="email-footer">
            <p>© ${new Date().getFullYear()} Carômetro. Todos os direitos reservados.</p>
            <p><a href="${window.location.origin}">Visite nosso site</a></p>
        </div>
    </div>
</body>
</html>
`;

const AdminEmailView: React.FC<AdminEmailViewProps> = ({ showAlert }) => {
    const [recipients, setRecipients] = useState('');
    const [subject, setSubject] = useState('Convite para Criar Conta - Carômetro'); // Updated subject
    const [messageBody, setMessageBody] = useState(defaultInviteTemplate); // Use invite template

    const [sendingEmail, setSendingEmail] = useState(false);
    const [sendError, setSendError] = useState('');

    const { adminUser, setLoading: setAppLoading } = useAppContext(); // Get adminUser

    const handlePreviewEmail = () => {
        // Basic preview, won't show the replaced link
        if (messageBody.trim() === "") {
            showAlert("Não há conteúdo na mensagem para visualizar.", "warning");
            return;
        }
        const previewWindow = window.open('', '_blank');
        if (previewWindow) {
            let rootStyles = "";
            const styleSheets = Array.from(document.styleSheets);
            styleSheets.forEach(sheet => { try { if (sheet.cssRules) { Array.from(sheet.cssRules).forEach(rule => { if (rule instanceof CSSStyleRule && rule.selectorText === ':root') { rootStyles += rule.cssText.replace(':root', 'body') + '\n'; } }); } } catch (e) { } });

            previewWindow.document.open();
            previewWindow.document.write(`<html><head><title>Pré-visualização do Convite (Link não substituído)</title><style>${rootStyles}</style></head><body>`);
            // Replace {link} with a placeholder for preview purposes
            previewWindow.document.write(messageBody.replace(/{link}/g, '#PREVIEW_LINK_PLACEHOLDER'));
            previewWindow.document.write('</body></html>');
            previewWindow.document.close();
        } else {
            showAlert("Não foi possível abrir a janela de visualização. Verifique as configurações do seu navegador (bloqueador de pop-up).", "danger");
        }
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setSendError('');

        if (!adminUser || !adminUser.id) {
            setSendError('Erro: Administrador não identificado. Faça login novamente.');
            showAlert('Erro: Administrador não identificado.', 'danger');
            return;
        }

        if (!recipients.trim() || !subject.trim() || !messageBody.trim()) {
            setSendError('Preencha Destinatários, Assunto e Mensagem.');
            showAlert('Preencha Destinatários, Assunto e Mensagem.', 'warning');
            return;
        }

        const recipientEmails: EmailRecipient[] = recipients
            .split(/[\n,]+/)
            .map(email => email.trim())
            .filter(email => email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            .map(email => ({ email }));

        if (recipientEmails.length === 0) {
            setSendError('Nenhum destinatário válido encontrado. Verifique os e-mails inseridos.');
            showAlert('Nenhum destinatário válido encontrado.', 'warning');
            return;
        }

        // Data sent to the API - link replacement happens server-side now
        const emailData: EmailSendData = {
            recipients: recipientEmails,
            subject: subject,
            text: messageBody, // Server will generate text version *after* link replacement
            html: messageBody,
        };

        setSendingEmail(true);
        setAppLoading(true);
        try {
            // Pass adminId along with emailData
            const success = await api.sendEmail(emailData, adminUser.id);
            if (success) {
                showAlert(`Convite(s) enviado(s) com sucesso para ${recipientEmails.length} destinatário(s)!`, 'success');
                // Clear recipients after successful send
                setRecipients('');
            } else {
                if (!sendError) {
                    setSendError('Falha ao enviar o e-mail. Verifique o console para detalhes.');
                }
                showAlert(sendError || 'Falha ao enviar o e-mail.', 'danger');
            }
        } catch (err: any) {
            console.error("Error sending email:", err);
            const errorMsg = err?.message || 'Erro desconhecido ao enviar e-mail.';
            setSendError(`Erro ao enviar e-mail: ${errorMsg}`);
            showAlert(`Erro ao enviar e-mail: ${errorMsg}`, 'danger');
        } finally {
            setSendingEmail(false);
            setAppLoading(false);
        }
    };


    return (
        <Container fluid>
            <Card className="modern-card shadow-sm">
                <Card.Header as="h5" className="section-title-card">Enviar Convite para Cadastro</Card.Header>
                <Card.Body>
                    {sendError && <BootstrapAlert variant="danger" className="modern-alert" onClose={() => setSendError('')} dismissible>{sendError}</BootstrapAlert>}
                    <Form onSubmit={handleSendEmail}>
                        <Form.Group className="mb-3" controlId="formRecipients">
                            <Form.Label className="fw-medium">Destinatários</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="Insira e-mails separados por vírgula ou nova linha..."
                                value={recipients}
                                onChange={(e) => setRecipients(e.target.value)}
                                className="form-control-modern"
                                required
                            />
                            <Form.Text muted>
                                Insira um ou mais endereços de e-mail. Um link de convite único será gerado e inserido na mensagem para todos os destinatários desta leva.
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formSubject">
                            <Form.Label className="fw-medium">Assunto</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Assunto do E-mail"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="form-control-modern"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formMessageBody">
                            <Form.Label className="fw-medium">Mensagem (HTML - use {'{link}'} para o convite)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={12}
                                placeholder="Corpo da mensagem (HTML)"
                                value={messageBody}
                                onChange={(e) => setMessageBody(e.target.value)}
                                className="form-control-modern"
                                required
                            />
                        </Form.Group>

                        <Row className="mt-3">
                            <Col className="text-start">
                                <Button variant="outline-secondary" className="btn-modern" onClick={handlePreviewEmail} disabled={sendingEmail}>
                                    Visualizar Modelo
                                </Button>
                            </Col>
                            <Col className="text-end">
                                <Button variant="success" type="submit" className="btn-modern" disabled={sendingEmail}>
                                    {sendingEmail ? <><Spinner as="span" animation="border" size="sm" /> Enviando Convites...</> : 'Enviar Convites'}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AdminEmailView;
