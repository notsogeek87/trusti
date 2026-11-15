import React from 'react';
import { t } from '../i18n/index.js';

/**
 * Filet de sécurité global : sans ErrorBoundary, une exception de rendu
 * n'importe où dans l'arbre React fait planter toute l'app (écran blanc).
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erreur non gérée dans l\'application:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'Nunito, system-ui, sans-serif', // i18n-ignore
        }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700 }}>{t('myApps.error.title')}</h1>
          <p style={{ color: '#5B6B7D', maxWidth: '400px' }}>
            {t('myApps.error.body')}
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: 'none',
              background: '#1F3A5F',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t('myApps.error.reload')}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
