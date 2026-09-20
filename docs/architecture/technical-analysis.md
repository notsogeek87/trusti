# Analyse technique — architecture

Deuxième dimension d'évaluation d'une application, indépendante du
Trusti-Score communautaire/éditorial existant (`applications.trustiScore`,
`src/models/Application.js`, `src/constants/grades.js`) : ce document décrit
le module ajouté **à côté** de ce système, sans le modifier.

## Pourquoi c'est découplé

Le Trusti-Score actuel est une note A→E curée par l'équipe Trusti (texte
`reason` en base Postgres) — pas un vote d'utilisateurs. L'analyse technique
ne touche jamais à cette donnée : elle affiche des faits détectés localement
sur l'appareil, jamais un jugement de sécurité/confidentialité/qualité.

## Flux

```
Application installée  ─┐
                         ├─▶ ApplicationSource ─▶ TechnicalAnalyzer ─▶ TechnicalAnalysis
APK externe (Phase 12) ─┘        (interface)         (pur JS, testable
                                                        sans Android)
```

- `src/native/TechnicalAnalysis.js` — pont Capacitor vers
  `android/app/src/main/java/com/trusti/app/TechnicalAnalysisPlugin.java`,
  qui expose `analyzePackage({ packageName })` : lit `PackageManager`
  (permissions déclarées + accordées, composants du manifeste
  services/receivers/providers/activities, clés `<meta-data>`, infos
  générales) et renvoie un JSON brut — **jamais** de détection SDK/tracker
  côté natif, uniquement des données factuelles.
- `src/technical/source/` — `ApplicationSource` (interface),
  `InstalledApplicationSource` (implémentation via le plugin ci-dessus),
  `ApkApplicationSource` (architecture préparée, non implémentée — voir
  Phase 12 ci-dessous). `RawPackageData.js` documente le contrat partagé.
- `src/technical/database/` — signatures connues, réparties par famille
  (`signatures/google.js`, `signatures/tracking.js`, `signatures/devtools.js`)
  pour rester maintenable (pas une liste géante dans une seule classe).
  `SignatureDatabase` est le moteur générique de détection par préfixe de
  composant / clé de méta-données ; `GoogleDatabase`, `TrackerDatabase`,
  `SdkDatabase` sont de simples façades filtrant le même registre
  (`ALL_SIGNATURES`) — `SdkDatabase` est le superset des deux autres.
- `src/technical/analyzer/` — un analyzer par dimension (permissions, Google,
  SDK, trackers, niveau de dépendance) + `TechnicalAnalyzer`, l'orchestrateur
  qui ne connaît que `ApplicationSource`/`RawPackageData` — jamais Capacitor
  ni `PackageManager` directement, donc testable en pur Node (`npm test`).
- `src/technical/model/` — `TechnicalAnalysis` et types associés,
  `DetectionStatus` (`DETECTED` / `NOT_DETECTED` / `UNKNOWN`, jamais confondu
  avec une preuve d'absence).

## UI

`src/components/technical/TechnicalAnalysisSection.jsx`, intégrée dans
`AppDetailModal.jsx`, sous la carte Trusti-Score existante — visible
uniquement dans l'app Android native (`isNativeAndroid`) et quand
l'application consultée est détectée installée sur l'appareil
(`useTechnicalAnalysis`).

## Catégories implémentées (P1)

Composition, Permissions, Sécurité, Google, SDK, Trackers. Chaque
dépendance/SDK/tracker détecté porte une `DetectionMetadata`
(`src/technical/model/DetectionMetadata.js` : `method` un `DetectionMethod`,
`confidence`, `source`) qui explique sa provenance — exportée dans le JSON
(`metadata` sur chaque entrée).

Composition (`CompositionAnalyzer`) et Sécurité (`SecurityAnalyzer`) lisent
des blocs `rawData.composition` / `rawData.security` / `rawData.componentCounts`
optionnels : absents → `dataAvailable: false` / statuts `UNKNOWN`, jamais une
valeur inventée. Le schéma de signature APK (v1/v2/v3) et les certificats
réseau épinglés restent volontairement `UNKNOWN` : non exposés de façon
fiable par l'API publique `PackageManager`.

Non implémenté pour l'instant (P2/P3, voir la spec) : Réseau, Authentification,
Monétisation, Capacités matérielles, IA, Open Source, Écosystème. Ces clés
n'apparaissent pas dans l'export JSON tant qu'elles ne sont pas analysées —
mieux vaut une absence de clé qu'une catégorie vide présentée comme analysée.

## Ajouter un nouveau SDK/tracker/dépendance Google

Ajouter une entrée dans le fichier de signatures concerné
(`src/technical/database/signatures/*.js`) — aucun changement nécessaire côté
moteur (`SignatureDatabase`, analyzers, UI).

## Phase 12 — APK externe

Non implémentée dans cette première version : un parsing fiable d'un APK
arbitraire (AndroidManifest.xml binaire) nécessite soit une lib de parsing
côté natif Android, soit un parseur AXML en JS — à trancher et tester avant
de brancher `ApkApplicationSource.getRawData()`. Le reste du moteur n'aura
alors rien à changer.

## Tests

`npm test` (Node 22, `node --test`, aucune dépendance de test ajoutée) —
`tests/technical/`, avec des fixtures représentant différents profils d'app
(sans Google, avec Firebase, plusieurs trackers, plusieurs SDK, permissions
sensibles, composants illisibles).
