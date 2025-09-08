const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema.Types;

const Addcorporateaddress = new Schema({
    Apartmentname: {
        type: String,
    },
    logo: {
        type: String,
    },
    mobile:{
        type: Number
    },
    Address: {
        type: String,
    },
    pincode: {
        type: Number,
    },
    apartmentdelivaryprice: {
        type: Number,
    },
    approximatetime: {
        type: String,
    },
    prefixcode: {
        type: String,
    },
    otp:{
        type: Number
    },
    // New optional time slots fields
    lunchSlots: {
        type: [{
            time: {
                type: String,
                required: true
            },
            active: {
                type: Boolean,
                default: true
            }
        }],
        default: []
    },
    dinnerSlots: {
        type: [{
            time: {
                type: String,
                required: true
            },
            active: {
                type: Boolean,
                default: true
            }
        }],
        default: []
    },
    status: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const userAddcorporateaddress = mongoose.model("Addcorporateaddress", Addcorporateaddress);
module.exports = userAddcorporateaddress;