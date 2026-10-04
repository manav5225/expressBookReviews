const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();

const users = [];

const JWT_SECRET = process.env.JWT_SECRET || 'access';

// Check whether username exists
const isValid = (username) => {
  return (
    typeof username === 'string' &&
    username.trim() !== '' &&
    users.some((user) => user.username === username)
  );
};

// Check username and password
const authenticatedUser = (username, password) => {
  return users.some(
    (user) =>
      user.username === username &&
      user.password === password
  );
};


// =============================
// REGISTER USER
// =============================

regd_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  if (isValid(username)) {
    return res.status(409).json({
      message: 'User already exists'
    });
  }

  users.push({
    username,
    password
  });

  return res.status(201).json({
    message: 'User registered successfully'
  });
});


// =============================
// LOGIN
// =============================

regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: 'Invalid username or password'
    });
  }

  const accessToken = jwt.sign(
    { username },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({
    message: 'Login successful',
    accessToken
  });
});


// =============================
// ADD / UPDATE REVIEW
// =============================

regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;
  const review = req.body.review;

  if (!books[isbn]) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  if (typeof review !== 'string' || review.trim() === '') {
    return res.status(400).json({
      message: 'Review is required'
    });
  }

  books[isbn].reviews[username] = review.trim();

  return res.status(200).json({
    message: 'Review added/updated successfully',
    book: books[isbn]
  });
});


// =============================
// DELETE REVIEW
// =============================

regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  if (!books[isbn]) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  if (
    !Object.prototype.hasOwnProperty.call(
      books[isbn].reviews,
      username
    )
  ) {
    return res.status(404).json({
      message: 'Review not found for this user'
    });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: 'Review deleted successfully'
  });
});


// =============================
// EXPORT
// =============================

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.authenticatedUser = authenticatedUser;
module.exports.users = users;