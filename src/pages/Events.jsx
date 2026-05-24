import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Clock, AlertTriangle } from 'lucide-react';
import MOCK_EVENTS from '../data/mockEvents';

const Events = ({ currentUser }) => {
    const [events, setEvents] = useState(MOCK_EVENTS);
    const [isMobile] = useState(window.innerWidth <= 768);

    const [newEvent, setNewEvent] = useState({
        date: '',
        title: '',
        start: '08:00',
        end: '14:00',
        description: 'Cortes de tráfico por carrera popular.'
    });

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newEvent.date || !newEvent.title) return;
        
        const eventObj = {
            id: Date.now(),
            type: 'warning',
            ...newEvent
        };
        
        setEvents([...events, eventObj].sort((a, b) => a.date.localeCompare(b.date)));
        setNewEvent({ ...newEvent, title: '', date: '' });
    };

    const handleDelete = (id) => {
        setEvents(events.filter(ev => ev.id !== id));
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <AlertTriangle size={24} color="#dc2626" />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Alertas de Tráfico / Eventos</h2>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    Gestiona aquí las carreras populares, manifestaciones o eventos que impliquen cortes de tráfico en el centro de Barcelona o Montjuïc. Los eventos que añadas aquí aparecerán automáticamente con un icono 🚧 en tu calendario.
                </p>

                <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr 1fr 1fr auto', gap: '1rem', alignItems: 'end', marginBottom: '2rem', backgroundColor: 'var(--bg-hover)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>FECHA</label>
                        <input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', fontSize: '0.875rem' }} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>EVENTO</label>
                        <input type="text" placeholder="Ej: Cursa dels Nassos" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', fontSize: '0.875rem' }} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>INICIO CORTE</label>
                        <input type="time" value={newEvent.start} onChange={e => setNewEvent({...newEvent, start: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', fontSize: '0.875rem' }} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>FIN CORTE</label>
                        <input type="time" value={newEvent.end} onChange={e => setNewEvent({...newEvent, end: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', fontSize: '0.875rem' }} required />
                    </div>
                    <button type="submit" style={{ backgroundColor: 'var(--brand-primary)', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '0.25rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', height: '100%' }}>
                        <Plus size={18} />
                        <span>Añadir</span>
                    </button>
                </form>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                <th style={{ padding: '1rem', fontWeight: 800 }}>FECHA</th>
                                <th style={{ padding: '1rem', fontWeight: 800 }}>EVENTO</th>
                                <th style={{ padding: '1rem', fontWeight: 800 }}>HORARIO</th>
                                <th style={{ padding: '1rem', fontWeight: 800, textAlign: 'right' }}>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map(ev => (
                                <tr key={ev.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Calendar size={16} color="var(--text-tertiary)" />
                                            {ev.date.split('-').reverse().join('/')}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 600, color: '#991b1b' }}>{ev.title}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Clock size={16} color="var(--text-tertiary)" />
                                            {ev.start} - {ev.end}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button onClick={() => handleDelete(ev.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', opacity: 0.7 }} title="Eliminar alerta">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {events.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                        No hay eventos de tráfico registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Events;
