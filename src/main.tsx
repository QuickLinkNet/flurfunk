import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { FeatureFlagsProvider } from './context/FeatureFlagsContext';
import './design-system/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <FeatureFlagsProvider>
        <BrowserRouter basename="/apps/neighborhood">
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </FeatureFlagsProvider>
    </ThemeProvider>
  </React.StrictMode>
);
