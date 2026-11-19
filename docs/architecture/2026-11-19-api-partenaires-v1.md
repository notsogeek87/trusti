# 2026-11-19 : API ouverte `/api/v1`, séparée de l'API interne

**Pour qui / Pourquoi** : pour comprendre pourquoi les partenaires n'utilisent pas
`/api/apps`, et ce qu'il ne faut pas casser.

## Contexte

Des partenaires veulent lire les notes TrustiScore et leur détail (critères, sources).
`GET /api/apps` est déjà public, mais :

- son format suit l'interface (couleur, popularité, choix de l'équipe…) et change avec elle ;
- la même route porte les écritures (`POST`/`PUT`/`DELETE` avec `x-api-key`) ;
- elle mélange une douzaine de modes par paramètres, difficiles à documenter ;
- elle ne permet pas de savoir qui l'utilise ni de limiter un client précis.

## Décision

- **Une API distincte `/api/v1`**, en lecture seule, avec un contrat écrit à la main
  (`server/publicApi/format.js`) et une spec OpenAPI. L'API interne ne change pas.
- **Ouverte sans clé**, limitée par IP (60 requêtes par minute, 20 exports par heure), CORS
  ouvert. Les données sont déjà publiques via `/api/apps`, qu'utilise l'app : une clé
  obligatoire n'aurait rien protégé. Elle aurait seulement ajouté de la friction, de la
  gestion et des données personnelles. C'est cohérent avec la
  [suppression des comptes](2026-10-11-suppression-connexion-et-administration.md).
- **Clé facultative** (`Authorization: Bearer tsk_...`) pour les rares partenaires qui ont
  besoin de plus : quota propre, suspension possible, dernière utilisation connue.
  Empreinte SHA-256 en base (table `api_partners`), remise à la main. La clé admin
  `API_KEY` n'est pas réutilisée.
- **Pas d'espace partenaire** (inscription, gestion de clé en libre-service) : il
  réintroduirait des comptes et n'apporte rien tant que l'accès libre couvre presque tout
  le monde. À reconsidérer si les demandes de clés se multiplient.
- **Licence des données : CC BY 4.0.** Réutilisation libre, même commerciale, avec
  attribution « Source : TrustiScore ». L'ODbL a été écartée : elle oblige à republier
  les bases dérivées sous la même licence, ce qui freine les partenaires. Le changement
  se fait en un seul endroit (`DATA_LICENSE`).
- **Le détail complet est exposé** (justifications, sources, notes corrigées à la main).
  Le `summary` interne de l'historique reste exclu, comme dans l'app.

## Conséquences

- Un champ ne peut plus être retiré ni renommé en v1 : il faut une `/api/v2`.
- Les limites de débit et le cache sont en mémoire, comme le reste de `protection.js` :
  à revoir s'il y a un jour plusieurs réplicas.
- On ne sait pas qui utilise l'accès libre. On ne peut prévenir d'un changement que via la
  page développeurs et la spec, d'où l'engagement de stabilité.
- La limite par IP se contourne en changeant d'adresse. C'est accepté : les données sont
  publiques et sous licence CC BY 4.0.
- Les clés facultatives demandent la migration `2026-11-19-api-partners.sql`. Sans la
  table, l'API marche sans clé et toute clé est refusée.
