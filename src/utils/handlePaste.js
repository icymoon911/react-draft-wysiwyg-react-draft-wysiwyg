import { getSelectedBlock } from "draftjs-utils";
import {
  Modifier,
  EditorState,
  ContentState,
  ContentBlock,
  CharacterMetadata,
  genKey,
} from "draft-js";
import htmlToDraft from "html-to-draftjs";
import { OrderedMap, List } from "immutable";

/**
 * Parse an HTML table element into our table data format.
 * Returns { rows, cols, cells } where cells is a flat object keyed by "r-c".
 */
function parseHTMLTable(tableEl) {
  const trElements = tableEl.querySelectorAll("tr");
  const rows = trElements.length;
  let cols = 0;

  trElements.forEach((tr) => {
    const cellCount = tr.querySelectorAll("td, th").length;
    if (cellCount > cols) cols = cellCount;
  });

  if (rows === 0 || cols === 0) return null;

  const cells = {};
  trElements.forEach((tr, r) => {
    const tdElements = tr.querySelectorAll("td, th");
    tdElements.forEach((td, c) => {
      cells[`${r}-${c}`] = td.textContent || "";
    });
    for (let c = tdElements.length; c < cols; c++) {
      cells[`${r}-${c}`] = "";
    }
  });

  return { rows, cols, cells };
}

/**
 * Handle pasted HTML that may contain <table> elements.
 * Tables are extracted, converted to atomic TABLE blocks,
 * and the remaining HTML is processed by html-to-draftjs.
 */
function handleHTMLWithTables(html, editorState, onChange) {
  // Parse HTML to find tables
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const tables = doc.querySelectorAll("table");

  if (tables.length === 0) {
    // No tables, use standard processing
    return standardHTMLPaste(html, editorState, onChange);
  }

  // Replace tables with placeholders in the HTML string
  let processedHTML = html;
  const tableDataMap = {};

  tables.forEach((tableEl, i) => {
    const placeholder = `__RDW_TABLE_${i}__`;
    const tableData = parseHTMLTable(tableEl);
    if (tableData) {
      tableDataMap[placeholder] = tableData;
    }
    // Replace the table HTML with a simple placeholder paragraph
    processedHTML = processedHTML.replace(
      tableEl.outerHTML,
      `<p data-rdw-table-placeholder="${placeholder}">${placeholder}</p>`
    );
  });

  // Convert the modified HTML using html-to-draftjs
  const contentBlock = htmlToDraft(processedHTML);
  let contentState = editorState.getCurrentContent();

  // Merge any entities from html-to-draftjs
  contentBlock.entityMap.forEach((value, key) => {
    contentState = contentState.mergeEntityData(key, value);
  });

  // Build the fragment, replacing placeholder blocks with table atomic blocks
  let blocks = contentBlock.contentBlocks;
  const newBlocks = [];

  blocks.forEach((block) => {
    const text = block.getText().trim();
    let matchedPlaceholder = null;

    for (const placeholder of Object.keys(tableDataMap)) {
      if (text === placeholder || text.includes(placeholder)) {
        matchedPlaceholder = placeholder;
        break;
      }
    }

    if (matchedPlaceholder) {
      const { rows, cols, cells } = tableDataMap[matchedPlaceholder];
      const entityKey = contentState.createEntity("TABLE", "MUTABLE", {
        rows,
        cols,
        cells,
        tableStyle: {},
        cellStyle: {},
        tableVersion: 1,
      });

      const atomicBlock = new ContentBlock({
        key: genKey(),
        type: "atomic",
        text: " ",
        depth: 0,
        characterList: List([
          CharacterMetadata.create({ entity: entityKey }),
        ]),
      });

      newBlocks.push(atomicBlock);
    } else {
      newBlocks.push(block);
    }
  });

  contentState = Modifier.replaceWithFragment(
    contentState,
    editorState.getSelection(),
    new List(newBlocks)
  );
  onChange(EditorState.push(editorState, contentState, "insert-characters"));
  return true;
}

/**
 * Standard HTML paste processing (no tables).
 */
function standardHTMLPaste(html, editorState, onChange) {
  const contentBlock = htmlToDraft(html);
  let contentState = editorState.getCurrentContent();
  contentBlock.entityMap.forEach((value, key) => {
    contentState = contentState.mergeEntityData(key, value);
  });
  contentState = Modifier.replaceWithFragment(
    contentState,
    editorState.getSelection(),
    new List(contentBlock.contentBlocks)
  );
  onChange(EditorState.push(editorState, contentState, "insert-characters"));
  return true;
}

export const handlePastedText = (text, html, editorState, onChange) => {
  const selectedBlock = getSelectedBlock(editorState);
  if (selectedBlock && selectedBlock.type === "code") {
    const contentState = Modifier.replaceText(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      text,
      editorState.getCurrentInlineStyle()
    );
    onChange(EditorState.push(editorState, contentState, "insert-characters"));
    return true;
  } else if (html) {
    return handleHTMLWithTables(html, editorState, onChange);
  }
  return false;
};

/**
 * Convert a TABLE entity to HTML string for export.
 *
 * Usage with draftjs-to-html:
 *
 *   import draftToHtml from 'draftjs-to-html';
 *   import { tableEntityToHTML } from 'react-draft-wysiwyg';
 *
 *   const html = draftToHtml(rawContentState, undefined, undefined, (entity) => {
 *     if (entity.type === 'TABLE') return tableEntityToHTML(entity.data);
 *     return undefined;
 *   });
 */
export function tableEntityToHTML(data) {
  if (!data || !data.rows || !data.cols || !data.cells) return "";

  const { rows, cols, cells, tableStyle, cellStyle } = data;

  const camelToKebab = (str) =>
    str.replace(/([A-Z])/g, "-$1").toLowerCase();

  const styleToString = (style) => {
    if (!style) return "";
    return Object.entries(style)
      .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
      .join("; ");
  };

  let html = "<table";
  const tableStyleStr = styleToString(tableStyle);
  if (tableStyleStr) html += ` style="${tableStyleStr}"`;
  html += ">";

  for (let r = 0; r < rows; r++) {
    html += "<tr>";
    for (let c = 0; c < cols; c++) {
      html += "<td";
      const cellStyleStr = styleToString(cellStyle);
      if (cellStyleStr) html += ` style="${cellStyleStr}"`;
      html += `>${cells[`${r}-${c}`] || ""}</td>`;
    }
    html += "</tr>";
  }
  html += "</table>";

  return html;
}
