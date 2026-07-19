import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // Він має імпортувати App
import './App.css'        // Можеш додати імпорт стилів і сюди для надійності

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)