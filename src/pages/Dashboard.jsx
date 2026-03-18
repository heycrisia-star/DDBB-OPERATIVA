import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, TrendingUp, Users, Car, UserCircle, Timer, AlertCircle, ShoppingBag, PieChart } from 'lucide-react';
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

const ProgressBar = ({ label, value, max, color, count, extraLabel, striped }) => {
    const percentage = max > 0 ? Math.round((value / max) * 100) : 0;

    // Pattern for better visual distinction
    const stripeStyle = striped ? {
        backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)',
        backgroundSize: '1rem 1rem'
    } : {};

    return (
        <div style={{ marginBottom: '1.25rem' }}>
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

export default function Dashboard({ currentUser }) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
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

    const totalSales = filteredTours.reduce((sum, t) => sum + (t.netPrice || 0), 0);
    const totalHours = filteredTours.reduce((sum, t) => sum + (t.duration || 0), 0);
    const totalTours = filteredTours.length;
    const avgTicket = totalTours > 0 ? Math.round(totalSales / totalTours) : 0;
    const cancelledCount = filteredTours.filter(t => t.status.toLowerCase() === 'cancelado').length;
    const cancelRate = totalTours > 0 ? Math.round((cancelledCount / totalTours) * 100) : 0;

    const kpis = {
        sales: totalSales.toLocaleString('es-ES'),
        hours: totalHours,
        tours: totalTours,
        ticket: avgTicket.toLocaleString('es-ES'),
        cancelRate: cancelRate
    };

    // Recalculate dynamic driver & vehicle stats
    const driverStatsMap = {};
    const vehicleHoursMap = {};
    filteredTours.forEach(t => {
        if (!driverStatsMap[t.driver]) driverStatsMap[t.driver] = { hours: 0, sales: 0 };
        driverStatsMap[t.driver].hours += t.duration || 0;
        driverStatsMap[t.driver].sales += t.netPrice || 0;

        if (t.vehicle) {
            if (!vehicleHoursMap[t.vehicle]) vehicleHoursMap[t.vehicle] = 0;
            vehicleHoursMap[t.vehicle] += t.duration || 0;
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

    const paxMix = {
        pax1: { perc: 10, count: 7 },
        pax2: { perc: 55, count: 40 },
        pax3: { perc: 15, count: 11 },
        pax4: { perc: 20, count: 14 }
    };

    const tourDuration = {
        '1': { perc: 20, count: 14 },
        '2': { perc: 60, count: 43 },
        '3': { perc: 20, count: 15 }
    };

    const operatorStats = {
        'GYG': { perc: 45, count: 32 },
        'FH': { perc: 35, count: 25 },
        'VIA': { perc: 15, count: 11 },
        'IC': { perc: 5, count: 4 }
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 className="page-title" style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '1.875rem' }}>KPIs</h1>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {op}
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
                <StatCard
                    title="Tours"
                    value={kpis.tours}
                    icon={CalendarIcon}
                    isMobile={isMobile}
                />
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>

                {/* Vehículos y Choferes */}
                <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={18} color="var(--brand-primary)" /> Vehículos
                        </h3>
                        {Object.entries(vehicleHours)
                            .sort((a, b) => b[1] - a[1])
                            .map(([name, hours]) => (
                                <ProgressBar key={name} label={name} value={hours} max={maxVehicle} color={VEHICLE_COLORS[name]} count={`${hours}h`} />
                            ))}

                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '2rem 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={18} color="var(--brand-primary)" /> Choferes
                        </h3>
                        {Object.entries(driverStats)
                            .sort((a, b) => b[1].hours - a[1].hours)
                            .map(([name, stats]) => (
                                <ProgressBar key={name} label={name} value={stats.hours} max={maxDriverHours} color={DRIVER_COLORS[name]} count={`${stats.hours}h`} striped />
                            ))}
                    </div>

                    <div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            💰 Venta
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {Object.entries(driverStats)
                                .sort((a, b) => {
                                    const salesA = parseInt((a[1].sales || '0').replace(/[,.]/g, '')) || 0;
                                    const salesB = parseInt((b[1].sales || '0').replace(/[,.]/g, '')) || 0;
                                    return salesB - salesA;
                                })
                                .map(([name, stats]) => (
                                    <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)' }}>
                                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{name}</span>
                                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{stats.sales}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                {/* Mix Operativo y Agregadores */}
                <div className="card">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PieChart size={18} color="var(--brand-primary)" /> Agregadores
                    </h3>
                    {Object.entries(operatorStats)
                        .sort((a, b) => b[1].count - a[1].count)
                        .map(([op, stats]) => {
                            const labels = { 'GYG': 'GetYourGuide (GYG)', 'FH': 'FareHarbor (FH)', 'VIA': 'Viator (VIA)', 'IC': 'Intercruises (IC)' };
                            const colors = { 'GYG': '#c2410c', 'FH': '#4338ca', 'VIA': '#15803d', 'IC': '#7e22ce' };
                            return <ProgressBar key={op} label={labels[op]} value={stats.perc} max={100} color={colors[op]} count={`${stats.count} tours`} />;
                        })}

                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '2rem 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={18} color="var(--brand-primary)" /> Pax
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        {[
                            { l: '1 Pax', v: paxMix.pax1 },
                            { l: '2 Pax', v: paxMix.pax2 },
                            { l: '3 Pax', v: paxMix.pax3 },
                            { l: '4 Pax', v: paxMix.pax4 },
                        ].sort((a, b) => b.v.count - a.v.count).map(item => (
                            <div key={item.l} style={{ padding: '0.75rem 0.5rem', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-primary)' }}>{item.l}</div>
                                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.v.perc}%</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{item.v.count} tours</div>
                            </div>
                        ))}
                    </div>

                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Timer size={18} color="var(--brand-primary)" /> Duración
                    </h3>
                    {Object.entries(tourDuration)
                        .sort((a, b) => b[1].count - a[1].count)
                        .map(([dur, stats]) => (
                            <ProgressBar key={dur} label={`Duración: ${dur} hrs`} value={stats.perc} max={100} color="#0ea5e9" count={`${stats.count} tours`} />
                        ))}
                </div>

            </div>
        </div>
    );
};
