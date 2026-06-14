import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AtomicBlockUtils, EditorState } from 'draft-js';

import {
  createEmptyCells,
  addRow,
  removeRow,
  addCol,
  removeCol,
} from '../../utils/table';
import LayoutComponent from './Component';

/**
 * TableControl - Logic layer for the table toolbar control.
 * Manages table insertion and structural operations (add/remove rows/cols).
 *
 * Follows the same pattern as Image/Embedded controls:
 * - Logic layer (this file): handles editor state mutations
 * - View layer (Component/index.js): renders the toolbar UI
 */
class TableControl extends Component {
  static propTypes = {
    editorState: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    modalHandler: PropTypes.object,
    config: PropTypes.object,
    translations: PropTypes.object,
  };

  constructor(props) {
    super(props);
    const { modalHandler } = this.props;
    this.state = {
      expanded: false,
    };
    modalHandler.registerCallBack(this.expandCollapse);
  }

  componentWillUnmount() {
    const { modalHandler } = this.props;
    modalHandler.deregisterCallBack(this.expandCollapse);
  }

  onExpandEvent = () => {
    this.signalExpanded = !this.state.expanded;
  };

  doExpand = () => {
    this.setState({ expanded: true });
  };

  doCollapse = () => {
    this.setState({ expanded: false });
  };

  expandCollapse = () => {
    this.setState({
      expanded: this.signalExpanded,
    });
    this.signalExpanded = false;
  };

  /**
   * Insert a new table with the given dimensions.
   */
  addTable = (rows, cols) => {
    const { editorState, onChange, config } = this.props;
    const cells = createEmptyCells(rows, cols);
    const tableStyle = {};
    const cellStyle = {};

    if (config) {
      if (config.defaultTableStyle) {
        Object.assign(tableStyle, config.defaultTableStyle);
      }
      if (config.defaultCellStyle) {
        Object.assign(cellStyle, config.defaultCellStyle);
      }
    }

    const entityData = {
      rows,
      cols,
      cells,
      tableStyle,
      cellStyle,
      tableVersion: 1,
    };

    const entityKey = editorState
      .getCurrentContent()
      .createEntity('TABLE', 'MUTABLE', entityData)
      .getLastCreatedEntityKey();

    const newEditorState = AtomicBlockUtils.insertAtomicBlock(
      editorState,
      entityKey,
      ' '
    );

    onChange(newEditorState);
    this.doCollapse();
  };

  /**
   * Check if the current selection is on a table block.
   * Returns { entityKey, tableData } or null.
   */
  getTableAtSelection = () => {
    const { editorState } = this.props;
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const blockKey = selection.getStartKey();
    const block = contentState.getBlockForKey(blockKey);

    if (block && block.getType() === 'atomic') {
      const entityKey = block.getEntityAt(0);
      if (entityKey) {
        try {
          const entity = contentState.getEntity(entityKey);
          if (entity && entity.getType() === 'TABLE') {
            return { entityKey, tableData: entity.getData() };
          }
        } catch (e) {
          // entity not found
        }
      }
    }
    return null;
  };

  /**
   * Update table entity data and trigger editor state change.
   */
  updateTableEntity = (entityKey, newData) => {
    const { editorState, onChange } = this.props;
    const contentState = editorState.getCurrentContent();
    contentState.mergeEntityData(entityKey, newData);
    onChange(EditorState.push(editorState, contentState, 'change-block-data'));
  };

  handleInsertRowAbove = () => {
    const table = this.getTableAtSelection();
    if (!table) return;
    const { entityKey, tableData } = table;
    const newData = addRow(tableData, 0, 'above');
    this.updateTableEntity(entityKey, newData);
  };

  handleInsertRowBelow = () => {
    const table = this.getTableAtSelection();
    if (!table) return;
    const { entityKey, tableData } = table;
    const newData = addRow(tableData, tableData.rows - 1, 'below');
    this.updateTableEntity(entityKey, newData);
  };

  handleInsertColLeft = () => {
    const table = this.getTableAtSelection();
    if (!table) return;
    const { entityKey, tableData } = table;
    const newData = addCol(tableData, 0, 'left');
    this.updateTableEntity(entityKey, newData);
  };

  handleInsertColRight = () => {
    const table = this.getTableAtSelection();
    if (!table) return;
    const { entityKey, tableData } = table;
    const newData = addCol(tableData, tableData.cols - 1, 'right');
    this.updateTableEntity(entityKey, newData);
  };

  handleDeleteRow = () => {
    const table = this.getTableAtSelection();
    if (!table) return;
    const { entityKey, tableData } = table;
    if (tableData.rows <= 1) {
      // If only one row, delete the whole table
      this.handleDeleteTable();
      return;
    }
    const newData = removeRow(tableData, tableData.rows - 1);
    this.updateTableEntity(entityKey, newData);
  };

  handleDeleteCol = () => {
    const table = this.getTableAtSelection();
    if (!table) return;
    const { entityKey, tableData } = table;
    if (tableData.cols <= 1) {
      this.handleDeleteTable();
      return;
    }
    const newData = removeCol(tableData, tableData.cols - 1);
    this.updateTableEntity(entityKey, newData);
  };

  handleDeleteTable = () => {
    const { editorState, onChange } = this.props;
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const blockKey = selection.getStartKey();

    // Remove the block containing the table
    const blockMap = contentState.getBlockMap();
    const newBlockMap = blockMap.delete(blockKey);
    const newContentState = contentState.set('blockMap', newBlockMap);

    onChange(EditorState.push(editorState, newContentState, 'remove-range'));
  };

  render() {
    const { config, translations } = this.props;
    const { expanded } = this.state;
    const TableComponent = config.component || LayoutComponent;
    const tableAtSelection = this.getTableAtSelection();
    const isTableSelected = !!tableAtSelection;

    return (
      <TableComponent
        config={config}
        translations={translations}
        onChange={this.addTable}
        expanded={expanded}
        onExpandEvent={this.onExpandEvent}
        doExpand={this.doExpand}
        doCollapse={this.doCollapse}
        isTableSelected={isTableSelected}
        onInsertRowAbove={this.handleInsertRowAbove}
        onInsertRowBelow={this.handleInsertRowBelow}
        onInsertColLeft={this.handleInsertColLeft}
        onInsertColRight={this.handleInsertColRight}
        onDeleteRow={this.handleDeleteRow}
        onDeleteCol={this.handleDeleteCol}
        onDeleteTable={this.handleDeleteTable}
      />
    );
  }
}

export default TableControl;
