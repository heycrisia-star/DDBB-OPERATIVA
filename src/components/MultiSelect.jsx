import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function MultiSelect({ options, selected, onChange, onToggleAll, label, isMobile: propIsMobile }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [isMobile, setIsMobile] = useState(propIsMobile !== undefined ? propIsMobile : (typeof window !== 'undefined' ? window.innerWidth < 768 : false));

    useEffect(() => {
        if (propIsMobile !== undefined) {
            setIsMobile(propIsMobile);
        }
    }, [propIsMobile]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const allSelected = selected.length === options.length;

    return (
        <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block', width: isMobile ? '100%' : 'auto' }}>
            <button
                className="input"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    padding: '0.4rem 1rem',
                    width: '100%',
                    minWidth: isMobile ? '120px' : '160px',
                    cursor: 'pointer',
                    background: 'var(--bg-card)',
                    textAlign: 'left'
                }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span style={{ fontSize: '0.875rem' }}>
                    {selected.length === 0 ? `0 seleccionados` :
                        allSelected ? `Todos (${label})` :
                            selected.length === 1 ? selected[0] :
                                `${selected.length} seleccionados`}
                </span>
                <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '0.25rem',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    zIndex: 50,
                    minWidth: '100%',
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer', padding: '0.25rem' }}>
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={onToggleAll}
                            style={{ accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: 600 }}>Todos</span>
                    </label>
                    <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.25rem 0' }} />
                    {options.map(opt => (
                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer', padding: '0.25rem', whiteSpace: 'nowrap' }}>
                            <input
                                type="checkbox"
                                checked={selected.includes(opt)}
                                onChange={() => onChange(opt)}
                                style={{ accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                            />
                            {opt}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}
