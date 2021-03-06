import React, { Component, PropTypes } from 'react';
import List from './list';
import Operation from './operation';
import Search from './search';
import classNames from 'classnames';

function noop() {
}

class Transfer extends Component {

  constructor(props) {
    super(props);

    this.state = {
      leftFilter: '',
      rightFilter: '',
      leftCheckedKeys: [],
      rightCheckedKeys: [],
    };
  }

  splitDataSource() {
    const { targetKeys, dataSource } = this.props;

    let leftDataSource = [...dataSource];
    let rightDataSource = [];

    if (targetKeys.length > 0) {
      targetKeys.forEach((targetKey) => {
        rightDataSource.push(leftDataSource.filter((data, index) => {
          if (data.key === targetKey) {
            leftDataSource.splice(index, 1);
            return true;
          }
          return false;
        })[0]);
      });
    }

    return {
      leftDataSource,
      rightDataSource,
    };
  }

  moveTo(direction) {
    const { targetKeys } = this.props;
    const { leftCheckedKeys, rightCheckedKeys } = this.state;
    const moveKeys = direction === 'right' ? leftCheckedKeys : rightCheckedKeys;
    // move items to target box
    const newTargetKeys = direction === 'right'
      ? moveKeys.concat(targetKeys)
      : targetKeys.filter(targetKey => !moveKeys.some(checkedKey => targetKey === checkedKey));

    // empty checked keys
    this.setState({
      [direction === 'right' ? 'leftCheckedKeys' : 'rightCheckedKeys']: [],
    });

    this.props.onChange(newTargetKeys, direction, moveKeys);
  }

  getGlobalCheckStatus(direction) {
    const { leftDataSource, rightDataSource } = this.splitDataSource();
    const { leftFilter, rightFilter, leftCheckedKeys, rightCheckedKeys } = this.state;

    const dataSource = direction === 'left' ? leftDataSource : rightDataSource;
    const filter = direction === 'left' ? leftFilter : rightFilter;
    const checkedKeys = direction === 'left' ? leftCheckedKeys : rightCheckedKeys;
    const filteredDataSource = this.filterDataSource(dataSource, filter);

    let globalCheckStatus;

    if (checkedKeys.length > 0) {
      if (checkedKeys.length < filteredDataSource.length) {
        globalCheckStatus = 'part';
      } else {
        globalCheckStatus = 'all';
      }
    } else {
      globalCheckStatus = 'none';
    }
    return globalCheckStatus;
  }

  filterDataSource(dataSource, filter) {
    return dataSource.filter(item => {
      const itemText = this.props.render(item);
      return this.matchFilter(itemText, filter);
    });
  }

  matchFilter(text, filterText) {
    const regex = new RegExp(filterText);
    return text.match(regex);
  }

  handleSelectAll(direction) {
    const { leftDataSource, rightDataSource } = this.splitDataSource();
    const { leftFilter, rightFilter } = this.state;
    const dataSource = direction === 'left' ? leftDataSource : rightDataSource;
    const filter = direction === 'left' ? leftFilter : rightFilter;
    const checkStatus = this.getGlobalCheckStatus(direction);
    const holder = (checkStatus === 'all') ? [] :
      this.filterDataSource(dataSource, filter).map(item => item.key);

    this.setState({
      [`${direction}CheckedKeys`]: holder,
    });
  }

  handleFilter(direction, e) {
    this.setState({
      // deselect all
      [`${direction}CheckedKeys`]: [],
      // add filter
      [`${direction}Filter`]: e.target.value,
    });
  }

  handleClear(direction) {
    this.setState({
      [`${direction}Filter`]: '',
    });
  }

  handleSelect(direction, selectedItem, checked) {
    const { leftCheckedKeys, rightCheckedKeys } = this.state;
    const holder = direction === 'left' ? leftCheckedKeys : rightCheckedKeys;
    let index;
    holder.forEach((key, i) => {
      if (key === selectedItem.key) {
        index = i;
      }
    });
    if (index > -1) {
      holder.splice(index, 1);
    }
    if (checked) {
      holder.push(selectedItem.key);
    }
    this.setState({
      [`${direction}CheckedKeys`]: holder,
    });
  }

  render() {
    const {
      prefixCls, titles, operations, showSearch, notFoundContent,
      searchPlaceholder, body, footer, listStyle, className,
    } = this.props;
    const { leftFilter, rightFilter, leftCheckedKeys, rightCheckedKeys } = this.state;

    const { leftDataSource, rightDataSource } = this.splitDataSource();
    const leftActive = rightCheckedKeys.length > 0;
    const rightActive = leftCheckedKeys.length > 0;

    const leftCheckStatus = this.getGlobalCheckStatus('left');
    const rightCheckStatus = this.getGlobalCheckStatus('right');

    const cls = classNames({
      [className]: !!className,
      [prefixCls]: true,
    });

    return (
      <div className={cls}>
        <List titleText={titles[0]}
          dataSource={leftDataSource}
          filter={leftFilter}
          style={listStyle}
          checkedKeys={leftCheckedKeys}
          checkStatus={leftCheckStatus}
          handleFilter={this.handleFilter.bind(this, 'left')}
          handleClear={this.handleClear.bind(this, 'left')}
          handleSelect={this.handleSelect.bind(this, 'left')}
          handleSelectAll={this.handleSelectAll.bind(this, 'left')}
          position="left"
          render={this.props.render}
          showSearch={showSearch}
          searchPlaceholder={searchPlaceholder}
          notFoundContent={notFoundContent}
          body={body}
          footer={footer}
          prefixCls={`${prefixCls}-list`} />
        <Operation rightActive={rightActive}
          rightArrowText={operations[0]}
          moveToRight={this.moveTo.bind(this, 'right')}
          leftActive={leftActive}
          leftArrowText={operations[1]}
          moveToLeft={this.moveTo.bind(this, 'left')}
          className={`${prefixCls}-operation`} />
        <List titleText={titles[1]}
          dataSource={rightDataSource}
          filter={rightFilter}
          style={listStyle}
          checkedKeys={rightCheckedKeys}
          checkStatus={rightCheckStatus}
          handleFilter={this.handleFilter.bind(this, 'right')}
          handleClear={this.handleClear.bind(this, 'right')}
          handleSelect={this.handleSelect.bind(this, 'right')}
          handleSelectAll={this.handleSelectAll.bind(this, 'right')}
          position="right"
          render={this.props.render}
          showSearch={showSearch}
          searchPlaceholder={searchPlaceholder}
          notFoundContent={notFoundContent}
          body={body}
          footer={footer}
          prefixCls={`${prefixCls}-list`} />
      </div>
    );
  }
}

Transfer.defaultProps = {
  prefixCls: 'ant-transfer',
  dataSource: [],
  render: noop,
  targetKeys: [],
  onChange: noop,
  titles: ['?????????', '????????????'],
  operations: [],
  showSearch: false,
  searchPlaceholder: '?????????????????????',
  notFoundContent: 'Not Found',
  body: noop,
  footer: noop,
};

Transfer.propTypes = {
  prefixCls: PropTypes.string,
  dataSource: PropTypes.array,
  render: PropTypes.func,
  targetKeys: PropTypes.array,
  onChange: PropTypes.func,
  height: PropTypes.number,
  listStyle: PropTypes.object,
  className: PropTypes.string,
  titles: PropTypes.array,
  operations: PropTypes.array,
  showSearch: PropTypes.bool,
  searchPlaceholder: PropTypes.string,
  notFoundContent: PropTypes.node,
  body: PropTypes.func,
  footer: PropTypes.func,
};

Transfer.List = List;
Transfer.Operation = Operation;
Transfer.Search = Search;

export default Transfer;
