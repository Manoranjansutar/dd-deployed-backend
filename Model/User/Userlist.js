const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema.Types;
const Customer = new Schema(
  {
    Fname: {
      type: String,
    },

    Mobile: {
      type: Number,
    },

    Email: {
      type: String,
    },
    ApartmentId:{
        type:ObjectId,
        // required:true
    },
    Flatno: {
      type: String,
    },

    otp: {
      type: Number,
    },

    Address: {
      type: String,
    },
  
    profileImage: {
      type: String,
    },

    BlockCustomer: {
      type: Boolean,
      default: true,
    },
    token: {
      type: String,
    },
    Nooforders: {
      type: Number,
    },
    Lastorderdate: {
      type: String,
    },
    lastorderamount: {
      type: Number,
    },
    lastLogin:{
      type:String,
    }
    
  },
  { timestamps: true }
);

const CustomerModel = mongoose.model("Customer", Customer);
module.exports = CustomerModel;
