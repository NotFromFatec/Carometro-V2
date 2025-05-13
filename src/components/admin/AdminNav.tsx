import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useResolvedPath, useMatch } from 'react-router-dom';

interface AdminNavLinkProps {
    to: string;
    children: React.ReactNode;
    end?: boolean;
}

const AdminViewNavLink: React.FC<AdminNavLinkProps> = ({ to, children, end = false }) => {
    const resolved = useResolvedPath(to);

    const match = useMatch({ path: resolved.pathname, end: end });

    return (
        <Nav.Link as={Link} to={to} active={!!match} className="nav-link">
            {children}
        </Nav.Link>
    );
};

const AdminNav: React.FC = () => {
    return (
        <Nav variant="pills" className="flex-column flex-md-row nav-pills-modern mb-4 justify-content-center">
            <Nav.Item>
                {/* Use end prop carefully. Should be true for the index/overview link */}
                <AdminViewNavLink to="/admin" end>Visão Geral</AdminViewNavLink>
            </Nav.Item>
            <Nav.Item>
                <AdminViewNavLink to="/admin/users">Gerenciar Usuários</AdminViewNavLink>
            </Nav.Item>
            <Nav.Item>
                <AdminViewNavLink to="/admin/invites">Gerenciar Convites</AdminViewNavLink>
            </Nav.Item>
            <Nav.Item>
                <AdminViewNavLink to="/admin/courses">Gerenciar Cursos</AdminViewNavLink>
            </Nav.Item>
            <Nav.Item>
                <AdminViewNavLink to="/admin/email">Enviar E-mail</AdminViewNavLink> {/* Add email link */}
            </Nav.Item>
        </Nav>
    );
};

export default AdminNav;