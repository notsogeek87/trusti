import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchAppsFromText, normalizeAppName, buildAppIndex } from '../../src/utils/screenshotAppMatcher.js';

// Extrait du catalogue réel : noms au format Play Store, avec des apps
// système Android qui portent le même nom que des apps intégrées d'iOS.
const CATALOG = [
  { id: 1, name: 'Whatsapp' },
  { id: 2, name: 'Spotify: Music and Podcasts' },
  { id: 3, name: 'TikTok - Videos, Shop & LIVE' },
  { id: 4, name: 'Microsoft Word: Edit Documents' },
  { id: 5, name: 'Google Drive' },
  { id: 6, name: 'Proton Drive' },
  { id: 7, name: 'Infomaniak kDrive' },
  { id: 8, name: 'Messages' },
  { id: 9, name: 'Contacts' },
  { id: 10, name: 'Apple Music' },
  { id: 11, name: 'Apple Pay' },
  { id: 12, name: 'Google Wallet' },
  { id: 13, name: 'Youtube' },
  { id: 14, name: 'Youtube Music' },
  { id: 15, name: 'Uber - Request a ride' },
  { id: 16, name: 'Uber Eats: Food and Grocery' },
  { id: 17, name: 'Organic Maps・Offline Map & GPS' },
  { id: 18, name: 'Signal Private Messenger' },
  { id: 19, name: 'Booking.com: Hotels & Travel' },
  { id: 20, name: 'X' },
  { id: 'apple-safari', name: 'Safari' },
  { id: 'apple-mail', name: 'Mail' },
];

const names = (apps) => apps.map(a => a.name);

test('normalise casse, accents, ponctuation et caractères invisibles', () => {
  assert.equal(normalizeAppName('  ​Météo-France ! '), 'meteo france');
  assert.equal(normalizeAppName('WhatsApp'), 'whatsapp');
});

test('reconnaît le nom court affiché par l\'iPhone', () => {
  const text = 'Spotify\nTikTok\nWord\nDrive\nUber\nUber Eats\nOrganic Maps\nSignal\nBooking.com';
  assert.deepEqual(names(matchAppsFromText(text, CATALOG)), [
    'Spotify: Music and Podcasts',
    'TikTok - Videos, Shop & LIVE',
    'Microsoft Word: Edit Documents',
    'Google Drive',
    'Uber - Request a ride',
    'Uber Eats: Food and Grocery',
    'Organic Maps・Offline Map & GPS',
    'Signal Private Messenger',
    'Booking.com: Hotels & Travel',
  ]);
});

test('ignore les apps intégrées d\'iOS homonymes d\'apps système Android', () => {
  assert.deepEqual(matchAppsFromText('Messages\nContacts\nRéglages', CATALOG), []);
});

test('relie les apps intégrées d\'iOS à l\'app Apple du catalogue', () => {
  assert.deepEqual(names(matchAppsFromText('Musique\nWallet\nSafari\nMail', CATALOG)), ['Apple Music', 'Apple Pay', 'Safari', 'Mail']);
});

test('une app intégrée d\'iOS absente du catalogue reste ignorée', () => {
  const withoutApple = CATALOG.filter(app => !String(app.id).startsWith('apple-'));
  assert.deepEqual(matchAppsFromText('Safari\nMail', withoutApple), []);
});

test('tolère une erreur de lecture sur un nom long, pas sur un nom court', () => {
  assert.deepEqual(names(matchAppsFromText('WhatsApD', CATALOG)), ['Whatsapp']);
  assert.deepEqual(matchAppsFromText('Drlve', CATALOG), []);
});

test('nettoie chevrons, icônes parasites et lignes d\'en-tête', () => {
  const text = '09:41\n< Réglages\nApps\nA\nYouTube >\n@ WhatsApp\nSs Signal >\n\n';
  assert.deepEqual(names(matchAppsFromText(text, CATALOG)), ['Youtube', 'Whatsapp', 'Signal Private Messenger']);
});

test('le nom exact prime sur le premier mot d\'une autre app, sans doublon', () => {
  assert.deepEqual(names(matchAppsFromText('YouTube\nYouTube Music\nYouTube', CATALOG)), ['Youtube', 'Youtube Music']);
});

test('une clé partagée par deux apps est écartée comme ambiguë', () => {
  const index = buildAppIndex([{ id: 'a', name: 'Proton Mail' }, { id: 'b', name: 'Proton VPN' }]);
  assert.equal(index.has('proton'), false);
  assert.equal(index.get('proton mail').app.id, 'a');
});

test('entrées vides ou invalides', () => {
  assert.deepEqual(matchAppsFromText('', CATALOG), []);
  assert.deepEqual(matchAppsFromText(null, []), []);
  assert.deepEqual(matchAppsFromText('Spotify', [null, { id: 1 }]), []);
});
