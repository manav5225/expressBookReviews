const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (users.some((u) => u.username === username)) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', (req, res) => {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).send(JSON.stringify(book, null, 4));
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();
  const result = Object.keys(books)
    .filter((isbn) => books[isbn].author.toLowerCase() === author)
    .map((isbn) => ({ isbn, ...books[isbn] }));

  if (result.length === 0) {
    return res.status(404).json({ message: "No books found for this author" });
  }
  return res.status(200).send(JSON.stringify(result, null, 4));
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();
  const result = Object.keys(books)
    .filter((isbn) => books[isbn].title.toLowerCase() === title)
    .map((isbn) => ({ isbn, ...books[isbn] }));

  if (result.length === 0) {
    return res.status(404).json({ message: "No books found with this title" });
  }
  return res.status(200).send(JSON.stringify(result, null, 4));
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).send(JSON.stringify(book.reviews, null, 4));
});

// ---- Axios client functions (for Task 11) ----
const BASE = 'http://localhost:5000';

const getAllBooks = async () => {
  try {
    const res = await axios.get(`${BASE}/`);
    return res.data;
  } catch (err) {
    console.error('Error fetching books:', err.message);
  }
};

const getBookByISBN = async (isbn) => {
  try {
    const res = await axios.get(`${BASE}/isbn/${isbn}`);
    return res.data;
  } catch (err) {
    console.error('Error fetching by ISBN:', err.message);
  }
};

const getBooksByAuthor = async (author) => {
  try {
    const res = await axios.get(`${BASE}/author/${encodeURIComponent(author)}`);
    return res.data;
  } catch (err) {
    console.error('Error fetching by author:', err.message);
  }
};

const getBooksByTitle = async (title) => {
  try {
    const res = await axios.get(`${BASE}/title/${encodeURIComponent(title)}`);
    return res.data;
  } catch (err) {
    console.error('Error fetching by title:', err.message);
  }
};

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;