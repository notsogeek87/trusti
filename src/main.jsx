import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Empêcher le navigateur de réinitialiser le scroll lors des pushState/popState
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}
import { ToastProvider } from './contexts/ToastContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './styles/index.css'

import { resolveStandalonePage, STANDALONE_PAGES } from './utils/standalonePage.js'

// Pages autonomes de la rubrique « Organisations », chargées à part : sans
// leur paramètre d'adresse, l'app s'affiche exactement comme avant.
// - ?organisation       : « Évaluer mon organisation » (page historique)
// - ?organisations      : choix du parcours (évaluer / créer)
// - ?creer-organisation : « Créer mon organisation » (en préparation)
const STANDALONE_COMPONENTS = {
  [STANDALONE_PAGES.EVALUATE_ORGANISATION]: React.lazy(() => import('./components/organisation/OrganisationPage.jsx')),
  [STANDALONE_PAGES.ORGANISATIONS]: React.lazy(() => import('./components/organisation/OrganisationsPage.jsx')),
  [STANDALONE_PAGES.CREATE_ORGANISATION]: React.lazy(() => import('./components/organisation/CreateOrganisationPage.jsx')),
}
const StandalonePage = STANDALONE_COMPONENTS[resolveStandalonePage(window.location.search)]

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      {StandalonePage ? (
        <React.Suspense fallback={null}>
          <StandalonePage />
        </React.Suspense>
      ) : (
        <ToastProvider>
          <App />
        </ToastProvider>
      )}
    </ErrorBoundary>
  </React.StrictMode>,
)
