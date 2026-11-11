/**
 * Rapport PDF de l'évaluation « organisation », généré dans le navigateur
 * (jsPDF + jspdf-autotable, chargés seulement à la demande) puis téléchargé.
 * Les tableaux passent automatiquement à la page suivante.
 * Testé dans tests/technical/organisationPdf.test.js.
 */
import { GRADES, GRADE_COLORS } from '../constants/grades.js';
import { CRITICALITY_LEVELS, DEFAULT_CRITICALITY } from '../constants/proFamilies.js';
import { familyForCategory } from './organisationAssessment.js';
import { AUDIT_WEIGHTS } from '../constants/auditChecklist.js';

const ORG_GRADE_LABEL = {
  A: 'Parc très souverain',
  B: 'Parc plutôt souverain',
  C: 'Parc hybride, à surveiller',
  D: 'Forte dépendance, risque élevé',
  E: 'Dépendance critique',
};
const DARK_TEXT = new Set(['B', 'C', 'D']);
const INK = [27, 42, 58];
const MUTED = [91, 107, 125];
const LINE = [220, 232, 239];

// Caractères hors Latin-1 acceptés par les polices standard du PDF (WinAnsi).
const WIN_ANSI_EXTRA = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';

/** Texte compatible avec les polices standard du PDF (espaces invisibles retirés). */
export function pdfText(value) {
  return String(value ?? '')
    .normalize('NFC')
    .replace(/[​-‍⁠﻿]/g, '')
    .replace(/[  ]/g, ' ')
    .replace(/[‘’]/g, '\'')
    .split('')
    .map(ch => (ch.charCodeAt(0) <= 0xff || WIN_ANSI_EXTRA.includes(ch) ? ch : '?'))
    .join('')
    .trim();
}

/** Couleur RVB d'une note (reprise de GRADE_COLORS, ex. « bg-[#006837] »). */
export function gradeRgb(grade) {
  const hex = (GRADE_COLORS[grade] || '').match(/#([0-9a-f]{6})/i)?.[1];
  if (!hex) return [200, 200, 200];
  return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
}

const gradeTextRgb = grade => (DARK_TEXT.has(grade) ? [18, 28, 39] : [255, 255, 255]);
const percent = value => `${Math.round(value * 100)} %`;
const levelLabel = id => (CRITICALITY_LEVELS.find(l => l.id === (id || DEFAULT_CRITICALITY)) || {}).label || '';

/** Nom de fichier du rapport. */
export function reportFilename(orgName, date = new Date()) {
  const slug = pdfText(orgName).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  return `trusti-rapport${slug ? `-${slug}` : ''}-${date.toISOString().slice(0, 10)}.pdf`;
}

/**
 * Construit le document PDF.
 * @returns {Promise<import('jspdf').jsPDF>}
 */
export async function buildOrganisationPdf({ orgName, profileLabel, selectedApps, criticality = {}, summary, plan = [], audit = null, help = [], date = new Date() }) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const M = 14;
  let y = M;

  // En-tête
  doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(...MUTED);
  doc.text('RAPPORT DE SOUVERAINETÉ NUMÉRIQUE', M, y + 3);
  doc.setFont('helvetica', 'normal').text('Établi avec Trusti - trusti.lielu.eu', W - M, y + 3, { align: 'right' });
  doc.setFont('helvetica', 'bold').setFontSize(18).setTextColor(...INK);
  const title = doc.splitTextToSize(pdfText(orgName) || 'Parc applicatif de l\'organisation', W - 2 * M);
  doc.text(title, M, y + 11);
  y += 11 + (title.length - 1) * 7;
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(...MUTED);
  const dateLabel = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.text(pdfText(`${profileLabel ? `${profileLabel} - ` : ''}${dateLabel}`), M, y + 6);
  y += 10;
  doc.setDrawColor(...INK).setLineWidth(0.6).line(M, y, W - M, y);
  y += 7;

  // Note du parc. Lisible imprimé en noir et blanc : la lettre est toujours écrite,
  // les pastilles ont un contour et la répartition porte lettre et nombre.
  const g = summary.overallGrade;
  doc.setFillColor(...gradeRgb(g)).setDrawColor(...INK).setLineWidth(0.5).roundedRect(M, y, 20, 24, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold').setFontSize(30).setTextColor(...gradeTextRgb(g));
  doc.text(g, M + 10, y + 16, { align: 'center' });
  const textX = M + 26;
  doc.setFontSize(14).setTextColor(...INK).text(pdfText(`Note ${g} : ${ORG_GRADE_LABEL[g]}`), textX, y + 6);
  doc.setFont('helvetica', 'normal').setFontSize(9.5).setTextColor(...MUTED);
  const subtitle = `Note du parc pondérée par la criticité de ${summary.total} outil${summary.total > 1 ? 's' : ''}`
    + (summary.rawGrade !== g ? ` (sans pondération : ${summary.rawGrade})` : '') + '.';
  doc.text(doc.splitTextToSize(pdfText(subtitle), W - M - textX)[0], textX, y + 12);
  // Répartition : une pastille par note (lettre dedans), suivie du nombre d'outils
  let x = textX;
  const chipY = y + 16;
  doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(...MUTED).text('RÉPARTITION', x, chipY + 4.2);
  x += doc.getTextWidth('RÉPARTITION') + 3;
  GRADES.forEach(grade => {
    const count = summary.counts[grade] || 0;
    doc.setFillColor(...gradeRgb(grade)).setDrawColor(...INK).setLineWidth(0.25).roundedRect(x, chipY, 6, 6, 1.2, 1.2, 'FD');
    doc.setFont('helvetica', 'bold').setFontSize(8.5).setTextColor(...gradeTextRgb(grade)).text(grade, x + 3, chipY + 4.3, { align: 'center' });
    const label = `${count} outil${count > 1 ? 's' : ''}`;
    doc.setFont('helvetica', count > 0 ? 'bold' : 'normal').setFontSize(9).setTextColor(...(count > 0 ? INK : MUTED)).text(label, x + 7.5, chipY + 4.3);
    x += 7.5 + doc.getTextWidth(label) + 4;
  });
  y += 30;

  // Indicateurs
  const indicators = [
    ['OUTILS NOTÉS D OU E', percent(summary.weakShare)],
    ['OUTILS VITAUX À RISQUE', String(summary.criticalWeak.length)],
    ['PREMIER ÉDITEUR', summary.topEditor ? `${summary.topEditor.name} (${percent(summary.topEditor.share)})` : 'Aucune concentration'],
    ['ÉDITEURS EUROPÉENS', summary.europeanShare === null ? 'Non renseigné' : percent(summary.europeanShare)],
  ];
  const gap = 3;
  const boxW = (W - 2 * M - gap * 3) / 4;
  indicators.forEach(([label, value], i) => {
    const x = M + i * (boxW + gap);
    doc.setDrawColor(...LINE).setLineWidth(0.3).roundedRect(x, y, boxW, 18, 2, 2, 'S');
    doc.setFont('helvetica', 'bold').setFontSize(6.5).setTextColor(...MUTED).text(pdfText(label), x + 2.5, y + 5);
    doc.setFontSize(9.5).setTextColor(...INK).text(doc.splitTextToSize(pdfText(value), boxW - 5).slice(0, 2), x + 2.5, y + 10.5);
  });
  y += 25;

  const tableStyles = {
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 9, textColor: INK, cellPadding: { top: 1.8, bottom: 1.8, left: 1.5, right: 1.5 }, lineColor: LINE, lineWidth: { bottom: 0.2 } },
    headStyles: { fontStyle: 'bold', fontSize: 7, textColor: MUTED, lineWidth: { bottom: 0.4 }, lineColor: [184, 200, 213] },
    margin: { left: M, right: M, top: M, bottom: 18 },
  };
  // Cellules de note : fond de la couleur de la note
  const colorGrades = gradeColumns => data => {
    if (data.section !== 'body' || !gradeColumns.includes(data.column.index)) return;
    const grade = data.cell.raw;
    if (!GRADES.includes(grade)) return;
    data.cell.styles.fillColor = gradeRgb(grade);
    data.cell.styles.textColor = gradeTextRgb(grade);
    data.cell.styles.fontStyle = 'bold';
    data.cell.styles.halign = 'center';
  };
  const sectionTitle = text => {
    if (y > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); y = M; }
    doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(...INK).text(pdfText(text), M, y);
    y += 3;
  };

  // Plan d'action
  if (plan.length > 0) {
    sectionTitle('Plan d\'action prioritaire');
    autoTable(doc, {
      ...tableStyles,
      startY: y,
      head: [['#', 'OUTIL ACTUEL', 'NOTE', 'CRITICITÉ', 'ALTERNATIVE PROPOSÉE', 'NOTE']],
      body: plan.map(({ app, alternative, criticality: level }, i) => [
        String(i + 1), pdfText(app.name), app.grade, levelLabel(level),
        alternative ? pdfText(alternative.name) : 'aucune au catalogue', alternative ? alternative.grade : '',
      ]),
      columnStyles: { 0: { cellWidth: 8, textColor: MUTED }, 1: { fontStyle: 'bold' }, 2: { cellWidth: 12 }, 3: { cellWidth: 24 }, 5: { cellWidth: 12 } },
      didParseCell: colorGrades([2, 5]),
    });
    y = doc.lastAutoTable.finalY + 9;
  }

  // Questionnaire d'audit : points de vigilance (seulement s'il a été rempli)
  if (audit && audit.answered > 0) {
    sectionTitle('Pratiques : points de vigilance');
    doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(...MUTED);
    doc.text(pdfText(`Questionnaire d'audit : ${audit.answered} réponse${audit.answered > 1 ? 's' : ''} sur ${audit.total} questions, `
      + `${audit.risks.length} point${audit.risks.length > 1 ? 's' : ''} de vigilance, ${audit.unknown.length} à vérifier.`), M, y + 3);
    y += 5;
    if (audit.risks.length > 0) {
      autoTable(doc, {
        ...tableStyles,
        startY: y,
        head: [['#', 'PRIORITÉ', 'THÈME', 'RECOMMANDATION']],
        body: audit.risks.map((q, i) => [String(i + 1), pdfText(AUDIT_WEIGHTS[q.weight]?.label || ''), pdfText(q.theme), pdfText(q.recommendation)]),
        columnStyles: { 0: { cellWidth: 8, textColor: MUTED }, 1: { cellWidth: 22, fontStyle: 'bold' }, 2: { cellWidth: 38 } },
      });
      y = doc.lastAutoTable.finalY + 6;
    }
    if (audit.unknown.length > 0) {
      autoTable(doc, {
        ...tableStyles,
        startY: y,
        head: [['À VÉRIFIER']],
        body: audit.unknown.map(q => [pdfText(q.label)]),
      });
      y = doc.lastAutoTable.finalY + 6;
    }
    y += 3;
  }

  // Qui peut vous aider
  if (help.length > 0) {
    sectionTitle('Qui peut vous aider ?');
    autoTable(doc, {
      ...tableStyles,
      startY: y,
      head: [['DISPOSITIF', 'POUR QUOI FAIRE', 'ADRESSE']],
      body: help.map(h => [pdfText(h.label), pdfText(h.description), pdfText(h.url.replace(/^https:\/\//, ''))]),
      columnStyles: { 0: { cellWidth: 40, fontStyle: 'bold' }, 2: { cellWidth: 46, textColor: MUTED } },
    });
    y = doc.lastAutoTable.finalY + 9;
  }

  // Annexe
  sectionTitle('Annexe : outils évalués');
  const sortedApps = [...selectedApps].sort((a, b) =>
    familyForCategory(a.category).label.localeCompare(familyForCategory(b.category).label, 'fr') || String(a.name).localeCompare(String(b.name), 'fr'));
  autoTable(doc, {
    ...tableStyles,
    startY: y,
    head: [['OUTIL', 'ÉDITEUR', 'FAMILLE', 'CRITICITÉ', 'NOTE']],
    body: sortedApps.map(app => [
      pdfText(app.name), pdfText(app.developer) || '-', pdfText(familyForCategory(app.category).label), levelLabel(criticality[app.id]), app.grade,
    ]),
    columnStyles: { 0: { fontStyle: 'bold' }, 3: { cellWidth: 24 }, 4: { cellWidth: 12 } },
    didParseCell: colorGrades([4]),
  });
  y = doc.lastAutoTable.finalY + 8;

  // Méthode
  const method = doc.setFont('helvetica', 'normal').setFontSize(8).splitTextToSize(pdfText(
    'Les notes TrustiScore (A à E) évaluent la souveraineté numérique de chaque outil sur cinq critères : contrôle technique, '
    + 'conformité, gouvernance et juridiction, localisation des données, transparence. Certaines notes sont provisoires '
    + '(sources à confirmer) ; le détail de chaque note est consultable sur la fiche de l\'outil dans Trusti. '
    + 'Ce rapport est une aide à la décision, pas un audit de conformité.'), W - 2 * M);
  if (y + method.length * 3.6 > doc.internal.pageSize.getHeight() - 18) { doc.addPage(); y = M; }
  doc.setTextColor(...MUTED).text(method, M, y);

  // Pied de page numéroté
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    const H = doc.internal.pageSize.getHeight();
    doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...MUTED);
    doc.text(pdfText(`${pdfText(orgName) || 'Rapport Trusti'} - ${dateLabel}`), M, H - 8);
    doc.text(`Page ${i} / ${pages}`, W - M, H - 8, { align: 'right' });
  }
  return doc;
}

/** Génère le PDF et l'enregistre (téléchargement navigateur ou sélecteur Android). */
export async function downloadOrganisationPdf(params) {
  const doc = await buildOrganisationPdf(params);
  const { saveBlob } = await import('./saveFile.js');
  await saveBlob(doc.output('blob'), reportFilename(params.orgName, params.date));
}
