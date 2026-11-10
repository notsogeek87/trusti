# Audit des alternatives proposées (10 novembre 2026)

**Pour qui :** le mainteneur, pour décider s'il faut changer la façon de proposer des alternatives.
**Méthode :** pour chacune des 383 apps notées C, D ou E, calcul de l'alternative mise en avant aujourd'hui, avec la même règle que l'app : même catégorie, note A, B ou C strictement meilleure, « Migration facile » d'abord, puis meilleure note, puis popularité. Lecture seule, rien n'a été modifié. Classement des cas fait à la main.

## Chiffres

| | Apps C/D/E |
|---|---|
| Total | 383 |
| Sans aucune alternative | 88 (46 C, 29 D, 13 E) |
| Avec une alternative proposée | 295 |
| … dont alternative **hors sujet** (autre usage) | **96** (un tiers) |
| … dont alternative **discutable** (même famille, autre nature) | environ 55 |
| … dont alternative pertinente | environ 145 |

## 1. Alternatives hors sujet (96)

Trois sur quatre viennent de six catégories « fourre-tout » où une seule app bien notée sert d'alternative à tout le reste.

| Catégorie | Apps concernées | Alternative proposée | Problème |
|---|---|---|---|
| Shopping | 36 : Amazon, SHEIN, Temu, AliExpress, eBay, Walmart, Back Market, Etsy, Carrefour, Darty, adidas… | Leroy Merlin (B) | Magasin de bricolage proposé pour tout |
| Jeux | 15 : Candy Crush, Pokémon GO, Fortnite, Échecs, Steam… | GameNative (B) | Lanceur de jeux PC, sans rapport |
| Personnalisation | 9 : widgets, fonds d'écran, montre « écran cassé »… | Arcticons (A) | Pack d'icônes |
| Utilitaires | 5 : Find Hub, reconnaissance vocale, notifications Motorola… | AdBlock pour Samsung Browser (B) | Bloqueur de pub |
| Téléphone & SMS | 5 : Téléphone, Contacts, Messages Google, TextNow… | Truecaller (C) | Anti-spam, réputé pour collecter les carnets d'adresses |
| Maison connectée | 5 : SmartThings, iRobot, eufy, Deco (routeur), Home | Nuki (B) | Serrure connectée |
| CRM & Support | HubSpot, Salesforce, Pipedrive, Zoho CRM | Zammad (A) | Outil de support, pas un CRM (Twenty existe dans la catégorie) |
| Outils / Développement | GitHub, GitLab, Play Console, Android Developer Verifier | Termux (A) | Terminal (Forgejo existe dans la catégorie) |
| Sauvegarde & Supervision | Datadog, Grafana | Duplicati (A) | Sauvegarde, pas supervision (Zabbix existe dans la catégorie) |
| Système / Smartphone | iOS | LineageOS (B) | Ne s'installe pas sur iPhone |
| Divers | Duolingo → Moodle, Too Good To Go → Yuka, Calendrier → Doodle, Éditeur de texte → Karakeep, Sheets → Acrobat Reader, Shazam → Deezer, Miro → OpenProject, Qonto → Lydia, Okta → RG System Suite, Roblox → Mastodon | | Usage différent |

## 2. Alternatives discutables (environ 55)

| Catégorie | Apps | Proposée | Pourquoi c'est discutable |
|---|---|---|---|
| Streaming Vidéo | 18 : Netflix, Disney+, Prime Video, YouTube… | Jellyfin (A) | Serveur multimédia à installer soi-même, pas un catalogue de films ; pour YouTube, PeerTube serait plus juste |
| Retouche Photo | 18 : Lightroom, Snapseed, Canva, VSCO… | Photoroom (B) | Outil de détourage par IA, pas un éditeur photo complet |
| Réseaux sociaux | LinkedIn, Pinterest, Reddit, Twitch, ZEPETO, Meetup | Mastodon (A) | Usages très différents de Mastodon |
| Messagerie | Slack, Discord, Messenger Kids, JusTalk Kids | Signal (C) | Messagerie d'équipe ou pour enfants |
| Sport & Fitness | Strava, Nike Run Club, Peloton, MyFitnessPal, Fitbit | PAT.fit (C) | À vérifier : usage proche ? |
| Transport | Uber, Lyft | BlaBlaCar (C) | Covoiturage, pas VTC |
| Email | Thunderbird, Mail | Proton Mail (B) | Logiciel de messagerie remplacé par un service |

## 3. Liens saisis à la main ignorés

`app_relations` contient 64 alternatives saisies à la main. L'app ne les lit pas.

- **6 relient deux catégories** et ne peuvent donc jamais apparaître : Chrome → Qwant, SharePoint → Nextcloud, Teams → Tchap, Miro → CryptPad, Notion → BookStack, Notion → Outline.
- **Plusieurs auraient corrigé un cas hors sujet** : HubSpot → Twenty, GitHub → Forgejo, Datadog → Zabbix, Miro → CryptPad.
- **4 ne sont plus mieux notées** que l'app qu'elles remplacent (par exemple Outlook → Thunderbird, toutes deux C) : à nettoyer.

## 4. Apps sans alternative (88)

Ce n'est pas un défaut de la règle : le catalogue n'a pas d'app mieux notée pour ces usages. Les plus visibles : Airbnb, Booking, Tripadvisor, Deliveroo, Uber Eats, Kindle, Calm, Headspace, Figma, Family Link, Epic Games, Spotify, Apple Music.

## Lecture

- Le problème est réel : environ un tiers des alternatives proposées sont hors sujet.
- Il est concentré : six catégories fourre-tout font 75 des 96 cas.
- Une partie se corrige sans toucher au code, en découpant ces catégories (par exemple Shopping en Grande distribution, Mode, Bricolage, Places de marché, Seconde main). Une app sans alternative vaut mieux qu'une alternative absurde.
- Le reste (CRM et support, développement, supervision) concerne des apps d'une même catégorie aux usages différents ; c'est là que les liens saisis à la main aident.

## Décision (10 novembre 2026)

Découpage validé des catégories fourre-tout et des cas discutables en sous-catégories « Parent / Détail » (Shopping, Jeux, Personnalisation, Streaming Vidéo, Réseaux sociaux, Messagerie, Retouche Photo…). Une app sans alternative pour son usage n'en affiche plus, plutôt qu'une alternative hors sujet.

- **Script :** `server/database/migrations/2026-11-10-recategorisation.sql` (136 apps, idempotent, vérifie la catégorie d'origine). **À appliquer après le déploiement du code ci-dessous.**
- **Onboarding inchangé :** mêmes 7 étapes ; le serveur inclut les sous-catégories des parents découpés (`server/onboardingCategories.js`), sans élargir aux autres sous-catégories existantes (« Finance / Crypto »…).
- **Filtre du catalogue :** une sous-catégorie suit son parent (`getMainCategory`, `src/constants/categories.js`). Effet de bord voulu : les sous-catégories existantes « Jeux / … », « Finance / … », « Productivité / … » quittent « Divers » pour leur parent.
- **Palmarès inchangé :** les nouvelles sous-catégories gardent le podium d'avant (`getPodiumCategory`, liste `SPLIT_SUBCATEGORIES`).
- **Kigardeki** (app du mainteneur) reste seule dans « Shopping » et **Circle Club** (entrée en salle de sport) passe dans « Sport & Fitness / Salles de sport » : aucune des deux n'a d'alternative.
- **Restent à traiter :** CRM et support, développement, supervision, iOS (lecture d'`app_relations`), apps libres à ajouter pour combler les « aucune » (Lemmy, Loops, éditeur photo libre).

## Deuxième volet (10 novembre 2026)

- **Liens saisis lus par le serveur :** les alternatives d'une app réunissent celles de sa catégorie et les liens `alternative` de `app_relations` (autre catégorie possible), toujours seulement vers une app strictement mieux notée (`server/relations.js`, `computeRelations`, testé dans `tests/server/relations.test.js`). Un lien devenu obsolète est ignoré, pas supprimé. `replacesAppIds` est l'inverse exact des alternatives. Effet sur les données du jour : 6 liens deviennent visibles (Chrome → Qwant, SharePoint → Nextcloud, Teams → Tchap, Miro → CryptPad, Notion → BookStack et Outline).
- **Découpages proposés** (`server/database/migrations/2026-11-10-recategorisation-volet2.sql`, validé par David et appliqué en production le 2026-11-10 : 23 apps reclassées, 2 lignes Chrome ↔ Qwant supprimées) : CRM & Support → CRM / Tickets ; Sauvegarde & Supervision → Sauvegarde / Supervision ; Termux → Tech & Dev / Terminal ; Play Console et Android Developer Verifier → Tech & Dev / Publication Android ; Miro → Gestion de projet / Tableau blanc ; iOS → Système d'exploitation / iPhone. Le lien Chrome → Qwant (un moteur de recherche n'est pas un navigateur) est retiré. Palmarès et filtres inchangés (`SPLIT_SUBCATEGORIES`, parent « Système d'exploitation » ajouté à `CATEGORY_MAPPING`).
- **iOS sans alternative** (décision de David, 2026-11-10) : les 8 liens saisis au lot 45 sont supprimés de `app_relations` (iOS → /e/OS, LineageOS, iodéOS, GrapheneOS en `alternative`, et leurs inverses en `replaces`). Retour arrière : réinsérer ces 8 lignes.
