const customerCartModel = require('../../Model/Admin/Addorder');
const ProductModel = require('../../Model/Admin/Addproduct');
const CouponModel = require("../../Model/Admin/Coupon");
const { default: mongoose } = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { default: axios } = require("axios");
const Wallet = require("../../Model/User/Wallet");
const CartModel = require('../../Model/User/Cart')


async function sendorderwhatsapp(oderid, user, mobile, slote, location) {
  try {
    const payload = {
      "apiKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTJkNGI3ODU0MGZhN2FmOTQ1NzM5ZCIsIm5hbWUiOiJDSEVGIFNUVURJTyBJTk5PVkFUSU9OUyIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2NzUyZDRiNzg1NDBmYTdhZjk0NTczOTciLCJhY3RpdmVQbGFuIjoiQkFTSUNfTU9OVEhMWSIsImlhdCI6MTczMzQ4MTY1NX0.HMTWJFXWW7I0KG8U24jYvY9CUMEEl0tP1W-2X18GnDI",
      "campaignName": "order_successful",
      "destination": `91${mobile}`,
      "userName": "CHEF STUDIO INNOVATIONS",
      "templateParams": [
        `${oderid}`,
        `${slote}`,
        `${location}`,
        "https://dailydish.in/orders"
      ],
      "source": "new-landing-page form",
      "media": {},
      "buttons": [],
      "carouselCards": [],
      "location": {},
      "paramsFallbackValue": {
        "FirstName": "user"
      }
    }

    let data = await axios.post('https://backend.aisensy.com/campaign/t1/api/v2', payload);
    if (!data) {
      console.log("Can not send sms")
    } else {
      console.log("successfully send sms", mobile)
    }

  } catch (error) {
    console.log("Whats app send sms error", error)
  }
}

async function sendordSuccessfull(oderid, mobile) {
  try {
    const payload = {
      "apiKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTJkNGI3ODU0MGZhN2FmOTQ1NzM5ZCIsIm5hbWUiOiJDSEVGIFNUVURJTyBJTk5PVkFUSU9OUyIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2NzUyZDRiNzg1NDBmYTdhZjk0NTczOTciLCJhY3RpdmVQbGFuIjoiQkFTSUNfTU9OVEhMWSIsImlhdCI6MTczMzQ4MTY1NX0.HMTWJFXWW7I0KG8U24jYvY9CUMEEl0tP1W-2X18GnDI",
      "campaignName": "DeliverySuccessful",
      "destination": `91${mobile}`,
      "userName": "CHEF STUDIO INNOVATIONS",
      "templateParams": [
        oderid
      ],
      "source": "new-landing-page form",
      "media": {},
      "buttons": [],
      "carouselCards": [],
      "location": {},
      "paramsFallbackValue": {
        "FirstName": "user"
      }
    }

    let data = await axios.post('https://backend.aisensy.com/campaign/t1/api/v2', payload);
    if (!data) {
      console.log("Can not send sms")
    } else {
      console.log("successfully send sms", mobile)
    }

  } catch (error) {
    console.log("Whats app send sms error", error)
  }
}

class customerCart {

  async addfoodorder(req, res) {
    let {
      customerId,
      allProduct,
      Placedon,
      delivarylocation,
      username,
      Mobilenumber,
      paymentmethod,
      delivarytype,
      payid,
      addressline,
      subTotal,
      allTotal,
      foodtotal,
      tax,
      slot,
      ordertype,
      orderdelivarytype,
      orderId,
      orderstatus,
      approximatetime,
      Cutlery,
      deliveryMethod,
      apartment,
      prefixcode,
      orderid,
      couponId,
      coupon,
      status,
      discountWallet,
      cartId,
      cart_id,
    } = req.body;

    // console.log("deli",deliveryMethod)

    let check = await customerCartModel.findOne({ Mobilenumber: Mobilenumber, orderid: orderid, slot: slot });
    if (check) return res.status(200).json({ error: "Your order already exits" });

    try {
      let newOrder = new customerCartModel({
        customerId,
        allProduct,
        Placedon,
        delivarylocation,
        username,
        Mobilenumber,
        paymentmethod,
        delivarytype,
        payid,
        addressline,
        subTotal,
        allTotal,
        orderstatus,
        foodtotal,
        tax,
        slot,
        ordertype,
        Cutlery,
        orderdelivarytype,
        approximatetime,
        orderId: uuidv4(),
        deliveryMethod,
        apartment,
        prefixcode,
        orderid,
        couponId,
        coupon,
        status, cartId,
        discountWallet,
        cart_id,
      });

      if (!customerId) {
        return res.status(501).json({ error: "Please Login" });
      } else {
        let check = await newOrder.save();
        if (check) {
          sendorderwhatsapp(check?.orderid, username, Mobilenumber, slot, delivarylocation)

          if (customerId) {
            await CartModel.findOneAndUpdate({ userId: customerId, status: "Added" }, { $set: { status: "COMPLETED" } })
          }
          //   if(couponId){
          //         let coponData=await CouponModel.find({couponName:couponId?.toLowerCase()});
          //         let check=coponData.applyUser.find((ele)=>ele?.MobileNumber==Mobilenumber);

          //         coponData.applyUser.push({
          //              Name:username,
          //              MobileNumber:Mobilenumber
          //         });
          //         coponData.save();
          //   }

          if (discountWallet) {

            // Find or create wallet
            let wallet = await Wallet.findOne({ userId: customerId });
            if (wallet) {
              // Add transaction
              wallet.transactions.push({
                amount: discountWallet,
                type: "debit",
                description: `Applied to order #${check?.orderid}`,
                isFreeCash: false,
                expiryDate: null,
              });

              // Update balance
              wallet.balance -= Number(discountWallet);
              wallet.updatedAt = Date.now();

              await wallet.save();
            }

          }

          if (couponId) {
            // Find all coupon data with the provided couponName
            let coponData = await CouponModel.find({ couponName: couponId?.toLowerCase() });

            // Flag to track if the mobile number was added
            let mobileAdded = false;

            // Iterate through each coupon data
            for (let coupon of coponData) {
              // Check if the MobileNumber already exists in applyUser
              let userExists = coupon.applyUser.find((ele) => ele?.MobileNumber === Mobilenumber);

              if (!userExists) {
                // If MobileNumber does not exist, push the new user data
                coupon.applyUser.push({
                  Name: username,
                  MobileNumber: Mobilenumber,
                });

                // Save the updated coupon data
                await coupon.save();

                mobileAdded = true;
                break; // Stop processing further coupons
              }
            }

            if (!mobileAdded) {
              console.log('Mobile number already exists in all matching coupons.');
            } else {
              console.log('Mobile number added to a coupon successfully.');
            }
          }


        }
        // Update the stock for each product in the order
        for (let item of allProduct) {
          const product = await ProductModel.findById(item.foodItemId);
          if (product) {
            product.Remainingstock -= item.quantity;

            // Check if Remainingstock and totalstock are equal
            // if (product.Remainingstock >= product.totalstock) {
            //   product.blocked = true;
            // }

            await product.save();
          }
        }


        return res.status(200).json({ success: "Order placed and stock updated" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error", error });
    }
  }



  async getfoodorder(req, res) {
    try {
      const { customerId } = req.params.id;

      // Find all orders for the given customerId
      const orders = await customerCartModel.find({ customerId }).populate("foodItemId");

      if (orders.length === 0) {
        return res.status(404).json({ message: "No orders found for this customer." });
      }

      res.status(200).json({
        message: "Orders retrieved successfully",
        orders,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve orders", error });
    }
  }

  // Get all orders for a specific user by userId
  async getfoodorderId(req, res) {
    try {
      const { orderId } = req.params;

      // Find the order by orderId
      const order = await customerCartModel.findOne({ orderId }).populate("allProduct.foodItemId");

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.status(200).json({
        message: "Order retrieved successfully",
        order,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve order", error });
    }
  }

  async getorderNotRatedByUserID(req, res) {
    try {
      const { customerId } = req.params;

      // Find the order by orderId
      const order = await customerCartModel.findOne({ customerId: customerId, ratted: false, status: "Delivered" }).populate("allProduct.foodItemId");

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.status(200).json({
        message: "Order retrieved successfully",
        order,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve order", error });
    }
  }


  async makeRateOfOrder(req, res) {
    try {
      let { id, rate, comement } = req.body;
      if (!id) return res.status(400).json({ error: "Order id is required" })
      let data = await customerCartModel.findById(id);
      if (!data) return res.status(400).json({ error: "Order not found" });
      data.rate = rate;
      data.ratted = true;
      
      if (comement) {
        data.comement = comement
      }
      data = await data.save()

      return res.status(200).json({ data: data, message: "Successfully rated" })
    } catch (error) {
      console.log(error)
    }
  }

  async getallorders(req, res) {
    let order = await customerCartModel.find({}).populate("allProduct.foodItemId");
    if (order) {
      return res.status(200).json({ order: order });
    } else {
      return res.status(500).json({ error: "something went wrong" });
    }
  }

  async getallordersbyUserId(req, res) {
    let id = req.params.id
    let order = await customerCartModel.find({ customerId: id }).sort({ _id: -1 }).populate("allProduct.foodItemId");
    if (order) {
      return res.status(200).json({ order: order });
    } else {
      return res.status(500).json({ error: "something went wrong" });
    }
  }

  // Delete a specific order by orderId
  async deletefoodorder(req, res) {
    let orderid = req.params.id;

    try {
      const data = await customerCartModel.findOneAndDelete({ _id: orderid });

      if (!data) {
        return res.status(403).json({
          error: "Cannot find the order",
        });
      }

      return res.json({ success: "Deleted Successfully" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params; // Order ID
      const { newStatus, reasonforcancel } = req.body; // New status from request body

      // Validate status
      const validStatuses = [
        "inprocess",
        "Cooking",
        "Packing",
        "Ontheway",
        "Delivered",
        "Undelivered",
        "Returned",
        "Cancelled",
      ];
      if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // Find the order by ID
      const order = await customerCartModel.findById(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (newStatus == "Delivered") {
        sendordSuccessfull(order?.orderid, order?.Mobilenumber)
      }
      // Update the status and reason for cancellation
      order.status = newStatus;
      order.reasonforcancel = reasonforcancel;

      // If newStatus is 'Delivered', automatically update orderstatus to 'Delivered'
      if (newStatus === "Delivered") {
        order.orderstatus = "Delivered";
      }

      // Save the updated order
      await order.save();

      // Respond with the updated order details
      res.status(200).json(order);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }


}

const customerCartController = new customerCart();
module.exports = customerCartController;