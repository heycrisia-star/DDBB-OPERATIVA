import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, TrendingUp, Users, Car, UserCircle, Timer, AlertCircle, ShoppingBag, PieChart, Globe } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import MultiSelect from '../components/MultiSelect';
import { MOCK_TOURS } from '../data/mockTours';

const StatCard = ({ title, value, icon: Icon, color = 'var(--brand-primary)', trend, isMobile }) => (
    <div className="card" style={{
        padding: isMobile ? '1rem' : '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '0.25rem' : '0.5rem',
        minHeight: isMobile ? '90px' : 'auto',
        justifyContent: 'center'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '0.25rem' : '0.5rem' }}>
            <div style={{ padding: isMobile ? '0.35rem' : '0.5rem', backgroundColor: 'var(--brand-light)', color: 'var(--brand-primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={isMobile ? 18 : 20} />
            </div>
            {trend !== undefined && (
                <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: trend > 0 ? 'var(--status-confirmed)' : 'var(--status-cancelled)',
                    backgroundColor: trend > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px'
                }}>
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.025em', margin: 0 }}>{title}</p>
            <h3 style={{ fontSize: isMobile ? '1.1rem' : '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{value}</h3>
        </div>
    </div>
);

const ProgressBar = ({ label, value, max, color, count, extraLabel, striped, marginBottom = '1.25rem' }) => {
    const percentage = max > 0 ? Math.round((value / max) * 100) : 0;

    // Pattern for better visual distinction
    const stripeStyle = striped ? {
        backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)',
        backgroundSize: '1rem 1rem'
    } : {};

    return (
        <div style={{ marginBottom }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.875rem' }}>
                <span style={{ fontWeight: 600 }}>{label}</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                    {count !== undefined ? count : value}
                    {extraLabel && <span style={{ marginLeft: '0.35rem', fontWeight: 500, color: 'var(--text-primary)' }}> • {extraLabel}</span>}
                    <span style={{ marginLeft: '0.35rem', fontWeight: 700, color: 'var(--text-primary)' }}> • {percentage}%</span>
                </span>
            </div>
            <div style={{ width: '100%', backgroundColor: 'var(--bg-hover)', borderRadius: '9999px', height: '0.875rem', overflow: 'hidden' }}>
                <div style={{ width: `${percentage}%`, backgroundColor: color, height: '100%', borderRadius: '9999px', ...stripeStyle }}></div>
            </div>
        </div>
    )
}

const StackedBar = ({ label, segments }) => (
    <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.875rem' }}>
            <span style={{ fontWeight: 600 }}>{label}</span>
        </div>
        <div style={{ width: '100%', height: '1.5rem', display: 'flex', borderRadius: '8px', overflow: 'hidden' }}>
            {segments.map((s, i) => (
                s.value > 0 && (
                    <div key={i} style={{
                        width: `${s.value}%`,
                        backgroundColor: s.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                    }}>
                        {s.value > 10 ? `${s.value}%` : ''}
                    </div>
                )
            ))}
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', justifyContent: 'center', flexWrap: 'wrap' }}>
            {segments.map((s, i) => (
                s.count > 0 && (
                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
                        {s.label} ({s.count})
                    </span>
                )
            ))}
        </div>
    </div>
);

export default function Dashboard({ currentUser }) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activeShortcut, setActiveShortcut] = useState('');
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const isDriver = currentUser?.role === 'driver';

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const DRIVER_COLORS = { 'Cristian': '#0284c7', 'Roger': '#0d9488', 'Marco': '#be123c' };
    const VEHICLE_COLORS = { '01-DR': '#ca8a04', '02-NR': '#334155' };
    const OPERATORS = ['GYG', 'FH', 'VIA', 'IC'];
    const DRIVERS = ['Cristian', 'Roger', 'Marco'];
    const VEHICLES = ['01-DR', '02-NR'];
    const OPERATOR_COLORS = {
        'GYG': { bg: '#ffedd5', border: '#fdba74', text: '#c2410c' },
        'FH': { bg: '#e0e7ff', border: '#a5b4fc', text: '#4338ca' },
        'VIA': { bg: '#dcfce7', border: '#86efac', text: '#15803d' },
        'IC': { bg: '#f3e8ff', border: '#d8b4fe', text: '#7e22ce' }
    };

    const [selectedOperators, setSelectedOperators] = useState(OPERATORS);
    const [selectedDrivers, setSelectedDrivers] = useState(DRIVERS);
    const [selectedVehicles, setSelectedVehicles] = useState(VEHICLES);

    const toggleOperator = (op) => {
        if (selectedOperators.length === OPERATORS.length) {
            setSelectedOperators([op]);
        } else if (selectedOperators.includes(op)) {
            setSelectedOperators(selectedOperators.filter(o => o !== op));
        } else setSelectedOperators([...selectedOperators, op]);
    };
    const toggleAllOperators = () => {
        setSelectedOperators(selectedOperators.length === OPERATORS.length ? [] : OPERATORS);
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

    const filteredTours = MOCK_TOURS.filter(t => {
        if (isDriver && t.driver !== currentUser.name) return false;
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

    const totalSales = filteredTours.reduce((sum, t) => sum + (parseFloat(t.netPrice) || 0), 0);
    const totalHours = filteredTours.reduce((sum, t) => sum + (parseFloat(t.duration) || 0), 0);
    const totalTours = filteredTours.length;
    const avgTicket = totalTours > 0 ? Math.round(totalSales / totalTours) : 0;
    const cancelledCount = filteredTours.filter(t => t.status.toLowerCase() === 'cancelado').length;
    const cancelRate = totalTours > 0 ? Math.round((cancelledCount / totalTours) * 100) : 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    const pipelineCount = filteredTours.filter(t => t.status.toLowerCase() === 'confirmado' && t.date >= today).length;

    const kpis = {
        sales: totalSales.toLocaleString('es-ES'),
        hours: totalHours,
        tours: totalTours,
        ticket: avgTicket.toLocaleString('es-ES'),
        cancelRate: cancelRate,
        cancelledCount: cancelledCount,
        pipelineCount: pipelineCount
    };

    // Recalculate dynamic driver & vehicle stats
    const driverStatsMap = {};
    const vehicleHoursMap = {};

    // For Pax, Duration and Operators Mix
    const paxStatsMap = { 1: 0, 2: 0, 3: 0, 4: 0, '5+': 0 };
    const durationStatsMap = {
        1: { total: 0, pax4: 0, paxLess4: 0 },
        2: { total: 0, pax4: 0, paxLess4: 0 },
        3: { total: 0, pax4: 0, paxLess4: 0 }
    };
    const operatorStatsMap = { 'GYG': 0, 'FH': 0, 'VIA': 0, 'IC': 0 };
    const countryStatsMap = {};

    filteredTours.forEach(t => {
        if (!driverStatsMap[t.driver]) driverStatsMap[t.driver] = { hours: 0, sales: 0 };
        driverStatsMap[t.driver].hours += parseFloat(t.duration) || 0;
        driverStatsMap[t.driver].sales += parseFloat(t.netPrice) || 0;

        if (t.vehicle) {
            if (!vehicleHoursMap[t.vehicle]) vehicleHoursMap[t.vehicle] = 0;
            vehicleHoursMap[t.vehicle] += parseFloat(t.duration) || 0;
        }

        // Pax
        const p = parseInt(t.pax) || 0;
        if (p === 1) paxStatsMap[1]++;
        else if (p === 2) paxStatsMap[2]++;
        else if (p === 3) paxStatsMap[3]++;
        else if (p === 4) paxStatsMap[4]++;
        else if (p >= 5) paxStatsMap['5+']++;

        // Duration
        const dStr = String(t.duration);
        if (durationStatsMap[dStr]) {
            durationStatsMap[dStr].total++;
            if (p >= 4) durationStatsMap[dStr].pax4++;
            else durationStatsMap[dStr].paxLess4++;
        }

        // Operator
        if (operatorStatsMap[t.operator] !== undefined) operatorStatsMap[t.operator]++;

        // Country (Native Country first, Phone prefix as fallback)
        let country = 'Desconocido';
        if (t.country) {
            const cMap = {
                'United States': 'Estados Unidos',
                'Germany': 'Alemania',
                'France': 'Francia',
                'United Kingdom': 'Reino Unido',
                'Sweden': 'Suecia',
                'Italy': 'Italia',
                'Canada': 'Canadá',
                'Romania': 'Rumania',
                'Belgium': 'Bélgica',
                'Chile': 'Chile',
                'Switzerland': 'Suiza',
                'Japan': 'Japón',
                'Brazil': 'Brasil',
                'Turkey': 'Turquía',
                'Netherlands': 'Países Bajos',
                'Mexico': 'México'
            };
            country = cMap[t.country] || t.country;
        } else {
            const phoneStr = (t.phone || '').trim().replace(/\D/g, '');
            if (phoneStr.length > 3) {
                if (phoneStr.startsWith('1')) country = 'Estados Unidos';
                else if (phoneStr.startsWith('34')) country = 'España';
                else if (phoneStr.startsWith('33')) country = 'Francia';
                else if (phoneStr.startsWith('49')) country = 'Alemania';
                else if (phoneStr.startsWith('39')) country = 'Italia';
                else if (phoneStr.startsWith('44')) country = 'Reino Unido';
                else if (phoneStr.startsWith('31')) country = 'Países Bajos';
                else if (phoneStr.startsWith('351')) country = 'Portugal';
                else if (phoneStr.startsWith('54')) country = 'Argentina';
                else if (phoneStr.startsWith('52')) country = 'México';
                else if (phoneStr.startsWith('57')) country = 'Colombia';
                else if (phoneStr.startsWith('56')) country = 'Chile';
                else if (phoneStr.startsWith('55')) country = 'Brasil';
                else if (phoneStr.startsWith('41')) country = 'Suiza';
                else if (phoneStr.startsWith('43')) country = 'Austria';
                else if (phoneStr.startsWith('61')) country = 'Australia';
                else if (phoneStr.startsWith('46')) country = 'Suecia';
            }
        }

        if (!country) country = 'Desconocido';



        if (country !== 'Desconocido' && country !== 'Otros') {
            if (!countryStatsMap[country]) countryStatsMap[country] = 0;
            countryStatsMap[country]++;
        }
    });

    const driverStats = isDriver ? {
        [currentUser.name]: driverStatsMap[currentUser.name] || { hours: 0, sales: 0 }
    } : (() => {
        const stats = {};
        DRIVERS.forEach(d => {
            stats[d] = {
                hours: driverStatsMap[d]?.hours || 0,
                sales: (driverStatsMap[d]?.sales || 0).toLocaleString('es-ES')
            };
        });
        return stats;
    })();

    const vehicleHours = (() => {
        const vStats = {};
        VEHICLES.forEach(v => {
            vStats[v] = vehicleHoursMap[v] || 0;
        });
        return vStats;
    })();

    const maxDriverHours = Math.max(1, ...Object.values(driverStats).map(d => d.hours));
    const maxVehicle = Math.max(1, ...Object.values(vehicleHours));

    const getPerc = (count) => totalTours > 0 ? Math.round((count / totalTours) * 100) : 0;

    const paxMix = {
        pax1: { perc: getPerc(paxStatsMap[1]), count: paxStatsMap[1] },
        pax2: { perc: getPerc(paxStatsMap[2]), count: paxStatsMap[2] },
        pax3: { perc: getPerc(paxStatsMap[3]), count: paxStatsMap[3] },
        pax4: { perc: getPerc(paxStatsMap[4]), count: paxStatsMap[4] },
        pax5: { perc: getPerc(paxStatsMap['5+']), count: paxStatsMap['5+'] }
    };

    const tourDuration = {
        '1': {
            perc: getPerc(durationStatsMap[1].total),
            count: durationStatsMap[1].total,
            pax4Count: durationStatsMap[1].pax4,
            paxLess4Count: durationStatsMap[1].paxLess4,
            pax4Perc: durationStatsMap[1].total > 0 ? Math.round((durationStatsMap[1].pax4 / durationStatsMap[1].total) * 100) : 0,
            paxLess4Perc: durationStatsMap[1].total > 0 ? Math.round((durationStatsMap[1].paxLess4 / durationStatsMap[1].total) * 100) : 0
        },
        '2': {
            perc: getPerc(durationStatsMap[2].total),
            count: durationStatsMap[2].total,
            pax4Count: durationStatsMap[2].pax4,
            paxLess4Count: durationStatsMap[2].paxLess4,
            pax4Perc: durationStatsMap[2].total > 0 ? Math.round((durationStatsMap[2].pax4 / durationStatsMap[2].total) * 100) : 0,
            paxLess4Perc: durationStatsMap[2].total > 0 ? Math.round((durationStatsMap[2].paxLess4 / durationStatsMap[2].total) * 100) : 0
        },
        '3': {
            perc: getPerc(durationStatsMap[3].total),
            count: durationStatsMap[3].total,
            pax4Count: durationStatsMap[3].pax4,
            paxLess4Count: durationStatsMap[3].paxLess4,
            pax4Perc: durationStatsMap[3].total > 0 ? Math.round((durationStatsMap[3].pax4 / durationStatsMap[3].total) * 100) : 0,
            paxLess4Perc: durationStatsMap[3].total > 0 ? Math.round((durationStatsMap[3].paxLess4 / durationStatsMap[3].total) * 100) : 0
        },
    };

    const operatorStats = {
        'GYG': { perc: getPerc(operatorStatsMap['GYG']), count: operatorStatsMap['GYG'] },
        'FH': { perc: getPerc(operatorStatsMap['FH']), count: operatorStatsMap['FH'] },
        'VIA': { perc: getPerc(operatorStatsMap['VIA']), count: operatorStatsMap['VIA'] },
        'IC': { perc: getPerc(operatorStatsMap['IC']), count: operatorStatsMap['IC'] }
    };

    const totalKnownCountries = Object.values(countryStatsMap).reduce((sum, val) => sum + val, 0);
    const getCountryPerc = (count) => totalKnownCountries > 0 ? Math.round((count / totalKnownCountries) * 100) : 0;

    const topCountries = Object.entries(countryStatsMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([country, count]) => ({
            label: country,
            count: count,
            perc: getCountryPerc(count)
        }));

    return (
        <div className="animate-fade-in">
            <div className="page-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1 className="page-title" style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '1.875rem' }}>KPIs</h1>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginRight: '0.5rem' }}>
                            <button onClick={() => setDateRangeShortcut('today')} style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: activeShortcut === 'today' ? 'var(--primary-color)' : 'var(--bg-card)', color: activeShortcut === 'today' ? '#fff' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>Hoy</button>
                            <button onClick={() => setDateRangeShortcut('week')} style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: activeShortcut === 'week' ? 'var(--primary-color)' : 'var(--bg-card)', color: activeShortcut === 'week' ? '#fff' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>Semana</button>
                            <button onClick={() => setDateRangeShortcut('month')} style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: activeShortcut === 'month' ? 'var(--primary-color)' : 'var(--bg-card)', color: activeShortcut === 'month' ? '#fff' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>Mes</button>
                            <button onClick={() => setDateRangeShortcut('all')} style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: activeShortcut === 'all' ? 'var(--primary-color)' : 'var(--bg-card)', color: activeShortcut === 'all' ? '#fff' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>Todo</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Desde</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'var(--bg-card)',
                                    color: 'var(--text-primary)',
                                    fontWeight: 600,
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Hasta</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'var(--bg-card)',
                                    color: 'var(--text-primary)',
                                    fontWeight: 600,
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="card" style={{ marginBottom: '2rem', padding: 0 }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <MultiSelect
                            label="Coches"
                            options={VEHICLES}
                            selected={selectedVehicles}
                            onChange={toggleVehicle}
                            onToggleAll={toggleAllVehicles}
                            isMobile={isMobile}
                        />

                        {!isDriver && (
                            <MultiSelect
                                label="Choferes"
                                options={DRIVERS}
                                selected={selectedDrivers}
                                onChange={toggleDriver}
                                onToggleAll={toggleAllDrivers}
                                isMobile={isMobile}
                            />
                        )}
                    </div>
                </div>

                <div style={{ padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem', backgroundColor: 'var(--bg-hover)', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: isMobile ? 'nowrap' : 'wrap', borderBottomLeftRadius: 'inherit', borderBottomRightRadius: 'inherit', overflowX: isMobile ? 'auto' : 'visible' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '0.25rem', whiteSpace: 'nowrap' }}>Ops:</span>
                    <button
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: selectedOperators.length === OPERATORS.length ? 'var(--brand-primary)' : 'var(--bg-card)', color: selectedOperators.length === OPERATORS.length ? '#fff' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}
                        onClick={toggleAllOperators}
                    >
                        Todos
                    </button>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'nowrap' }}>
                        {OPERATORS.map(op => {
                            const colors = OPERATOR_COLORS[op] || { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' };
                            const isSelected = selectedOperators.includes(op);
                            const opActiveCount = filteredTours.filter(t => t.operator === op && t.status.toLowerCase() !== 'cancelado').length;
                            const opCancelCount = filteredTours.filter(t => t.operator === op && t.status.toLowerCase() === 'cancelado').length;
                            return (
                                <button
                                    key={op}
                                    onClick={() => toggleOperator(op)}
                                    style={{
                                        fontSize: '0.75rem',
                                        padding: '0.35rem 0.75rem',
                                        borderRadius: '6px',
                                        fontWeight: 800,
                                        border: `1px solid ${isSelected ? colors.border : 'var(--border-color)'}`,
                                        background: isSelected ? colors.bg : 'var(--bg-card)',
                                        color: isSelected ? colors.text : 'var(--text-tertiary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        opacity: isSelected ? 1 : 0.6,
                                        whiteSpace: 'nowrap',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.35rem'
                                    }}
                                >
                                    {op}
                                    {opActiveCount > 0 && (
                                        <span style={{ fontSize: '0.65rem', fontWeight: 900, backgroundColor: isSelected ? 'rgba(0,0,0,0.15)' : 'var(--bg-hover)', padding: '0.1rem 0.35rem', borderRadius: '4px', lineHeight: 1.4 }}>
                                            {opActiveCount}
                                        </span>
                                    )}
                                    {opCancelCount > 0 && (
                                        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(239,68,68,0.85)', backgroundColor: 'rgba(239,68,68,0.1)', padding: '0.1rem 0.3rem', borderRadius: '4px', lineHeight: 1.4 }}>
                                            ✕{opCancelCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Primary KPIs */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: isMobile ? '0.75rem' : '1.5rem',
                marginBottom: '2rem'
            }}>
                <StatCard
                    title="Venta Total"
                    value={kpis.sales}
                    icon={TrendingUp}
                    isMobile={isMobile}
                />
                <StatCard
                    title="Horas"
                    value={kpis.hours}
                    icon={Clock}
                    isMobile={isMobile}
                />
                <div className="card" style={{
                    padding: isMobile ? '1rem' : '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? '0.25rem' : '0.5rem',
                    minHeight: isMobile ? '90px' : 'auto',
                    justifyContent: 'center'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '0.25rem' : '0.5rem' }}>
                        <div style={{ padding: isMobile ? '0.35rem' : '0.5rem', backgroundColor: 'var(--brand-light)', color: 'var(--brand-primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CalendarIcon size={isMobile ? 18 : 20} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                            {kpis.pipelineCount > 0 && (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0ea5e9', backgroundColor: 'rgba(14,165,233,0.12)', padding: '0.2rem 0.45rem', borderRadius: '5px', whiteSpace: 'nowrap' }}>
                                    🔵 {kpis.pipelineCount} tubería
                                </span>
                            )}
                            {kpis.cancelledCount > 0 && (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--status-cancelled)', backgroundColor: 'rgba(239,68,68,0.1)', padding: '0.2rem 0.45rem', borderRadius: '5px', whiteSpace: 'nowrap' }}>
                                    ✕ {kpis.cancelledCount} ({kpis.cancelRate}%)
                                </span>
                            )}
                        </div>
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.025em', margin: 0 }}>Tours</p>
                        <h3 style={{ fontSize: isMobile ? '1.1rem' : '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{kpis.tours}</h3>
                    </div>
                </div>
                <StatCard
                    title="Ticket Medio"
                    value={kpis.ticket}
                    icon={ShoppingBag}
                    isMobile={isMobile}
                />
                <StatCard
                    title="Cancelaciones"
                    value={`${kpis.cancelRate}%`}
                    icon={AlertCircle}
                    isMobile={isMobile}
                />
            </div>

            <div style={{ columnCount: isMobile ? 1 : 2, columnGap: '1.5rem', paddingBottom: '2rem' }}>

                {/* Card 1: Vehículos y Choferes */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', breakInside: 'avoid', marginBottom: '1.5rem', WebkitColumnBreakInside: 'avoid' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Car size={18} color="var(--brand-primary)" /> Vehículos y Choferes
                    </h3>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Flota</h4>
                    {Object.entries(vehicleHours)
                        .sort((a, b) => b[1] - a[1])
                        .map(([name, hours]) => (
                            <ProgressBar key={name} label={name} value={hours} max={maxVehicle} color={VEHICLE_COLORS[name]} count={`${hours}h`} />
                        ))}

                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', margin: '1.5rem 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personal</h4>
                    {Object.entries(driverStats)
                        .sort((a, b) => b[1].hours - a[1].hours)
                        .map(([name, stats]) => (
                            <ProgressBar key={name} label={name} value={stats.hours} max={maxDriverHours} color={DRIVER_COLORS[name]} count={`${stats.hours}h`} striped />
                        ))}
                </div>

                {/* Card 2: Venta por Chofer */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', breakInside: 'avoid', marginBottom: '1.5rem', WebkitColumnBreakInside: 'avoid' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={18} color="var(--brand-primary)" /> Venta por Conductor
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {Object.entries(driverStats)
                            .sort((a, b) => {
                                const salesA = parseInt((a[1].sales || '0').replace(/[,.]/g, '')) || 0;
                                const salesB = parseInt((b[1].sales || '0').replace(/[,.]/g, '')) || 0;
                                return salesB - salesA;
                            })
                            .map(([name, stats]) => (
                                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{name}</span>
                                    <span style={{ fontWeight: 800, color: 'var(--brand-primary)', fontSize: '1.125rem' }}>{stats.sales} €</span>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Card 3: Agregadores */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', breakInside: 'avoid', marginBottom: '1.5rem', WebkitColumnBreakInside: 'avoid' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PieChart size={18} color="var(--brand-primary)" /> Canales (Agregadores)
                    </h3>
                    {Object.entries(operatorStats)
                        .sort((a, b) => b[1].count - a[1].count)
                        .map(([op, stats]) => {
                            const labels = { 'GYG': 'GetYourGuide', 'FH': 'FareHarbor', 'VIA': 'Viator', 'IC': 'Intercruises' };
                            const colors = { 'GYG': '#c2410c', 'FH': '#4338ca', 'VIA': '#15803d', 'IC': '#7e22ce' };
                            return <ProgressBar key={op} label={labels[op]} value={stats.perc} max={100} color={colors[op]} count={`${stats.count} tours`} />;
                        })}
                </div>

                {/* Card 4: Top 3 Países */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', breakInside: 'avoid', marginBottom: '1.5rem', WebkitColumnBreakInside: 'avoid' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Globe size={18} color="var(--brand-primary)" /> Top 3 Mercados (Países)
                    </h3>
                    {topCountries.map((country, idx) => {
                        const colors = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6'];
                        return (
                            <ProgressBar key={country.label} label={`${idx + 1}. ${country.label}`} value={country.perc} max={100} color={colors[idx] || '#cbd5e1'} count={`${country.count} tours`} />
                        );
                    })}
                </div>

                {/* Card 5: Duración */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', breakInside: 'avoid', marginBottom: '1.5rem', WebkitColumnBreakInside: 'avoid' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Timer size={18} color="var(--brand-primary)" /> Duración de Tours
                    </h3>
                    {Object.entries(tourDuration)
                        .sort((a, b) => b[1].count - a[1].count)
                        .map(([dur, stats]) => (
                            <ProgressBar key={dur} label={`Tours de ${dur} hrs`} value={stats.perc} max={100} color="#0ea5e9" count={`${stats.count} tours`} />
                        ))}
                </div>

                {/* Card 6: Pax Mix */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', breakInside: 'avoid', marginBottom: '1.5rem', WebkitColumnBreakInside: 'avoid' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={18} color="var(--brand-primary)" /> Tamaño de Grupos
                    </h3>

                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Distribución General</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '2rem' }}>
                        {[
                            { l: '1 Pax', v: paxMix.pax1 },
                            { l: '2 Pax', v: paxMix.pax2 },
                            { l: '3 Pax', v: paxMix.pax3 },
                            { l: '4 Pax', v: paxMix.pax4 },
                        ].sort((a, b) => b.v.count - a.v.count).map(item => (
                            <div key={item.l} style={{ padding: '0.5rem', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.15rem', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-primary)' }}>{item.l}</div>
                                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{item.v.perc}%</div>
                            </div>
                        ))}
                    </div>

                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mix por Duración</h4>
                    {Object.entries(tourDuration).map(([dur, stats]) => {
                        if (stats.count === 0) return null;
                        const segments = [
                            { label: '<4 Pax', value: stats.paxLess4Perc, count: stats.paxLess4Count, color: '#0ea5e9' },
                            { label: '4+ Pax', value: stats.pax4Perc, count: stats.pax4Count, color: '#f59e0b' }
                        ];
                        return <StackedBar key={dur} label={`Tours de ${dur} hrs`} segments={segments} />;
                    })}
                </div>

            </div>
        </div>
    );
};
