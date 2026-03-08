import React from 'react';
import { User, LogOut, Shield } from 'lucide-react';

export default function Configuracion({ currentUser, onLogout }) {
    return (
        <div className="section animate-fade-in" style={{ padding: '0 2rem' }}>
            <div className="section-header">
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Configuración</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Ajustes de cuenta y sistema</p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--bg-hover)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={32} color="var(--brand-primary)" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{currentUser.name}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                            <Shield size={14} />
                            {currentUser.role === 'admin' ? 'Administrador del Sistema' : 'Chofer Asignado'}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ padding: '1rem', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Permisos Activos</h3>
                        <ul style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginLeft: '1.5rem', listStyleType: 'disc' }}>
                            {currentUser.role === 'admin' ? (
                                <>
                                    <li>Acceso total a todos los tours y calendarios.</li>
                                    <li>Visualización de facturación y KPIs globales.</li>
                                    <li>Gestión de todos los vehículos y choferes.</li>
                                </>
                            ) : (
                                <>
                                    <li>Visualización de tours asignados a tu nombre.</li>
                                    <li>Acceso a hoja de ruta personal.</li>
                                    <li>Visualización de métricas y facturación propias.</li>
                                </>
                            )}
                        </ul>
                    </div>

                    <button className="button" onClick={onLogout} style={{ marginTop: '1rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--status-cancelled)', color: 'var(--status-cancelled)', justifyContent: 'center' }}>
                        <LogOut size={18} /> Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
}
