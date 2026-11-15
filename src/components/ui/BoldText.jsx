import React from 'react';

/**
 * Texte traduit avec des passages en gras marqués `**…**` (ex. t('…') renvoie
 * « Ouvre les **réglages** »). Rien d'autre n'est interprété.
 */
const BoldText = ({ text, strongClassName }) => {
  const parts = String(text ?? '').split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1
        ? <strong key={i} className={strongClassName}>{part}</strong>
        : <React.Fragment key={i}>{part}</React.Fragment>))}
    </>
  );
};

export default BoldText;
