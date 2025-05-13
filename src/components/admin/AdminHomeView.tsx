// src/components/admin/AdminHomeView.tsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { api } from '../../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Colors :root variables
const colorPrimary = 'rgba(59, 130, 246, 0.8)'; // --bs-primary with alpha
const colorPrimaryBorder = 'rgb(59, 130, 246)';
const colorSuccess = 'rgba(16, 185, 129, 0.8)'; // --bs-success with alpha
const colorSuccessBorder = 'rgb(16, 185, 129)';
const colorWarning = 'rgba(245, 158, 11, 0.8)'; // --bs-warning with alpha
const colorWarningBorder = 'rgb(245, 158, 11)';
const colorSecondary = 'rgba(107, 114, 128, 0.8)'; // --bs-secondary with alpha
const colorSecondaryBorder = 'rgb(107, 114, 128)';
// const colorInfo = 'rgba(59, 130, 246, 0.8)'; // --bs-info (same as primary here)
// const colorInfoBorder = 'rgb(59, 130, 246)';
const colorDanger = 'rgba(239, 68, 68, 0.8)'; // --bs-danger with alpha
// const colorDangerBorder = 'rgb(239, 68, 68)';


const AdminHomeView: React.FC = () => {
    const [stats, setStats] = useState<{
        totalEgressos: number; verifiedEgressos: number; unverifiedEgressos: number;
        totalInvites: number; usedInvites: number; unusedInvites: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true); setError(null);
            try {
                const [egressosData, invitesData] = await Promise.all([
                    api.getEgressos(),
                    api.getInvites(),
                ]);

                const totalEgressos = egressosData.length;
                const verifiedEgressos = egressosData.filter(e => e.verified).length;
                const totalInvites = invitesData.length;
                const usedInvites = invitesData.filter(inv => inv.used).length;

                setStats({
                    totalEgressos, verifiedEgressos, unverifiedEgressos: totalEgressos - verifiedEgressos,
                    totalInvites, usedInvites, unusedInvites: totalInvites - usedInvites,
                });
            } catch (err) {
                console.error("Error fetching admin stats:", err)
                setError("Falha ao carregar estatísticas. Tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const egressoStatusChartData = {
        labels: ['Verificados', 'Não Verificados'],
        datasets: [{
            label: 'Egressos',
            data: [stats?.verifiedEgressos || 0, stats?.unverifiedEgressos || 0],
            backgroundColor: [colorSuccess, colorWarning],
            borderColor: [colorSuccessBorder, colorWarningBorder],
            borderWidth: 1,
        }],
    };

    const inviteStatusChartData = {
        labels: ['Utilizados', 'Disponíveis'],
        datasets: [{
            label: 'Convites',
            data: [stats?.usedInvites || 0, stats?.unusedInvites || 0],
            backgroundColor: [colorPrimary, colorSecondary],
            borderColor: [colorPrimaryBorder, colorSecondaryBorder],
            borderWidth: 1,
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' as const, labels: { color: 'var(--text-muted)' } },
            title: { display: true, text: '', color: 'var(--text-default)' },
            tooltip: {
                bodyFont: { family: 'Inter, sans-serif' },
                titleFont: { family: 'Inter, sans-serif' }
            }
        },
        scales: { // Bar chart only
            x: { ticks: { color: 'var(--text-muted)' }, grid: { display: false } },
            y: { ticks: { color: 'var(--text-muted)', stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.05)' } }
        }
    };
    const pieChartOptions = { ...chartOptions, scales: {} }; // Remove scales for Pie chart


    if (loading) return <Container className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-2">Carregando...</p></Container>;
    if (error) return <Alert variant="danger" className="modern-alert">{error}</Alert>;
    if (!stats) return <Alert variant="warning" className="modern-alert">Nenhuma estatística disponível.</Alert>;

    return (
        <Container fluid>
            <h3 className="mb-4 section-title" style={{ borderBottom: 'none', fontSize: '1.75rem' }}>Visão Geral do Sistema</h3>
            <Row className="g-4 mb-4">
                <Col md={6} lg={4} xl={3}><Card className="modern-card stat-card border-primary h-100"><Card.Body className="text-center"><div className="stat-number">{stats.totalEgressos}</div><div className="stat-label">Total de Egressos</div></Card.Body></Card></Col>
                <Col md={6} lg={4} xl={3}><Card className="modern-card stat-card border-success h-100"><Card.Body className="text-center"><div className="stat-number">{stats.verifiedEgressos}</div><div className="stat-label">Egressos Verificados</div></Card.Body></Card></Col>
                <Col md={6} lg={4} xl={3}><Card className="modern-card stat-card border-warning h-100"><Card.Body className="text-center"><div className="stat-number">{stats.unverifiedEgressos}</div><div className="stat-label">Não Verificados</div></Card.Body></Card></Col>

                <Col md={6} lg={4} xl={3}><Card className="modern-card stat-card border-info h-100"><Card.Body className="text-center"><div className="stat-number">{stats.totalInvites}</div><div className="stat-label">Total de Convites</div></Card.Body></Card></Col>
                <Col md={6} lg={4} xl={3}><Card className="modern-card stat-card border-success h-100"><Card.Body className="text-center"><div className="stat-number">{stats.usedInvites}</div><div className="stat-label">Convites Utilizados</div></Card.Body></Card></Col>
                <Col md={6} lg={4} xl={3}><Card className="modern-card stat-card border-danger h-100"><Card.Body className="text-center"><div className="stat-number">{stats.unusedInvites}</div><div className="stat-label">Convites Disponíveis</div></Card.Body></Card></Col>
            </Row>

            <Row className="g-4">
                <Col lg={6} xl={4}>
                    <Card className="modern-card h-100">
                        <Card.Header as="h5" className="section-title-card text-center">Egressos por Status</Card.Header>
                        <Card.Body>
                            <div className="chart-container">
                                {(stats.verifiedEgressos > 0 || stats.unverifiedEgressos > 0) ?
                                    <Pie data={egressoStatusChartData} options={{ ...pieChartOptions, plugins: { ...pieChartOptions.plugins, title: { display: false } } }} /> :
                                    <p className="text-muted text-center pt-5">Sem dados de egressos para exibir.</p>
                                }
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6} xl={4}>
                    <Card className="modern-card h-100">
                        <Card.Header as="h5" className="section-title-card text-center">Convites por Status</Card.Header>
                        <Card.Body>
                            <div className="chart-container">
                                {(stats.usedInvites > 0 || stats.unusedInvites > 0) ?
                                    <Bar data={inviteStatusChartData} options={{ ...chartOptions, indexAxis: 'y', plugins: { ...chartOptions.plugins, title: { display: false } } }} /> :
                                    <p className="text-muted text-center pt-5">Sem dados de convites para exibir.</p>
                                }
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                {/* <Col lg={12} xl={4}>
                    <Card className="modern-card h-100">
                        <Card.Header as="h5" className="section-title-card text-center">Atividade Recente (Placeholder)</Card.Header>
                        <Card.Body className="text-muted d-flex align-items-center justify-content-center">
                            <p>Mais gráficos ou listas de atividades recentes aqui.</p>
                        </Card.Body>
                    </Card>
                </Col> */}
            </Row>
        </Container>
    );
};

export default AdminHomeView;