import React, { useState } from 'react';
import { Lock, User, LogIn } from 'lucide-react';

const USERS = {
    '2026': { name: 'Cristian', role: 'admin' },
    '0000': { name: 'Roger', role: 'driver' },
    '1111': { name: 'Marco', role: 'driver' }
};

export default function Login({ onLogin }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const user = USERS[password];
        if (user) {
            setError('');
            onLogin(user);
        } else {
            setError('Contraseña incorrecta');
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: 'var(--bg-color)',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            <div className="card animate-fade-in" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '2.5rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <img
                        src="https://res.cloudinary.com/dk7xpxrvh/image/upload/v1771317526/ultimo_intento_yrsutn.png"
                        alt="Legacy Tours Spain Logo"
                        style={{ maxWidth: '200px', margin: '0 auto 1rem', display: 'block' }}
                    />
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                            <input
                                type="password"
                                placeholder="Contraseña de acceso"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input"
                                style={{ width: '100%', paddingLeft: '2.5rem', height: '48px', fontSize: '1rem' }}
                                autoFocus
                            />
                        </div>
                        {error && <p style={{ color: 'var(--status-cancelled)', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center' }}>{error}</p>}
                    </div>

                    <button type="submit" className="button" style={{ height: '48px', fontSize: '1rem', fontWeight: 600, width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                        <LogIn size={20} /> Entrar
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Área restringida solo para personal autorizado.</p>
                </div>
            </div>
        </div>
    );
}
