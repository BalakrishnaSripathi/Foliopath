import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import AOS from 'aos'
import 'aos/dist/aos.css'
import './index.css'
import App from './App.jsx'

AOS.init({
  duration: 700,
  easing: 'ease-out-cubic',
  once: true,
  offset: 100,
  disable: window.innerWidth < 768,
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{ duration: 4000 }}
    />
  </StrictMode>,
)
