import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './Style/theme.css'
import { setupGlobalErrorHandler } from './services/errorLogger'

const rootEl = document.getElementById('root')
const preloader = document.getElementById('app-preloader')

// Set up global error handler
setupGlobalErrorHandler()

createRoot(rootEl).render(<App />)

// Remove preloader after first paint
requestAnimationFrame(() => {
  if (preloader) {
    preloader.remove()
  }
})
