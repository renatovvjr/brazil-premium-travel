import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import DestinationPage from './DestinationPage.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css' // 👈 ESSA LINHA É O SEGREDO

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/destino/:name" element={<DestinationPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)