import React from 'react';
import OnboardingApps from './OnboardingApps';
import OnboardingAppsNative from './OnboardingAppsNative';
import { isNativeAndroid } from '../utils/platform';

/**
 * Écran de sélection des apps (onboarding ou re-scan). Sur Android natif,
 * scan automatique, avec bascule possible vers la sélection manuelle ; sur
 * le web, choix entre capture d'écran et sélection à la main.
 */
const AppsSelectionScreen = ({ manual, onManualChange, onComplete, autoStart }) => {
  if (isNativeAndroid && !manual) {
    return (
      <OnboardingAppsNative
        onComplete={onComplete}
        onManualSelection={() => onManualChange(true)}
        autoStart={autoStart}
      />
    );
  }
  return (
    <OnboardingApps
      onComplete={onComplete}
      onExit={isNativeAndroid ? () => onManualChange(false) : undefined}
    />
  );
};

export default AppsSelectionScreen;
