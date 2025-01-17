// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Route principali
router.get('/', transactionController.getAllTransactions);
router.get('/new', transactionController.getTransactionForm);
router.post('/add', transactionController.addTransaction);
router.post('/delete/:id', transactionController.deleteTransaction);

// Route per i suggerimenti
router.get('/clients', transactionController.getClientSuggestions);
router.get('/suppliers', transactionController.getSupplierSuggestions);

module.exports = router;