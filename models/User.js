// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username è obbligatorio'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password è obbligatoria'],
        minlength: 6,
        select: false // Nasconde la password di default nelle query
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    active: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true 
});

// Hash password prima del salvataggio
UserSchema.pre('save', async function(next) {
    // Procedi solo se la password è stata modificata
    if (!this.isModified('password')) return next();
    
    try {
        // Genera il salt e hash la password
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Metodo per confrontare le password
UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
};

module.exports = mongoose.model('User', UserSchema);