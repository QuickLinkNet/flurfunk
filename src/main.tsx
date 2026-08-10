import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { FeatureFlagsProvider } from './context/FeatureFlagsContext';
import { MessagesProvider } from './context/MessagesContext';
import { initPwaUpdate } from './pwaUpdate';
import './design-system/global.css';

initPwaUpdate();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <FeatureFlagsProvider>
        <BrowserRouter basename="/apps/neighborhood" future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <AuthProvider>
            <MessagesProvider>
              <App />
            </MessagesProvider>
          </AuthProvider>
        </BrowserRouter>
      </FeatureFlagsProvider>
    </ThemeProvider>
  </React.StrictMode>
);
