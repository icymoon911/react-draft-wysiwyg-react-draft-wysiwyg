import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EditorState } from 'draft-js';
import classNames from 'classnames';
import './styles.css';

const getTableComponent = (config) => class Table extends Component {
  static propTypes = {
    block: PropTypes.object,
    contentState: PropTypes.object,
  };

  state = {
    showActions: false,
  };

  getEntityData = () => {
    const { block, contentState } = this.props;
    const entityKey = block.getEntityAt(0);
    const entity = contentState.getEntity(entityKey);
    return entity.getData();
  };

  updateEntityData = (data) => {
    const { block, contentState } = this.props;
    const entityKey = block.getEntityAt(0);
    contentState.mergeEntityData(entityKey, data);
    config.onChange(
      EditorState.push(config.getEditorState(), contentState, 'change-block-data')
    );
    this.setState({ dummy: true });
  };

  toggleActions = () => {
    this.setState((prev) => ({ showActions: !prev.showActions }));
  };

  showActions = () => {
    this.setState({ showActions: true });
  };

  hideActions = () => {
    this.setState({ showActions: false });
  };

  addRowAbove = () => {
    const data = this.getEntityData();
    const { rows, cols, cells } = data;
    const newCells = [
      ...Array(cols).fill(''),
      ...cells,
    ];
    this.updateEntityData({
      rows: rows + 1,
      cells: newCells,
    });
  };

  addRowBelow = () => {
    const data = this.getEntityData();
    const { rows, cols, cells } = data;
    const newCells = [
      ...cells,
      ...Array(cols).fill(''),
    ];
    this.updateEntityData({
      rows: rows + 1,
      cells: newCells,
    });
  };

  addColLeft = () => {
    const data = this.getEntityData();
    const { rows, cols, cells } = data;
    const newCells = [];
    for (let r = 0; r < rows; r++) {
      newCells.push('');
      for (let c = 0; c < cols; c++) {
        newCells.push(cells[r * cols + c]);
      }
    }
    this.updateEntityData({
      cols: cols + 1,
      cells: newCells,
    });
  };

  addColRight = () => {
    const data = this.getEntityData();
    const { rows, cols, cells } = data;
    const newCells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        newCells.push(cells[r * cols + c]);
      }
      newCells.push('');
    }
    this.updateEntityData({
      cols: cols + 1,
      cells: newCells,
    });
  };

  deleteRow = () => {
    const data = this.getEntityData();
    const { rows, cols, cells, activeRow } = data;
    if (rows <= 1) {
      this.deleteTable();
      return;
    }
    const row = activeRow || 0;
    const newCells = [
      ...cells.slice(0, row * cols),
      ...cells.slice((row + 1) * cols),
    ];
    this.updateEntityData({
      rows: rows - 1,
      cells: newCells,
      activeRow: undefined,
      activeCol: undefined,
    });
  };

  deleteCol = () => {
    const data = this.getEntityData();
    const { rows, cols, cells, activeCol } = data;
    if (cols <= 1) {
      this.deleteTable();
      return;
    }
    const col = activeCol || 0;
    const newCells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (c !== col) {
          newCells.push(cells[r * cols + c]);
        }
      }
    }
    this.updateEntityData({
      cols: cols - 1,
      cells: newCells,
      activeRow: undefined,
      activeCol: undefined,
    });
  };

  deleteTable = () => {
    const editorState = config.getEditorState();
    const contentState = editorState.getCurrentContent();
    const { block } = this.props;
    const blockKey = block.getKey();
    const newContentState = contentState.set(
      'blockMap',
      contentState.getBlockMap().delete(blockKey)
    );
    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      'remove-range'
    );
    config.onChange(newEditorState);
  };

  onCellClick = (rowIndex, colIndex) => {
    this.updateEntityData({
      activeRow: rowIndex,
      activeCol: colIndex,
    });
  };

  onCellChange = (rowIndex, colIndex, value) => {
    const data = this.getEntityData();
    const { cols, cells } = data;
    const newCells = [...cells];
    newCells[rowIndex * cols + colIndex] = value;
    this.updateEntityData({ cells: newCells });
  };

  renderActionButtons(isReadOnly) {
    if (isReadOnly()) return null;
    const { showActions } = this.state;
    if (!showActions) return null;

    return (
      <div className="rdw-table-action-bar">
        <button type="button" className="rdw-table-action-btn" onClick={this.addRowAbove} title="Insert row above">↑ Row</button>
        <button type="button" className="rdw-table-action-btn" onClick={this.addRowBelow} title="Insert row below">↓ Row</button>
        <button type="button" className="rdw-table-action-btn" onClick={this.addColLeft} title="Insert column left">← Col</button>
        <button type="button" className="rdw-table-action-btn" onClick={this.addColRight} title="Insert column right">→ Col</button>
        <button type="button" className="rdw-table-action-btn rdw-table-action-btn-danger" onClick={this.deleteRow} title="Delete row">✕ Row</button>
        <button type="button" className="rdw-table-action-btn rdw-table-action-btn-danger" onClick={this.deleteCol} title="Delete column">✕ Col</button>
        <button type="button" className="rdw-table-action-btn rdw-table-action-btn-danger" onClick={this.deleteTable} title="Delete table">✕ Table</button>
      </div>
    );
  }

  render() {
    const data = this.getEntityData();
    const { rows, cols, cells } = data;
    const { isReadOnly } = config;
    const tableStyle = config.tableStyle || {};

    return (
      <div
        className="rdw-table-wrapper"
        onMouseEnter={this.showActions}
        onMouseLeave={this.hideActions}
        contentEditable={false}
        suppressContentEditableWarning
      >
        {this.renderActionButtons(isReadOnly)}
        <table
          className="rdw-table"
          style={{
            borderCollapse: 'collapse',
            width: '100%',
            border: `1px solid ${tableStyle.borderColor || '#ccc'}`,
          }}
        >
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: cols }).map((_, colIndex) => {
                  const cellValue = cells[rowIndex * cols + colIndex] || '';
                  return (
                    <td
                      key={colIndex}
                      className="rdw-table-cell"
                      style={{
                        border: `1px solid ${tableStyle.borderColor || '#ccc'}`,
                        padding: tableStyle.cellPadding || '8px',
                        minWidth: '60px',
                        minHeight: '30px',
                      }}
                      onClick={() => this.onCellClick(rowIndex, colIndex)}
                    >
                      <input
                        type="text"
                        className="rdw-table-cell-input"
                        value={cellValue}
                        readOnly={isReadOnly()}
                        onChange={(e) => this.onCellChange(rowIndex, colIndex, e.target.value)}
                        onClick={(e) => {
                          e.stopPropagation();
                          this.onCellClick(rowIndex, colIndex);
                        }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
};

export default getTableComponent;
