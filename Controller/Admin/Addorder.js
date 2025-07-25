const customerCartModel = require('../../Model/Admin/Addorder');
const ProductModel = require('../../Model/Admin/Addproduct');
const CouponModel = require("../../Model/Admin/Coupon");
const UserModel = require('../../Model/User/Userlist')
const { default: mongoose } = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { default: axios } = require("axios");
const Wallet = require("../../Model/User/Wallet");
const CartModel = require('../../Model/User/Cart')
const ReportModel = require('../../Model/Admin/OfferReports');

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
      companyId,
      companyName,
      customerType

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
        companyId,
        companyName,
        customerType
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
        // for (let item of allProduct) {

        //   const product = await ProductModel.findById(item.foodItemId);
        //   if (product) {
        //     product.Remainingstock =product.Remainingstock>item.quantity ? product.Remainingstock-item.quantity:0;

        //    product.locationPrice.map((ele)=>{
        //     if(ele.loccationAdreess?.includes(delivarylocation)){
        //         return {
        //             ...ele,
        //             Remainingstock:ele.Remainingstock-item.quantity
        //         }
        //     }else return ele

        //     })

        //     await product.save();
        //   }
        // }
        for (let item of allProduct) {
          const product = await ProductModel.findById(item.foodItemId);
          if (product) {
            // Update main product remaining stock
            product.Remainingstock = product.Remainingstock > item.quantity ?
              product.Remainingstock - item.quantity : 0;

            // Update location-specific remaining stock
            product.locationPrice = product.locationPrice.map((ele) => {
              // Check if any location address matches the delivery location
              const hasMatchingLocation = ele.loccationAdreess?.some(address =>
                address.split(", ")[0] === delivarylocation
              );

              if (hasMatchingLocation) {
                return {
                  ...ele,
                  Remainingstock: ele.Remainingstock > item.quantity ?
                    ele.Remainingstock - item.quantity : 0
                };
              } else {
                return ele;
              }
            });

            await product.save();
          }
        }
        io?.emit("newOrder", { orderid, delivarylocation, allTotal, username })
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
      await UserModel.findOneAndUpdate(
        { _id: customerId },
        { $set: { lastLogin: new Date().toISOString().split('T')[0] } }
      );
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

  async getAllAppartmentOrder(req,res){
    try {
      const apartment=await customerCartModel.find({orderdelivarytype:"apartment"}).populate("allProduct.foodItemId");
      return res.status(200).json({orders:apartment})

    } catch (error) {
      console.log(error);
      
    }
  }

  async getAllOrderCount(req,res){
    try {
      const order = await customerCartModel.find({orderdelivarytype:"apartment"}).count();
      const corporate=await customerCartModel.find({orderdelivarytype:"corporate"}).count();
      const user=await UserModel.find().count()
      return res.status(200).json({apartment:order,corporate:corporate,user:user})
    } catch (error) {
      console.log(error);
      
    }
  }
// Backend API Controller
async getallordersfilter(req, res) {
  try {
    const {
      page = 1,
      limit = 6,
      search = '',
      startDate,
      endDate,
      slot,
      locations,
      status,
      orderType = 'corporate',
      hub // New hub filter parameter
    } = req.query;

    // Build filter object
    let filter = {};
    
    // Filter by order delivery type
    if (orderType) {
      filter.orderdelivarytype = orderType;
    }

    // Hub filter - assuming you have a hub field in your model
    if (hub && hub !== 'all') {
      filter.hub = hub;
    }

    // Status filter
    if (status && status !== '') {
      filter.status = status;
    }

    // Slot filter
    if (slot && slot !== '') {
      filter.slot = slot;
    }

    // Location filter (multiple locations)
    if (locations) {
      const locationArray = Array.isArray(locations) ? locations : [locations];
      filter.delivarylocation = { $in: locationArray };
    }

    // Date range filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      filter.createdAt = {
        $gte: start,
        $lte: end
      };
    }

    // Search filter - searches across multiple fields
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
    
      const orFilters = [
        { username: searchRegex },
        { orderid: searchRegex },
        { delivarylocation: searchRegex },
        { apartment: searchRegex },
        { status: searchRegex },
        { paymentmethod: searchRegex }
      ];
    
      // अगर मोबाइल नंबर है और वो pure number है तो उसी को number के रूप में चेक करो
      if (!isNaN(search.trim())) {
        orFilters.push({ Mobilenumber: Number(search.trim()) });
      }
    
      filter.$or = orFilters;
    }
    
    // console.log("filter",filter);
    

    // Calculate pagination
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Get total count for pagination
    const totalCount = await customerCartModel.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / pageSize);

    // Fetch orders with pagination and populate
    const orders = await customerCartModel
      .find(filter)
      .populate("allProduct.foodItemId")
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(pageSize);

    // Get unique values for filters (for today's orders)
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todayFilter = {
      ...filter,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    };

    // Get unique slots for today
    const uniqueSlots = await customerCartModel.distinct('slot', todayFilter);
    
    // Get unique locations for today
    const uniqueLocations = await customerCartModel.distinct('delivarylocation', todayFilter);
    
    // Get unique hubs
    const uniqueHubs = await customerCartModel.distinct('hub', { orderdelivarytype: orderType });

    return res.status(200).json({
      success: true,
      data: {
        orders: orders,
        pagination: {
          currentPage: pageNumber,
          totalPages: totalPages,
          totalCount: totalCount,
          pageSize: pageSize,
          hasNext: pageNumber < totalPages,
          hasPrev: pageNumber > 1
        },
        filters: {
          slots: uniqueSlots,
          locations: uniqueLocations,
          hubs: uniqueHubs
        }
      }
    });

  } catch (error) {
    console.error('Error in getallorders:', error);
    return res.status(500).json({ 
      success: false,
      error: "Something went wrong",
      message: error.message 
    });
  }
}
  

async exportExcelOrder (req,res){
  try {
    const {
      search = '',
      startDate,
      endDate,
      slot,
      locations,
      status,
      orderType = 'corporate',
      hub // New hub filter parameter
    } = req.query;

    // Build filter object
    let filter = {};
    
    // Filter by order delivery type
    if (orderType) {
      filter.orderdelivarytype = orderType;
    }

    // Hub filter - assuming you have a hub field in your model
    if (hub && hub !== 'all') {
      filter.hub = hub;
    }

    // Status filter
    if (status && status !== '') {
      filter.status = status;
    }

    // Slot filter
    if (slot && slot !== '') {
      filter.slot = slot;
    }

    // Location filter (multiple locations)
    if (locations) {
      const locationArray = Array.isArray(locations) ? locations : [locations];
      filter.delivarylocation = { $in: locationArray };
    }

    // Date range filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      filter.createdAt = {
        $gte: start,
        $lte: end
      };
    }

    // Search filter - searches across multiple fields
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
    
      const orFilters = [
        { username: searchRegex },
        { orderid: searchRegex },
        { delivarylocation: searchRegex },
        { apartment: searchRegex },
        { status: searchRegex },
        { paymentmethod: searchRegex }
      ];
    
      // अगर मोबाइल नंबर है और वो pure number है तो उसी को number के रूप में चेक करो
      if (!isNaN(search.trim())) {
        orFilters.push({ Mobilenumber: Number(search.trim()) });
      }
    
      filter.$or = orFilters;
    }

    const orders = await customerCartModel
      .find(filter)
      .populate("allProduct.foodItemId")
      .sort({ createdAt: -1 }) // Sort by newest first


    return res.status(200).json({
      success: true,
      
        orders: orders,
 
    });

  } catch (error) {
    console.error('Error in getallorders:', error);
    return res.status(500).json({ 
      success: false,
      error: "Something went wrong",
      message: error.message 
    });
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

  async updateMultipleOrderStatus(req, res) {
    try {
      const { status, locations, slot, reasonforcancel } = req.body;

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
        "On the way"
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // Validate locations array
      if (!locations || !Array.isArray(locations) || locations.length === 0) {
        return res.status(400).json({ message: "Locations array is required" });
      }

      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      // Build query for today's orders in specified locations
      const query = {
        delivarylocation: { $in: locations },
        createdAt: {
          $gte: startOfDay,
          $lt: endOfDay
        },
        status: { $ne: status }
      };

      // Add slot filter if provided
      if (slot) {
        query.slot = slot;
      }

      // Find orders matching the criteria
      const orders = await customerCartModel.find(query);

      if (orders.length === 0) {
        return res.status(404).json({
          message: "No orders found for the specified criteria",
          criteria: { locations, date: today.toDateString(), slot }
        });
      }

      // Update all matching orders
      const updateData = {
        status: status,
        reasonforcancel: reasonforcancel || null,

      };

      // If status is 'Delivered', also update orderstatus
      if (status === "Delivered") {
        updateData.orderstatus = "Delivered";

      }

      const updateResult = await customerCartModel.updateMany(query, updateData);

      // Send success notifications for delivered orders
      if (status === "Delivered") {
        for (const order of orders) {
          try {
            await sendordSuccessfull(order?.orderid, order?.Mobilenumber);
          } catch (notificationError) {
            console.error(`Failed to send notification for order ${order.orderid}:`, notificationError);
          }
        }
      }

      // Return response with update details
      res.status(200).json({
        message: "Orders updated successfully",
        updatedCount: updateResult.modifiedCount,
        totalFound: orders.length,
        criteria: {
          status,
          locations,
          slot,
          date: today.toDateString()
        },
        updatedOrders: orders.map(order => ({
          orderId: order.orderid,
          id: order._id,
          location: order.location,
          previousStatus: order.status
        }))
      });

    } catch (error) {
      console.error("Error in updateMultipleOrderStatus:", error);
      res.status(500).json({ message: "Server error", error: error.message });
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
        "On the way"
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

  async getAllOrderByCompany(req, res) {
    try {
      const { companyId } = req.params;

      const orders = await customerCartModel.find({ companyId: companyId }).populate("customerId").populate("allProduct.foodItemId").sort({ _id: -1 });


      return res.status(200).json({
        message: "Orders retrieved successfully",
        orders,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve orders", error });
    }
  }

  // static authPacker(req, res, next) {
  //   const token = req.headers.authorization?.split("Bearer ")[1];
  //   if (!token) {
  //     return res.status(401).json({ error: "Unauthorized: No token provided" });
  //   }
  //   // Mock verification (replace with JWT or your auth mechanism)
  //   req.packer = { packerId: "packer123", username: "JohnPacker" }; // Example
  //   next();
  // }

  // GET /api/packer/orders - Fetch orders assigned to the packer, filtered by location


  // async getPackerOrders(req, res) {
  //   try {

  //     const { location } = req.query; // Get location from query parameter

  //     let query = {

  //       status: { $in: ["Pending", "Partially Packed", "Packed", "Cooking", "Packing"] },
  //     };

  //     const orders = await customerCartModel
  //       .find(query)
  //       .populate("allProduct.foodItemId")
  //       .sort({ createdAt: -1 });

  //     if (!orders.length) {
  //       return res.status(404).json({ message: "No orders found for this packer" });
  //     }

  //     return res.status(200).json(orders);
  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).json({ error: "Internal Server Error", details: error.message });
  //   }
  // }
  async getPackerOrders(req, res) {
    try {

      // Get today's date range
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // Query only today's orders with specific statuses
      let query = {
        status: { $in: ["Pending", "Partially Packed", "Packed", "Cooking", "Packing"] },
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      };

      const orders = await customerCartModel
        .find(query)
        .populate("allProduct.foodItemId")
      // .sort({ createdAt: -1 });

      if (!orders.length) {
        return res.status(404).json({ message: "No orders found for today" });
      }

      return res.status(200).json(orders);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  }

  // PUT /api/packer/orders/:id - Update order details (status, bagNo, driver, items, etc.)
  async updatePackerOrder(req, res) {
    try {
      const {
        id,
        status,
        bagNo,
        driver,
        reason,
        packBefore,
        allProduct,
        timeLeft,
        packer,
        _id,
        packername, packeTime
      } = req.body;


      // Find the order
      let order = await customerCartModel.findById(_id).populate("allProduct.foodItemId");
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Verify packer authorization
      // if (order.packer && order.packer !== packer) {
      //   return res.status(403).json({ message: "Not authorized to update this order" });
      // }

      // Validate status
      const validStatuses = [
        "Pending",
        "Partially Packed",
        "Packed",
        "Cooking",
        "Packing",
        "Ontheway",
        "Delivered",
        "Undelivered",
        "Returned",
        "Cancelled",
      ];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // Update fields
      if (status) order.status = status;
      if (bagNo) order.bagNo = bagNo;
      if (driver) order.driver = driver;
      if (reason) order.reason = reason;
      if (packBefore) order.packBefore = packBefore;
      if (timeLeft) order.timeLeft = timeLeft;
      if (packeTime) order.packeTime = packeTime
      if (allProduct && Array.isArray(allProduct)) {
        order.allProduct = allProduct.map((item) => ({
          ...item,
          packed: item.packed || false,
          missing: item.missing || false,
        }));
      }
      if (packer) {
        order.packer = packer; // Ensure packer is assigned
      }
      if (packername) {
        order.packername = packername
      }
      // console.log("rewww",req.body);

      // Save updated order
      order = await order.save();

      return res.status(200).json({
        message: "Order updated successfully",
        order,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  }

  // GET /api/packer/locations - Fetch available locations
  async getLocations(req, res) {
    try {
      const locations = ["Sector 10", "Sector 12", "Sector 15", "Sector 20"];
      return res.status(200).json(locations);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  }

  // GET /api/packer/drivers - Fetch available drivers
  async getDrivers(req, res) {
    try {
      const drivers = ["Ravi", "Kartik", "Suresh", "Ramesh"];
      return res.status(200).json(drivers);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  }

}

const customerCartController = new customerCart();
module.exports = customerCartController;