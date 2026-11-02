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

// Page autonome « Évaluer mon organisation » (adresse ?organisation), chargée
// à part : sans ce paramètre, l'app s'affiche exactement comme avant.
const OrganisationPage = React.lazy(() => import('./components/organisation/OrganisationPage.jsx'))
const isOrganisationPage = new URLSearchParams(window.location.search).has('organisation')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      {isOrganisationPage ? (
        <React.Suspense fallback={null}>
          <OrganisationPage />
        </React.Suspense>
      ) : (
        <ToastProvider>
          <App />
        </ToastProvider>
      )}
    </ErrorBoundary>
  </React.StrictMode>,
)
