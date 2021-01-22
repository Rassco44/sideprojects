﻿import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

// These constants will be used to indicate points where we have page controls for moving LEFT and RIGHT respectively.
const LEFT_PAGE = 'LEFT';
const RIGHT_PAGE = 'RIGHT';

/**
 * Helper method for creating a range of numbers
 * range(1, 5) => [1, 2, 3, 4, 5]
 */
const range = (from, to, step = 1) => {
  let i = from;
  const range = [];

  while (i <= to) {
    range.push(i);
    i += step;
  }

  return range;
}

class Pagination extends Component {
  constructor(props) {
    super(props);
    let pageLimit = typeof props.pageLimit === 'number' ? props.pageLimit : 30;
    let totalRecords = typeof props.totalRecords === 'number' ? props.totalRecords : 0;

    // pageNeighbours can be: 0, 1 or 2
    let pageNeighbours = typeof props.pageNeighbours === 'number'
      ? Math.max(0, Math.min(props.pageNeighbours, 2))
      : 0;
    let pageCount = Math.ceil(props.totalRecords / props.pageLimit) === 0
      ? 1
      : Math.ceil(props.totalRecords / props.pageLimit);

    this.state = {
      totalRecords,
      pageLimit,
      pageCount,
      pageNeighbours,
      currentPage: 1 // We need this state property to internally keep track of the currently active page
    };
  } // End of constructor

  /**
   * This method handles the core logic for generating the page numbers to be shown on the pagination control.
   * We want the first page and last page to always be visible.
   *
   * Let's say we have 10 pages and we set pageNeighbours to 2
   * Given that the current page is 6
   * The pagination control will look like the following:
   *
   * (1) < {4 5} [6] {7 8} > (10)
   *
   * (x) => terminal pages: first and last page(always visible)
   * [x] => represents current page
   * {...x} => represents page neighbours
   *
   *
   */
  fetchPageNumbers = () => {
    const pageCount = this.state.pageCount;
    const currentPage = this.state.currentPage;
    const pageNeighbours = this.state.pageNeighbours;

    /**
     * totalNumbers: the total page numbers to show on the control
     * totalBlocks: totalNumbers + 2 to cover for the left(<) and right(>) controls
     */
    const totalNumbers = (this.state.pageNeighbours * 2) + 3;
    const totalBlocks = totalNumbers + 2;

    /**
     * If pageCount <= totalBlocks, we simply return a range of numbers from 1 to pageCount.
     * If pageCount > totalBlocks, we return the array of page numbers, with LEFT_PAGE and RIGHT_PAGE
     * at points where we have pages spilling to the left and right respectively.
     */
    if (pageCount > totalBlocks) {
      const startPage = Math.max(2, currentPage - pageNeighbours);
      const endPage = Math.min(pageCount - 1, currentPage + pageNeighbours);

      let pages = range(startPage, endPage);

      /**
       * hasLeftSpill: has hidden pages to the left
       * hasRightSpill: has hidden pages to the right
       * spillOffset: number of hidden pages either to the left or to the right
       */
      const hasLeftSpill = startPage > 2;
      const hasRightSpill = (pageCount - endPage) > 1;
      const spillOffset = totalNumbers - (pages.length + 1);

      switch (true) {
        // handle: (1) < {5 6} [7] {8 9} (10)
        case (hasLeftSpill && !hasRightSpill): {
          const extraPages = range(startPage - spillOffset, startPage - 1);
          pages = [LEFT_PAGE, ...extraPages, ...pages];
          break;
        }

        // handle: (1) {2 3} [4] {5 6} > (10)
        case (!hasLeftSpill && hasRightSpill): {
          const extraPages = range(endPage + 1, endPage + spillOffset);
          pages = [...pages, ...extraPages, RIGHT_PAGE];
          break;
        }

        // handle: (1) < {4 5} [6] {7 8} > (10)
        case (hasLeftSpill && hasRightSpill):
        default: {
          pages = [LEFT_PAGE, ...pages, RIGHT_PAGE];
          break;
        }
      }
      return [1, ...pages, pageCount];
    }
    return range(1, pageCount);
  } // End of fetch

  /**
   * gotoPage modifies the state and sets the currentPage to the specified page. It ensures that the page
   * argument has a minimum value of 1 and a maximum value of the total number of pages
   */
  gotoPage = page => {
    const { onPageChanged = f => f } = this.props;
    const currentPage = Math.max(0, Math.min(page, this.state.pageCount));
    const totalRecords = this.state.totalRecords;

    const paginationData = {
      totalRecords,
      pageLimit: this.state.pageLimit,
      pageCount: this.state.pageCount,
      currentPage
    };

    this.setState(
      {
        totalRecords,
        pageLimit: this.state.pageLimit,
        pageCount: this.state.pageCount,
        currentPage
      },
      () => onPageChanged(paginationData)
    );
  } // End of gotoPage

  handleClick = page => evt => {
    evt.preventDefault();
    this.gotoPage(page);
  } // End of handleClick

  handleMoveLeft = evt => {
    evt.preventDefault();
    // slide the page numbers to the left based on the current page number when user clicks "<<"
    this.gotoPage(this.state.currentPage - (this.state.pageNeighbours * 2) - 1);
  } // End of handleMoveLeft

  handleMoveRight = evt => {
    evt.preventDefault();
    // slide the page numbers to the right based on the current page number when user clicks ">>"
    this.gotoPage(this.state.currentPage + (this.state.pageNeighbours * 2) + 1);
  } // End of handleMoveRight

  componentDidMount() {
    this.gotoPage(1);
  } // End of componentDidMount

  // When user types in search bar
  // Do not use this since componentWillReceiveProps is deprecated, use getDerivedStateFromProps instead
  /*
  componentWillReceiveProps(nextProps) {
    this.totalRecords = typeof nextProps.totalRecords === 'number' ? nextProps.totalRecords : 1;
    this.pageLimit = typeof nextProps.pageLimit === 'number' ? nextProps.pageLimit : 30;
    this.pageNeighbours = typeof nextProps.pageNeighbours === 'number'
      ? Math.max(0, Math.min(nextProps.pageNeighbours, 2))
      : 0;

    this.pageCount = Math.ceil(this.totalRecords / this.pageLimit) === 0
      ? 1
      : Math.ceil(this.totalRecords / this.pageLimit);
  } // End of componentWillReceiveProps
  */

  // When user types in search bar
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.totalRecords !== prevState.totalRecords) {
      let totalRecords = typeof nextProps.totalRecords === 'number' ? nextProps.totalRecords : 1;
      let pageLimit = typeof prevState.pageLimit === 'number' ? nextProps.pageLimit : 30;
      let pageNeighbours = typeof nextProps.pageNeighbours === 'number'
        ? Math.max(0, Math.min(nextProps.pageNeighbours, 2))
        : 0;
      let pageCount = Math.ceil(totalRecords / pageLimit) === 0
        ? 1
        : Math.ceil(totalRecords / pageLimit);

      return {
        totalRecords,
        pageLimit,
        pageNeighbours,
        pageCount,
        currentPage: 1
      };
    }
    else return null;
  }

  render() {
    // The pagination control will not be rendered if the totalRecords prop was not passed in correctly
    // to the Pagination component or in cases where there is only 1 page.
    if (!this.state.totalRecords || this.state.pageCount === 1) return null;

    const { currentPage } = this.state;
    const pages = this.fetchPageNumbers(); // generate page numbers

    return (
      <Fragment>
        <nav aria-label="Contacts Pagination">
          <ul className="pagination">
            { // render each page number
              pages.map((page, index) => {
              if (page === LEFT_PAGE) return (
                <li key={index} className="page-item">
                  <a className="page-link" aria-label="Previous" onClick={this.handleMoveLeft}>
                    <span aria-hidden="true">&laquo;</span>
                    <span className="sr-only">Previous</span>
                  </a>
                </li>
              );

              if (page === RIGHT_PAGE) return (
                <li key={index} className="page-item">
                  <a className="page-link" aria-label="Next" onClick={this.handleMoveRight}>
                    <span aria-hidden="true">&raquo;</span>
                    <span className="sr-only">Next</span>
                  </a>
                </li>
              );

              // Notice that we register click event handlers on each rendered page number to handle clicks.
              return (
                <li key={index} className={`page-item${currentPage === page ? ' active' : ''}`}>
                  <a className="page-link" onClick={this.handleClick(page)}>{page}</a>
                </li>
              );
            })}

          </ul>
        </nav>
      </Fragment>
    );
  } // End of return
}

Pagination.propTypes = {
  pageLimit: PropTypes.number,                // indicates the number of records to be shown per page. If not specified,
                                              // it defaults to 30 as defined in the constructor()

  pageNeighbours: PropTypes.number,           // indicates the number of additional page numbers to show on each side of the current page
                                              // The minimum value is 0 and the maximum value is 2
                                              // If not specified, it defaults to 0

  onPageChanged: PropTypes.func               // is a function that will be called with data of the current pagination
                                              // state only when the current page changes
};

export default Pagination;