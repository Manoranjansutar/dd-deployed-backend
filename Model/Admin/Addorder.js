const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const customerorderSchema = new mongoose.Schema(
  {
    customerId: {
      type: ObjectId,
      ref: "Customer",
    },
    cartId: {
      type: String,
    },
    cart_id: {
      type: String,
    },
    allProduct: [
      {
        foodItemId: {
          type: ObjectId,
          ref: "Fooditem",
        },
        totalPrice: {
          type: Number,
        },
        quantity: {
          type: Number,
        },
      },
    ],
    rate: {
      type: Number,
      default: 0
    },
    ratted: {
      type: Boolean,
      default: false
    },
    comement:{
      type:String
    },
    Cutlery: {
      type: String,
    },
    Placedon: {
      type: String,
    },
    couponId: {
      type: String
    },
    coupon: {
      type: Number,
      default: 0
    },
    discountWallet: {
      type: Number,
      default: 0
    },
    slot: {
      type: String,
    },
    ordertype: {
      type: String,
    },
    orderdelivarytype: {
      type: String,
    },
    approximatetime: {
      type: String,
    },
    delivarylocation: {
      type: String,
    },
    username: {
      type: String,
    },
    Mobilenumber: {
      type: Number,
    },
    paymentmethod: {
      type: String,
    },
    orderstatus: {
      type: String,
    },
    delivarytype: {
      type: Number,
    },
    payid: {
      type: String,
    },

    addressline: {
      type: String,
      // required: true,
    },

    subTotal: {
      type: Number,

    },
    allTotal: {
      type: Number,

    },
    foodtotal: {
      type: Number,

    },
    apartment: {
      type: String,
    },
    prefixcode: {
      type: String,
    },
    orderid: {
      type: String,
    },
    tax: {
      type: Number,
    },
    deliveryMethod: {
      type: String,
    },
    orderId: {
      type: String,
    },
    reasonforcancel: {
      type: String,
    },
    companyId:{
      type: String,
     
    },
    companyName:{
      type: String,
      default: "Normal User",
    },
    status: {
      type: String,
      default: "Cooking",
      enum: [
        "inprocess",
        "Cooking",
        "Packing",
        "Ontheway",
        "Delivered",
        "Undelivered",
        "Returned",
        "Cancelled",
      ],
    },
  },
  { timestamps: true }
);

const customerorderModel = mongoose.model("Foodorder", customerorderSchema);
module.exports = customerorderModel;
