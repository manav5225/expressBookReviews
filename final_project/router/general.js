const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const isValid = require('./auth_users.js').isValid;
const users = require('./auth_users.js').users;

const public_users = express.Router();
const API_BASE = process.env.BOOK_API_BASE || 'http://localhost:5000';

// Register a new user.
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  users.push({ username, password });
  return res.status(201).json({ message: 'User registered successfully' });
});

// Get all books.
public_users.get('/', (req, res) => {
  return res.status(200).json(books);
});

// Get book details based on ISBN/book id.
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  return res.status(200).json(book);
});

// Get books by author (case-insensitive partial match).
public_users.get('/author/:author', (req, res) => {
  const author = decodeURIComponent(req.params.author).toLowerCase();
  const result = Object.keys(books).reduce((matches, isbn) => {
    if (books[isbn].author.toLowerCase().includes(author)) matches[isbn] = books[isbn];
    return matches;
  }, {});
  return res.status(200).json(result);
});

// Get books by title (case-insensitive partial match).
public_users.get('/title/:title', (req, res) => {
  const title = decodeURIComponent(req.params.title).toLowerCase();
  const result = Object.keys(books).reduce((matches, isbn) => {
    if (books[isbn].title.toLowerCase().includes(title)) matches[isbn] = books[isbn];
    return matches;
  }, {});
  return res.status(200).json(result);
});

// Get reviews for a book.
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  return res.status(200).json(book.reviews);
});

/*
 * Task 11: Axios implementations.
 * These functions call the running Express API using async/await + Axios.
 */
async function getAllBooks() {
  const response = await axios.get(`${API_BASE}/`);
  return response.data;
}

async function getBooksByISBN(isbn) {
  const response = await axios.get(`${API_BASE}/isbn/${encodeURIComponent(isbn)}`);
  return response.data;
}

async function getBooksByAuthor(author) {
  const response = await axios.get(`${API_BASE}/author/${encodeURIComponent(author)}`);
  return response.data;
}

async function getBooksByTitle(title) {
  const response = await axios.get(`${API_BASE}/title/${encodeURIComponent(title)}`);
  return response.data;
}

async function getBookReview(isbn) {
  const response = await axios.get(`${API_BASE}/review/${encodeURIComponent(isbn)}`);
  return response.data;
}

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBooksByISBN = getBooksByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
module.exports.getBookReview = getBookReview;

// Optional CLI demonstrations after the server is running.
if (require.main === module) {
  const [operation, value] = process.argv.slice(2);
  const actions = {
    all: () => getAllBooks(),
    isbn: () => getBooksByISBN(value),
    author: () => getBooksByAuthor(value),
    title: () => getBooksByTitle(value),
    review: () => getBookReview(value)
  };
  if (!actions[operation]) {
    console.log('Usage: node router/general.js all | isbn <id> | author <name> | title <title> | review <id>');
    process.exit(1);
  }
  actions[operation]().then((data) => console.log(JSON.stringify(data, null, 2)))
    .catch((error) => {
      console.error(error.response ? error.response.data : error.message);
      process.exit(1);
    });
}
