import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, Calendar as CalendarIcon, Clock, Users, UserCircle, Phone, Globe, Ship, MapPin } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import MultiSelect from '../components/MultiSelect';

import { MOCK_TOURS } from '../data/mockTours';
import { MOCK_CRUISES } from '../data/mockCruises';


const OPERATOR_COLORS = {
    'GYG': { bg: '#ffedd5', border: '#fdba74', text: '#c2410c' }, // Naranja
    'FH': { bg: '#e0e7ff', border: '#a5b4fc', text: '#4338ca' },  // Indigo
    'VIA': { bg: '#dcfce7', border: '#86efac', text: '#15803d' }, // Verde
    'IC': { bg: '#f3e8ff', border: '#d8b4fe', text: '#7e22ce' }   // Purpura
};

const VEHICLES = ['01-DR', '02-NR'];
const DRIVERS = ['Cristian', 'Carlos', 'Joao'];
const OPERATORS = ['GYG', 'FH', 'VIA', 'IC', 'CASH'];

const DRIVER_COLORS = { 'Cristian': '#0284c7', 'Carlos': '#0d9488', 'Joao': '#be123c' };
const VEHICLE_COLORS = { '01-DR': '#ca8a04', '02-NR': '#334155' };
const LANG_MAP = { 'EN': 'English', 'ES': 'Spanish', 'DE': 'German', 'FR': 'French', 'IT': 'Italian', 'NL': 'Dutch', 'PT': 'Portuguese' };

export default function Calendar({ currentUser }) {
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const currentTime = format(now, 'HH:mm');
    const thisWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const thisWeekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [viewMode, setViewMode] = useState('agenda');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState(thisWeekStart);
    const [endDate, setEndDate] = useState(thisWeekEnd);
    const [activeShortcut, setActiveShortcut] = useState('week');
    const [statusFilter, setStatusFilter] = useState('all'); // all | confirmado | realizado | cancelado
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const isDriver = currentUser?.role === 'driver';

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [selectedVehicles, setSelectedVehicles] = useState(VEHICLES);
    const [selectedDrivers, setSelectedDrivers] = useState(DRIVERS);
    const [selectedOperators, setSelectedOperators] = useState(OPERATORS);

    const setDateRangeShortcut = (type) => {
        const today = new Date();
        setActiveShortcut(type);
        setViewMode('agenda');
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

    const handleStartDateChange = (val) => {
        setStartDate(val);
        setActiveShortcut('');
        if (!endDate || endDate < val) {
            try { setEndDate(format(endOfMonth(new Date(val + 'T00:00:00')), 'yyyy-MM-dd')); } catch { setEndDate(val); }
        }
    };

    const toggleVehicle = (v) => {
        if (selectedVehicles.includes(v)) {
            setSelectedVehicles(selectedVehicles.filter(x => x !== v));
        } else setSelectedVehicles([...selectedVehicles, v]);
    };
    const toggleAllVehicles = () => {
        setSelectedVehicles(selectedVehicles.length === VEHICLES.length ? [] : VEHICLES);
    };

    const toggleDriver = (d) => {
        if (selectedDrivers.includes(d)) {
            setSelectedDrivers(selectedDrivers.filter(x => x !== d));
        } else setSelectedDrivers([...selectedDrivers, d]);
    };
    const toggleAllDrivers = () => {
        setSelectedDrivers(selectedDrivers.length === DRIVERS.length ? [] : DRIVERS);
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToToday = () => setCurrentMonth(new Date());

    const toggleOperator = (op) => {
        if (selectedOperators.includes(op)) {
            setSelectedOperators(selectedOperators.filter(o => o !== op));
        } else {
            setSelectedOperators([...selectedOperators, op]);
        }
    };

    const toggleAllOperators = () => {
        if (selectedOperators.length === OPERATORS.length) {
            setSelectedOperators([]);
        } else {
            setSelectedOperators(OPERATORS);
        }
    };

    const renderHeader = () => {
        return (
            <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '1rem', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-start' }}>
                        <h1 className="page-title" style={{ margin: 0, textTransform: 'capitalize', fontSize: isMobile ? '1.25rem' : '1.75rem' }}>
                            {format(currentMonth, 'MMMM yyyy', { locale: es })}
                        </h1>
                        <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', padding: '0.2rem' }}>
                            <button onClick={prevMonth} style={{ padding: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}><ChevronLeft size={isMobile ? 18 : 20} color="var(--text-secondary)" /></button>
                            <button onClick={goToToday} style={{ padding: '0.4rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--text-secondary)', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>Hoy</button>
                            <button onClick={nextMonth} style={{ padding: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}><ChevronRight size={isMobile ? 18 : 20} color="var(--text-secondary)" /></button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: isMobile ? '100%' : 'auto', flexWrap: 'wrap' }}>
                        {/* View mode toggle */}
                        <div style={{ display: 'flex', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', flex: isMobile ? 1 : 'none' }}>
                            <button
                                onClick={() => setViewMode('month')}
                                style={{ flex: isMobile ? 1 : 'none', padding: isMobile ? '0.4rem 0.5rem' : '0.5rem 1rem', border: 'none', background: viewMode === 'month' ? 'var(--brand-light)' : 'transparent', color: viewMode === 'month' ? 'var(--brand-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: isMobile ? '0.8rem' : '0.875rem' }}
                            >
                                Mes
                            </button>
                            <button
                                onClick={() => setViewMode('agenda')}
                                style={{ flex: isMobile ? 1 : 'none', padding: isMobile ? '0.4rem 0.5rem' : '0.5rem 1rem', border: 'none', background: viewMode === 'agenda' ? 'var(--brand-light)' : 'transparent', color: viewMode === 'agenda' ? 'var(--brand-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: isMobile ? '0.8rem' : '0.875rem' }}
                            >
                                Agenda
                            </button>
                            <button
                                onClick={() => setViewMode('ultimas')}
                                style={{ flex: isMobile ? 1 : 'none', padding: isMobile ? '0.4rem 0.5rem' : '0.5rem 1rem', border: 'none', background: viewMode === 'ultimas' ? 'var(--brand-light)' : 'transparent', color: viewMode === 'ultimas' ? 'var(--brand-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: isMobile ? '0.8rem' : '0.875rem', borderLeft: '1px solid var(--border-color)' }}
                            >
                                Últimas
                            </button>
                        </div>

                        {/* Search */}
                        <div style={{ position: 'relative', flex: isMobile ? 1.5 : 'none' }}>
                            <Search size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    padding: '0.4rem 1rem 0.4rem 2.25rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'var(--bg-card)',
                                    color: 'var(--text-primary)',
                                    width: '100%',
                                    outline: 'none',
                                    fontSize: isMobile ? '0.8rem' : '0.875rem'
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ marginBottom: '2rem', padding: 0 }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: isMobile ? 'center' : 'space-between' }}>

                        {viewMode === 'agenda' && (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', gap: '0.25rem', marginRight: '0.5rem' }}>
                                    {[['today', 'Hoy'], ['week', 'Semana'], ['month', 'Mes'], ['all', 'Todo']].map(([key, label]) => {
                                        const isActive = activeShortcut === key;
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => setDateRangeShortcut(key)}
                                                style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.35rem 0.7rem',
                                                    borderRadius: '6px',
                                                    border: isActive ? '1px solid var(--brand-primary)' : '1px solid var(--border-color)',
                                                    background: isActive ? 'var(--brand-primary)' : 'var(--bg-card)',
                                                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                                                    cursor: 'pointer',
                                                    fontWeight: isActive ? 700 : 600,
                                                    boxShadow: isActive ? '0 2px 6px rgba(59,130,246,0.35)' : 'none',
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <input type="date" value={startDate} onChange={(e) => handleStartDateChange(e.target.value)} style={{ padding: '0.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.875rem' }} />
                                <span style={{ color: 'var(--text-secondary)' }}>-</span>
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '0.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.875rem' }} />
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1 }}>
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
                    </div>

                    <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--border-color)', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '0.25rem' }}>Estado:</span>
                        {[
                            { key: 'all', label: 'Todos', color: 'var(--brand-primary)', bg: 'var(--brand-light)' },
                            { key: 'confirmado', label: '✔ Confirmado', color: '#15803d', bg: '#dcfce7' },
                            { key: 'realizado', label: '✓ Realizado', color: '#065f46', bg: 'rgba(5,150,105,0.15)' },
                            { key: 'cancelado', label: '✕ Cancelado', color: '#b91c1c', bg: '#fee2e2' },
                        ].map(({ key, label, color, bg }) => (
                            <button key={key} onClick={() => setStatusFilter(key)} style={{
                                fontSize: '0.72rem', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 700,
                                border: `1px solid ${statusFilter === key ? color : 'var(--border-color)'}`,
                                background: statusFilter === key ? bg : 'var(--bg-card)',
                                color: statusFilter === key ? color : 'var(--text-secondary)',
                                cursor: 'pointer', transition: 'all 0.15s ease'
                            }}>{label}</button>
                        ))}
                    </div>

                    <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-hover)', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', borderBottomLeftRadius: 'inherit', borderBottomRightRadius: 'inherit' }}>
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
                                        border: `1px solid ${isSelected ? colors.border : 'var(--border-color)'}`,
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
                </div>
            </>
        );
    };

    const renderDays = () => {
        const days = [];
        const startDate = startOfWeek(currentMonth, { weekStartsOn: 1 }); // Comienza en Lunes

        for (let i = 0; i < 7; i++) {
            const date = addDays(startDate, i);
            const label = isMobile ? format(date, 'eeeee', { locale: es }) : format(date, 'EEE', { locale: es });
            days.push(
                <div key={i} style={{ padding: isMobile ? '0.5rem 0.25rem' : '0.75rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', textTransform: 'uppercase', fontSize: isMobile ? '0.65rem' : '0.75rem', letterSpacing: '0.05em' }}>
                    {label}
                </div>
            );
        }

        return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: 'var(--bg-card)' }}>{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const dateFormat = 'd';
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = '';

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isCurrentDay = isToday(day);

                // Obtener tours del día
                const dayTours = MOCK_TOURS.filter(t => {
                    if (currentUser?.role === 'driver' && t.driver !== currentUser.name) return false;
                    if (t.date !== format(day, 'yyyy-MM-dd')) return false;
                    if (searchTerm) {
                        const q = searchTerm.toLowerCase();
                        if (
                            !t.code?.toLowerCase().includes(q) &&
                            !t.driver?.toLowerCase().includes(q) &&
                            !t.clientName?.toLowerCase().includes(q) &&
                            !t.phone?.toLowerCase().includes(q)
                        ) return false;
                    }
                    if (selectedVehicles.length !== VEHICLES.length && !selectedVehicles.some(v => t.vehicle?.includes(v))) return false;
                    if (selectedDrivers.length !== DRIVERS.length && !selectedDrivers.some(d => t.driver?.includes(d))) return false;
                    if (selectedOperators.length > 0 && !selectedOperators.includes(t.operator)) return false;
                    return true;
                });

                days.push(
                    <div
                        key={day}
                        style={{
                            minHeight: isMobile ? '80px' : '120px',
                            padding: isMobile ? '0.25rem' : '0.5rem',
                            borderRight: '1px solid var(--border-color)',
                            borderBottom: '1px solid var(--border-color)',
                            backgroundColor: isCurrentMonth ? 'var(--bg-card)' : 'var(--bg-hover)',
                            opacity: isCurrentMonth ? 1 : 0.5,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem',
                            cursor: isMobile ? 'pointer' : 'default'
                        }}
                        onClick={() => {
                            if (isMobile) setViewMode('agenda');
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            {MOCK_CRUISES[format(day, 'yyyy-MM-dd')] > 0 ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#0369a1', fontSize: '0.65rem', fontWeight: 800, backgroundColor: '#e0f2fe', padding: '2px 5px', borderRadius: '4px' }} title={`${MOCK_CRUISES[format(day, 'yyyy-MM-dd')]} cruceros hoy`}>
                                    <Ship size={12} strokeWidth={2.5} />
                                    <span>x{MOCK_CRUISES[format(day, 'yyyy-MM-dd')]}</span>
                                </div>
                            ) : <div />}
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: isCurrentDay ? 'var(--brand-primary)' : 'transparent',
                                color: isCurrentDay ? 'white' : 'var(--text-primary)',
                                fontWeight: isCurrentDay ? 700 : 500,
                                fontSize: '0.875rem'
                            }}>
                                {formattedDate}
                            </span>
                        </div>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: isMobile ? '2px' : '0.25rem',
                            overflowY: isMobile ? 'visible' : 'auto',
                            flex: 1,
                            justifyContent: 'flex-start'
                        }}>
                            {dayTours.sort((a, b) => a.start.localeCompare(b.start)).map(tour => {
                                const colors = OPERATOR_COLORS[tour.operator] || { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' };
                                const isCancelled = tour.status === 'cancelado';
                                const isModified = tour.status === 'modificado';
                                // Unificar lógica de pasado: día anterior o hoy después de hora inicio
                                const isPast = tour.date < today || (tour.date === today && tour.start <= currentTime);

                                // Driver color overrides — makes it easy to see who's driving
                                const DRIVER_COLORS = {
                                    'Carlos': { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
                                    'Joao': { bg: '#dbeafe', border: '#3b82f6', text: '#1e3a8a' },
                                };
                                const driverColor = DRIVER_COLORS[tour.driver];
                                const cardBg = driverColor ? driverColor.bg : colors.bg;
                                const cardBorder = driverColor ? driverColor.border : colors.text;
                                const cardText = driverColor ? driverColor.text : colors.text;

                                // Estilos dinámicos por estado
                                const statusStyles = {
                                    backgroundColor: isCancelled ? '#f1f5f9' : (isModified ? '#fef3c7' : (isPast ? '#f1f5f9' : cardBg)),
                                    borderLeftColor: isCancelled ? '#94a3b8' : (isModified ? '#f59e0b' : (isPast ? '#94a3b8' : cardBorder)),
                                    textDecoration: isCancelled ? 'line-through' : 'none',
                                    opacity: (isPast || isCancelled) ? 0.6 : 1, // Reducir opacidad para ambos
                                    color: (isCancelled || isPast) ? '#64748b' : (isModified ? '#92400e' : cardText)
                                };

                                return (
                                    <div
                                        key={tour.id}
                                        style={{
                                            padding: isMobile ? '0.15rem 0.25rem' : '0.25rem 0.4rem',
                                            borderRadius: 'var(--radius-sm)',
                                            backgroundColor: statusStyles.backgroundColor,
                                            borderLeft: `${isMobile ? '2px' : '3px'} solid ${statusStyles.borderLeftColor}`,
                                            fontSize: isMobile ? '0.6rem' : '0.7rem',
                                            cursor: 'pointer',
                                            opacity: statusStyles.opacity,
                                            textDecoration: statusStyles.textDecoration,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.05rem',
                                            transition: 'transform 0.1s ease',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                            marginBottom: '1px'
                                        }}
                                        title={`${tour.operator} - ${tour.code} | Coche: ${tour.vehicle} | Chofer: ${tour.driver}`}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800 }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                {tour.start}
                                                <span style={{ fontSize: '0.6rem', opacity: 0.7, fontWeight: 500 }}>{parseInt(tour.duration)}h</span>
                                                {tour.pickup && <MapPin size={10} color="#eab308" strokeWidth={3} />}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', whiteSpace: 'nowrap', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                                <span style={{ fontSize: isMobile ? '0.55rem' : '0.65rem', letterSpacing: '-0.5px', opacity: 0.85, whiteSpace: 'nowrap' }}>
                                                    {'👤'.repeat(Math.min(parseInt(tour.pax) || 1, 4))}
                                                </span>
                                                <span style={{ fontSize: isMobile ? '0.5rem' : '0.6rem', marginLeft: '0.2rem' }}>{tour.operator !== 'CASH' ? tour.operator : ''}</span>
                                                {(tour.payment === 'CASH' || tour.operator === 'CASH') && (
                                                    <span style={{ marginLeft: '0.1rem', backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.5rem', fontWeight: 800, padding: '0.1rem 0.2rem', borderRadius: '3px', border: '1px solid #86efac' }}>
                                                        CASH
                                                    </span>
                                                )}
                                            </span>
                                        </div>

                                        <div style={{
                                            color: isCancelled ? '#b91c1c' : 'var(--text-primary)',
                                            fontWeight: 700,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            fontSize: isMobile ? '0.65rem' : '0.75rem',
                                            lineHeight: '1.1'
                                        }}>
                                            {tour.clientName}
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            fontSize: isMobile ? '0.55rem' : '0.65rem',
                                            marginTop: '0.1rem'
                                        }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', color: (isCancelled || isPast) ? '#64748b' : 'var(--text-secondary)' }}>
                                                <Globe size={isMobile ? 8 : 10} /> {tour.language}
                                                {isPast && !isCancelled && <span style={{ color: '#059669', fontWeight: 800, fontSize: '0.65rem', marginLeft: '0.2rem' }}>✓</span>}
                                            </span>
                                            {tour.driver && (
                                                <span style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.15rem',
                                                    color: (isCancelled || isPast) ? '#64748b' : (DRIVER_COLORS[tour.driver] || 'var(--text-secondary)'),
                                                    fontWeight: 700
                                                }}>
                                                    {tour.driver}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div style={{ borderTop: '1px solid var(--border-color)', borderLeft: '1px solid var(--border-color)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', overflow: 'hidden' }}>{rows}</div>;
    };

    // ─── renderUltimas ────────────────────────────────────────────────
    const renderUltimas = () => {
        const last7Days = addDays(new Date(), -7);
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const sevenDaysAgoStr = format(last7Days, 'yyyy-MM-dd');

        const recentTours = [...MOCK_TOURS]
            .sort((a, b) => (b.id || 0) - (a.id || 0))
            .slice(0, 10);

        const statusColor = {
            confirmado: { bg: '#dcfce7', text: '#15803d' },
            cancelado: { bg: '#fee2e2', text: '#b91c1c' },
            modificado: { bg: '#fef3c7', text: '#92400e' }
        };

        return (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-card)' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Reservas última semana</h3>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Desde {format(last7Days, 'dd MMM', { locale: es })} hasta hoy · {recentTours.length} reservada{recentTours.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 500, display: 'block' }}>Actualización: 5:00, 11:00, 16:00, 22:00</span>
                    </div>
                </div>

                {recentTours.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>No hay movimientos en los últimos 7 días.</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--bg-hover)' }}>
                                    {['CÓDIGO', 'OPERADOR', 'F. RESERVA', 'F. TOUR', 'HORA', 'ESTADO', 'PAX', 'VEHÍCULO', 'CHOFER'].map(h => (
                                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {recentTours.map((tour, i) => {
                                    const sc = statusColor[tour.status?.toLowerCase()] || { bg: 'var(--bg-hover)', text: 'var(--text-secondary)' };
                                    const opColors = OPERATOR_COLORS[tour.operator] || { bg: '#f1f5f9', text: '#475569' };
                                    return (
                                        <tr key={tour.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: i % 2 === 0 ? 'var(--bg-card)' : 'rgba(0,0,0,0.01)', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--brand-primary)', fontFamily: 'monospace' }}>{tour.code}</td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <span style={{ backgroundColor: opColors.bg, color: opColors.text, fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px' }}>{tour.operator}</span>
                                                {(tour.payment === 'CASH' || tour.operator === 'CASH') && (
                                                    <span style={{ marginLeft: '0.3rem', backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.6rem', fontWeight: 800, padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid #86efac' }}>
                                                        CASH
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{tour.bookingDate ? format(parseISO(tour.bookingDate), 'dd/MM/yy') : '--'}</td>
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{format(parseISO(tour.date), 'dd/MM/yy')}</td>
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{tour.start}</td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                {tour.status.toLowerCase() === 'confirmado' && (tour.date < today || (tour.date === today && tour.start <= currentTime)) ? (
                                                    <span style={{ backgroundColor: 'rgba(5,150,105,0.15)', color: '#065f46', fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(5,150,105,0.3)' }}>REALIZADO</span>
                                                ) : (
                                                    <span style={{ backgroundColor: sc.bg, color: sc.text, fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{tour.status.toUpperCase()}</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{tour.pax} pax</td>
                                            <td style={{ padding: '0.75rem 1rem', color: VEHICLE_COLORS[tour.vehicle] || 'var(--text-secondary)', fontWeight: 700 }}>{tour.vehicle}</td>
                                            <td style={{ padding: '0.75rem 1rem', color: DRIVER_COLORS[tour.driver] || 'var(--text-secondary)', fontWeight: 700 }}>{tour.driver}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    const renderAgenda = () => {
        // Simple list view for agenda mode (better for mobile)
        const sortedTours = [...MOCK_TOURS]
            .filter(t => {
                if (currentUser?.role === 'driver' && t.driver !== currentUser.name) return false;
                if (searchTerm) {
                    const q = searchTerm.toLowerCase();
                    if (
                        !t.code?.toLowerCase().includes(q) &&
                        !t.driver?.toLowerCase().includes(q) &&
                        !t.clientName?.toLowerCase().includes(q) &&
                        !t.phone?.toLowerCase().includes(q)
                    ) return false;
                }
                if (selectedVehicles.length !== VEHICLES.length && !selectedVehicles.some(v => t.vehicle?.includes(v))) return false;
                if (selectedDrivers.length !== DRIVERS.length && !selectedDrivers.some(d => t.driver?.includes(d))) return false;
                if (selectedOperators.length > 0 && !selectedOperators.includes(t.operator)) return false;

                if (startDate && t.date < startDate) return false;
                if (endDate && t.date > endDate) return false;

                // Filtro de estado
                if (statusFilter !== 'all') {
                    const isCancelled = t.status.toLowerCase() === 'cancelado';
                    const isPastT = (t.date < today || (t.date === today && t.start <= currentTime)) && t.status.toLowerCase() === 'confirmado';
                    const isConfirmedFuture = t.status.toLowerCase() === 'confirmado' && !isPastT;
                    if (statusFilter === 'cancelado' && !isCancelled) return false;
                    if (statusFilter === 'realizado' && !isPastT) return false;
                    if (statusFilter === 'confirmado' && !isConfirmedFuture) return false;
                }

                return true;
            })
            .sort((a, b) => new Date(`${a.date}T${a.start}`) - new Date(`${b.date}T${b.start}`));

        return (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sortedTours.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>No hay tours programados.</div>}

                {sortedTours.map(tour => {
                    const colors = OPERATOR_COLORS[tour.operator] || { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' };
                    const isPast = (tour.date < today || (tour.date === today && tour.start <= currentTime)) && tour.status.toLowerCase() === 'confirmado';
                    const isCancelledAgenda = tour.status.toLowerCase() === 'cancelado';
                    return (
                        <div key={tour.id} style={{
                            display: 'flex', flexDirection: isMobile ? 'column' : 'row',
                            alignItems: isMobile ? 'stretch' : 'center', gap: isMobile ? '0.75rem' : '1rem',
                            padding: isMobile ? '0.85rem' : '1rem',
                            border: `1px solid ${isPast ? 'var(--border-color)' : 'var(--border-color)'}`,
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: isPast ? 'var(--bg-hover)' : 'var(--bg-card)',
                            opacity: isPast ? 0.7 : 1,
                            position: 'relative'
                        }}>
                            <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', alignItems: 'center', justifyContent: isMobile ? 'flex-start' : 'center', width: isMobile ? 'auto' : '60px', minHeight: isMobile ? 'auto' : '60px', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', padding: isMobile ? '0.5rem 0.75rem' : '0', gap: isMobile ? '0.5rem' : '0' }}>
                                <span style={{ fontSize: isMobile ? '0.85rem' : '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{format(parseISO(tour.date), isMobile ? 'EEEE' : 'MMM', { locale: es })}</span>
                                <span style={{ fontSize: isMobile ? '1.125rem' : '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{format(parseISO(tour.date), 'dd')}</span>
                                {isMobile && <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{format(parseISO(tour.date), 'MMMM', { locale: es })}</span>}
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <span style={{ fontWeight: 700, color: isPast ? 'var(--text-secondary)' : 'var(--text-primary)', fontSize: isMobile ? '1rem' : '1.125rem' }}>{tour.start}</span>
                                        <span className={`badge`} style={{ backgroundColor: colors.bg, color: colors.text, fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>{tour.operator}</span>
                                        {!isMobile && <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{tour.code}</span>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                        {isPast && (
                                            <span style={{
                                                fontSize: '0.65rem',
                                                fontWeight: 800,
                                                color: '#065f46',
                                                backgroundColor: 'rgba(5,150,105,0.15)',
                                                padding: '0.15rem 0.45rem',
                                                borderRadius: '4px',
                                                border: '1px solid rgba(5,150,105,0.3)'
                                            }}>✓ Realizado</span>
                                        )}
                                        <span className={`badge badge-${tour.status.toLowerCase()}`} style={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}>{tour.status}</span>
                                    </div>
                                </div>

                                <div style={{ color: 'var(--brand-primary)', fontWeight: 700, fontSize: isMobile ? '1.1rem' : '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {tour.clientName}
                                    {tour.pickup && (
                                        <span style={{ fontSize: '0.75rem', backgroundColor: '#fef9c3', color: '#a16207', padding: '0.1rem 0.4rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 800 }}>
                                            <MapPin size={14} strokeWidth={2.5} /> Recogida Especial
                                        </span>
                                    )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem', fontSize: isMobile ? '0.75rem' : '0.875rem', color: 'var(--text-secondary)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Phone size={isMobile ? 12 : 14} /> {tour.phone}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Globe size={isMobile ? 12 : 14} /> {LANG_MAP[tour.language] || tour.language}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Clock size={isMobile ? 12 : 14} /> {tour.duration}h</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Users size={isMobile ? 12 : 14} /> {tour.pax} pax</span>
                                </div>

                                {tour.pickup && (
                                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#fef3c7', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#92400e', fontWeight: 600 }}>
                                        <MapPin size={isMobile ? 16 : 18} color="#d97706" />
                                        <span>Recogida: {tour.pickup}</span>
                                    </div>
                                )}

                                {tour.driver && (
                                    <div style={{ marginTop: '0.25rem', padding: '0.5rem', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                                        <UserCircle size={isMobile ? 16 : 18} color={DRIVER_COLORS[tour.driver] || 'var(--brand-primary)'} />
                                        <span>
                                            <strong style={{ color: 'var(--text-primary)' }}>{tour.driver}</strong>
                                            <span style={{ color: 'var(--text-tertiary)', marginLeft: '0.4rem' }}>{tour.vehicle}</span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="animate-fade-in">
            {renderHeader()}

            {viewMode === 'month' ? (
                <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                    <div style={{ minWidth: '800px' }}>
                        {renderDays()}
                        {renderCells()}
                    </div>
                </div>
            ) : viewMode === 'agenda' ? (
                renderAgenda()
            ) : (
                renderUltimas()
            )}
        </div>
    );
}
