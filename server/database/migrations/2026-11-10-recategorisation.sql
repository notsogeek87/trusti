-- Découpage des catégories trop larges (audit docs/analyses/audit-alternatives-2026-11-10.md).
--
-- Les alternatives se calculent par catégorie exacte : ranger les apps par usage évite
-- des propositions hors sujet (Leroy Merlin pour Amazon, Truecaller pour Contacts…).
--
-- À appliquer APRÈS le déploiement du code qui sait lire ces sous-catégories :
--   - server/onboardingCategories.js (l'onboarding inclut les sous-catégories),
--   - getMainCategory / getPodiumCategory (src/constants/categories.js : filtre et Palmarès).
--
-- Chaque UPDATE vérifie la catégorie d'origine : le script est idempotent et ne touche
-- pas une app déjà reclassée à la main entre-temps.

BEGIN;

-- Shopping
UPDATE applications SET category = 'Shopping / Grande distribution', updated_at = NOW()
WHERE category = 'Shopping' AND id IN (
  'edc0d0f7-7e40-4cea-ab48-033076908678', -- Leclerc DRIVE
  '4adb95ca-f567-46c5-9a5e-fb4df6d26e4d', -- Mon E.Leclerc
  'c55110ee-5efb-45a6-b833-bebe15d22b4e', -- Carrefour
  '656d9cf1-61fb-4871-aa3c-d29fc9ce3d5d', -- Polygone Montpellier
  'app_1770825798943_xi2zmvl3k',          -- Walmart
  'app_1770825804160_73a1diwmj',          -- Target
  'app_1770825803175_mlccz4e9d',          -- Kohl's
  'app_1770825807611_8eb1y6eou',          -- Dollar General
  'app_1770825801791_1h21lvvfk'           -- noon
);
UPDATE applications SET category = 'Shopping / Places de marché', updated_at = NOW()
WHERE category = 'Shopping' AND id IN (
  'amazon-shopping',
  'app_1770825799343_u1klsdm6y', -- eBay
  'app_1770825800428_ycbkuwpjh', -- AliExpress
  'app_1770825803858_cjrxsizsf', -- Alibaba
  'app_1770825800745_u1t52eytd', -- Temu
  'app_1770825801408_he7rh00kb', -- Wish
  'app_1770825799674_jz2mxml77', -- Etsy
  'app_1770825801043_etm3iaxou', -- Flipkart
  'app_1770825805409_0f0z84854', -- Lazada
  'app_1770825805760_q5p4yw7om', -- Meesho
  'app_1770825802460_mjudnfujc', -- Mercado Libre
  'app_1770825807309_1sagaiou0', -- OZON
  'app_1770825806111_0lr15vpps'  -- Trendyol
);
UPDATE applications SET category = 'Shopping / Mode', updated_at = NOW()
WHERE category = 'Shopping' AND id IN (
  'app_1770825806494_h1nk5i88o',          -- adidas
  'ac89c8c1-2eec-455b-85fa-75bf87f9f833', -- Orchestra
  'app_1770825798444_7onat0hby',          -- SHEIN
  'app_1770825802810_wzqv4ms5h',          -- Fashion Nova
  'app_1770825803475_d9dmxh3k7',          -- Hollister
  'app_1770825802108_je8tedjpz'           -- Myntra
);
UPDATE applications SET category = 'Shopping / Beauté', updated_at = NOW()
WHERE category = 'Shopping' AND id IN ('app_1770825807960_ufot67j5c'); -- Bath & Body Works
UPDATE applications SET category = 'Shopping / High-tech', updated_at = NOW()
WHERE category = 'Shopping' AND id IN (
  'ab9de203-76c0-4f17-b309-2758c925cad4', -- Darty
  'b2669d9f-5042-4e61-b02e-c89e60337cbc'  -- Back Market
);
UPDATE applications SET category = 'Shopping / Seconde main', updated_at = NOW()
WHERE category = 'Shopping' AND id IN (
  'a923cded-665f-4a74-a8f0-cc8c1982ced6', -- momox
  '43d8c0c2-bccb-4def-8bb0-377979a64b40'  -- Je revends
);
UPDATE applications SET category = 'Shopping / Bricolage & maison', updated_at = NOW()
WHERE category = 'Shopping' AND id IN (
  '815f13bb-c2fb-4e6e-8d9c-717fec989cf5', -- Leroy Merlin
  'app_1770825805084_f3hdd5iu5'           -- Wayfair
);
UPDATE applications SET category = 'Petites Annonces', updated_at = NOW()
WHERE category = 'Shopping' AND id IN ('app_1770825806945_ljl0jt9i4'); -- OfferUp
UPDATE applications SET category = 'Achats / Bons plans', updated_at = NOW()
WHERE category = 'Shopping' AND id IN ('app_1770825808260_nu7x4mls4'); -- Fetch
UPDATE applications SET category = 'Jeux / Store', updated_at = NOW()
WHERE category = 'Shopping' AND id IN ('7b55b426-2339-4768-918b-cb447f61a1d1'); -- Nintendo Store
-- Restent dans « Shopping » : Kigardeki, Circle Club (usage à préciser).

-- Jeux
UPDATE applications SET category = 'Jeux / Mobile', updated_at = NOW()
WHERE category = 'Jeux' AND id IN (
  'candy-crush', 'clash-of-clans', 'pubg-mobile', 'pokemon-go', 'among-us', 'fortnite', 'minecraft',
  '48a12588-0f0a-492b-88b7-bc0df221b839' -- Échecs
);
UPDATE applications SET category = 'Jeux / Mobile', updated_at = NOW()
WHERE category = 'Réseaux sociaux' AND id IN ('roblox');
UPDATE applications SET category = 'Jeux / Indépendants', updated_at = NOW()
WHERE category = 'Jeux' AND id IN (
  'fd66c76d-2981-4a73-bf14-f82c107ec0bb', -- CloverPit
  '830c7d36-3aeb-4bd5-aed2-5d1448de8b1a', -- Balatro
  'f6daa23c-14b7-49a6-a870-b1dce599fd76', -- David's Dream
  '1c57cf08-a988-4a3d-9eb6-e64cdd62a286', -- Destroy
  'd78aee10-d4ed-4f67-9fc2-53f89e58ab44'  -- TMNT: Shredder's Revenge
);
UPDATE applications SET category = 'Jeux / Store', updated_at = NOW()
WHERE category = 'Jeux' AND id IN (
  'd13fdca3-79ee-4976-a18d-4fa8e73c2c29', -- Steam
  'app_1770825778308_52u0qtp0q'           -- XBOX
);
UPDATE applications SET category = 'Jeux / Émulation', updated_at = NOW()
WHERE category = 'Jeux' AND id IN ('bedaf334-3a2a-4208-bc36-d45d7713e405'); -- GameNative

-- Personnalisation
UPDATE applications SET category = 'Personnalisation / Icônes', updated_at = NOW()
WHERE category = 'Personnalisation' AND id IN (
  'f7643ff8-c40f-4c10-80d7-6abca259a543', -- Arcticons Material You
  'd05ddf3d-00b9-43d1-9518-b8b059af87ef', -- Arcticons
  '0504dbc6-41d6-4c03-87f2-219ca9e35b1e', -- Icon Pack Studio
  '12da6bc9-6027-42cd-bddb-0aa1cbb5363d', -- Exported Icon Pack
  'fb854d47-b151-486d-ae04-00b63cb9ae40'  -- Black Icons
);
UPDATE applications SET category = 'Personnalisation / Widgets', updated_at = NOW()
WHERE category = 'Personnalisation' AND id IN (
  '2d0a266a-a6a0-4406-97f6-d13934ba6ef5', -- Kustom Widget
  '210bee5b-9961-4844-9960-1ffe8b373280'  -- KWGT Pro
);
UPDATE applications SET category = 'Personnalisation / Fonds d''écran', updated_at = NOW()
WHERE category = 'Personnalisation' AND id IN (
  '0815c338-9a2b-47d1-9ac0-3325119028ba', -- Backdrops
  '0fe2187e-216c-4e90-a646-6182e4f1fb97'  -- Fond d'écran et style
);

-- Utilitaires, Téléphone & SMS, Maison connectée : on sort l'app bien notée sans rapport
UPDATE applications SET category = 'Sécurité / Bloqueurs de pub', updated_at = NOW()
WHERE category = 'Utilitaires' AND id IN ('e91f8ffb-f89e-46ad-b247-8edcb00a7186'); -- AdBlock pour Samsung Browser
UPDATE applications SET category = 'Téléphone & SMS / Identification d''appels', updated_at = NOW()
WHERE category = 'Téléphone & SMS' AND id IN ('app_1770825749376_nq2d6dajv'); -- Truecaller
UPDATE applications SET category = 'Téléphone & SMS / Second numéro', updated_at = NOW()
WHERE category = 'Téléphone & SMS' AND id IN (
  'app_1770825743256_09txpgcuj', -- TextNow
  'app_1770825749825_1e2071x46'  -- Text Free
);
UPDATE applications SET category = 'Maison / Serrures connectées', updated_at = NOW()
WHERE category = 'Maison connectée' AND id IN ('1b69fab9-5d46-4df6-b942-0b39a542c261'); -- Nuki

-- Streaming Vidéo
UPDATE applications SET category = 'Streaming Vidéo / Films & séries', updated_at = NOW()
WHERE category = 'Streaming Vidéo' AND id IN (
  'netflix',
  'f8b49a77-0d58-4ea8-a248-ad20869e42cb', -- CANAL+
  'app_1770825775649_c50fi2639',          -- Disney+
  'app_1770825777435_5lqci2quy',          -- Prime Video
  'app_1770825776601_qw55xyzd8',          -- HBO Max
  'app_1770825784104_plqwtnehg',          -- Hulu
  'app_1770825779370_55oawz6rx',          -- Paramount+
  'app_1770825782369_lhdsozenp',          -- Peacock
  'app_1770825780511_q8urgruun',          -- Crunchyroll
  'app_1770825775219_um0hhlzj1',          -- Tubi
  'app_1770825783371_4ioydfgzx',          -- PlutoTV
  'app_1770825779072_av0me4msu',          -- Philo
  'app_1770825776033_pa0fruqf9',          -- STARZ
  'app_1770825777784_igzxc49jf',          -- Sony LIV
  'app_1770825782950_kn2s2hh77'           -- aha
);
UPDATE applications SET category = 'Streaming Vidéo / Vidéos en ligne', updated_at = NOW()
WHERE category = 'Streaming Vidéo' AND id IN ('1769878590420', 'peertube', '1769878626276'); -- YouTube, PeerTube, LibreTube
UPDATE applications SET category = 'Streaming Vidéo / Médiathèque personnelle', updated_at = NOW()
WHERE category = 'Streaming Vidéo' AND id IN ('jellyfin');
UPDATE applications SET category = 'Streaming Vidéo / Box & TV', updated_at = NOW()
WHERE category = 'Streaming Vidéo' AND id IN (
  'cf80628f-5828-4970-8575-c6bdeb5d557a', -- Google TV
  'app_1770825780918_z9m5648kn'           -- Roku
);
UPDATE applications SET category = 'Streaming Vidéo / Direct', updated_at = NOW()
WHERE category = 'Réseaux sociaux' AND id IN ('app_1770825755663_0e4bvgjan'); -- Twitch

-- Réseaux sociaux
UPDATE applications SET category = 'Réseaux sociaux / Photos', updated_at = NOW()
WHERE category = 'Réseaux sociaux' AND id IN (
  'instagram', 'pinterest', '1769543537349', -- Pixelfed
  'app_1770825752659_v1q9eago9'             -- BeReal
);
UPDATE applications SET category = 'Réseaux sociaux / Vidéo courte', updated_at = NOW()
WHERE category = 'Réseaux sociaux' AND id IN (
  'tiktok',
  'app_1770825754095_k0z9sy103', -- Kwai
  'app_1770825756592_hnmko4dpn'  -- Clapper
);
UPDATE applications SET category = 'Réseaux sociaux / Forums', updated_at = NOW()
WHERE category = 'Réseaux sociaux' AND id IN ('reddit');
UPDATE applications SET category = 'Réseaux sociaux / Professionnel', updated_at = NOW()
WHERE category = 'Réseaux sociaux' AND id IN ('linkedin');
UPDATE applications SET category = 'Réseaux sociaux / Événements', updated_at = NOW()
WHERE category = 'Réseaux sociaux' AND id IN ('app_1770825751826_bbt53psby'); -- Meetup
UPDATE applications SET category = 'Réseaux sociaux / Avatars', updated_at = NOW()
WHERE category = 'Réseaux sociaux' AND id IN ('app_1770825753579_ubmnnmdyb'); -- ZEPETO

-- Messagerie
UPDATE applications SET category = 'Messagerie / Équipes & communautés', updated_at = NOW()
WHERE category = 'Messagerie' AND id IN (
  'slack', 'discord', 'mattermost', 'element', 'threema',
  '2c9fbdcd-3b77-4c94-b9a0-c2f778a0dc02' -- Element X
);
UPDATE applications SET category = 'Messagerie / Enfants', updated_at = NOW()
WHERE category = 'Messagerie' AND id IN (
  'app_1770825746467_9jylbq7f2', -- Messenger Kids
  'app_1770825750312_dmheoaa34'  -- JusTalk Kids
);

-- Retouche Photo
UPDATE applications SET category = 'Retouche Photo / Montage & IA', updated_at = NOW()
WHERE category = 'Retouche Photo' AND id IN (
  'app_1770825792755_sxld9iujy', -- Photoroom
  'app_1770825789437_z2u9netcl', -- Picsart
  'app_1770825788594_sat7dxsru', -- Canva
  'app_1770825795858_5dultjvee', -- Hypic
  'app_1770825797286_1ftis86ag'  -- Collage Maker
);
UPDATE applications SET category = 'Retouche Photo / Retouche classique', updated_at = NOW()
WHERE category = 'Retouche Photo' AND id IN (
  'app_1770825790807_37k17ubzi', -- Lightroom
  'app_1770825792381_0aod61n6k', -- Snapseed
  'app_1770825791455_a52oa7n2k', -- Photoshop Express
  'app_1770825789066_v5c83eak0'  -- VSCO
);
UPDATE applications SET category = 'Retouche Photo / Selfies & visage', updated_at = NOW()
WHERE category = 'Retouche Photo' AND id IN (
  'app_1770825794769_otx1mawp9', -- FaceApp
  'app_1770825790189_kf5kiop65', -- Remini
  'app_1770825795491_3c6kyuha4', -- Meitu
  'app_1770825797607_wihji5he8', -- BeautyPlus
  'app_1770825795091_q6c6vopgp', -- YouCam Makeup
  'app_1770825790489_bzr07u7h3', -- YouCam Perfect
  'app_1770825794036_hjss1d0iv', -- B612
  'app_1770825797990_7j4cp242z'  -- LINE Camera
);
UPDATE applications SET category = 'Photo & Vidéo', updated_at = NOW()
WHERE category = 'Retouche Photo' AND id IN ('app_1770825791124_7y7w7qrph'); -- SmugMug
UPDATE applications SET category = 'Photographie / Outils', updated_at = NOW()
WHERE category = 'Retouche Photo' AND id IN ('app_1770825791907_fstylnbrx'); -- Unscripted Photography Posing

-- Sport, transport, e-mail
UPDATE applications SET category = 'Sport & Fitness / Entraînement', updated_at = NOW()
WHERE category = 'Sport & Fitness' AND id IN ('peloton', 'patfit');
UPDATE applications SET category = 'Transport & Mobilité / VTC', updated_at = NOW()
WHERE category = 'Transport & Mobilité' AND id IN ('uber', 'lyft');
UPDATE applications SET category = 'Email / Logiciels de messagerie', updated_at = NOW()
WHERE category = 'Email' AND id IN ('thunderbird', 'apple-mail');

COMMIT;
