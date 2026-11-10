import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Markdown from 'react-markdown';
import { RICH_TEXT_OPTIONS, safeUrl } from '../../src/utils/richText.js';

const render = (text) => renderToStaticMarkup(createElement(Markdown, RICH_TEXT_OPTIONS, text));

test('gras, italique, code et lien https sont rendus', () => {
  const html = render('Touchez **⋮ > Plus** puis *Exporter*, ouvrez `vivaldi://settings` ou [l\'aide](https://faq.whatsapp.com/x).');
  assert.match(html, /<strong>⋮ &gt; Plus<\/strong>/);
  assert.match(html, /<em>Exporter<\/em>/);
  assert.match(html, /<code>vivaldi:\/\/settings<\/code>/);
  assert.match(html, /<a href="https:\/\/faq\.whatsapp\.com\/x">l(&#x27;|')aide<\/a>/);
});

test('le HTML brut est supprimé, jamais interprété', () => {
  const html = render('Avant <script>alert(1)</script><img src=x onerror=alert(1)> après');
  assert.doesNotMatch(html, /<script|<img|onerror/);
  assert.match(html, /Avant/);
  assert.match(html, /après/);
});

test('liens non https neutralisés', () => {
  for (const href of ['javascript:alert(1)', 'http://exemple.fr', 'data:text/html,x', '/relatif']) {
    const html = render(`[clic](${href})`);
    assert.doesNotMatch(html, /href="(javascript|http:|data|\/relatif)/, href);
  }
  assert.equal(safeUrl('https://proton.me/support'), 'https://proton.me/support');
  assert.equal(safeUrl('JAVASCRIPT:alert(1)'), '');
});

test('titres, images et listes : seul le texte reste', () => {
  const html = render('# Titre\n\n![logo](https://x/y.png)\n\n- un\n- deux');
  assert.doesNotMatch(html, /<h1|<img|<ul|<li/);
  assert.match(html, /Titre/);
  assert.match(html, /un/);
});
