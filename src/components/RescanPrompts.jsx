import React from 'react';
import { RefreshCw } from 'lucide-react';
import RescanPrompt from './ui/RescanPrompt';

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
        title="Tes apps ont changé ?"
        message="Relance un scan pour garder ton TrustiScore à jour."
        scanLabel="Oui, relancer le scan"
        dismissLabel="Non, voir Mes Apps"
        onScan={onScan}
        onDismiss={onDismissOnReopen}
      />
    );
  }
  return null;
};

export default RescanPrompts;
