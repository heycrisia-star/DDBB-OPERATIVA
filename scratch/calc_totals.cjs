
const fs = require('fs');
const content = fs.readFileSync('src/data/mockTours.js', 'utf8');
const jsonStr = content.substring(content.indexOf('['), content.lastIndexOf(']') + 1);
const tours = JSON.parse(jsonStr);

const getStats = (month) => {
    const monthTours = tours.filter(t => t.date && t.date.startsWith(month) && t.status === 'confirmado');
    const total = monthTours.reduce((sum, t) => sum + (t.netPrice || 0), 0);
    const gyg = monthTours.filter(t => t.operator === 'GYG').reduce((sum, t) => sum + (t.netPrice || 0), 0);
    const fh = monthTours.filter(t => t.operator === 'FH').reduce((sum, t) => sum + (t.netPrice || 0), 0);
    return { total, gyg, fh };
};

console.log('FEBRERO:', getStats('2026-02'));
console.log('MARZO:', getStats('2026-03'));
