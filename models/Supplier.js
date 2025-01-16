// models/Supplier.js
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    Cod: { 
        type: String, 
        required: [true, 'Il codice fornitore è obbligatorio'],
        unique: true,
        trim: true
    },
    Denominazione: { 
        type: String, 
        required: [true, 'La denominazione è obbligatoria'],
        trim: true
    },
    Citta: { 
        type: String, 
        required: [true, 'La città è obbligatoria'],
        trim: true
    },
    Prov: { 
        type: String, 
        required: [true, 'La provincia è obbligatoria'],
        trim: true,
        uppercase: true,
        minLength: [2, 'La provincia deve essere di 2 caratteri'],
        maxLength: [2, 'La provincia deve essere di 2 caratteri']
    },
    PartitaIva: { 
        type: String, 
        required: [true, 'La partita IVA è obbligatoria'],
        unique: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^\d{11}$/.test(v);
            },
            message: props => `${props.value} non è una partita IVA valida!`
        }
    }
}, {
    timestamps: true
});

// Indici
supplierSchema.index({ Denominazione: 'text' });
supplierSchema.index({ PartitaIva: 1 });
supplierSchema.index({ Cod: 1 });

module.exports = mongoose.model('Supplier', supplierSchema);