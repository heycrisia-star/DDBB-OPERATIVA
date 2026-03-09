import React from 'react';
import { User, LogOut, Shield } from 'lucide-react';

export default function Configuracion({ currentUser, onLogout }) {
    return (
        <div className="section animate-fade-in" style={{ padding: '0 2rem' }}>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title">Configuración</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Ajustes de cuenta, preferencias y sistema</p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem', marginBottom: '2rem' }}>
                    <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, var(--brand-light), #e0e7ff)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <User size={40} color="var(--brand-primary)" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentUser?.name || 'Usuario'}</h2>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: currentUser?.role === 'admin' ? '#f0fdf4' : '#f0f9ff', color: currentUser?.role === 'admin' ? '#166534' : '#0369a1', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, marginTop: '0.5rem', border: `1px solid ${currentUser?.role === 'admin' ? '#bbf7d0' : '#bae6fd'}` }}>
                            <Shield size={16} />
                            {currentUser?.role === 'admin' ? 'Administrador del Sistema' : 'Chofer Asignado'}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Permisos Activos</h3>
                        <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                            <ul style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', margin: 0, paddingLeft: '1.25rem', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {currentUser?.role === 'admin' ? (
                                    <>
                                        <li><strong>Acceso total:</strong> Visualización de todos los tours y calendarios.</li>
                                        <li><strong>Métricas:</strong> Visualización de facturación y KPIs globales.</li>
                                        <li><strong>Gestión:</strong> Control total sobre vehículos y choferes.</li>
                                    </>
                                ) : (
                                    <>
                                        <li><strong>Tours:</strong> Visualización de tours asignados a tu nombre.</li>
                                        <li><strong>Agenda:</strong> Acceso a la hoja de ruta personal.</li>
                                        <li><strong>Facturación:</strong> Visualización de métricas y facturación propias.</li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                        <button
                            className="btn"
                            onClick={onLogout}
                            style={{
                                backgroundColor: 'var(--bg-card)',
                                color: '#ef4444',
                                border: '2px solid #fee2e2',
                                width: '100%',
                                justifyContent: 'center',
                                padding: '1rem',
                                fontSize: '1rem',
                                fontWeight: 700,
                                borderRadius: 'var(--radius-lg)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#fef2f2';
                                e.currentTarget.style.borderColor = '#fecaca';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                                e.currentTarget.style.borderColor = '#fee2e2';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <LogOut size={20} />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
