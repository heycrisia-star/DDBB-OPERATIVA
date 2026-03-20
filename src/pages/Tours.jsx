import React, { useState } from 'react';
import { Search, Filter, Edit2, Download, Plus, ChevronDown, Check, X } from 'lucide-react';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import MultiSelect from '../components/MultiSelect';

import { MOCK_TOURS } from '../data/mockTours';


const VEHICLES = ['01-DR', '02-NR'];
const DRIVERS = ['Cristian', 'Chofer 2', 'Chofer 3'];
const OPERATORS = ['GYG', 'FH', 'VIA', 'IC'];
const TIME_FILTERS = [
    { id: 'today', label: 'Hoy' },
    { id: 'weekly', label: 'Semanal' },
    { id: 'monthly', label: 'Mensual' },
    { id: 'year', label: 'Año' }
];

const DRIVER_COLORS = { 'Cristian': '#0284c7', 'Chofer 2': '#0d9488', 'Chofer 3': '#be123c' };
const VEHICLE_COLORS = { '01-DR': '#ca8a04', '02-NR': '#334155' };
const OPERATOR_COLORS = {
    'GYG': { bg: '#ffedd5', border: '#fdba74', text: '#c2410c' },
    'FH': { bg: '#e0e7ff', border: '#a5b4fc', text: '#4338ca' },
    'VIA': { bg: '#dcfce7', border: '#86efac', text: '#15803d' },
    'IC': { bg: '#f3e8ff', border: '#d8b4fe', text: '#7e22ce' }
};

const LANG_MAP = { 'EN': 'English', 'ES': 'Spanish', 'DE': 'German', 'FR': 'French', 'IT': 'Italian', 'NL': 'Dutch', 'PT': 'Portuguese' };

export default function Tours({ currentUser }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTour, setSelectedTour] = useState(null);
    const isDriver = currentUser?.role === 'driver';
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const currentTime = format(now, 'HH:mm');

    // Filters State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activeShortcut, setActiveShortcut] = useState('');
    const [selectedVehicles, setSelectedVehicles] = useState(VEHICLES);
    const [selectedDrivers, setSelectedDrivers] = useState(DRIVERS);

    // Multiple Operator Selection State
    const [selectedOperators, setSelectedOperators] = useState(OPERATORS);

    const toggleVehicle = (v) => {
        if (selectedVehicles.length === VEHICLES.length) {
            setSelectedVehicles([v]);
        } else if (selectedVehicles.includes(v)) {
            setSelectedVehicles(selectedVehicles.filter(x => x !== v));
        } else setSelectedVehicles([...selectedVehicles, v]);
    };
    const toggleAllVehicles = () => {
        setSelectedVehicles(selectedVehicles.length === VEHICLES.length ? [] : VEHICLES);
    };

    const toggleDriver = (d) => {
        if (selectedDrivers.length === DRIVERS.length) {
            setSelectedDrivers([d]);
        } else if (selectedDrivers.includes(d)) {
            setSelectedDrivers(selectedDrivers.filter(x => x !== d));
        } else setSelectedDrivers([...selectedDrivers, d]);
    };
    const toggleAllDrivers = () => {
        setSelectedDrivers(selectedDrivers.length === DRIVERS.length ? [] : DRIVERS);
    };

    const handleEditClick = (tour) => {
        setSelectedTour({ ...tour });
    };

    const handleCloseModal = () => {
        setSelectedTour(null);
    };

    const handleSave = () => {
        console.log("Guardando datos:", selectedTour);
        alert(`Guardado: ${selectedTour.code} `);
        setSelectedTour(null);
    };

    const handleDownload = () => {
        alert("Descargando CSV de tours...");
    };

    const toggleOperator = (op) => {
        if (selectedOperators.length === OPERATORS.length) {
            setSelectedOperators([op]);
        } else if (selectedOperators.includes(op)) {
            setSelectedOperators(selectedOperators.filter(o => o !== op));
        } else setSelectedOperators([...selectedOperators, op]);
    };

    const toggleAllOperators = () => {
        setSelectedOperators(selectedOperators.length === OPERATORS.length ? [] : OPERATORS);
    }

    const filteredTours = MOCK_TOURS.filter(t => {
        if (currentUser?.role === 'driver' && t.driver !== currentUser.name) return false;
        if (!t.code.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (selectedVehicles.length !== VEHICLES.length && !selectedVehicles.includes(t.vehicle)) return false;
        if (selectedDrivers.length !== DRIVERS.length && !selectedDrivers.includes(t.driver)) return false;
        if (selectedOperators.length !== OPERATORS.length && !selectedOperators.includes(t.operator)) return false;

        if (startDate && t.date < startDate) return false;
        if (endDate && t.date > endDate) return false;

        return true;
    });

    const setDateRangeShortcut = (type) => {
        const today = new Date();
        setActiveShortcut(type);
        if (type === 'today') {
            const str = format(today, 'yyyy-MM-dd');
            setStartDate(str); setEndDate(str);
        } else if (type === 'week') {
            setStartDate(format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
            setEndDate(format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
        } else if (type === 'month') {
            setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'));
            setEndDate(format(endOfMonth(today), 'yyyy-MM-dd'));
        } else if (type === 'all') {
            setStartDate(''); setEndDate('');
        }
    };

    const getOperatorClass = (operator) => {
        switch (operator) {
            case 'GYG': return 'op-gyg';
            case 'FH': return 'op-fh';
            case 'VIA': return 'op-via';
            case 'IC': return 'op-ic';
            default: return 'op-fh';
        }
    }

    // Helper to format date as DD/MM/YYYY
    const formatDate = (dateString) => {
        try {
            return format(parseISO(dateString), 'dd/MM/yyyy');
        } catch {
            return dateString;
        }
    }

    const getDriverColor = (driver) => DRIVER_COLORS[driver] || 'var(--text-primary)';
    const getVehicleColor = (vehicle) => VEHICLE_COLORS[vehicle] || 'var(--text-primary)';

    return (
        <div className="animate-fade-in" style={{ position: 'relative' }}>
            <div className="page-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <h1 className="page-title">Gestión</h1>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button className="btn" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }} onClick={handleDownload}>
                        <Download size={18} /> Descargar Datos
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
                {/* Superior Filter Bar */}
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', minWidth: '250px', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                        <input
                            type="text"
                            className="input"
                            placeholder="Buscar por código..."
                            style={{ paddingLeft: '2.5rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: '0.25rem', marginRight: '0.5rem' }}>
                            <button onClick={() => setDateRangeShortcut('today')} style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', borderRadius: '6px', border: activeShortcut === 'today' ? '1px solid var(--brand-primary)' : '1px solid var(--border-color)', background: activeShortcut === 'today' ? '#1e3a8a' : 'var(--bg-card)', color: activeShortcut === 'today' ? '#fff' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 700, boxShadow: activeShortcut === 'today' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>Hoy</button>
                            <button onClick={() => setDateRangeShortcut('week')} style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', borderRadius: '6px', border: activeShortcut === 'week' ? '1px solid var(--brand-primary)' : '1px solid var(--border-color)', background: activeShortcut === 'week' ? '#1e3a8a' : 'var(--bg-card)', color: activeShortcut === 'week' ? '#fff' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 700, boxShadow: activeShortcut === 'week' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>Semanal</button>
                            <button onClick={() => setDateRangeShortcut('month')} style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', borderRadius: '6px', border: activeShortcut === 'month' ? '1px solid var(--brand-primary)' : '1px solid var(--border-color)', background: activeShortcut === 'month' ? '#1e3a8a' : 'var(--bg-card)', color: activeShortcut === 'month' ? '#fff' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 700, boxShadow: activeShortcut === 'month' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>Mensual</button>
                            <button onClick={() => setDateRangeShortcut('all')} style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', borderRadius: '6px', border: activeShortcut === 'all' ? '1px solid var(--brand-primary)' : '1px solid var(--border-color)', background: activeShortcut === 'all' ? '#1e3a8a' : 'var(--bg-card)', color: activeShortcut === 'all' ? '#fff' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 700, boxShadow: activeShortcut === 'all' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>Todo</button>
                        </div>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="input"
                            style={{ padding: '0.5rem', width: 'auto' }}
                        />
                        <span style={{ color: 'var(--text-secondary)' }}>-</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="input"
                            style={{ padding: '0.5rem', width: 'auto' }}
                        />
                    </div>

                    <MultiSelect
                        label="Coches" options={VEHICLES}
                        selected={selectedVehicles} onChange={toggleVehicle} onToggleAll={toggleAllVehicles}
                    />

                    {!isDriver && (
                        <MultiSelect
                            label="Choferes" options={DRIVERS}
                            selected={selectedDrivers} onChange={toggleDriver} onToggleAll={toggleAllDrivers}
                        />
                    )}
                </div>

                {/* Operator Filter Bar */}
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-hover)', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Ops:</span>
                    <button
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: selectedOperators.length === OPERATORS.length ? 'var(--brand-primary)' : 'var(--bg-card)', color: selectedOperators.length === OPERATORS.length ? '#fff' : 'var(--text-primary)', cursor: 'pointer' }}
                        onClick={toggleAllOperators}
                    >
                        Todos
                    </button>

                    {OPERATORS.map(op => {
                        const colors = OPERATOR_COLORS[op] || { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' };
                        const isSelected = selectedOperators.includes(op);
                        return (
                            <button
                                key={op}
                                onClick={() => toggleOperator(op)}
                                style={{
                                    fontSize: '0.75rem',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    fontWeight: 600,
                                    border: `1px solid ${isSelected ? colors.border : 'var(--border-color)'} `,
                                    background: isSelected ? colors.bg : 'var(--bg-card)',
                                    color: isSelected ? colors.text : 'var(--text-tertiary)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    opacity: isSelected ? 1 : 0.6
                                }}
                            >
                                {op}
                            </button>
                        );
                    })}
                </div>

                <div className="data-table-container" style={{ borderBottomLeftRadius: 'inherit', borderBottomRightRadius: 'inherit' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Operador</th>
                                <th>Idioma</th>
                                <th>Fecha</th>
                                <th>Inicio</th>
                                <th>Hrs</th>
                                <th>Estado</th>
                                <th>Pax</th>
                                <th>Precio</th>
                                <th>Vehículo</th>
                                <th>Chofer</th>
                                <th style={{ textAlign: 'right' }}>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTours.map(tour => {
                                const operatorColors = OPERATOR_COLORS[tour.operator] || { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' };
                                const isCancelled = tour.status.toLowerCase() === 'cancelado';
                                const isPast = (tour.date < today || (tour.date === today && tour.start <= currentTime)) && tour.status.toLowerCase() === 'confirmado';
                                return (
                                    <tr key={tour.id} style={{
                                        textDecoration: isCancelled ? 'line-through' : 'none',
                                        opacity: isCancelled ? 0.6 : (isPast ? 0.7 : 1),
                                        backgroundColor: isCancelled ? 'var(--bg-hover)' : (isPast ? 'var(--bg-hover)' : 'inherit'),
                                        transition: 'all 0.2s ease'
                                    }}>
                                        <td style={{ fontWeight: 500 }}>{tour.code}</td>
                                        <td>
                                            <span
                                                style={{
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    backgroundColor: operatorColors.bg,
                                                    border: `1px solid ${operatorColors.border} `,
                                                    color: operatorColors.text
                                                }}
                                            >
                                                {tour.operator}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500, backgroundColor: 'var(--bg-hover)' }}>
                                                {LANG_MAP[tour.language] || tour.language || 'Spanish'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ whiteSpace: 'nowrap' }}>{formatDate(tour.date)}</div>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600 }}>{tour.start}</span>
                                        </td>
                                        <td>{tour.duration}</td>
                                        <td>
                                            <span
                                                className={`badge ${isPast ? '' : `badge-${tour.status.toLowerCase()}`}`}
                                                style={isPast ? {
                                                    backgroundColor: 'rgba(5,150,105,0.1)',
                                                    color: '#059669',
                                                    fontSize: '0.7rem',
                                                    padding: '0.15rem 0.45rem',
                                                    borderRadius: '4px',
                                                    fontWeight: 700,
                                                    border: '1px solid rgba(5,150,105,0.2)'
                                                } : {}}
                                            >
                                                {isPast ? '✓ Realizado' : tour.status}
                                            </span>
                                        </td>
                                        <td>{tour.pax}</td>
                                        <td style={{ fontWeight: 500 }}>{tour.netPrice ? `€${tour.netPrice}` : '-'}</td>
                                        <td>{tour.vehicle ? <span style={{ color: getVehicleColor(tour.vehicle), fontWeight: 700 }}>{tour.vehicle}</span> : <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Sin</span>}</td>
                                        <td>{tour.driver ? <span style={{ color: getDriverColor(tour.driver), fontWeight: 700 }}>{tour.driver}</span> : <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Sin</span>}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button onClick={() => handleEditClick(tour)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                                <Edit2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedTour && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                        <button onClick={handleCloseModal} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <X size={24} />
                        </button>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', paddingRight: '2rem' }}>Detalle del Tour: {selectedTour.code}</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Operador</p>
                                <p style={{ fontWeight: 500 }}>{selectedTour.operator}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Estado</p>
                                <span className={`badge badge-${selectedTour.status}`} style={{ marginTop: '0.25rem' }}>{selectedTour.status}</span>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Fecha y Hora</p>
                                <p>{formatDate(selectedTour.date)} <br /> {selectedTour.start} ({selectedTour.duration})</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Detalles</p>
                                <p>{selectedTour.pax} pax <br /> {LANG_MAP[selectedTour.language] || selectedTour.language} <br /> €{selectedTour.price}</p>
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.5rem 0' }} />

                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Asignación Manual</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Coche asignado</label>
                                <select
                                    className="input"
                                    value={selectedTour.vehicle || ''}
                                    onChange={(e) => setSelectedTour({ ...selectedTour, vehicle: e.target.value })}
                                >
                                    <option value="">-- Sin asignar --</option>
                                    {VEHICLES.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Chofer asignado</label>
                                <select
                                    className="input"
                                    value={selectedTour.driver || ''}
                                    onChange={(e) => setSelectedTour({ ...selectedTour, driver: e.target.value })}
                                >
                                    <option value="">-- Sin asignar --</option>
                                    {DRIVERS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Observaciones (Internas)</label>
                                <textarea
                                    className="input"
                                    rows="3"
                                    placeholder="Cliente llega tarde, punto de recogida especial..."
                                    value={selectedTour.notes || ''}
                                    onChange={(e) => setSelectedTour({ ...selectedTour, notes: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button className="btn" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)' }} onClick={handleCloseModal}>Cancelar</button>
                                <button className="btn btn-primary" onClick={handleSave}>Guardar Cambios</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
