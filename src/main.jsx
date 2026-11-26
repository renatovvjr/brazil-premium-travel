import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import DestinationPage from './DestinationPage.jsx'
import Workspace from './Workspace.jsx'
import CarnavalLanding from './CarnavalLanding.jsx'
import CarnavalPackagePage from './CarnavalPackagePage.jsx'
import UnsubscribePage from './UnsubscribePage.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { I18nProvider, TranslationDisclosure } from './i18n.jsx'
import { RouteLanguageControl } from './LanguageSelector.jsx'
import './index.css' // 👈 ESSA LINHA É O SEGREDO

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nProvider>
      <BrowserRouter>
        <RouteLanguageControl />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/destino/:name" element={<DestinationPage />} />
          <Route path="/workspace/*" element={<Workspace />} />
          <Route path="/carnaval" element={<CarnavalLanding />} />
          <Route path="/carnaval/grand-journey" element={<CarnavalPackagePage packageId="grand-journey" />} />
          <Route path="/carnaval/rio-bahia" element={<CarnavalPackagePage packageId="rio-bahia" />} />
          <Route path="/carnaval/rio-minas" element={<CarnavalPackagePage packageId="rio-minas" />} />
          <Route path="/unsubscribe" element={<UnsubscribePage />} />
        </Routes>
        <TranslationDisclosure />
      </BrowserRouter>
    </I18nProvider>
  </React.StrictMode>
)
