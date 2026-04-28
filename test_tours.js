import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Tours from './src/pages/Tours';

try {
  const html = ReactDOMServer.renderToString(React.createElement(Tours, { currentUser: null }));
  console.log("RENDER SUCCESS", html.length);
} catch (e) {
  console.error("RENDER FAILED:", e);
}
