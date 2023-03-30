import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [mostCommonAuthor, setMostCommonAuthor] = useState('');
  const [earliestPublicationDate, setEarliestPublicationDate] = useState('');
  const [latestPublicationDate, setLatestPublicationDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(5);

  useEffect(() => {
    if (query) {
      fetchData();
    }
  }, [query, currentPage, resultsPerPage]);

  async function fetchData() {
    setLoading(true);
    const response = await axios.get(
      `${process.env.REACT_APP_BASE_URL}books/search?q=${query}&page=${currentPage}&maxResults=${resultsPerPage}`
    );
    setResults(response.data || []);
    setTotalResults(response.data.totalItems || 0);
    setLoading(false);

    const authors = response.data.map((result) => result.authors).flat(); // get all authors from search results and flatten array
    const authorCounts = authors.reduce((acc, author) => {
      if (!acc[author]) {
        acc[author] = 1;
      } else {
        acc[author]++;
      }
      return acc;
    }, {});

    const mostCommonAuthor = Object.keys(authorCounts).reduce((a, b) =>
      authorCounts[a] > authorCounts[b] ? a : b
    );

    const publicationDates = response.data
      .map((result) => result.publishedDate)
      .sort();
    const earliestPublicationDate = publicationDates[0];
    const latestPublicationDate = publicationDates[publicationDates.length - 1];

    setMostCommonAuthor(mostCommonAuthor);
    setEarliestPublicationDate(earliestPublicationDate);
    setLatestPublicationDate(latestPublicationDate);
  }

  useEffect(() => {
    async function fetchStats() {
      const response = await axios.get('/api/books/stats');
      setMostCommonAuthor(response.data.mostCommonAuthor || '');
      setEarliestPublicationDate(response.data.earliestPublicationDate || '');
      setLatestPublicationDate(response.data.latestPublicationDate || '');
    }
    fetchStats();
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleResultsPerPageChange = (event) => {
    setResultsPerPage(parseInt(event.target.value));
    setCurrentPage(1);
  };

  const renderAuthor = (authors) => {
    if (authors) {
      return authors.join(', ');
    } else {
      return 'Unknown';
    }
  };

  const renderResults = () => {
    if (loading) {
      return <p>Loading...</p>;
    } else if (results.length === 0) {
      return <p>No results found.</p>;
    } else {
      return results.map((result, index) => (
        <tr key={index}>
          <td>{renderAuthor(result.authors)}</td>
          <td>{result.title}</td>
          <td>
            <button onClick={() => alert(result.description)}>
              Show description
            </button>
          </td>
        </tr>
      ));
    }
  };

  return (
    <div className='App'>
      <header className='App-header'>
        <h1>Search Books</h1>
        <form
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <label htmlFor='query'>Search:</label>
          <input
            type='text'
            id='query'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type='submit'>Search</button>
        </form>
      </header>
      <div className='results'>
        <div className='options'>
          <label htmlFor='resultsPerPage'>Results per page:</label>
          <select
            id='resultsPerPage'
            value={resultsPerPage}
            onChange={handleResultsPerPageChange}
          >
            <option value='5'>5</option>
            <option value='10'>10</option>
            <option value='20'>20</option>
          </select>
        </div>
        <table>
          <thead>
            <tr>
              <th>Author(s)</th>
              <th>Title</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>{renderResults()}</tbody>
        </table>
        {renderResults()}
        <div className='pagination'>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {Array.from(
            { length: Math.ceil(totalResults / resultsPerPage) },
            (_, i) => i + 1
          ).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={currentPage === page ? 'active' : ''}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === Math.ceil(totalResults / resultsPerPage)}
          >
            Next
          </button>
        </div>
        <div className='stats'>
          <p>Total results: {results.length}</p>
          <p>Most common author: {mostCommonAuthor}</p>
          <p>Earliest publication date: {earliestPublicationDate}</p>
          <p>Latest publication date: {latestPublicationDate}</p>
          {/* <p>Server response time: {responseTime}ms</p> */}
        </div>
      </div>
    </div>
  );
}

export default App;
