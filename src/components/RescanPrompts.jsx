import React from 'react';
import { RefreshCw } from 'lucide-react';
import RescanPrompt from './ui/RescanPrompt';
import { t } from '../i18n/index.js';

/**
 * Propositions de re-scan : après une désinstallation (prioritaire), ou à la
 * réouverture de l'app.
 */
const RescanPrompts = ({ showAfterUninstall, showOnReopen, onScan, onDismissAfterUninstall, onDismissOnReopen }) => {
  if (showAfterUninstall) {
    return <RescanPrompt onScan={onScan} onDismiss={onDismissAfterUninstall} />;
  }
  if (showOnReopen) {
    return (
      <RescanPrompt
        Icon={RefreshCw}
        title={t('cards.rescan.changedTitle')}
        message={t('cards.rescan.changedBody')}
        scanLabel={t('cards.rescan.changedScan')}
        dismissLabel={t('cards.rescan.changedDismiss')}
        onScan={onScan}
        onDismiss={onDismissOnReopen}
      />
    );
  }
  return null;
};

export default RescanPrompts;
