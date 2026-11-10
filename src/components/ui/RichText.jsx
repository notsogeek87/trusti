import React from 'react';
import Markdown from 'react-markdown';
import { RICH_TEXT_OPTIONS } from '../../utils/richText';

// Règles (éléments autorisés, liens https uniquement, HTML supprimé) : src/utils/richText.js
const COMPONENTS = {
  // Paragraphe -> bloc en ligne : le texte garde la mise en forme du conteneur (li, p…).
  p: ({ children }) => <span className="block [&+&]:mt-1">{children}</span>,
  strong: ({ children }) => <strong className="font-bold text-slate-800">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children }) => (
    <code className="px-1 py-0.5 rounded bg-slate-200/70 text-slate-800 text-[0.95em] font-mono break-all">{children}</code>
  ),
  a: ({ href, children }) => (href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 underline underline-offset-2">
      {children}
    </a>
  ) : <>{children}</>),
};

/**
 * Texte court venu de la base, avec un Markdown limité (voir utils/richText.js).
 * Les couleurs et la mise en page restent décidées par le composant qui l'affiche.
 */
const RichText = ({ children }) => {
  if (typeof children !== 'string' || !children) return null;
  return (
    <Markdown
      {...RICH_TEXT_OPTIONS}
      components={COMPONENTS}
    >
      {children}
    </Markdown>
  );
};

export default RichText;
