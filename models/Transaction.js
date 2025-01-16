// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    date: { 
        type: Date, 
        required: [true, 'La data è obbligatoria'] 
    },
    documentNumber: { 
        type: String, 
        required: [true, 'Il numero documento è obbligatorio'],
        trim: true 
    },
    description: { 
        type: String, 
        trim: true 
    },
    amount: { 
        type: Number, 
        required: [true, 'L\'importo è obbligatorio'],
        validate: {
            validator: function(v) {
                return v > 0;
            },
            message: 'L\'importo deve essere maggiore di zero'
        }
    },
    type: { 
        type: String, 
        enum: {
            values: ['incasso', 'pagamento'],
            message: 'Tipo non valido'
        },
        required: [true, 'Il tipo è obbligatorio'] 
    },
    bank: { 
        type: String, 
        enum: {
            values: ['Cassa', 'Banca Veneta (Patavina)', 'Bcc Centro Marca', 'Bcc di Roma', 'Bcc Colli'],
            message: 'Banca non valida'
        },
        required: [true, 'La banca è obbligatoria'] 
    },
    client: { 
        type: String,
        required: function() { 
            return this.type === 'incasso';
        }
    },
    supplier: { 
        type: String,
        required: function() { 
            return this.type === 'pagamento';
        }
    }
}, {
    timestamps: true
});

// Indici
transactionSchema.index({ date: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ client: 1 });
transactionSchema.index({ supplier: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);