
import { tours } from './src/data/mockTours.js';

const marchTours = tours.filter(t => t.date.startsWith('2026-03') && t.status === 'confirmado');
const febTours = tours.filter(t => t.date.startsWith('2026-02') && t.status === 'confirmado');

const sumNetPrice = (list) => list.reduce((sum, t) => sum + (t.netPrice || 0), 0);

console.log('FEBRERO:');
console.log('Total:', sumNetPrice(febTours));
console.log('GYG:', sumNetPrice(febTours.filter(t => t.operator === 'GYG')));
console.log('FH:', sumNetPrice(febTours.filter(t => t.operator === 'FH')));

console.log('\nMARZO:');
console.log('Total:', sumNetPrice(marchTours));
console.log('GYG:', sumNetPrice(marchTours.filter(t => t.operator === 'GYG')));
console.log('FH:', sumNetPrice(marchTours.filter(t => t.operator === 'FH')));
