import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Option from '../../../components/Option';
import './styles.css';

/**
 * TableLayoutComponent - View layer for the table toolbar control.
 * Renders:
 * 1. A table icon button that opens a grid picker popup for inserting tables.
 * 2. When a table is selected in the editor, shows operation buttons
 *    (insert row/col, delete row/col, delete table).
 */
class TableLayoutComponent extends Component {
  static propTypes = {
    expanded: PropTypes.bool,
    onExpandEvent: PropTypes.func,
    doCollapse: PropTypes.func,
    onChange: PropTypes.func,
    config: PropTypes.object,
    translations: PropTypes.object,
    isTableSelected: PropTypes.bool,
    onInsertRowAbove: PropTypes.func,
    onInsertRowBelow: PropTypes.func,
    onInsertColLeft: PropTypes.func,
    onInsertColRight: PropTypes.func,
    onDeleteRow: PropTypes.func,
    onDeleteCol: PropTypes.func,
    onDeleteTable: PropTypes.func,
  };

  state = {
    hoveredRow: 0,
    hoveredCol: 0,
  };

  gridSize = 8; // 8x8 grid picker

  componentDidUpdate(prevProps) {
    if (prevProps.expanded && !this.props.expanded) {
      this.setState({ hoveredRow: 0, hoveredCol: 0 });
    }
  }

  onGridHover = (row, col) => {
    this.setState({ hoveredRow: row, hoveredCol: col });
  };

  onGridClick = () => {
    const { hoveredRow, hoveredCol } = this.state;
    const { onChange } = this.props;
    if (onChange && hoveredRow > 0 && hoveredCol > 0) {
      onChange(hoveredRow, hoveredCol);
    }
  };

  stopPropagation = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  renderGridPicker() {
    const { hoveredRow, hoveredCol } = this.state;
    const { doCollapse, config, translations } = this.props;
    const { popupClassName } = config;

    const rows = [];
    for (let r = 1; r <= this.gridSize; r++) {
      const cells = [];
      for (let c = 1; c <= this.gridSize; c++) {
        cells.push(
          <div
            key={c}
            className={classNames('rdw-table-grid-cell', {
              'rdw-table-grid-cell-active': r <= hoveredRow && c <= hoveredCol,
            })}
            onMouseEnter={() => this.onGridHover(r, c)}
            onClick={this.onGridClick}
          />
        );
      }
      rows.push(
        <div key={r} className="rdw-table-grid-row">
          {cells}
        </div>
      );
    }

    return (
      <div
        className={classNames('rdw-table-modal', popupClassName)}
        onClick={this.stopPropagation}
      >
        <div className="rdw-table-modal-title">
          {translations['components.controls.table.insertTable'] || 'Insert Table'}
        </div>
        <div className="rdw-table-grid">{rows}</div>
        <div className="rdw-table-modal-size">
          {hoveredRow > 0 && hoveredCol > 0
            ? `${hoveredRow} × ${hoveredCol}`
            : ' '}
        </div>
        <div className="rdw-table-modal-btn-section">
          <button className="rdw-table-modal-btn" onClick={doCollapse}>
            {translations['generic.cancel'] || 'Cancel'}
          </button>
        </div>
      </div>
    );
  }

  renderTableOperations() {
    const {
      translations,
      config,
      onInsertRowAbove,
      onInsertRowBelow,
      onInsertColLeft,
      onInsertColRight,
      onDeleteRow,
      onDeleteCol,
      onDeleteTable,
    } = this.props;

    return (
      <div className="rdw-table-operations">
        <Option
          onClick={onInsertRowAbove}
          className="rdw-table-operation"
          title={translations['components.controls.table.insertRowAbove'] || 'Insert row above'}
        >
          <span className="rdw-table-op-icon">↑＋</span>
        </Option>
        <Option
          onClick={onInsertRowBelow}
          className="rdw-table-operation"
          title={translations['components.controls.table.insertRowBelow'] || 'Insert row below'}
        >
          <span className="rdw-table-op-icon">↓＋</span>
        </Option>
        <Option
          onClick={onInsertColLeft}
          className="rdw-table-operation"
          title={translations['components.controls.table.insertColLeft'] || 'Insert column left'}
        >
          <span className="rdw-table-op-icon">←＋</span>
        </Option>
        <Option
          onClick={onInsertColRight}
          className="rdw-table-operation"
          title={translations['components.controls.table.insertColRight'] || 'Insert column right'}
        >
          <span className="rdw-table-op-icon">→＋</span>
        </Option>
        <Option
          onClick={onDeleteRow}
          className="rdw-table-operation"
          title={translations['components.controls.table.deleteRow'] || 'Delete row'}
        >
          <span className="rdw-table-op-icon">🗑─</span>
        </Option>
        <Option
          onClick={onDeleteCol}
          className="rdw-table-operation"
          title={translations['components.controls.table.deleteCol'] || 'Delete column'}
        >
          <span className="rdw-table-op-icon">🗑│</span>
        </Option>
        <Option
          onClick={onDeleteTable}
          className="rdw-table-operation rdw-table-operation-danger"
          title={translations['components.controls.table.deleteTable'] || 'Delete table'}
        >
          <span className="rdw-table-op-icon">✕</span>
        </Option>
      </div>
    );
  }

  render() {
    const {
      config: { icon, className, title },
      expanded,
      onExpandEvent,
      translations,
      isTableSelected,
    } = this.props;

    return (
      <div
        className="rdw-table-wrapper"
        aria-haspopup="true"
        aria-expanded={expanded}
        aria-label="rdw-table-control"
      >
        <Option
          className={classNames(className)}
          onClick={onExpandEvent}
          title={title || translations['components.controls.table.table'] || 'Table'}
        >
          <img src={icon} alt="" />
        </Option>
        {expanded ? this.renderGridPicker() : undefined}
        {isTableSelected ? this.renderTableOperations() : undefined}
      </div>
    );
  }
}

export default TableLayoutComponent;
