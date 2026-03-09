import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, Calendar as CalendarIcon, Clock, Users, UserCircle, Phone, Globe } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import MultiSelect from '../components/MultiSelect';

// Utilizamos los mismos datos de prueba (ampliados para abarcar el mes)
const MOCK_TOURS = [
    { id: 1, code: 'GYG-93812', date: '2026-03-08', start: '10:00', duration: 2, operator: 'GYG', status: 'confirmado', pax: 4, vehicle: '01-DR', driver: 'Cristian', clientName: 'Familia Smith', phone: '+34 600 123 456', language: 'EN' },
    { id: 2, code: 'FH-81723', date: '2026-03-08', start: '10:30', duration: 3, operator: 'FH', status: 'modificado', pax: 2, vehicle: '02-NR', driver: 'Roger', clientName: 'Juan Pérez', phone: '+34 611 222 333', language: 'ES' },
    { id: 4, code: 'IC-8821', date: '2026-03-09', start: '08:00', duration: 4, operator: 'IC', status: 'confirmado', pax: 4, vehicle: '01-DR', driver: 'Marco', clientName: 'Hans Müller', phone: '+49 151 2345 6789', language: 'DE' },
    { id: 5, code: 'GYG-99999', date: '2026-03-09', start: '10:30', duration: 2, operator: 'GYG', status: 'confirmado', pax: 4, vehicle: '02-NR', driver: 'Roger', clientName: 'Sophie Dubois', phone: '+33 6 12 34 56 78', language: 'FR' },
    { id: 6, code: 'VIA-0192', date: '2026-03-10', start: '14:00', duration: 2, operator: 'VIA', status: 'cancelado', pax: 1, vehicle: '', driver: '', clientName: 'Kenji Sato', phone: '+81 90 1234 5678', language: 'EN' },
    { id: 7, code: 'GYG-1111', date: '2026-03-12', start: '09:00', duration: 2, operator: 'GYG', status: 'confirmado', pax: 3, vehicle: '01-DR', driver: 'Cristian', clientName: 'Laura Rossi', phone: '+39 333 444 5566', language: 'IT' },
];

const OPERATOR_COLORS = {
    'GYG': { bg: '#ffedd5', border: '#fdba74', text: '#c2410c' }, // Naranja
    'FH': { bg: '#e0e7ff', border: '#a5b4fc', text: '#4338ca' },  // Indigo
    'VIA': { bg: '#dcfce7', border: '#86efac', text: '#15803d' }, // Verde
    'IC': { bg: '#f3e8ff', border: '#d8b4fe', text: '#7e22ce' }   // Purpura
};

const VEHICLES = ['01-DR', '02-NR'];
const DRIVERS = ['Cristian', 'Roger', 'Marco'];
const OPERATORS = ['GYG', 'FH', 'VIA', 'IC'];

const DRIVER_COLORS = { 'Cristian': '#0284c7', 'Roger': '#0d9488', 'Marco': '#be123c' };
const VEHICLE_COLORS = { '01-DR': '#ca8a04', '02-NR': '#334155' };
const LANG_MAP = { 'EN': 'English', 'ES': 'Spanish', 'DE': 'German', 'FR': 'French', 'IT': 'Italian', 'NL': 'Dutch', 'PT': 'Portuguese' };

export default function Calendar({ currentUser }) {
    const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 8)); // Marzo 2026 as reference
    const [viewMode, setViewMode] = useState('agenda'); // 'month', 'week', 'agenda'
    const [searchTerm, setSearchTerm] = useState('');
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
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-end' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
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
                    if (searchTerm && !t.code.toLowerCase().includes(searchTerm.toLowerCase()) && !t.driver.toLowerCase().includes(searchTerm.toLowerCase()) && !t.clientName?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
                    if (selectedVehicles.length !== VEHICLES.length && !selectedVehicles.includes(t.vehicle)) return false;
                    if (selectedDrivers.length !== DRIVERS.length && !selectedDrivers.includes(t.driver)) return false;
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
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.25rem' }}>
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
                            flexDirection: isMobile ? 'row' : 'column',
                            flexWrap: isMobile ? 'wrap' : 'nowrap',
                            gap: isMobile ? '2px' : '0.25rem',
                            overflowY: isMobile ? 'hidden' : 'auto',
                            flex: 1,
                            justifyContent: isMobile ? 'center' : 'flex-start'
                        }}>
                            {dayTours.map(tour => {
                                const colors = OPERATOR_COLORS[tour.operator] || { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' };
                                const isCancelled = tour.status === 'cancelado';

                                if (isMobile) {
                                    return (
                                        <div
                                            key={tour.id}
                                            style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: colors.text,
                                                opacity: isCancelled ? 0.4 : 1
                                            }}
                                        />
                                    );
                                }

                                return (
                                    <div
                                        key={tour.id}
                                        style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: 'var(--radius-sm)',
                                            backgroundColor: colors.bg,
                                            borderLeft: `3px solid ${colors.text}`,
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                            opacity: isCancelled ? 0.6 : 1,
                                            textDecoration: isCancelled ? 'line-through' : 'none',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.125rem',
                                            transition: 'transform 0.1s ease'
                                        }}
                                        title={`${tour.operator} - ${tour.code} | Coche: ${tour.vehicle} | Chofer: ${tour.driver}`}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, color: colors.text }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                {tour.start}
                                                <span style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: 500 }}>({tour.duration}h)</span>
                                            </span>
                                            <span>{tour.operator}</span>
                                        </div>
                                        <div style={{ color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {tour.clientName}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'space-between', flexWrap: 'wrap', fontSize: '0.65rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                                                <Globe size={10} /> {LANG_MAP[tour.language] || tour.language}
                                            </span>
                                            {tour.driver && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', color: DRIVER_COLORS[tour.driver] || 'var(--text-secondary)', fontWeight: 600 }}>
                                                    <UserCircle size={10} /> {tour.driver}
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

    const renderAgenda = () => {
        // Simple list view for agenda mode (better for mobile)
        const sortedTours = [...MOCK_TOURS]
            .filter(t => {
                if (currentUser?.role === 'driver' && t.driver !== currentUser.name) return false;
                if (searchTerm && !t.code.toLowerCase().includes(searchTerm.toLowerCase()) && !t.driver.toLowerCase().includes(searchTerm.toLowerCase()) && !t.clientName?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
                if (selectedVehicles.length !== VEHICLES.length && !selectedVehicles.includes(t.vehicle)) return false;
                if (selectedDrivers.length !== DRIVERS.length && !selectedDrivers.includes(t.driver)) return false;
                if (selectedOperators.length > 0 && !selectedOperators.includes(t.operator)) return false;
                return true;
            })
            .sort((a, b) => new Date(`${a.date}T${a.start}`) - new Date(`${b.date}T${b.start}`));

        return (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sortedTours.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>No hay tours programados.</div>}

                {sortedTours.map(tour => {
                    const colors = OPERATOR_COLORS[tour.operator] || { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' };
                    return (
                        <div key={tour.id} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: isMobile ? '0.75rem' : '1rem', padding: isMobile ? '0.85rem' : '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card)', position: 'relative' }}>
                            <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', alignItems: 'center', justifyContent: isMobile ? 'flex-start' : 'center', width: isMobile ? 'auto' : '60px', minHeight: isMobile ? 'auto' : '60px', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', padding: isMobile ? '0.5rem 0.75rem' : '0', gap: isMobile ? '0.5rem' : '0' }}>
                                <span style={{ fontSize: isMobile ? '0.85rem' : '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{format(parseISO(tour.date), isMobile ? 'EEEE' : 'MMM', { locale: es })}</span>
                                <span style={{ fontSize: isMobile ? '1.125rem' : '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{format(parseISO(tour.date), 'dd')}</span>
                                {isMobile && <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{format(parseISO(tour.date), 'MMMM', { locale: es })}</span>}
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: isMobile ? '1rem' : '1.125rem' }}>{tour.start}</span>
                                        <span className={`badge`} style={{ backgroundColor: colors.bg, color: colors.text, fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>{tour.operator}</span>
                                        {!isMobile && <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{tour.code}</span>}
                                    </div>
                                    <span className={`badge badge-${tour.status}`} style={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}>{tour.status}</span>
                                </div>

                                <div style={{ color: 'var(--brand-primary)', fontWeight: 700, fontSize: isMobile ? '1.1rem' : '1.25rem' }}>{tour.clientName}</div>

                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem', fontSize: isMobile ? '0.75rem' : '0.875rem', color: 'var(--text-secondary)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Phone size={isMobile ? 12 : 14} /> {tour.phone}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Globe size={isMobile ? 12 : 14} /> {LANG_MAP[tour.language] || tour.language}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Clock size={isMobile ? 12 : 14} /> {tour.duration}h</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Users size={isMobile ? 12 : 14} /> {tour.pax} pax</span>
                                </div>

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
            ) : (
                renderAgenda()
            )}
        </div>
    );
}
