import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/index.css';
import { AuthProvider } from './contexts/AuthContext';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
