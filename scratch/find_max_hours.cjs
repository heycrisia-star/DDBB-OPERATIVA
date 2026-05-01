
const fs = require('fs');
const content = fs.readFileSync('src/data/mockTours.js', 'utf8');
const jsonStr = content.substring(content.indexOf('['), content.lastIndexOf(']') + 1);
const tours = JSON.parse(jsonStr);

const hoursByDay = {};
tours.filter(t => t.status === 'confirmado' && !t.hiddenInCalendar).forEach(t => {
    if (!hoursByDay[t.date]) hoursByDay[t.date] = 0;
    hoursByDay[t.date] += parseFloat(t.duration) || 0;
});

const entries = Object.entries(hoursByDay).sort((a, b) => b[1] - a[1]);
console.log('Top 5 days by hours:');
console.log(entries.slice(0, 5));
