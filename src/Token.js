import React, { Component } from 'react';
import classNames from 'classnames';

import { ENTER, UP, DOWN, SPACE } from './key-codes';

import { UNIQUE_ID } from './FacetedTokenInput'

const CHECK = <span className="check">✓</span>;

export default class Token extends Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedIndex: -1,
      showDropDown: false
    };
  }

  focus() {
    this.refs.container.focus();
  }

  render() {
    const {
      selected,
      facet,
      description,
      dropdownMenu,
      componentClasses,
      customElements
      index
    } = this.props;

    const { showDropDown, selectedIndex } = this.state;

    const containerClassName = classNames(
      {
        'token-container': true,
        'selected': selected
      },
      componentClasses.tokenWrapper
    );

    return (
      <div
        ref={ 'container' }
        tabIndex={ 0 }
        // this will make desktop screen readers work properly
        role={ dropdownMenu ? "menu" : "" }
        aria-haspopup="true"
        aria-owns={ UNIQUE_ID + "facet_menu" }
        aria-expanded={ dropdownMenu ? showDropDown : "false" }
        aria-activedescendant={ UNIQUE_ID + 'facet_0' + selectedIndex }
        aria-labelledby={ UNIQUE_ID + "token_0" + index }
        // end screen reader compatibility
        className={ containerClassName }
        onContextMenu={ event => this.onContextMenu(event) }
        onKeyDown={ event => this.onKeyDown(event) }
        onFocus={ event => this.onFocus(event) }
        onBlur={ event => this.onBlur(event) }
      >
        {
          this.renderContent({
            facet,
            description,
            dropdownMenu,
            componentClasses,
            customElements,
            selectedIndex,
            index
          })
        }

        {
          showDropDown &&
          dropdownMenu &&
          this.renderDropdown(dropdownMenu, componentClasses)
        }
      </div>
    );
  }

  renderContent({
    facet,
    description,
    dropdownMenu,
    componentClasses,
    customElements,
    selectedIndex,
    index
  }) {
    const onClick = event => this.setState({ showDropDown: true });

    const { showDropDown } = this.state;

    const showFacet = !!(facet || dropdownMenu);

    const tokenClass = classNames(
      'token',
      {
        'facet': showFacet,
        [componentClasses.tokenWithFacet]: showFacet
      },
      componentClasses.token
    );

    const facetClass = classNames('facet-type', componentClasses.facet);

    const descriptionClass = classNames(
      'facet-value',
      componentClasses.description
    );

    if (showFacet) {
      return (
        <span className={ tokenClass } id={ UNIQUE_ID + "token_0" + index } >
          <span
            aria-haspopup={ dropdownMenu ? true : false }
            aria-role="listbox"
            className={ facetClass }
            id={ UNIQUE_ID + "facet" }
            onClick={ onClick }
          >
            { facet }
            <span aria-hidden="true">
              { dropdownMenu && (customElements.dropdownArrow || ' ▾') }
            </span>
          </span>
          <span className={ descriptionClass }>
            { description }
          </span>
        </span>
      );
    }
    else {
      return (
        <span className={ tokenClass }>
          <span className={ descriptionClass } role="tab">
            { description }
          </span>
        </span>
      );
    }
  }

  renderDropdown(dropdownMenu, componentClasses) {
    const dropdownClass = classNames(
      'dropdown token-dropdown',
      componentClasses.dropdownWrap
    );

    const dropdownUlClass = classNames(componentClasses.dropdownUl);

    return (
      <div className={ dropdownClass }>
        <ul
          className={ dropdownUlClass }
          id={ UNIQUE_ID + "facet_menu" }
          role="menu"
        >
          { dropdownMenu.map(this.renderDropdownItem, this) }
        </ul>
      </div>
    );
  }

  renderDropdownItem(item, index) {
    const { componentClasses, customElements } = this.props;

    const { selectedIndex } = this.state;

    const selected = (index === selectedIndex);

    const dropdownLiClass = classNames(
      { 'active': selected },
      componentClasses.dropdownLi
    );

    const dropdownAClass = classNames(componentClasses.dropdownA);

    return (
      <li
        key={ 'menuItem' + index }
        className={ dropdownLiClass }
        id={ UNIQUE_ID + 'facet_0' + index }
        role="menuitemradio"
        aria-checked={ item.current }
        aria-label={ item.label }
        aria-controls={ UNIQUE_ID + "facet" }
      >

        <a
          onMouseEnter={ event => this.setState({ selectedIndex: index }) }
          onClick={ event => this.select(index) }
          className={ dropdownAClass }
        >
          <span aria-hidden="true">
            { !item.current ? null : customElements.check || CHECK }
          </span>
          { item.label }
        </a>
      </li>
    );
  }

  onContextMenu(event) {
    event.preventDefault();

    this.setState({
      showDropDown: true
    });
  }

  onKeyDown(event) {
    switch (event.which) {
      case ENTER:
        return this.onEnter(event);
      case UP:
      case DOWN:
        return this.onUpDown(event);
      default:
        return this.props.onKeyDown(event);
    }
  }

  onUpDown(event) {
    if (this.state.showDropDown) {
      const { dropdownMenu } = this.props;

      const { min, max } = Math;

      const increment = (event.which === UP) ? -1 : 1;

      const selectedIndex = this.state.selectedIndex + increment;

      this.setState({
        selectedIndex: max(0, min(dropdownMenu.length - 1, selectedIndex))
      });
    }
    else {
      this.setState({ showDropDown: true });

      this.props.onShowDropdown({});
    }
  }

  onEnter(event) {
    const { selectedIndex } = this.state;

    if (selectedIndex >= 0) {
      this.select(selectedIndex);
    }
  }

  onFocus(event) {
    this.props.onFocus(event);
  }

  onBlur(event) {
    this.setState({
      selectedIndex: -1,
      showDropDown: false
    });
  }

  select(selectedIndex) {
    const { dropdownMenu, onUpdate, index } = this.props;

    const token = dropdownMenu[ selectedIndex ].result;

    onUpdate({ token, index });

    this.setState({
      selectedIndex: -1,
      showDropDown: false
    });
  }

}
