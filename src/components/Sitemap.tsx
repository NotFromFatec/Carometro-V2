// src/components/Sitemap.tsx
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAppContext } from '../AppContext';

const Sitemap: React.FC = () => {
    const { isLoggedIn, isAdminLoggedIn } = useAppContext();

    return (
        <Container className="py-4 sitemap-container">
            <h1 className="page-title text-center mb-4">Mapa do Site</h1>
            <Row>
                <Col md={6} lg={4}>
                    <h3>Páginas Públicas</h3>
                    <ul>
                        <li><Link to="/">Página Inicial Pública</Link></li>
                        <li><Link to="/search">Buscar Egressos</Link></li>
                        {!isLoggedIn && !isAdminLoggedIn && (
                            <>
                                <li><Link to="/login">Login (Egresso)</Link></li>
                                <li><Link to="/create-account">Criar Conta (Egresso)</Link></li>
                                <li><Link to="/admin-login">Login (Admin)</Link></li>
                            </>
                        )}
                    </ul>
                </Col>

                {isLoggedIn && !isAdminLoggedIn && (
                    <Col md={6} lg={4}>
                        <h3>Área do Egresso</h3>
                        <ul>
                            <li><Link to="/home">Minha Página Inicial</Link></li>
                            <li><Link to="/profile/me">Meu Perfil</Link> (Redireciona para o ID)</li>
                            <li><Link to="/edit-profile">Editar Meu Perfil</Link></li>
                        </ul>
                    </Col>
                )}

                {isAdminLoggedIn && (
                    <Col md={6} lg={4}>
                        <h3>Painel de Administração</h3>
                        <ul>
                            <li><Link to="/admin">Visão Geral do Admin</Link></li>
                            <li><Link to="/admin/users">Gerenciar Usuários</Link></li>
                            <li><Link to="/admin/invites">Gerenciar Convites</Link></li>
                            <li><Link to="/admin/courses">Gerenciar Cursos</Link></li>
                            <li><Link to="/create-admin">Criar Novo Admin</Link> (Necessario deslogar antes)</li>
                        </ul>
                    </Col>
                )}
                <Col md={6} lg={4}>
                    <h3>Outros</h3>
                    <ul>
                        <li><Link to="/sitemap">Mapa do Site</Link></li>
                    </ul>
                </Col>
            </Row>
        </Container>
    );
};

export default Sitemap;