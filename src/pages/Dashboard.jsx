import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, TrendingUp, Users, Car, UserCircle, Timer, AlertCircle, ShoppingBag, PieChart, Globe, CalendarMinus, Trophy, BarChart2 } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInDays, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, LabelList } from 'recharts';
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

    const DRIVER_COLORS = { 'Cristian': '#0284c7', 'Carlos': '#ef4444', 'Joao': '#a855f7' };
    const VEHICLE_COLORS = { '01-DR': '#ca8a04', '02-NR': '#334155' };
    const OPERATORS = ['GYG', 'FH', 'VIATOR', 'CASH'];
    const DRIVERS = ['Cristian', 'Carlos', 'Joao'];
    const VEHICLES = ['01-DR', '02-NR'];
    const OPERATOR_COLORS = {
        'GYG': { bg: '#fff7ed', border: '#ffedd5', text: '#c2410c' },
        'FH': { bg: '#eef2ff', border: '#e0e7ff', text: '#4338ca' },
        'VIATOR': { bg: '#f0fdf4', border: '#dcfce7', text: '#15803d' },
        'CASH': { bg: '#f0fdfa', border: '#ccfbf1', text: '#0d9488' }
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
        if (selectedOperators.length !== OPERATORS.length) {
            const hasMatch = selectedOperators.some(op => {
                if (op === 'CASH') return t.payment === 'CASH' || t.operator === 'CASH';
                return t.operator === op;
            });
            if (!hasMatch) return false;
        }

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

    const handleStartDateChange = (val) => {
        setStartDate(val);
        setActiveShortcut('');
        // Si endDate vacío o anterior al nuevo startDate, sincronizar al último día del mes de startDate
        if (!endDate || endDate < val) {
            try {
                const sd = new Date(val + 'T00:00:00');
                setEndDate(format(endOfMonth(sd), 'yyyy-MM-dd'));
            } catch { setEndDate(val); }
        }
    };
    const handleEndDateChange = (val) => {
        setEndDate(val);
        setActiveShortcut('');
    };

    const activeTours = filteredTours.filter(t => t.status.toLowerCase() !== 'cancelado');
    const realTours = activeTours.filter(t => !t.hiddenInCalendar); 
    
    // Venta Total should be the sum of all tours in the range, respecting ALL active filters
    const totalSales = Math.round(activeTours.reduce((sum, t) => sum + (parseFloat(t.netPrice) || 0), 0));
    const totalHours = Math.round(realTours.reduce((sum, t) => sum + (parseFloat(t.duration) || 0), 0));
    const activeToursCount = realTours.length;
    const totalTours = filteredTours.filter(t => !t.hiddenInCalendar).length;
    const avgTicket = activeToursCount > 0 ? Math.round(totalSales / activeToursCount) : 0;
    const cancelledCount = filteredTours.filter(t => t.status.toLowerCase() === 'cancelado' && !t.hiddenInCalendar).length;
    const cancelRate = totalTours > 0 ? Math.round((cancelledCount / totalTours) * 100) : 0;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const pipelineCount = filteredTours.filter(t => t.status.toLowerCase() === 'confirmado' && t.date >= todayStr && !t.hiddenInCalendar).length;

    let emptyDays = 0;
    if (startDate && endDate) {
        const uniqueTourDates = new Set(activeTours.map(t => t.date));
        const totalDaysInRange = Math.max(0, differenceInDays(parseISO(endDate), parseISO(startDate))) + 1;
        emptyDays = Math.max(0, totalDaysInRange - uniqueTourDates.size);
    } else if (activeTours.length > 0) {
        const uniqueTourDates = new Set(activeTours.map(t => t.date));
        const minDateStr = activeTours.reduce((min, p) => p.date < min ? p.date : min, activeTours[0].date);
        const maxDateStr = activeTours.reduce((max, p) => p.date > max ? p.date : max, activeTours[0].date);
        const totalDaysInRange = Math.max(0, differenceInDays(parseISO(maxDateStr), parseISO(minDateStr))) + 1;
        emptyDays = Math.max(0, totalDaysInRange - uniqueTourDates.size);
    }

    const avgHourlyTicket = totalHours > 0 ? Math.round(totalSales / totalHours) : 0;

    const kpis = {
        sales: totalSales.toLocaleString('es-ES'),
        hours: Math.round(totalHours),
        tours: activeToursCount,
        ticket: avgTicket.toLocaleString('es-ES'),
        hourly: avgHourlyTicket.toLocaleString('es-ES'),
        cancelRate: cancelRate,
        cancelledCount: cancelledCount,
        pipelineCount: pipelineCount
    };

    // --- Maps and Stats ---
    const driverStatsMap = {};
    const vehicleHoursMap = {};
    const paxStatsMap = { 1: 0, 2: 0, 3: 0, 4: 0, '5+': 0 };
    const durationStatsMap = {
        1: { total: 0, pax4: 0, paxLess4: 0 },
        2: { total: 0, pax4: 0, paxLess4: 0 },
        3: { total: 0, pax4: 0, paxLess4: 0 }
    };
    const operatorStatsMap = { 'GYG': 0, 'FH': 0, 'VIATOR': 0, 'CASH': 0 };
    const countryStatsMap = {};
    const timeSlotStatsMap = { '08-10': 0, '10-12': 0, '12-14': 0, '14-16': 0, '16-18': 0, '18-20': 0, '20-22': 0 };
    const leadTimeStatsMap = { 'Mismo día': 0, '1-3 días': 0, '4-7 días': 0, '8-30 días': 0, '+30 días': 0 };
    
    // --- Historical Records (Calculated from ALL tours matching the operator/driver filters, but independent of the main date range) ---
    const salesByDay_total = {};
    const salesByDay_net = {};
    const salesByWeek_total = {};
    const salesByWeek_net = {};
    const salesByMonth_total = {};
    const salesByMonth_net = {}; // Only Cristian's personal net
    const opByMonth_total = {};
    const hoursByDay = {};
    const hoursByWeek = {};
    const hoursByMonth = {};

    let toursWithBooking = 0;
    let totalLeadDays = 0;

    // Single pass for most maps (uses filtered range)
    activeTours.forEach(t => {
        const price = parseFloat(t.netPrice) || 0;
        const dur = parseFloat(t.duration) || 0;
        const pax = parseInt(t.pax) || 0;

        if (!driverStatsMap[t.driver]) driverStatsMap[t.driver] = { hours: 0, sales: 0 };
        driverStatsMap[t.driver].hours += dur;
        driverStatsMap[t.driver].sales += price;

        if (t.vehicle) {
            if (!vehicleHoursMap[t.vehicle]) vehicleHoursMap[t.vehicle] = 0;
            vehicleHoursMap[t.vehicle] += dur;
        }

        if (pax === 1) paxStatsMap[1]++;
        else if (pax === 2) paxStatsMap[2]++;
        else if (pax === 3) paxStatsMap[3]++;
        else if (pax === 4) paxStatsMap[4]++;
        else if (pax >= 5) paxStatsMap['5+']++;

        const dStr = String(t.duration);
        if (durationStatsMap[dStr]) {
            durationStatsMap[dStr].total++;
            if (pax >= 4) durationStatsMap[dStr].pax4++;
            else durationStatsMap[dStr].paxLess4++;
        }

        if (!t.hiddenInCalendar) {
            const op = (t.payment === 'CASH' || t.operator === 'CASH') ? 'CASH' : t.operator;
            if (operatorStatsMap[op] !== undefined) operatorStatsMap[op]++;
        }

        // INFERRED COUNTRY LOGIC (Fallback to phone prefix if country is missing)
        let rawCountry = t.country || '';
        if (!rawCountry && t.phone) {
            if (t.phone.startsWith('+1')) rawCountry = 'United States';
            else if (t.phone.startsWith('+44')) rawCountry = 'United Kingdom';
            else if (t.phone.startsWith('+49')) rawCountry = 'Germany';
            else if (t.phone.startsWith('+33')) rawCountry = 'France';
            else if (t.phone.startsWith('+39')) rawCountry = 'Italy';
            else if (t.phone.startsWith('+61')) rawCountry = 'Australia';
            else if (t.phone.startsWith('+41')) rawCountry = 'Switzerland';
            else if (t.phone.startsWith('+31')) rawCountry = 'Netherlands';
            else if (t.phone.startsWith('+32')) rawCountry = 'Belgium';
            else if (t.phone.startsWith('+43')) rawCountry = 'Austria';
            else if (t.phone.startsWith('+45')) rawCountry = 'Denmark';
            else if (t.phone.startsWith('+46')) rawCountry = 'Sweden';
            else if (t.phone.startsWith('+351')) rawCountry = 'Portugal';
            else if (t.phone.startsWith('+55')) rawCountry = 'Brazil';
            else if (t.phone.startsWith('+52')) rawCountry = 'Mexico';
            else if (t.phone.startsWith('+506')) rawCountry = 'Costa Rica';
            else if (t.phone.startsWith('+34')) rawCountry = 'Spain';
            else if (t.phone.startsWith('+90')) rawCountry = 'Turkey';
            else if (t.phone.startsWith('+971')) rawCountry = 'United Arab Emirates';
            else if (t.phone.startsWith('+91')) rawCountry = 'India';
            else if (t.phone.startsWith('+54')) rawCountry = 'Argentina';
            else if (t.phone.startsWith('+56')) rawCountry = 'Chile';
            else if (t.phone.startsWith('+57')) rawCountry = 'Colombia';
        }

        const cMap = { 
            'United States': 'Estados Unidos', 'Germany': 'Alemania', 'France': 'Francia', 
            'United Kingdom': 'Reino Unido', 'Sweden': 'Suecia', 'Italy': 'Italia', 
            'Canada': 'Canadá', 'Romania': 'Rumania', 'Belgium': 'Bélgica', 
            'Chile': 'Chile', 'Switzerland': 'Suiza', 'Japan': 'Japón', 
            'Brazil': 'Brasil', 'Turkey': 'Turquía', 'Netherlands': 'Países Bajos', 
            'Mexico': 'México', 'Australia': 'Australia', 'Portugal': 'Portugal',
            'Austria': 'Austria', 'Denmark': 'Dinamarca', 'Spain': 'España',
            'United Arab Emirates': 'EAU', 'India': 'India', 'Argentina': 'Argentina',
            'Colombia': 'Colombia', 'Costa Rica': 'Costa Rica'
        };
        const countryStr = rawCountry ? (cMap[rawCountry] || rawCountry) : 'Desconocido';
        
        if (countryStr !== 'Desconocido') {
            if (!countryStatsMap[countryStr]) countryStatsMap[countryStr] = 0;
            countryStatsMap[countryStr]++;
        }

        if (t.start) {
            const h = parseInt(t.start.split(':')[0], 10);
            let bucket = "";
            if (h >= 8 && h < 10) bucket = "08-10";
            else if (h >= 10 && h < 12) bucket = "10-12";
            else if (h >= 12 && h < 14) bucket = "12-14";
            else if (h >= 14 && h < 16) bucket = "14-16";
            else if (h >= 16 && h < 18) bucket = "16-18";
            else if (h >= 18 && h < 20) bucket = "18-20";
            else if (h >= 20 && h < 22) bucket = "20-22";
            if (bucket) timeSlotStatsMap[bucket]++;
        }

        if (t.bookingDate && t.date) {
            const days = differenceInDays(parseISO(t.date), parseISO(t.bookingDate));
            if (days >= 0) {
                toursWithBooking++;
                totalLeadDays += days;
                if (days === 0) leadTimeStatsMap['Mismo día']++;
                else if (days <= 3) leadTimeStatsMap['1-3 días']++;
                else if (days <= 7) leadTimeStatsMap['4-7 días']++;
                else if (days <= 30) leadTimeStatsMap['8-30 días']++;
                else leadTimeStatsMap['+30 días']++;
            }
        }
    });

    // Separate pass for Records (independent of main date filter, but respecting operator/driver filters)
    MOCK_TOURS.filter(t => t.status === 'confirmado').forEach(t => {
        // Filter by operator/driver if multi-select is active
        if (selectedOperators.length !== OPERATORS.length) {
            const isMatch = selectedOperators.some(op => (op === 'CASH') ? (t.payment === 'CASH' || t.operator === 'CASH') : (t.operator === op));
            if (!isMatch) return;
        }
        if (selectedDrivers.length !== DRIVERS.length && !selectedDrivers.includes(t.driver)) return;
        if (selectedVehicles.length !== VEHICLES.length && !selectedVehicles.includes(t.vehicle)) return;

        if (!t.date) return;
        const d = parseISO(t.date);
        const price = parseFloat(t.netPrice) || 0;
        const dur = parseFloat(t.duration) || 0;
        const dayKey = t.date;

        // TOTAL Negocio Records
        if (!salesByDay_total[dayKey]) salesByDay_total[dayKey] = 0;
        salesByDay_total[dayKey] += price;

        if (!t.hiddenInCalendar) {
            if (!hoursByDay[dayKey]) hoursByDay[dayKey] = 0;
            hoursByDay[dayKey] += dur;
        }

        try {
            const wStart = format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd');
            salesByWeek_total[wStart] = (salesByWeek_total[wStart] || 0) + price;
            if (!t.hiddenInCalendar) hoursByWeek[wStart] = (hoursByWeek[wStart] || 0) + dur;
        } catch (e) { }

        try {
            const mStart = format(startOfMonth(d), 'yyyy-MM');
            salesByMonth_total[mStart] = (salesByMonth_total[mStart] || 0) + price;
            if (!t.hiddenInCalendar) hoursByMonth[mStart] = (hoursByMonth[mStart] || 0) + dur;

            if (!opByMonth_total[mStart]) opByMonth_total[mStart] = {};
            const op = t.operator || 'Otro';
            opByMonth_total[mStart][op] = (opByMonth_total[mStart][op] || 0) + price;

            // NETO Cristian Record (Match Venta por Conductor card)
            if (t.driver === 'Cristian') {
                salesByMonth_net[mStart] = (salesByMonth_net[mStart] || 0) + price;
                salesByDay_net[dayKey] = (salesByDay_net[dayKey] || 0) + price;
                const wStart = format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd');
                salesByWeek_net[wStart] = (salesByWeek_net[wStart] || 0) + price;
            }
        } catch (e) { }
    });

    const getRecord = (obj) => {
        const entries = Object.entries(obj);
        if (entries.length === 0) return { key: '-', val: 0 };
        const best = entries.reduce((max, curr) => curr[1] > max[1] ? curr : max, entries[0]);
        return { key: best[0], val: Math.round(best[1]) };
    };

    const bestDay = getRecord(salesByDay_total);
    const bestDayHours = getRecord(hoursByDay);
    const bestWeek = getRecord(salesByWeek_total);
    const bestMonth = getRecord(salesByMonth_total);

    const bestDay_net = salesByDay_net[bestDay.key] || 0;
    const bestWeek_net = salesByWeek_net[bestWeek.key] || 0;
    const bestMonth_net = salesByMonth_net[bestMonth.key] || 0;

    const allMonths = [...new Set([...Object.keys(salesByMonth_total), ...Object.keys(salesByMonth_net)])].sort();
    const monthlyChartData = allMonths.map(m => {
        const ops = opByMonth_total[m] || {};
        return {
            mes: (() => { try { const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']; return meses[parseISO(m+'-01').getMonth()] + ' ' + String(parseISO(m+'-01').getFullYear()).slice(2); } catch { return m; } })(),
            key: m,
            total: Math.round(salesByMonth_total[m] || 0),
            neto: Math.round(salesByMonth_net[m] || 0),
            GYG: Math.round(ops['GYG'] || 0),
            FH: Math.round(ops['FH'] || 0),
            VIATOR: Math.round(ops['VIATOR'] || 0),
            CASH: Math.round(ops['CASH'] || 0),
        };
    });

    const getWeekStr = (k) => { try { return 'S' + format(parseISO(k), 'I'); } catch { return k; } };
    const getMonthStr = (k) => { try { return ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'][parseISO(k + '-01').getMonth()]; } catch { return k; } };
    const getDayStr = (k) => { try { return format(parseISO(k), 'dd-MM-yyyy'); } catch { return k; } };

    const driverStats = isDriver ? {
        [currentUser.name]: {
            hours: Math.round(driverStatsMap[currentUser.name]?.hours || 0),
            sales: Math.round(driverStatsMap[currentUser.name]?.sales || 0).toLocaleString('es-ES')
        }
    } : (() => {
        const stats = {};
        DRIVERS.forEach(d => {
            stats[d] = {
                hours: Math.round(driverStatsMap[d]?.hours || 0),
                sales: Math.round(driverStatsMap[d]?.sales || 0).toLocaleString('es-ES')
            };
        });
        return stats;
    })();

    const vehicleHours = (() => {
        const vStats = {};
        VEHICLES.forEach(v => {
            vStats[v] = Math.round(vehicleHoursMap[v] || 0);
        });
        return vStats;
    })();

    const maxDriverHours = Math.max(1, ...Object.values(driverStats).map(d => d.hours));
    const maxVehicle = Math.max(1, ...Object.values(vehicleHours));

    const getPerc = (count) => totalTours > 0 ? Math.round((count / totalTours) * 100) : 0;

    const maxTimeSlot = Math.max(1, ...Object.values(timeSlotStatsMap));
    const maxLeadTime = Math.max(1, ...Object.values(leadTimeStatsMap));
    const avgLeadTime = toursWithBooking > 0 ? Math.round(totalLeadDays / toursWithBooking) : 0;

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
        'VIATOR': { perc: getPerc(operatorStatsMap['VIATOR']), count: operatorStatsMap['VIATOR'] },
        'CASH': { perc: getPerc(operatorStatsMap['CASH']), count: operatorStatsMap['CASH'] }
    };

    const topCountries = Object.entries(countryStatsMap)
        .filter(([country]) => country !== 'Desconocido') // Hide the "Unknown" label from UI
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([country, count]) => ({
            label: country,
            count: count,
            perc: getPerc(count)
        }));

    return (
        <div className="animate-fade-in">
            <div className="page-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', flexWrap: 'wrap', gap: '1rem', flexDirection: isMobile ? 'column' : 'row' }}>
                    <h1 className="page-title" style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '1.875rem' }}>KPIs</h1>

                    {/* Date selector — mismo estilo que Gestión */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                            {[['today', 'Hoy'], ['week', 'Semana'], ['month', 'Mes'], ['all', 'Todo']].map(([key, label]) => {
                                const isActive = activeShortcut === key;
                                return (
                                    <button key={key} onClick={() => setDateRangeShortcut(key)} style={{
                                        fontSize: '0.75rem', padding: '0.35rem 0.6rem', borderRadius: '6px',
                                        border: `1px solid ${isActive ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                                        background: isActive ? 'var(--brand-primary)' : 'var(--bg-card)',
                                        color: isActive ? '#fff' : 'var(--text-secondary)',
                                        cursor: 'pointer', fontWeight: isActive ? 700 : 600,
                                        boxShadow: isActive ? '0 2px 6px rgba(59,130,246,0.35)' : 'none',
                                        transition: 'all 0.15s ease'
                                    }}>{label}</button>
                                );
                            })}
                        </div>
                        <input type="date" value={startDate}
                            onChange={(e) => handleStartDateChange(e.target.value)}
                            style={{ padding: '0.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                        />
                        <span style={{ color: 'var(--text-secondary)' }}>-</span>
                        <input type="date" value={endDate}
                            onChange={(e) => handleEndDateChange(e.target.value)}
                            style={{ padding: '0.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                        />
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
                            const opCount = filteredTours.filter(t => t.operator === op).length;
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
                    title="Ticket / Tour"
                    value={kpis.ticket}
                    icon={ShoppingBag}
                    isMobile={isMobile}
                    extraLabel="Neto"
                />
                <StatCard
                    title="Ticket / Hora"
                    value={kpis.hourly}
                    icon={Clock}
                    isMobile={isMobile}
                    extraLabel="Neto"
                />
                <StatCard
                    title="Días Libres"
                    value={emptyDays}
                    icon={CalendarMinus}
                    isMobile={isMobile}
                />
            </div>

            {/* Pipeline + Cancelaciones — sub-KPI strip */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: isMobile ? '0.75rem' : '1.5rem',
                marginBottom: '2rem'
            }}>
                {/* En Tubería */}
                <div className="card" style={{
                    padding: '1.25rem 1.5rem',
                    background: 'linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(56,189,248,0.04) 100%)',
                    borderLeft: '3px solid #0ea5e9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem'
                }}>
                    <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '50%', background: 'rgba(14,165,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0ea5e9' }}>En Tubería</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>{kpis.pipelineCount}</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>reservas futuras confirmadas</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>del total</p>
                        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0ea5e9' }}>
                            {kpis.tours > 0 ? Math.round((kpis.pipelineCount / kpis.tours) * 100) : 0}%
                        </p>
                    </div>
                </div>

                {/* Cancelaciones */}
                <div className="card" style={{
                    padding: '1.25rem 1.5rem',
                    background: 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(248,113,113,0.02) 100%)',
                    borderLeft: '3px solid var(--status-cancelled)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem'
                }}>
                    <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <AlertCircle size={18} color="var(--status-cancelled)" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--status-cancelled)' }}>Cancelaciones</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>{kpis.cancelledCount}</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>reservas canceladas</span>
                        </div>
                        {/* Mini barra de ratio */}
                        <div style={{ marginTop: '0.5rem', height: '4px', borderRadius: '9999px', background: 'var(--bg-hover)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${kpis.cancelRate}%`, borderRadius: '9999px', background: 'var(--status-cancelled)', transition: 'width 0.6s ease' }} />
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>tasa</p>
                        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--status-cancelled)' }}>{kpis.cancelRate}%</p>
                    </div>
                </div>
            </div>

            {/* Sección de Récords y Tendencias */}
            <div className="card" style={{ marginBottom: '2rem', padding: isMobile ? '1rem' : '1.5rem', background: 'linear-gradient(135deg, rgba(251,191,36,0.06) 0%, rgba(245,158,11,0.02) 100%)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309' }}>
                    <Trophy size={20} color="#f59e0b" /> Récords Históricos
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '1rem' }}>
                    <div style={{ padding: '1rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Día Mayor Facturación</p>
                        <h4 style={{ margin: '0.5rem 0 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{Math.round(bestDay.val).toLocaleString('es-ES')} €</h4>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>{getDayStr(bestDay.key)}</p>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Día Más Intenso</p>
                        <h4 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{Math.round(bestDayHours.val)} h</h4>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>{getDayStr(bestDayHours.key)}</p>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Semana Récord</p>
                        <h4 style={{ margin: '0.5rem 0 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{Math.round(bestWeek.val).toLocaleString('es-ES')} €</h4>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>{getWeekStr(bestWeek.key)}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'rgba(245,158,11,0.15)', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(245,158,11,0.2)' }}>
                                <Clock size={10} color="#b45309" strokeWidth={3} />
                                <span style={{ fontSize: '0.65rem', color: '#b45309', fontWeight: 800 }}>{Math.round(hoursByWeek[bestWeek.key] || 0)}h tours</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Mes Récord</p>
                        <h4 style={{ margin: '0.5rem 0 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{Math.round(bestMonth.val).toLocaleString('es-ES')} €</h4>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>{getMonthStr(bestMonth.key)}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'rgba(245,158,11,0.15)', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(245,158,11,0.2)' }}>
                                <Clock size={10} color="#b45309" strokeWidth={3} />
                                <span style={{ fontSize: '0.65rem', color: '#b45309', fontWeight: 800 }}>{Math.round(hoursByMonth[bestMonth.key] || 0)}h tours</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráfico Evolutivo Mensual */}
            {(() => {
                const [chartMode, setChartMode] = React.useState('bars'); // 'bars' | 'lines'
                const [showNeto, setShowNeto] = React.useState(true);
                const [showTotal, setShowTotal] = React.useState(true);

                const CustomTooltip = ({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.75rem 1rem', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', minWidth: '150px' }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{label}</p>
                            {payload.map((p, i) => (
                                <p key={i} style={{ margin: '0.15rem 0', fontSize: '0.8rem', color: p.color, fontWeight: 700 }}>
                                    {p.name}: {p.value.toLocaleString('es-ES')} €
                                </p>
                            ))}
                        </div>
                    );
                };

                const PercLabel = (props) => {
                    const { x, y, width, height, value, payload } = props;
                    if (!height || height < 14 || !value || !payload) return null;
                    const total = payload.total;
                    if (!total) return null;
                    const perc = Math.round((value / total) * 100);
                    if (perc < 4) return null;
                    return (
                        <text x={x + width / 2} y={y + height / 2} fill="#fff" fontSize={10} fontWeight={700} textAnchor="middle" dominantBaseline="middle" style={{ pointerEvents: 'none' }}>
                            {perc}%
                        </text>
                    );
                };

                const TotalTopLabel = (props) => {
                    const { x, y, width, payload } = props;
                    if (!payload) return null;
                    const total = payload.total;
                    if (!total) return null;
                    return (
                        <text x={x + width / 2} y={y - 8} fill="var(--text-primary)" fontSize={11} fontWeight={800} textAnchor="middle" style={{ pointerEvents: 'none' }}>
                            {total.toLocaleString('es-ES')}€
                        </text>
                    );
                };

                const ChartComp = chartMode === 'bars' ? BarChart : LineChart;

                return (
                    <div className="card" style={{ marginBottom: '2rem', padding: isMobile ? '1rem' : '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                                <BarChart2 size={18} color="var(--brand-primary)" /> Evolutivo de Venta Mensual
                            </h3>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                {/* Toggle líneas/barras */}
                                <div style={{ display: 'flex', background: 'var(--bg-hover)', borderRadius: '8px', padding: '3px', border: '1px solid var(--border-color)' }}>
                                    {[['bars', '▦ Barras'], ['lines', '↗ Líneas']].map(([mode, label]) => (
                                        <button key={mode} onClick={() => setChartMode(mode)} style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 700, background: chartMode === mode ? 'var(--brand-primary)' : 'transparent', color: chartMode === mode ? '#fff' : 'var(--text-secondary)', transition: 'all 0.15s' }}>{label}</button>
                                    ))}
                                </div>
                                {/* Toggle series */}
                                <button onClick={() => setShowTotal(v => !v)} style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem', borderRadius: '6px', border: `2px solid #64748b`, cursor: 'pointer', fontWeight: 700, background: showTotal ? '#64748b' : 'transparent', color: showTotal ? '#fff' : '#64748b', transition: 'all 0.15s' }}>
                                    Total Negocio
                                </button>
                                <button onClick={() => setShowNeto(v => !v)} style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem', borderRadius: '6px', border: `2px solid #0284c7`, cursor: 'pointer', fontWeight: 700, background: showNeto ? '#0284c7' : 'transparent', color: showNeto ? '#fff' : '#0284c7', transition: 'all 0.15s' }}>
                                    Neto Cristian
                                </button>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <ChartComp data={monthlyChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--text-secondary)', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toLocaleString('es-ES')}€`} width={70} />
                                <Tooltip content={<CustomTooltip />} />
                                {chartMode === 'bars' ? (
                                    <>
                                        {showTotal && (
                                            <>
                                                <Bar dataKey="GYG" stackId="tot" name="GYG" fill="#f97316"><LabelList content={<PercLabel/>} /></Bar>
                                                <Bar dataKey="FH" stackId="tot" name="FH" fill="#6366f1"><LabelList content={<PercLabel/>} /></Bar>
                                                <Bar dataKey="VIATOR" stackId="tot" name="VIATOR" fill="#22c55e"><LabelList content={<PercLabel/>} /></Bar>
                                                <Bar dataKey="CASH" stackId="tot" name="CASH" fill="#14b8a6" radius={[4, 4, 0, 0]}>
                                                    <LabelList content={<PercLabel/>} />
                                                    <LabelList content={<TotalTopLabel/>} />
                                                </Bar>
                                            </>
                                        )}
                                        {showNeto && <Bar dataKey="neto" name="Neto Cristian" fill="#0284c7" radius={[4, 4, 0, 0]} />}
                                    </>
                                ) : (
                                    <>
                                        {showTotal && <Line type="monotone" dataKey="total" name="Total Negocio" stroke="#64748b" strokeWidth={2.5} dot={{ r: 4, fill: '#64748b' }} activeDot={{ r: 6 }} />}
                                        {showNeto && <Line type="monotone" dataKey="neto" name="Neto Cristian" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4, fill: '#0284c7' }} activeDot={{ r: 6 }} />}
                                    </>
                                )}
                            </ChartComp>
                        </ResponsiveContainer>
                    </div>
                );
            })()}

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
                            const labels = { 'GYG': 'GetYourGuide', 'FH': 'FareHarbor', 'VIATOR': 'Viator', 'CASH': 'Cash' };
                            const colors = { 'GYG': '#f97316', 'FH': '#6366f1', 'VIATOR': '#22c55e', 'CASH': '#14b8a6' };
                            return <ProgressBar key={op} label={labels[op] || op} value={stats.perc} max={100} color={colors[op] || '#94a3b8'} count={`${stats.count} tours`} />;
                        })}
                </div>

                {/* Card 4: Top 3 Países */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', breakInside: 'avoid', marginBottom: '1.5rem', WebkitColumnBreakInside: 'avoid' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Globe size={18} color="var(--brand-primary)" /> Principales Mercados
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

                {/* Card 4, 5: Analíticas de Booking */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', breakInside: 'avoid', marginBottom: '1.5rem', WebkitColumnBreakInside: 'avoid' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={18} color="var(--brand-primary)" /> Mapa de Calor (Horarios)
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '160px', marginTop: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', gap: '0.25rem' }}>
                        {Object.entries(timeSlotStatsMap).map(([bucket, count]) => {
                            const heightPerc = maxTimeSlot > 0 ? (count / maxTimeSlot) * 100 : 0;
                            const alpha = maxTimeSlot > 0 ? 0.2 + 0.8 * (count / maxTimeSlot) : 0.2;
                            return (
                                <div key={bucket} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '0.35rem', height: '100%', justifyContent: 'flex-end' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{count > 0 ? count : ''}</div>
                                    <div style={{
                                        width: '100%',
                                        maxWidth: '40px',
                                        height: `${Math.max(heightPerc, count > 0 ? 5 : 0)}%`,
                                        backgroundColor: `rgba(245, 158, 11, ${alpha})`,
                                        borderRadius: '4px 4px 0 0',
                                        transition: 'all 0.3s ease'
                                    }} />
                                    <div style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{bucket}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', breakInside: 'avoid', marginBottom: '1.5rem', WebkitColumnBreakInside: 'avoid' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CalendarIcon size={18} color="var(--brand-primary)" /> Antelación de Reservas
                    </h3>
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--brand-light)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--brand-primary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Promedio Global</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-primary)' }}>{avgLeadTime} días</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {Object.entries(leadTimeStatsMap)
                            .map(([range, count]) => (
                                <ProgressBar key={range} label={range} value={count} max={maxLeadTime} color="#3b82f6" count={`${count} res`} />
                            ))}
                    </div>
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
