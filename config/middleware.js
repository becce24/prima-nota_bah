// config/middleware.js
const express = require('express');
const cors = require('cors');
const path = require('path');

module.exports = (app) => {
  // Middleware di base
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, '../public')));
  
  // Error handling
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
      message: 'Si è verificato un errore',
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  });
};
