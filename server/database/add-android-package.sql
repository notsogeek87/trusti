-- Colonne `android_package` : nom de package Android explicite, pour les apps
-- sans lien Play Store (F-Droid, GitHub, apps système Samsung/Google/Meta).
-- Facultative et sans valeur par défaut : sans effet sur les lectures
-- existantes ni sur les anciennes versions de l'app.
-- Appliquée en production le 2026-10-13 (projet Neon « trusti-db »).
-- Retour arrière : ALTER TABLE applications DROP COLUMN android_package;

-- Rattrapage : `f_droid_url` était attendue par le code (création/modification
-- d'une app) mais n'existait pas en production, car initDatabase() n'est jamais
-- appelée automatiquement. Ajoutée le 2026-10-13, facultative.
ALTER TABLE applications ADD COLUMN IF NOT EXISTS f_droid_url TEXT;

ALTER TABLE applications ADD COLUMN IF NOT EXISTS android_package TEXT;

-- Valeurs initiales (28 apps). La jointure exige id ET nom identiques, et ne
-- touche jamais une app qui a déjà un lien Play Store ou un package.
-- Vérifiés à la source : F-Droid (org.fdroid.fdroid), CalcYou, Redomi
-- (pages F-Droid), Obtainium (build.gradle du dépôt GitHub). Apps système :
-- noms de package usuels Samsung/Google/Meta, non vérifiés sur un appareil.
UPDATE applications a SET android_package = v.pkg
FROM (VALUES
 ('f5f275aa-fca3-46c8-bcb5-4d14db9d233b','F-Droid','org.fdroid.fdroid'),
 ('calcyou','CalcYou','net.youapps.calcyou'),
 ('03c726b4-b02b-4d3a-b1d3-139a77fb2d5a','Obtainium','dev.imranr.obtainium'),
 ('2bdce2bb-2912-46ef-8562-674d586909d9','Redomi','com.acszo.redomi.repo'),
 ('3f98608c-e071-4300-8b91-650c5be490c2','Google Play Store','com.android.vending'),
 ('c9e3307a-7f93-459a-9dce-80ec95d8cfde','Galaxy Store','com.sec.android.app.samsungapps'),
 ('e5405a00-3ef2-441a-b1a4-7adc8de7dfc9','Samsung Pass','com.samsung.android.samsungpass'),
 ('485099ee-20d6-40fd-aa27-8b7a626ef783','Bixby','com.samsung.android.bixby.agent'),
 ('a2e3d36e-3012-4bb4-9532-6a8b6388e1f3','Clavier Samsung','com.samsung.android.honeyboard'),
 ('9c990518-f8e0-4bb2-b837-ab86761c7cf3','Dossier sécurisé','com.samsung.knox.securefolder'),
 ('1f03d066-a579-46cb-8d04-35582fcee5d0','Mes fichiers','com.sec.android.app.myfiles'),
 ('7e0f340e-e90b-4320-b0b0-535265cc66c9','Météo','com.sec.android.daemonapp'),
 ('c32ab19c-d36b-4594-a750-ceadef7dcd31','Écran d''accueil One UI','com.sec.android.app.launcher'),
 ('d37f31ab-74e7-4527-8bb1-44466e34f515','Galaxy Themes','com.samsung.android.themestore'),
 ('7566bdb4-6c08-4a6d-aeb9-3756c81a6d16','Gaming Hub','com.samsung.android.game.gamehome'),
 ('440b4b5e-1266-4083-8f74-9a4a4b1e7c9e','Maintenance de l''appareil','com.samsung.android.lool'),
 ('79031fae-70a0-4d97-b2bc-e7c3a91f4291','Modes et routines','com.samsung.android.app.routines'),
 ('d6ebc40e-de05-4036-94c1-71adab0be7f4','Reminder','com.samsung.android.app.reminder'),
 ('58a46376-a420-4245-9765-217362192c29','AlwaysOnDisplay','com.samsung.android.app.aodservice'),
 ('c639ef51-a9c9-43bb-ae5c-a3dc61efa377','QuickStar','com.samsung.android.qstuner'),
 ('21c807ca-af2b-49ee-b911-a84b0b60a297','Home Up','com.samsung.android.app.homestar'),
 ('6bfb97bb-2c8b-4532-83fa-4043dd138f00','Meta App Installer','com.facebook.system'),
 ('b4454b42-2c8c-4e4c-82f4-483829d7ac5a','Meta App Manager','com.facebook.appmanager'),
 ('1cd08490-22d9-4494-a06d-0d1a0188f11a','Meta Services','com.facebook.services'),
 ('e0873ace-83dd-4ffe-aa41-0962fc5d1a5d','Android System Intelligence','com.google.android.as'),
 ('8b0868a7-8549-46c7-ae0e-86fdd32e7c8f','Paramètres','com.android.settings'),
 ('5c62cf29-541e-4e4e-9ac4-56c337adf008','Connexion au portail captif','com.android.captiveportallogin'),
 ('4e0b0e60-0d54-433b-bb5c-25159262b816','Google Partner Setup','com.google.android.partnersetup')
) AS v(id,name,pkg)
WHERE a.id = v.id AND a.name = v.name AND a.play_store_url IS NULL AND a.android_package IS NULL;
