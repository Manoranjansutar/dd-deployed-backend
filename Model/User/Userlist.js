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

    addresses: [
    {
      locationType: { type: String, enum: ['home', 'pg/apartment', 'work', 'school'] },
      homeAddress: { type: String },
      workAddress: { type: String },
      pgAddress: { type: String },
      schoolAddress: { type: String },
    }
  ],

studentInformation: {
  studentName: { type: String },
  studentClass: { type: String },
  studentSection: { type: String },
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
    },
    companyId:{
      type: String,
    },
    employeeId:{
      type: String,
    },
    companyName:{
      type: String,
    },
    subsidyAmount:{
      type: Number,
      default:0
    },
    totalOrder:{
      type:Number,
      default:0
    },
    
    status:{
      type: String,
      default:"Normal",
    }
  },
  { timestamps: true }
);

const CustomerModel = mongoose.model("Customer", Customer);
module.exports = CustomerModel;
