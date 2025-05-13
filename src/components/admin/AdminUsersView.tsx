// src/components/admin/AdminUsersView.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { api, Egresso } from '../../api';
import { Link } from 'react-router-dom';
import { Form, Table, Button, Container, Spinner, Alert } from 'react-bootstrap';
import { useAppContext } from '../../AppContext';

interface AdminUsersViewProps {
    showAlert: (message: string, variant?: 'success' | 'danger' | string) => void;
}

const AdminUsersView: React.FC<AdminUsersViewProps> = ({ showAlert }) => {
    const [allEgressos, setAllEgressos] = useState<Egresso[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    // filteredEgressos will now be derived directly in the render or memoized
    const [loadingEgressos, setLoadingEgressos] = useState(true);
    const { adminUser } = useAppContext();
    const [operatingOnEgressoId, setOperatingOnEgressoId] = useState<string | null>(null);

    const fetchAllEgressos = useCallback(() => {
        if (!adminUser?.id) {
            setLoadingEgressos(false); // No admin, nothing to load
            return;
        }
        setLoadingEgressos(true);
        api.getEgressos()
            .then(data => {
                setAllEgressos(data);
            })
            .catch(err => {
                console.error("Error fetching egressos:", err);
                showAlert('Falha ao carregar lista de egressos.', 'danger');
            })
            .finally(() => setLoadingEgressos(false));
    }, [adminUser?.id]);

    useEffect(() => {
        fetchAllEgressos();
    }, [fetchAllEgressos, adminUser?.id]); // Runs once on mount and if adminUser.id changes

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Derive filteredEgressos directly
    const filteredEgressos = React.useMemo(() => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        if (!searchTerm.trim()) {
            return allEgressos;
        }
        return allEgressos.filter(egresso =>
            egresso.name.toLowerCase().includes(lowerSearchTerm) ||
            egresso.username.toLowerCase().includes(lowerSearchTerm) ||
            egresso.course?.toLowerCase().includes(lowerSearchTerm)
        );
    }, [searchTerm, allEgressos]);


    const handleDelete = async (id: string) => {
        if (window.confirm("Tem certeza que deseja deletar este usuário? Esta ação é irreversível.")) {
            setOperatingOnEgressoId(id);
            try {
                const success = await api.deleteEgresso(id);
                if (success) {
                    setAllEgressos(prevEgressos => prevEgressos.filter(egresso => egresso.id !== id));
                    showAlert('Usuário deletado com sucesso.', 'success');
                } else {
                    showAlert('Falha ao deletar usuário.', 'danger');
                }
            } catch (error) {
                showAlert('Erro ao deletar usuário.', 'danger');
            } finally {
                setOperatingOnEgressoId(null);
            }
        }
    };

    const handleVerify = async (id: string, currentVerifiedStatus: boolean) => {
        setOperatingOnEgressoId(id);
        try {
            const updatedEgressoData = await api.updateEgresso(id, { verified: !currentVerifiedStatus });
            if (updatedEgressoData) {
                // @ts-ignore
                const updatedEgressoInstance = Egresso.fromJson({ ...updatedEgressoData.toJson(), id: updatedEgressoData.id! });
                setAllEgressos(prevEgressos =>
                    prevEgressos.map(egresso =>
                        egresso.id === id ? updatedEgressoInstance : egresso
                    )
                );
                showAlert(`Usuário ${!currentVerifiedStatus ? 'verificado' : 'não verificado'} com sucesso.`);
            } else {
                showAlert('Falha ao atualizar o status de verificação.', 'danger');
            }
        } catch (error) {
            showAlert('Erro ao atualizar status de verificação.', 'danger');
        } finally {
            setOperatingOnEgressoId(null);
        }
    };

    if (loadingEgressos) {
        return <Container className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-2">Carregando usuários...</p></Container>;
    }

    return (
        <Container fluid>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0 section-title" style={{ borderBottom: 'none', fontSize: '1.5rem' }}>Gerenciar Usuários (Egressos)</h3>
            </div>
            <Form.Control
                type="text"
                placeholder="Buscar por nome, nome de usuário ou curso..."
                className="mb-3 form-control-modern"
                value={searchTerm}
                onChange={handleSearchChange}
            />
            {filteredEgressos.length === 0 && !loadingEgressos ? (
                <Alert variant="info" className="modern-alert text-center">
                    {searchTerm ? "Nenhum egresso encontrado com os termos da busca." : "Nenhum egresso cadastrado no sistema."}
                </Alert>
            ) : (
                <div className="modern-card" style={{ border: 'none', boxShadow: 'none' }}>
                    <Table hover className="modern-table mb-0">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Nome de Usuário</th>
                                <th>Curso</th>
                                <th className="text-center">Verificado</th>
                                <th className="text-end" style={{ whiteSpace: 'nowrap' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEgressos.map(egresso => (
                                <tr key={egresso.id}>
                                    <td><Link to={`/profile/${egresso.id}`}>{egresso.name}</Link></td>
                                    <td>{egresso.username}</td>
                                    <td>{egresso.course || 'N/A'}</td>
                                    <td className={`text-center fw-medium ${egresso.verified ? 'text-success' : 'text-danger'}`}>{egresso.verified ? 'Sim' : 'Não'}</td>
                                    <td className="text-end">
                                        <Button
                                            variant={egresso.verified ? 'outline-warning' : 'outline-success'}
                                            className="me-2 btn-modern"
                                            onClick={() => handleVerify(egresso.id!, egresso.verified)}
                                            size="sm"
                                            disabled={operatingOnEgressoId === egresso.id}
                                        >
                                            {operatingOnEgressoId === egresso.id ? <Spinner as="span" size="sm" animation="border" /> : (egresso.verified ? 'Desverificar' : 'Verificar')}
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            onClick={() => handleDelete(egresso.id!)}
                                            size="sm"
                                            className="btn-modern"
                                            disabled={operatingOnEgressoId === egresso.id}
                                        >
                                            {operatingOnEgressoId === egresso.id ? <Spinner as="span" size="sm" animation="border" /> : 'Deletar'}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </Container>
    );
};

export default AdminUsersView;