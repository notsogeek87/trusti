/**
 * « Choix de l'équipe » : une app mise en avant par catégorie.
 *
 * Colonnes en base (table applications) :
 * - is_team_pick BOOLEAN : l'app est le choix de l'équipe pour sa catégorie
 *   (unicité par catégorie garantie par l'index idx_team_pick_per_category)
 * - team_pick_reason TEXT : courte justification affichée sous le nom
 */

/**
 * Extrait les champs « choix de l'équipe » d'une ligne SQL.
 * @param {Object} row - Ligne de la table applications
 * @returns {{isTeamPick: boolean, teamPickReason: string|null}}
 */
export function formatTeamPick(row) {
  const isTeamPick = row?.is_team_pick === true;
  const reason = typeof row?.team_pick_reason === 'string' ? row.team_pick_reason.trim() : '';
  return {
    isTeamPick,
    teamPickReason: isTeamPick && reason ? reason : null
  };
}
