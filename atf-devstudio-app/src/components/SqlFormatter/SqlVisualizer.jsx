// src/components/SqlFormatter/SqlVisualizer.jsx
// -----------------------------------------------------------------------------
//  ‑ Simple SQL highlighter / visualizer
//  ‑ Exports both a React component *and* a helper that returns raw HTML.
// -----------------------------------------------------------------------------

import React, { useMemo } from 'react';
import './SqlFormatter.css';

/* --------------------------------------------------------------------------- */
/* util helpers                                                                */
/* --------------------------------------------------------------------------- */
const escapeHtml = str =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL',
  'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'UPDATE',
  'DELETE', 'CREATE', 'ALTER', 'DROP', 'TABLE', 'VIEW', 'INDEX', 'TRIGGER',
  'PROCEDURE', 'FUNCTION', 'AS', 'ON', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN',
  'LIKE', 'IS NULL', 'IS NOT NULL', 'WITH', 'UNION', 'ALL', 'CASE', 'WHEN',
  'THEN', 'ELSE', 'END', 'EXISTS'
];

/**
 * Build a fully‑highlighted HTML representation of an SQL string.
 * Can be injected with <div dangerouslySetInnerHTML={{__html: …}}/>.
 */
export const getSqlVizHtml = (sql = '') => {
  if (!sql.trim()) return '';

  let html = escapeHtml(sql);

  /* highlight keywords ------------------------------------------------------ */
  KEYWORDS.forEach(k => {
    html = html.replace(
      new RegExp(`\\b${k}\\b`, 'gi'),
      match => `<span class="sql-keyword">${match}</span>`
    );
  });

  /* highlight literals & comments ------------------------------------------- */
  html = html
    .replace(/'([^']*)'/g,  (_, s) => `<span class="sql-string">'${s}'</span>`)
    .replace(/\b(\d+)\b/g,  (_, n) => `<span class="sql-number">${n}</span>`)
    .replace(/--([^\n]*)/g, (_, c) => `<span class="sql-comment">--${c}</span>`)
    .replace(/\/\*[\s\S]*?\*\//g,
      c => `<span class="sql-comment">${c}</span>`);

  return `<div class="sql-visualization">
           <pre class="sql-formatted">${html}</pre>
          </div>`;
};

/* --------------------------------------------------------------------------- */
/* React wrapper component (optional)                                          */
/* --------------------------------------------------------------------------- */
const SqlVisualizer = ({ sql = '' }) => {
  const markup = useMemo(() => getSqlVizHtml(sql), [sql]);
  return (
    <div
      className="sql-visualizer-container"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
};

export default SqlVisualizer;
