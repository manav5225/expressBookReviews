const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'access';

app.use(express.json());

app.use('/customer', session({
  secret: process.env.SESSION_SECRET || 'fingerprint_customer',
  resave: false,
  saveUninitialized: false
}));

app.use('/customer/auth/*', function auth(req, res, next) {
  const token = req.session.authorization &&
                req.session.authorization.accessToken;

  if (!token) {
    return res.status(401).json({
      message: 'User not logged in'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: 'User not authenticated'
      });
    }

    req.user = user;
    next();
  });
});

// Customer routes
app.use('/customer', customer_routes);

// Root login route required for Q8
app.use('/', customer_routes);

// General book routes
app.use('/', genl_routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;