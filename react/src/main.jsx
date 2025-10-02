import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom'; // <- import BrowserRouter
import Store from './config/redux/Store';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={Store}>
      {/* Wrap App with BrowserRouter */}
      <BrowserRouter basename="/">
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
