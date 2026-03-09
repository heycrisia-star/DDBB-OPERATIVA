import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, TrendingUp, Users, Car, UserCircle, Timer, AlertCircle, ShoppingBag, PieChart } from 'lucide-react';
import MultiSelect from '../components/MultiSelect';

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
    const [timeRange, setTimeRange] = useState('today'); // 'today', 'weekly', 'monthly', 'year', 'cumulative'
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const isDriver = currentUser?.role === 'driver';

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Time Range Options aligned globally
    const TIME_FILTERS = [
        { id: 'today', label: 'Hoy' },
        { id: 'weekly', label: 'Semanal' },
        { id: 'monthly', label: 'Mensual' },
        { id: 'year', label: 'Año' }
    ];

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
        if (selectedOperators.includes(op)) {
            setSelectedOperators(selectedOperators.filter(o => o !== op));
        } else setSelectedOperators([...selectedOperators, op]);
    };
    const toggleAllOperators = () => {
        setSelectedOperators(selectedOperators.length === OPERATORS.length ? [] : OPERATORS);
    };

    const toggleDriver = (d) => {
        if (selectedDrivers.includes(d)) {
            setSelectedDrivers(selectedDrivers.filter(x => x !== d));
        } else setSelectedDrivers([...selectedDrivers, d]);
    };
    const toggleAllDrivers = () => {
        setSelectedDrivers(selectedDrivers.length === DRIVERS.length ? [] : DRIVERS);
    };

    const toggleVehicle = (v) => {
        if (selectedVehicles.includes(v)) {
            setSelectedVehicles(selectedVehicles.filter(x => x !== v));
        } else setSelectedVehicles([...selectedVehicles, v]);
    };
    const toggleAllVehicles = () => {
        setSelectedVehicles(selectedVehicles.length === VEHICLES.length ? [] : VEHICLES);
    };

    // Mock Data based on the selected timeRange
    const kpis = isDriver ? {
        today: { sales: '150', hours: 2, tours: 1, ticket: '150', cancelRate: 0 },
        weekly: { sales: '1,050', hours: 14, tours: 6, ticket: '175', cancelRate: 0 },
        monthly: { sales: '4,100', hours: 55, tours: 24, ticket: '170', cancelRate: 5 },
        year: { sales: '15,200', hours: 206, tours: 93, ticket: '163', cancelRate: 8 }
    }[timeRange] : {
        today: { sales: '450', hours: 6, tours: 3, ticket: '150', cancelRate: 5 },
        weekly: { sales: '3,150', hours: 42, tours: 18, ticket: '175', cancelRate: 8 },
        monthly: { sales: '12,400', hours: 165, tours: 72, ticket: '172', cancelRate: 12 },
        year: { sales: '45,800', hours: 620, tours: 280, ticket: '163', cancelRate: 10 }
    }[timeRange];

    const vehicleHours = { '01-DR': 95, '02-NR': 70 };
    const maxVehicle = 100;

    const driverStats = isDriver ? {
        [currentUser.name]: { hours: currentUser.name === 'Roger' ? 50 : 40, sales: currentUser.name === 'Roger' ? '3,200' : '2,600' }
    } : {
        'Cristian': { hours: 75, sales: '4,500' },
        'Roger': { hours: 50, sales: '3,200' },
        'Marco': { hours: 40, sales: '2,600' }
    };
    const maxDriverHours = 80;

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

                    {isMobile && (
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            style={{
                                padding: '0.5rem 2rem 0.5rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                appearance: 'none',
                                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 0.5rem center',
                                backgroundSize: '1em'
                            }}
                        >
                            {TIME_FILTERS.map(range => (
                                <option key={range.id} value={range.id}>{range.label}</option>
                            ))}
                        </select>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: isMobile ? '1rem' : '2.5rem', padding: isMobile ? '1rem' : '0 1.5rem 0 0', borderRight: isMobile ? 'none' : '1px solid var(--border-color)', backgroundColor: isMobile ? 'var(--bg-hover)' : 'transparent', borderRadius: isMobile ? 'var(--radius-md)' : '0', justifyContent: isMobile ? 'space-around' : 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>{timeRange === 'year' ? 'Acum. Año' : 'Venta Mes'}</div>
                            <div style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{isDriver ? '4,100' : '12,400'}€</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>{timeRange === 'year' ? 'Forecast Año' : 'Forecast'}</div>
                            <div style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 800, color: 'var(--brand-primary)' }}>{isDriver ? '5,500' : '14,500'}€</div>
                        </div>
                    </div>

                    {!isMobile && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {TIME_FILTERS.map(range => (
                                <button
                                    key={range.id}
                                    onClick={() => setTimeRange(range.id)}
                                    style={{
                                        padding: '0.5rem 1.25rem',
                                        border: '1px solid',
                                        borderColor: timeRange === range.id ? 'var(--brand-primary)' : 'var(--border-color)',
                                        background: timeRange === range.id ? 'var(--brand-primary)' : 'var(--bg-card)',
                                        color: timeRange === range.id ? '#ffffff' : 'var(--text-secondary)',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        borderRadius: '999px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: timeRange === range.id ? '0 4px 6px -1px rgba(14, 165, 233, 0.2)' : 'none'
                                    }}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    )}
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
                                .sort((a, b) => parseInt(b[1].sales.replace(/,/g, '')) - parseInt(a[1].sales.replace(/,/g, '')))
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
