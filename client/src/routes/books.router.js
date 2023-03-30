const axios = require('axios');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/search', function (req, res, _next) {
  const searchTerm = req.query.q;
  const maxResults = req.query.maxResults || 10; // default to 10 results per page if not specified
  const page = (req.query.page - 1) * maxResults;

  axios
    .get(
      `https://www.googleapis.com/books/v1/volumes?q=${searchTerm}&maxResults=${maxResults}&startIndex=${page}`
    )
    .then((response) => {
      const books = response.data.items.map((item) => {
        const book = item.volumeInfo;
        return {
          authors: book.authors || ['Unknown Author'],
          title: book.title,
          description: book.description || 'No description available',
          publishedDate: book.publishedDate || 'Unknown Date',
        };
      });

      res.json(books);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send('An error occurred while fetching book results');
    });
});

module.exports = router;
