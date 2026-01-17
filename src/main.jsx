import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import Analytics from './components/Analytics'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Analytics />
      <App />
    </BrowserRouter>
  </StrictMode>,
)
