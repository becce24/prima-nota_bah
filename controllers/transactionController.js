// controllers/transactionController.js
const Transaction = require('../models/Transaction');





const transactionController = {
  
    // GET - Mostra tutte le transazioni
    getAllTransactions: async (req, res) => {
        try {
            // Recupera tutte le transazioni ordinate per data
            const transactions = await Transaction.find().sort({ date: -1 });
            const currentDate = new Date().toISOString().split('T')[0];

            // Renderizza la pagina con i dati
            res.render('index', { 
                transactions, 
                currentDate,
                scriptName: 'transaction',
                pageTitle: 'Gestione Transazioni'
            });
        } catch (error) {
            console.error('Errore nel recupero delle transazioni:', error);
            res.status(500).render('error', {
                error: 'Errore nel recupero delle transazioni.',
                pageTitle: 'Errore'
            });
        }
    },

    // POST - Aggiunge una nuova transazione
    addTransaction: async (req, res) => {
        try {
            console.log('Dati ricevuti:', req.body);

            const { date, documentNumber, description, amount, type, bank, client, supplier } = req.body;

            // Log dei dati ricevuti
            console.log('Dati ricevuti:', {
                date,
                documentNumber,
                description,
                amount,
                type,
                bank,
                client,
                supplier
            });

            // Validazione dei campi
            const validationErrors = [];
            if (!date) validationErrors.push('La data è obbligatoria');
            if (!documentNumber) validationErrors.push('Il numero documento è obbligatorio');
            if (!amount) validationErrors.push('L\'importo è obbligatorio');
            if (!type) validationErrors.push('Il tipo è obbligatorio');
            if (!bank) validationErrors.push('La banca è obbligatoria');

            // Validazione specifica per tipo
            if (type === 'incasso' && !client) {
                validationErrors.push('Il cliente è obbligatorio per gli incassi');
            }
            if (type === 'pagamento' && !supplier) {
                validationErrors.push('Il fornitore è obbligatorio per i pagamenti');
            }

            // Se ci sono errori di validazione
            if (validationErrors.length > 0) {
                console.log('Errori di validazione:', validationErrors);
                const transactions = await Transaction.find().sort({ date: -1 });
                return res.render('index', {
                    transactions,
                    currentDate: new Date().toISOString().split('T')[0],
                    scriptName: 'transaction',
                    pageTitle: 'Gestione Transazioni',
                    error: validationErrors.join(', '),
                    formData: req.body // Mantieni i dati inseriti
                });
            }

            // Formattazione dell'importo
            let formattedAmount = amount.replace(/\./g, '').replace(',', '.');
            formattedAmount = parseFloat(formattedAmount);

            if (isNaN(formattedAmount)) {
                throw new Error('Formato importo non valido');
            }

            // Creazione della nuova transazione
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

            console.log('Transazione da salvare:', transaction);

            // Salvataggio nel database
            await transaction.save();
            res.redirect('/transactions');

        } catch (error) {
            console.error('Errore nell\'aggiunta della transazione:', error);
            
            // Recupera le transazioni per il re-render della pagina
            const transactions = await Transaction.find().sort({ date: -1 });
            
            // Renderizza la pagina con l'errore
            res.render('index', {
                error: error.message || 'Errore nell\'aggiunta della transazione',
                transactions,
                currentDate: new Date().toISOString().split('T')[0],
                scriptName: 'transaction',
                pageTitle: 'Gestione Transazioni',
                formData: req.body // Mantieni i dati inseriti
            });
        }
    },

    // POST - Elimina una transazione
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
    },

    // GET - Mostra una singola transazione per la modifica
    getTransaction: async (req, res) => {
        try {
            const transaction = await Transaction.findById(req.params.id);
            if (!transaction) {
                throw new Error('Transazione non trovata');
            }
            
            res.render('edit', {
                transaction,
                scriptName: 'transaction',
                pageTitle: 'Modifica Transazione'
            });
        } catch (error) {
            console.error('Errore nel recupero della transazione:', error);
            res.status(404).render('error', {
                error: error.message || 'Transazione non trovata',
                pageTitle: 'Errore'
            });
        }
    },


    // POST - Aggiorna una transazione esistente
    updateTransaction: async (req, res) => {
        try {
            const { date, documentNumber, description, amount, type, bank, client, supplier } = req.body;
            
            // Validazione
            if (!date || !documentNumber || !amount || !type || !bank) {
                throw new Error('Tutti i campi obbligatori devono essere compilati');
            }

            // Formattazione dell'importo
            let formattedAmount = amount.replace(/\./g, '').replace(',', '.');
            formattedAmount = parseFloat(formattedAmount);

            if (isNaN(formattedAmount)) {
                throw new Error('Formato importo non valido');
            }

            // Validazione tipo transazione e relativi campi
            if (type === 'incasso' && !client) {
                throw new Error('Il cliente è obbligatorio per gli incassi');
            }
            if (type === 'pagamento' && !supplier) {
                throw new Error('Il fornitore è obbligatorio per i pagamenti');
            }

            const updatedTransaction = {
                date,
                documentNumber,
                description: description || '',
                amount: formattedAmount,
                type,
                bank,
                client: client || null,
                supplier: supplier || null
            };

            await Transaction.findByIdAndUpdate(req.params.id, updatedTransaction);
            res.redirect('/transactions');
        } catch (error) {
            console.error('Errore nell\'aggiornamento della transazione:', error);
            res.status(400).render('edit', {
                error: error.message || 'Errore nell\'aggiornamento della transazione',
                transaction: req.body,
                scriptName: 'transaction',
                pageTitle: 'Modifica Transazione'
            });
        }
    },
     // GET - Suggerimenti clienti
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

    // GET - Suggerimenti fornitori
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
    
    
};

module.exports = transactionController;