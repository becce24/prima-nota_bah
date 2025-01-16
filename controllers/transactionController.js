// controllers/transactionController.js
const Transaction = require('../models/Transaction');
const Client = require('../models/Client');
const Supplier = require('../models/Supplier');

const transactionController = {
    // GET tutte le transazioni
    getAllTransactions: async (req, res) => {
        try {
            const transactions = await Transaction.find()
                .sort({ date: -1 })
                .limit(100);

            res.render('index', { 
                transactions,
                currentDate: new Date().toISOString().split('T')[0],
                pageTitle: 'Gestione Prima Nota',
                scriptName: 'transaction'
            });
        } catch (error) {
            console.error('Errore nel recupero delle transazioni:', error);
            res.status(500).render('error', {
                error: 'Errore nel recupero delle transazioni.',
                pageTitle: 'Errore'
            });
        }
    },

    // GET suggerimenti clienti
    getClientSuggestions: async (req, res) => {
        try {
            const search = req.query.search || '';
            const clients = await Client.find({
                Denominazione: { $regex: search, $options: 'i' }
            })
            .limit(10)
            .select('Denominazione');
            
            res.json(clients);
        } catch (error) {
            console.error('Errore ricerca clienti:', error);
            res.status(500).json({ error: 'Errore nella ricerca dei clienti' });
        }
    },

    // GET suggerimenti fornitori
    getSupplierSuggestions: async (req, res) => {
        try {
            const search = req.query.search || '';
            const suppliers = await Supplier.find({
                Denominazione: { $regex: search, $options: 'i' }
            })
            .limit(10)
            .select('Denominazione');
            
            res.json(suppliers);
        } catch (error) {
            console.error('Errore ricerca fornitori:', error);
            res.status(500).json({ error: 'Errore nella ricerca dei fornitori' });
        }
    },

    // POST aggiunta transazione
    addTransaction: async (req, res) => {
        try {
            const { date, documentNumber, description, amount, type, bank, client, supplier } = req.body;
            
            // Validazioni
            if (!date || !documentNumber || !amount || !type || !bank) {
                throw new Error('Tutti i campi obbligatori devono essere compilati');
            }

            // Formattazione importo
            const formattedAmount = parseFloat(amount.replace(',', '.'));
            if (isNaN(formattedAmount) || formattedAmount <= 0) {
                throw new Error('Importo non valido');
            }

            // Validazione tipo e relativi campi
            if (type === 'incasso' && !client) {
                throw new Error('Il cliente è obbligatorio per gli incassi');
            }
            if (type === 'pagamento' && !supplier) {
                throw new Error('Il fornitore è obbligatorio per i pagamenti');
            }

            const transaction = new Transaction({
                date,
                documentNumber,
                description: description || '',
                amount: formattedAmount,
                type,
                bank,
                client: client || null,
                supplier: supplier || null
            });

            await transaction.save();
            res.redirect('/transactions');
        } catch (error) {
            console.error('Errore nell\'aggiunta della transazione:', error);
            const transactions = await Transaction.find().sort({ date: -1 });
            res.render('index', {
                error: error.message || 'Errore nell\'aggiunta della transazione',
                transactions,
                currentDate: new Date().toISOString().split('T')[0],
                scriptName: 'transaction',
                pageTitle: 'Gestione Prima Nota',
                formData: req.body
            });
        }
    },

    // POST eliminazione transazione
    deleteTransaction: async (req, res) => {
        try {
            const transaction = await Transaction.findById(req.params.id);
            if (!transaction) {
                throw new Error('Transazione non trovata');
            }

            await Transaction.findByIdAndDelete(req.params.id);
            res.redirect('/transactions');
        } catch (error) {
            console.error('Errore nella cancellazione:', error);
            res.status(400).render('error', {
                error: error.message || 'Errore nella cancellazione della transazione',
                pageTitle: 'Errore'
            });
        }
    }
};

module.exports = transactionController;