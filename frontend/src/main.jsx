import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios';

// interceptor to set token in every request:
axios.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${sessionStorage.getItem("token")}`;
  return config;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)