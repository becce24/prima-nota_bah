
// models/Transaction.js
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  documentNumber: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['incasso', 'pagamento'], required: true },
  bank: { 
    type: String, 
    enum: ['Cassa', 'Banca Veneta (Patavina)', 'Bcc Centro Marca', 'Bcc di Roma', 'Bcc Colli'], 
    required: true 
  },
  client: { type: String, required: false },
  supplier: { type: String, required: false },
});

module.exports = mongoose.model('Transaction', TransactionSchema);