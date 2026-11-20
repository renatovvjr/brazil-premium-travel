import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import DestinationPage from './DestinationPage.jsx'
import Workspace from './Workspace.jsx'
import CarnavalLanding from './CarnavalLanding.jsx'
import CarnavalPackagePage from './CarnavalPackagePage.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css' // 👈 ESSA LINHA É O SEGREDO

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/destino/:name" element={<DestinationPage />} />
        <Route path="/workspace/*" element={<Workspace />} />
        <Route path="/carnaval" element={<CarnavalLanding />} />
        <Route path="/carnaval/grand-journey" element={<CarnavalPackagePage packageId="grand-journey" />} />
        <Route path="/carnaval/rio-bahia" element={<CarnavalPackagePage packageId="rio-bahia" />} />
        <Route path="/carnaval/rio-minas" element={<CarnavalPackagePage packageId="rio-minas" />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
