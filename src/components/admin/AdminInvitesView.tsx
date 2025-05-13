// src/components/admin/AdminInvitesView.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../api';
import { Container, Button, Alert as BootstrapAlert, Table, InputGroup, Form, Spinner } from 'react-bootstrap';
import { useAppContext } from '../../AppContext';

interface InviteData {
    code: string;
    used: boolean;
    createdBy: string;
    createdAt: any;
    createdByName?: string;
    id?: string;
}

interface AdminInvitesViewProps {
    showAlert: (message: string, variant?: 'success' | 'danger' | string) => void;
}

const AdminInvitesView: React.FC<AdminInvitesViewProps> = ({ showAlert }) => {
    const [invites, setInvites] = useState<InviteData[]>([]);
    const [generatedInviteCode, setGeneratedInviteCode] = useState('');
    const [showGeneratedInviteAlert, setShowGeneratedInviteAlert] = useState(false);
    const [loadingInvites, setLoadingInvites] = useState(true);
    const { adminUser } = useAppContext();
    const [operatingOnInviteCode, setOperatingOnInviteCode] = useState<string | null>(null); // For create and cancel

    const fetchInvites = useCallback(async () => {
        if (!adminUser?.id) {
            setLoadingInvites(false);
            return;
        }
        setLoadingInvites(true);
        try {
            const fetchedInvitesAPI = await api.getInvites();
            const invitesWithAdminNames: InviteData[] = await Promise.all(
                fetchedInvitesAPI.map(async (invite: any) => {
                    const admin = await api.getAdmin(invite.createdBy);
                    let createdAtDate = invite.createdAt;
                    if (invite.createdAt && typeof invite.createdAt.seconds === 'number') {
                        createdAtDate = new Date(invite.createdAt.seconds * 1000);
                    }
                    return {
                        ...invite,
                        id: invite.id || invite.code,
                        createdByName: admin ? admin.name : 'Desconhecido',
                        createdAt: createdAtDate
                    };
                })
            );
            setInvites(invitesWithAdminNames.sort((a, b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime()));
        } catch (error) {
            console.error("Error fetching invites:", error);
            showAlert("Erro ao buscar convites.", 'danger');
        } finally {
            setLoadingInvites(false);
        }
    }, [adminUser?.id]);

    useEffect(() => {
        fetchInvites();
    }, [fetchInvites]);

    const handleCreateInvite = async () => {
        if (adminUser && adminUser.id) {
            setOperatingOnInviteCode('creating'); // Generic busy state for create
            setShowGeneratedInviteAlert(false);
            setGeneratedInviteCode('');
            try {
                const code = await api.createInvite(adminUser.id);
                if (code) {
                    setGeneratedInviteCode(code);
                    setShowGeneratedInviteAlert(true);
                    // Optimistically add to local state
                    const newInvite: InviteData = {
                        code: code,
                        used: false,
                        createdBy: adminUser.id,
                        createdAt: new Date(),
                        createdByName: adminUser.name,
                        id: code
                    };
                    setInvites(prevInvites => [newInvite, ...prevInvites].sort((a, b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime()));
                } else {
                    showAlert("Erro ao gerar o código de convite.", 'danger');
                }
            } catch (error) {
                showAlert("Erro crítico ao gerar convite.", 'danger');
            } finally {
                setOperatingOnInviteCode(null);
            }
        }
    };

    const handleCancelInvite = async (code: string) => {
        if (window.confirm("Tem certeza que deseja cancelar este convite? Esta ação marcará o convite como 'usado'.")) {
            setOperatingOnInviteCode(code);
            try {
                const success = await api.cancelInvite(code);
                if (success) {
                    setInvites(prevInvites =>
                        prevInvites.map(inv =>
                            inv.code === code ? { ...inv, used: true } : inv
                        )
                    );
                    showAlert("Convite cancelado com sucesso.", "success");
                } else {
                    showAlert("Falha ao cancelar convite.", "danger");
                }
            } catch (error) {
                showAlert("Erro ao cancelar convite.", "danger");
            } finally {
                setOperatingOnInviteCode(null);
            }
        }
    };

    const copyToClipboard = (text: string, type: 'link' | 'code') => {
        navigator.clipboard.writeText(text)
            .then(() => showAlert(`${type === 'link' ? 'Link' : 'Código'} de convite copiado!`, "success"))
            .catch(() => showAlert(`Erro ao copiar ${type}.`, "warning"));
    };

    const getInviteLink = (code: string) => `${window.location.origin}/create-account?invite=${code}`;

    if (loadingInvites) {
        { console.log("loading") }
        return <Container className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-2">Carregando convites...</p></Container>;
    }

    return (
        <Container fluid>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0 section-title" style={{ borderBottom: 'none', fontSize: '1.5rem' }}>Gerenciar Convites</h3>
                <Button variant="primary" className="btn-modern btn-sm" onClick={handleCreateInvite} disabled={operatingOnInviteCode === 'creating'}>
                    {operatingOnInviteCode === 'creating' ? <><Spinner as="span" animation="border" size="sm" /> Gerando...</> : 'Gerar Novo Código'}
                </Button>
            </div>

            {showGeneratedInviteAlert && generatedInviteCode && (
                <BootstrapAlert
                    variant="info"
                    className="modern-alert admin-invite-alert mb-4"
                    onClose={() => setShowGeneratedInviteAlert(false)}
                    dismissible
                >
                    <BootstrapAlert.Heading as="h5" style={{ fontSize: '1.1rem' }}>Convite Gerado!</BootstrapAlert.Heading>
                    <p className="mb-1">Use os botões abaixo para copiar o código ou o link direto.</p>
                    <hr />
                    <Form.Label className="fw-medium small">Código:</Form.Label>
                    <InputGroup size="sm" className="mb-2">
                        <Form.Control value={generatedInviteCode} readOnly aria-label="Generated invite code" className="form-control-modern" />
                        <Button variant="outline-secondary" className="btn-modern" onClick={() => copyToClipboard(generatedInviteCode, 'code')}>Copiar Código</Button>
                    </InputGroup>
                    <Form.Label className="fw-medium small">Link de Cadastro:</Form.Label>
                    <InputGroup size="sm">
                        <Form.Control value={getInviteLink(generatedInviteCode)} readOnly aria-label="Generated invite link" className="form-control-modern" />
                        <Button variant="outline-secondary" className="btn-modern" onClick={() => copyToClipboard(getInviteLink(generatedInviteCode), 'link')}>Copiar Link</Button>
                    </InputGroup>
                </BootstrapAlert>
            )}

            <h4 className="section-title-card mb-3">Convites Emitidos</h4>
            <div className="modern-card" style={{ border: 'none', boxShadow: 'none' }}>
                <Table hover className="modern-table mb-0">
                    <thead>
                        <tr>
                            <th>Código</th><th>Criado Por</th><th className="text-center">Status</th>
                            <th>Criado Em</th><th className="text-end">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invites.map((invite) => (
                            <tr key={invite.id || invite.code}>
                                <td>
                                    <InputGroup size="sm">
                                        <Form.Control value={invite.code} readOnly className="form-control-modern" style={{ backgroundColor: '#f8f9fa', borderRight: 'none' }} />
                                        <Button variant="outline-secondary" className="btn-modern" style={{ fontSize: '0.75rem' }} onClick={() => copyToClipboard(invite.code, 'code')}>Cód.</Button>
                                        <Button variant="outline-info" className="btn-modern" style={{ fontSize: '0.75rem' }} onClick={() => copyToClipboard(getInviteLink(invite.code), 'link')}>Link</Button>
                                    </InputGroup>
                                </td>
                                <td>{invite.createdByName}</td>
                                <td className={`text-center fw-medium ${invite.used ? 'text-danger' : 'text-success'}`}>{invite.used ? 'Utilizado' : 'Disponível'}</td>
                                <td>{invite.createdAt instanceof Date ? invite.createdAt.toLocaleString() : 'Data inválida'}</td>
                                <td className="text-end">
                                    {!invite.used && (
                                        <Button variant="outline-warning" size="sm" className="btn-modern"
                                            onClick={() => handleCancelInvite(invite.code)}
                                            disabled={operatingOnInviteCode === invite.code}>
                                            {operatingOnInviteCode === invite.code ? <Spinner as="span" animation="border" size="sm" /> : 'Cancelar'}
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {invites.length === 0 && (
                            <tr><td colSpan={5} className="text-center text-muted py-4">Nenhum convite emitido.</td></tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </Container>
    );
};

export default AdminInvitesView;