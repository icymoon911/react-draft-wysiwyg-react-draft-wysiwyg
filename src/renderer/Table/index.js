import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Editor, EditorState, ContentState } from 'draft-js';
import './styles.css';

/**
 * TableCell - wraps a Draft.js Editor for each table cell.
 * Uses shouldComponentUpdate to prevent unnecessary re-renders
 * that would destroy the cell's editor state.
 */
class TableCell extends Component {
  static propTypes = {
    row: PropTypes.number.isRequired,
    col: PropTypes.number.isRequired,
    initialContent: PropTypes.string,
    readOnly: PropTypes.bool,
    onCellBlur: PropTypes.func,
    onCellSelect: PropTypes.func,
    cellStyle: PropTypes.object,
    isSelected: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    const { initialContent } = props;
    if (initialContent) {
      const contentState = ContentState.createFromText(initialContent);
      this.state = {
        cellEditorState: EditorState.createWithContent(contentState),
      };
    } else {
      this.state = {
        cellEditorState: EditorState.createEmpty(),
      };
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.cellEditorState !== this.state.cellEditorState) return true;
    if (nextProps.readOnly !== this.props.readOnly) return true;
    if (nextProps.isSelected !== this.props.isSelected) return true;
    return false;
  }

  onCellChange = (cellEditorState) => {
    this.setState({ cellEditorState });
  };

  onCellBlur = () => {
    const { row, col, onCellBlur } = this.props;
    if (onCellBlur) {
      const content = this.state.cellEditorState.getCurrentContent().getPlainText();
      onCellBlur(row, col, content);
    }
  };

  onCellFocus = () => {
    const { row, col, onCellSelect } = this.props;
    if (onCellSelect) {
      onCellSelect(row, col);
    }
  };

  onCellMouseDown = (e) => {
    e.stopPropagation();
  };

  render() {
    const { readOnly, cellStyle, isSelected } = this.props;
    const { cellEditorState } = this.state;
    const mergedStyle = {
      ...cellStyle,
      ...(isSelected ? { boxShadow: 'inset 0 0 0 2px #4a90d9' } : {}),
    };

    return (
      <td
        className="rdw-table-cell"
        style={mergedStyle}
        onMouseDown={this.onCellMouseDown}
      >
        <div className="rdw-table-cell-editor" onMouseDown={this.onCellMouseDown}>
          <Editor
            editorState={cellEditorState}
            onChange={this.onCellChange}
            onBlur={this.onCellBlur}
            onFocus={this.onCellFocus}
            readOnly={readOnly}
            editorClassName="rdw-table-cell-editor-inner"
          />
        </div>
      </td>
    );
  }
}

/**
 * getTableComponent - factory function returning a Table block component
 * configured with the editor's config (readOnly, onChange, etc.).
 */
const getTableComponent = (config) => {
  class TableBlock extends Component {
    static propTypes = {
      block: PropTypes.object,
      contentState: PropTypes.object,
    };

    state = {
      selectedRow: -1,
      selectedCol: -1,
      hoveredRow: -1,
      hoveredCol: -1,
      showControls: false,
    };

    getEntityInfo() {
      const { block, contentState } = this.props;
      const entityKey = block.getEntityAt(0);
      if (!entityKey) return null;
      try {
        const entity = contentState.getEntity(entityKey);
        if (!entity || entity.getType() !== 'TABLE') return null;
        return { entityKey, data: entity.getData() };
      } catch (e) {
        return null;
      }
    }

    updateTableData(newData) {
      const entityInfo = this.getEntityInfo();
      if (!entityInfo) return;
      const { entityKey } = entityInfo;
      const { contentState } = this.props;
      contentState.mergeEntityData(entityKey, newData);
      config.onChange(
        EditorState.push(config.getEditorState(), contentState, 'change-block-data')
      );
    }

    handleCellSelect = (row, col) => {
      this.setState({ selectedRow: row, selectedCol: col, showControls: true });
    };

    handleCellBlur = (row, col, content) => {
      const entityInfo = this.getEntityInfo();
      if (!entityInfo) return;
      const { entityKey, data } = entityInfo;
      const { contentState } = this.props;
      contentState.mergeEntityData(entityKey, {
        cells: {
          ...data.cells,
          [`${row}-${col}`]: content,
        },
      });
      config.onChange(
        EditorState.push(config.getEditorState(), contentState, 'change-block-data')
      );
    };

    handleWrapperMouseDown = (e) => {
      e.stopPropagation();
    };

    handleMouseEnter = () => {
      this.setState({ showControls: true });
    };

    handleMouseLeave = () => {
      // Keep controls visible if a cell is selected
      if (this.state.selectedRow < 0) {
        this.setState({ showControls: false });
      }
    };

    handleRowHover = (row) => {
      this.setState({ hoveredRow: row });
    };

    handleColHover = (col) => {
      this.setState({ hoveredCol: col });
    };

    // --- Table operations ---

    insertRowAbove = () => {
      const entityInfo = this.getEntityInfo();
      if (!entityInfo) return;
      const { data } = entityInfo;
      const { rows, cols, cells } = data;
      const insertAt = Math.max(0, this.state.selectedRow);
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
      this.updateTableData({
        ...data,
        rows: rows + 1,
        cells: newCells,
        tableVersion: (data.tableVersion || 0) + 1,
      });
    };

    insertRowBelow = () => {
      const entityInfo = this.getEntityInfo();
      if (!entityInfo) return;
      const { data } = entityInfo;
      const { rows, cols, cells } = data;
      const insertAt = Math.min(rows, this.state.selectedRow + 1);
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
      this.updateTableData({
        ...data,
        rows: rows + 1,
        cells: newCells,
        tableVersion: (data.tableVersion || 0) + 1,
      });
    };

    insertColLeft = () => {
      const entityInfo = this.getEntityInfo();
      if (!entityInfo) return;
      const { data } = entityInfo;
      const { rows, cols, cells } = data;
      const insertAt = Math.max(0, this.state.selectedCol);
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
      this.updateTableData({
        ...data,
        cols: cols + 1,
        cells: newCells,
        tableVersion: (data.tableVersion || 0) + 1,
      });
    };

    insertColRight = () => {
      const entityInfo = this.getEntityInfo();
      if (!entityInfo) return;
      const { data } = entityInfo;
      const { rows, cols, cells } = data;
      const insertAt = Math.min(cols, this.state.selectedCol + 1);
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
      this.updateTableData({
        ...data,
        cols: cols + 1,
        cells: newCells,
        tableVersion: (data.tableVersion || 0) + 1,
      });
    };

    deleteRow = () => {
      const entityInfo = this.getEntityInfo();
      if (!entityInfo) return;
      const { data } = entityInfo;
      const { rows, cols, cells } = data;
      if (rows <= 1) {
        this.deleteTable();
        return;
      }
      const deleteAt = this.state.selectedRow >= 0 ? this.state.selectedRow : rows - 1;
      const newCells = {};
      let destRow = 0;
      for (let r = 0; r < rows; r++) {
        if (r === deleteAt) continue;
        for (let c = 0; c < cols; c++) {
          newCells[`${destRow}-${c}`] = cells[`${r}-${c}`] || '';
        }
        destRow++;
      }
      this.updateTableData({
        ...data,
        rows: rows - 1,
        cells: newCells,
        tableVersion: (data.tableVersion || 0) + 1,
      });
      this.setState({ selectedRow: -1, selectedCol: -1 });
    };

    deleteCol = () => {
      const entityInfo = this.getEntityInfo();
      if (!entityInfo) return;
      const { data } = entityInfo;
      const { rows, cols, cells } = data;
      if (cols <= 1) {
        this.deleteTable();
        return;
      }
      const deleteAt = this.state.selectedCol >= 0 ? this.state.selectedCol : cols - 1;
      const newCells = {};
      for (let r = 0; r < rows; r++) {
        let destCol = 0;
        for (let c = 0; c < cols; c++) {
          if (c === deleteAt) continue;
          newCells[`${r}-${destCol}`] = cells[`${r}-${c}`] || '';
          destCol++;
        }
      }
      this.updateTableData({
        ...data,
        cols: cols - 1,
        cells: newCells,
        tableVersion: (data.tableVersion || 0) + 1,
      });
      this.setState({ selectedRow: -1, selectedCol: -1 });
    };

    deleteTable = () => {
      const { block, contentState } = this.props;
      const blockKey = block.getKey();
      const blockMap = contentState.getBlockMap();
      const newBlockMap = blockMap.delete(blockKey);
      const newContentState = contentState.set('blockMap', newBlockMap);
      config.onChange(
        EditorState.push(config.getEditorState(), newContentState, 'remove-range')
      );
    };

    renderOperationControls() {
      const { selectedRow, selectedCol } = this.state;
      const isReadOnly = config.isReadOnly();
      if (isReadOnly) return null;

      return (
        <div className="rdw-table-block-controls" onMouseDown={(e) => e.stopPropagation()}>
          <span className="rdw-table-block-controls-label">
            Table {selectedRow >= 0 ? `(Row ${selectedRow + 1}, Col ${selectedCol + 1})` : ''}
          </span>
          <button className="rdw-table-block-btn" onClick={this.insertRowAbove} title="Insert row above">
            ↑＋
          </button>
          <button className="rdw-table-block-btn" onClick={this.insertRowBelow} title="Insert row below">
            ↓＋
          </button>
          <button className="rdw-table-block-btn" onClick={this.insertColLeft} title="Insert column left">
            ←＋
          </button>
          <button className="rdw-table-block-btn" onClick={this.insertColRight} title="Insert column right">
            →＋
          </button>
          <button className="rdw-table-block-btn" onClick={this.deleteRow} title="Delete row">
            行✕
          </button>
          <button className="rdw-table-block-btn" onClick={this.deleteCol} title="Delete column">
            列✕
          </button>
          <button className="rdw-table-block-btn rdw-table-block-btn-danger" onClick={this.deleteTable} title="Delete table">
            ✕
          </button>
        </div>
      );
    }

    render() {
      const entityInfo = this.getEntityInfo();
      if (!entityInfo) return null;

      const { data } = entityInfo;
      const { rows, cols, cells, tableStyle, cellStyle: cellStyleProp } = data;
      const { selectedRow, selectedCol, showControls } = this.state;
      const isReadOnly = config.isReadOnly();

      const tableStyleObj = tableStyle || {};
      const cellStyleObj = cellStyleProp || {};

      const tableRows = [];
      for (let r = 0; r < rows; r++) {
        const tableCells = [];
        for (let c = 0; c < cols; c++) {
          const isSelected = r === selectedRow && c === selectedCol;

          tableCells.push(
            <TableCell
              key={`${r}-${c}`}
              row={r}
              col={c}
              initialContent={cells[`${r}-${c}`] || ''}
              readOnly={isReadOnly}
              onCellBlur={this.handleCellBlur}
              onCellSelect={this.handleCellSelect}
              cellStyle={cellStyleObj}
              isSelected={isSelected}
            />
          );
        }
        tableRows.push(<tr key={r}>{tableCells}</tr>);
      }

      return (
        <div
          className="rdw-table-block-wrapper"
          contentEditable={false}
          onMouseDown={this.handleWrapperMouseDown}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
        >
          {showControls && this.renderOperationControls()}
          <table className="rdw-table-block-table" style={tableStyleObj}>
            <tbody>{tableRows}</tbody>
          </table>
        </div>
      );
    }
  }

  return TableBlock;
};

export default getTableComponent;
