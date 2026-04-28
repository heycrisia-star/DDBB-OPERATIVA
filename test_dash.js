import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Dashboard from './src/pages/Dashboard';

try {
  const html = ReactDOMServer.renderToString(React.createElement(Dashboard, { currentUser: null }));
  console.log("RENDER SUCCESS", html.length);
} catch (e) {
  console.error("RENDER FAILED:", e);
}
