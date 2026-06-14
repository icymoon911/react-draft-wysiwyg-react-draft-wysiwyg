/**
 * Table HTML conversion utilities.
 *
 * Use tableEntityToHTML with draftjs-to-html's customEntityTransformer:
 *   import { draftToHtml } from 'draftjs-to-html';
 *   import { tableEntityToHTML } from 'react-draft-wysiwyg/src/utils/table';
 *   draftToHtml(contentState, {}, false, (entity, text) => tableEntityToHTML(entity, text));
 *
 * Use htmlToTableEntity with html-to-draftjs's customChunkRenderer:
 *   import htmlToDraft from 'html-to-draftjs';
 *   import { htmlToTableEntity } from 'react-draft-wysiwyg/src/utils/table';
 *   htmlToDraft(html, htmlToTableEntity);
 */

/**
 * Convert a TABLE entity to HTML for draftjs-to-html customEntityTransformer.
 */
export const tableEntityToHTML = (entity, text) => {
  if (entity.type === 'TABLE') {
    const { rows, cols, cells } = entity.data;
    let html = '<table>';
    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) {
        const cellContent = cells[r * cols + c] || '';
        html += `<td>${cellContent}</td>`;
      }
      html += '</tr>';
    }
    html += '</table>';
    return html;
  }
  return undefined;
};

/**
 * Convert an HTML <table> element to a draft-js entity for html-to-draftjs customChunkRenderer.
 */
export const htmlToTableEntity = (nodeName, node) => {
  if (nodeName === 'table' || (node && node.tagName === 'TABLE')) {
    const tableEl = node;
    const rows = tableEl.querySelectorAll('tr');
    let maxCols = 0;
    const cells = [];
    rows.forEach((tr) => {
      const tds = tr.querySelectorAll('td, th');
      maxCols = Math.max(maxCols, tds.length);
    });
    rows.forEach((tr) => {
      const tds = tr.querySelectorAll('td, th');
      for (let c = 0; c < maxCols; c++) {
        cells.push(tds[c] ? (tds[c].textContent || '') : '');
      }
    });
    return {
      type: 'TABLE',
      mutability: 'MUTABLE',
      data: {
        rows: rows.length,
        cols: maxCols,
        cells,
      },
    };
  }
  return undefined;
};
