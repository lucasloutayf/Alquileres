import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'  // ← IMPORTANTE
import './i18n/config' // Importar configuración de i18n
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
