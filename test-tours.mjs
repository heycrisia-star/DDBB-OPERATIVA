import { MOCK_TOURS } from './src/data/mockTours.js';
try {
  const filtered = MOCK_TOURS.filter(t => {
    if (!t.code) console.log("Missing code on tour", t.id);
    else if (typeof t.code !== 'string') t.code = String(t.code);
    return t.code.toLowerCase().includes('');
  });
  
  filtered.forEach(tour => {
    if (!tour.status) console.log("Missing status on tour", tour.id);
    else tour.status.toLowerCase();
  });
  console.log("Success! Total tours:", filtered.length);
} catch (e) {
  console.error("Runtime error:", e);
}
