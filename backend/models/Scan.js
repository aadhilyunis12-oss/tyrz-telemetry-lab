const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.Mixed,
        index: true,
        required: true
    },
    username: {
        type: String,
        default: ""
    },
    userEmail: {
        type: String,
        default: "pilot@ferrari.io"
    },
    imageUrl: {
        type: String,
        default: ""
    },
    treadDepthMm: {
        type: Number,
        required: true
    },
    remainingKm: {
        type: Number,
        required: true
    },
    safe: {
        type: Boolean,
        required: true
    },
    thresholdMm: {
        type: Number,
        default: 1.6
    },
    condition: {
        type: String,
        default: "🟢 Good"
    },
    confidence: {
        type: Number,
        default: 0.92
    },
    metadata: {
        tireMake: { type: String, default: "Pirelli P Zero" },
        tireModel: { type: String, default: "F40 Corsa" },
        tireSize: { type: String, default: "245/40 ZR17" },
        position: { type: String, default: "FL" },
        vehicleType: { type: String, default: "Car" },
        vehicleModel: { type: String, default: "Ferrari F40" },
        psi: { type: Number, default: 32 },
        odometerKm: { type: Number, default: 28500 },
        referenceDetected: { type: Boolean, default: true },
        calibrationFactor: { type: Number, default: 0.14 }
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Database-level compound index for fast, isolated user history retrieval
scanSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model("Scan", scanSchema);
