import React from 'react';
import { render } from '@testing-library/react';
import { JSDOM } from 'jsdom';
import Dashboard from './src/pages/Dashboard';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, 'navigator', { value: { userAgent: 'node.js' }, writable: true });
global.requestAnimationFrame = function (callback) { return setTimeout(callback, 0); };
global.cancelAnimationFrame = function (id) { clearTimeout(id); };

try {
  const { container } = render(React.createElement(Dashboard, { currentUser: null }));
  console.log("DOM RENDER SUCCESS", container.innerHTML.length);
} catch (e) {
  console.error("DOM RENDER FAILED:", e);
}
