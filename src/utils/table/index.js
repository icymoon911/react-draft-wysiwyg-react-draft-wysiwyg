/**
 * Table utility functions for creating and manipulating table data structures.
 * Table data is stored in a Draft.js entity attached to an atomic block.
 */

export const DEFAULT_ROWS = 2;
export const DEFAULT_COLS = 2;

/**
 * Create empty cell data for a table with given dimensions.
 * Returns a flat object keyed by "r-c" strings.
 */
export function createEmptyCells(rows, cols) {
  const cells = {};
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells[`${r}-${c}`] = '';
    }
  }
  return cells;
}

/**
 * Add a row above or below the given row index.
 */
export function addRow(tableData, rowIndex, position) {
  const { rows, cols, cells } = tableData;
  const insertAt = position === 'above' ? rowIndex : rowIndex + 1;
  const newCells = {};

  let srcRow = 0;
  for (let r = 0; r < rows + 1; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === insertAt) {
        newCells[`${r}-${c}`] = '';
      } else {
        newCells[`${r}-${c}`] = cells[`${srcRow}-${c}`] || '';
      }
    }
    if (r !== insertAt) srcRow++;
  }

  return {
    ...tableData,
    rows: rows + 1,
    cells: newCells,
    tableVersion: (tableData.tableVersion || 0) + 1,
  };
}

/**
 * Remove the row at the given index. Minimum 1 row is kept.
 */
export function removeRow(tableData, rowIndex) {
  const { rows, cols, cells } = tableData;
  if (rows <= 1) return tableData;

  const newCells = {};
  let destRow = 0;
  for (let r = 0; r < rows; r++) {
    if (r === rowIndex) continue;
    for (let c = 0; c < cols; c++) {
      newCells[`${destRow}-${c}`] = cells[`${r}-${c}`] || '';
    }
    destRow++;
  }

  return {
    ...tableData,
    rows: rows - 1,
    cells: newCells,
    tableVersion: (tableData.tableVersion || 0) + 1,
  };
}

/**
 * Add a column to the left or right of the given column index.
 */
export function addCol(tableData, colIndex, position) {
  const { rows, cols, cells } = tableData;
  const insertAt = position === 'left' ? colIndex : colIndex + 1;
  const newCells = {};

  for (let r = 0; r < rows; r++) {
    let srcCol = 0;
    for (let c = 0; c < cols + 1; c++) {
      if (c === insertAt) {
        newCells[`${r}-${c}`] = '';
      } else {
        newCells[`${r}-${c}`] = cells[`${r}-${srcCol}`] || '';
        srcCol++;
      }
    }
  }

  return {
    ...tableData,
    cols: cols + 1,
    cells: newCells,
    tableVersion: (tableData.tableVersion || 0) + 1,
  };
}

/**
 * Remove the column at the given index. Minimum 1 column is kept.
 */
export function removeCol(tableData, colIndex) {
  const { rows, cols, cells } = tableData;
  if (cols <= 1) return tableData;

  const newCells = {};
  for (let r = 0; r < rows; r++) {
    let destCol = 0;
    for (let c = 0; c < cols; c++) {
      if (c === colIndex) continue;
      newCells[`${r}-${destCol}`] = cells[`${r}-${c}`] || '';
      destCol++;
    }
  }

  return {
    ...tableData,
    cols: cols - 1,
    cells: newCells,
    tableVersion: (tableData.tableVersion || 0) + 1,
  };
}

/**
 * Update a single cell's content in the table data.
 */
export function updateCell(tableData, row, col, content) {
  return {
    ...tableData,
    cells: {
      ...tableData.cells,
      [`${row}-${col}`]: content,
    },
  };
}
