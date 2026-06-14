import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Option from '../../../components/Option';
import './styles.css';

class LayoutComponent extends Component {
  static propTypes = {
    expanded: PropTypes.bool,
    onExpandEvent: PropTypes.func,
    doCollapse: PropTypes.func,
    onChange: PropTypes.func,
    config: PropTypes.object,
    translations: PropTypes.object,
  };

  state = {
    hoverRow: 0,
    hoverCol: 0,
  };

  componentDidUpdate(prevProps) {
    const { expanded } = this.props;
    if (prevProps.expanded && !expanded) {
      this.setState({ hoverRow: 0, hoverCol: 0 });
    }
  }

  onGridHover = (row, col) => {
    this.setState({ hoverRow: row, hoverCol: col });
  };

  onGridClick = () => {
    const { hoverRow, hoverCol } = this.state;
    const { onChange } = this.props;
    if (hoverRow > 0 && hoverCol > 0) {
      onChange(hoverRow, hoverCol);
    }
  };

  renderGrid() {
    const { hoverRow, hoverCol } = this.state;
    const { config } = this.props;
    const maxRows = config.maxRows || 6;
    const maxCols = config.maxCols || 6;

    return (
      <div className="rdw-table-grid-popup">
        <div className="rdw-table-grid-label">
          {hoverRow > 0 && hoverCol > 0
            ? `${hoverRow} × ${hoverCol}`
            : 'Select size'}
        </div>
        <div className="rdw-table-grid">
          {Array.from({ length: maxRows }).map((_, rowIdx) => (
            <div key={rowIdx} className="rdw-table-grid-row">
              {Array.from({ length: maxCols }).map((_, colIdx) => {
                const active = rowIdx < hoverRow && colIdx < hoverCol;
                return (
                  <span
                    key={colIdx}
                    className={classNames('rdw-table-grid-cell', {
                      'rdw-table-grid-cell-active': active,
                    })}
                    onMouseEnter={() => this.onGridHover(rowIdx + 1, colIdx + 1)}
                    onClick={this.onGridClick}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  render() {
    const {
      config,
      expanded,
      onExpandEvent,
      translations,
    } = this.props;
    const { icon, className } = config;

    return (
      <div
        className="rdw-table-control-wrapper"
        aria-label="rdw-table-control"
      >
        <Option
          className={classNames(className)}
          value="unordered-list-item"
          onClick={onExpandEvent}
          aria-expanded={expanded}
          title={translations['components.controls.table.table']}
        >
          <img src={icon} alt="" />
        </Option>
        {expanded ? this.renderGrid() : undefined}
      </div>
    );
  }
}

export default LayoutComponent;
