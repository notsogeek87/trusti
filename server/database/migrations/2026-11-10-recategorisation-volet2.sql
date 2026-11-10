-- Deuxième volet de l'audit des alternatives (docs/analyses/audit-alternatives-2026-11-10.md).
--
-- Le serveur réunit maintenant deux sources d'alternatives (server/relations.js) :
-- la catégorie exacte et les liens saisis à la main (app_relations). Ce script range
-- les derniers cas hors sujet dans des sous-catégories et retire un lien saisi faux.
--
-- À appliquer APRÈS le déploiement du code qui connaît ces sous-catégories
-- (getMainCategory / getPodiumCategory, src/constants/categories.js), et seulement
-- après validation de David. Chaque UPDATE vérifie la catégorie d'origine (idempotent).
-- Retour arrière : remettre la catégorie d'origine indiquée dans chaque bloc.

BEGIN;

-- CRM & Support → CRM (ventes) / Tickets (support, ITSM)
UPDATE applications SET category = 'CRM & Support / CRM', updated_at = NOW()
WHERE category = 'CRM & Support' AND id IN ('twenty', 'zoho-crm', 'hubspot', 'pipedrive', 'salesforce');
UPDATE applications SET category = 'CRM & Support / Tickets', updated_at = NOW()
WHERE category = 'CRM & Support' AND id IN ('glpi', 'zammad', 'servicenow', 'zendesk', 'freshdesk', 'intercom');

-- Sauvegarde & Supervision → Sauvegarde / Supervision
UPDATE applications SET category = 'Sauvegarde & Supervision / Sauvegarde', updated_at = NOW()
WHERE category = 'Sauvegarde & Supervision' AND id IN ('borgbackup', 'duplicati', 'restic', 'veeam');
UPDATE applications SET category = 'Sauvegarde & Supervision / Supervision', updated_at = NOW()
WHERE category = 'Sauvegarde & Supervision' AND id IN ('zabbix', 'grafana', 'datadog');

-- Outils / Développement : Termux et les outils de publication Android à part
-- (forges Forgejo, GitLab, GitHub restent dans Outils / Développement)
UPDATE applications SET category = 'Tech & Dev / Terminal', updated_at = NOW()
WHERE category = 'Outils / Développement' AND id = 'f-droid'; -- Termux
UPDATE applications SET category = 'Tech & Dev / Publication Android', updated_at = NOW()
WHERE category = 'Outils / Développement' AND id IN (
  '7bae19e4-fcdd-4a98-badd-c836e5dae8bf', -- Play Console
  'c732f647-29a3-426f-b857-723a9fc231d3'  -- Android Developer Verifier
);

-- Miro : tableau blanc, pas gestion de projet (garde CryptPad par lien saisi)
UPDATE applications SET category = 'Gestion de projet / Tableau blanc', updated_at = NOW()
WHERE category = 'Gestion de projet' AND id = 'miro';

-- iOS : les systèmes Android alternatifs ne s'installent pas sur un iPhone
UPDATE applications SET category = 'Système d''exploitation / iPhone', updated_at = NOW()
WHERE category = 'Système d''exploitation / Smartphone' AND id = 'ios';

-- Lien saisi faux : Qwant (moteur de recherche) n'est pas une alternative au navigateur Chrome
-- Retour arrière : réinsérer les deux lignes (alternative Chrome → Qwant, replaces Qwant → Chrome).
DELETE FROM app_relations
WHERE (app_id = '1769805919501' AND related_app_id = '1781863444971' AND relation_type = 'alternative')
   OR (app_id = '1781863444971' AND related_app_id = '1769805919501' AND relation_type = 'replaces');

COMMIT;
