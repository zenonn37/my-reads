import React from "react";
import { Link } from "react-router-dom";
import BookList from "./BooksList";
import * as BooksAPI from "../BooksAPI";

class Search extends React.Component {
  state = {
    search: [],
    query: false,
  };

  /**
   * @description Search through raw book data,check for current book shelf matches and add shelf attribute to book object
   *  @description Combine Book state with raw search data, and filter out duplicates.
   *  @description set search state to new array data
   * @param {string} query - User input from search field
   * @returns {void} returns nothing
   */

  searchBooks = (query) => {
    //do not allow empty query string to server
    if (query === "") {
      //set query guard to false
      this.setState(() => ({
        search: [],
        query: false,
      }));
      return;
    }

    BooksAPI.search(query).then((data) => {
      //handle query errors
      if (data.error === "undefined" || data.error === "empty query") {
        //set query guard to false
        this.setState(() => ({
          search: [],
          query: false,
        }));
        return;
      }

      //run through books and check for id matches
      //if you find a match from user shelf and search
      //append shelf attribute with current value ie-read|current|want
      //if no match is found append shelf:none

      const bkShelf = this.props.books;

      let shelf = [];
      //run through all search data and match any shelf data.
      //if there is a match push to shelf array.
      data.forEach((search) => {
        let match = bkShelf.find((shelf) => {
          return shelf.id === search.id;
        });
        if (match != null) shelf.push(match);
      });

      //adds shelf attribute to raw data temp array
      const sFinal = data.map((e) => ({
        ...e,
        shelf: "none",
      }));
      //combine two shelf and updated search results
      const appendShelf = [...shelf, ...sFinal];

      //filter out all duplicates using Array SET
      const view = Array.from(new Set(appendShelf.map((a) => a.id))).map(
        (id) => {
          return appendShelf.find((a) => a.id === id);
        }
      );
      //set new state form new array
      //set query guard to true
      this.setState(() => ({
        search: view,
        query: true,
      }));
    });
  };

  /**
   *
   ** @description Updates books shelf status of books, filter out books status set to none
   @description Addes new book to book shelf and updates search state
   * @param {string} shelf - Status of book
   * @param {object} book - Entire Book Object
    * @returns {void} returns nothing
   */
  shelfHandler = (shelf, book) => {
    //do not allow the none option to be passed to update call
    if (shelf === "none") return;

    //add books to shelf from search
    BooksAPI.update(book, shelf).then((data) => {
      const update = this.state.search.map((b) =>
        b.id === book.id
          ? //  {...b,shelf:shelf}

            Object.assign({}, b, { shelf: shelf })
          : b
      );

      this.setState(() => ({
        search: update,
      }));
      this.props.addNewBook({ ...book, shelf });
    });
  };
  render() {
    const { search, query } = this.state;
    return (
      <div className="search-books">
        <div className="search-books-bar">
          <Link to="/">
            <button className="close-search">Close</button>
          </Link>
          <div className="search-books-input-wrapper">
            <input
              type="text"
              placeholder="Search by title or author"
              onChange={(e) => this.searchBooks(e.target.value)}
            />
          </div>
        </div>
        <div className="search-books-results">
          <ol className="books-grid">
            {query ? (
              search.map((search) => (
                <BookList
                  books={search}
                  key={search.id}
                  shelfHandler={this.shelfHandler}
                />
              ))
            ) : (
              <div>No data enter a book or author.</div>
            )}
          </ol>
        </div>
      </div>
    );
  }
}

export default Search;
