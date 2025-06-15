const mongoose = require('mongoose');

const hubSchema = new mongoose.Schema({
  hubId: { type: String, },
  hubName: { type: String, required: true, unique: true },
  locations: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now }
});

// Auto-generate hubId (HUB001, HUB002, etc.)
hubSchema.pre('save', async function (next) {
  if (!this.hubId) {
    try {
      const count = await this.constructor.countDocuments();
      this.hubId = `HUB${String(count + 1).padStart(3, '0')}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Hub', hubSchema);