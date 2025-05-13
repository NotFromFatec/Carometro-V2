// src/components/TermsOfConsent.tsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface TermsOfConsentProps {
    show: boolean;
    onHide: () => void;
}

const TermsOfConsent: React.FC<TermsOfConsentProps> = ({ show, onHide }) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Termos de Consentimento</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Estes são os termos de consentimento para o uso de dados no projeto.  **Substitua este texto
                    com os termos reais.**
                </p>
                <p>
                    Ao criar uma conta, você concorda com a coleta, uso e compartilhamento de seus dados
                    pessoais, conforme descrito nestes termos.  Seus dados serão usados para os seguintes
                    propósitos:
                </p>
                <ul>
                    <li>Permitir que outros egressos encontrem você.</li>
                    <li>Melhorar a funcionalidade do aplicativo.</li>
                    <li>Entrar em contato com você sobre questões relacionadas ao aplicativo (opcional).</li>
                </ul>
                <p>
                    Você tem o direito de acessar, corrigir e excluir seus dados a qualquer momento.
                    Para mais informações, entre em contato conosco.
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Fechar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default TermsOfConsent;