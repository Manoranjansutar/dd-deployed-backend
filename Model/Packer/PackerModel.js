const mongoose = require('mongoose');

// Packer Schema with auto-generated ID
const packerSchema = new mongoose.Schema({
    packerId: { type: String, unique: true, required: true },
    username: { type: String, required: true, unique: true },
    mobileNumber: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    otp: {
        type: Number
    },
    createdAt: { type: Date, default: Date.now }
});

// Auto-generate packerId (DDP001, DDP002, etc.)
packerSchema.pre('save', async function (next) {
    if (!this.packerId) {
        try {
            const count = await this.constructor.countDocuments();
            this.packerId = `DDP${String(count + 1).padStart(3, '0')}`;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model('Packer', packerSchema);