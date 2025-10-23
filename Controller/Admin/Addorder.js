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
const ExcelJS = require('exceljs');
const moment = require('moment');

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

async function saveOrderCount(order){
try {
 
  if(order){
    const allOrder=await customerCartModel.find({customerId:order.customerId}).count();
    order.totalOrder=allOrder||0;
    await order.save()

    const customer=await UserModel.findById(order.customerId);
    if(customer){
      customer.totalOrder=allOrder||0
      await customer.save()
    }

  }

} catch (error) {
  console.log(error);
  
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
          sendorderwhatsapp(check?.orderid, username, Mobilenumber, slot, delivarylocation);
       

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
        if(check){
           saveOrderCount(check)
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
  
      // Update last login date
       UserModel.findOneAndUpdate(
        { _id: customerId },
        { $set: { lastLogin: new Date().toISOString().split('T')[0] } }
      );
  
      // Calculate last week's date
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
  
      // Find order delivered in last week and not rated
      const order = await customerCartModel
        .findOne({
          customerId: customerId,
          ratted: false,
          status: "Delivered",
          createdAt: { $gte: lastWeek }  // only from last 7 days
        })
        .populate("allProduct.foodItemId");
  
      if (!order) {
        return res.status(400).json({ message: "Order not found in last week" });
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
// Updated backend controller with filtering
async getallorderssales(req, res) {
  try {
      const { 
          startDate, 
          endDate, 
          hubId, 
          locations,
          sortOrder = 'desc' 
      } = req.query;

      let matchStage = {};
      
      // Date filtering
      if (startDate || endDate) {
          matchStage.createdAt = {};
          if (startDate) {
              matchStage.createdAt.$gte = new Date(startDate);
          }
          if (endDate) {
              const endDateTime = new Date(endDate);
              endDateTime.setHours(23, 59, 59, 999);
              matchStage.createdAt.$lte = endDateTime;
          }
      } else {
          // Default to today if no date filters provided
          const today = new Date();
          const startOfDay = new Date(today.setHours(0, 0, 0, 0));
          const endOfDay = new Date(today.setHours(23, 59, 59, 999));
          matchStage.createdAt = {
              $gte: startOfDay,
              $lte: endOfDay
          };
      }

      // Location filtering
      if (locations && locations.length > 0) {
          const locationArray = Array.isArray(locations) ? locations : [locations];
          matchStage.delivarylocation = {
              $regex: new RegExp(`^(${locationArray.join('|')}),`, 'i')
          };
      }

      const pipeline = [
          { $match: matchStage },
          {
              $lookup: {
                  from: "fooditems", // Your food items collection name
                  localField: "allProduct.foodItemId",
                  foreignField: "_id",
                  as: "populatedProducts"
              }
          },
          {
              $sort: {
                  createdAt: sortOrder === 'desc' ? -1 : 1
              }
          }
      ];

      const orders = await customerCartModel.aggregate(pipeline);

      return res.status(200).json({ 
          order: orders,
          totalCount: orders.length,
          filters: {
              startDate,
              endDate,
              hubId,
              locations,
              sortOrder
          }
      });
  } catch (error) {
      console.error("Error fetching orders:", error);
      return res.status(500).json({ error: "Something went wrong" });
  }
}

// Additional endpoint for getting sales report data
async getSalesReport(req, res) {
  try {
    const { 
      startDate, 
      endDate, 
      hubId, 
      locations,
      searchTerm,
      sortOrder = 'desc'
    } = req.query;

    console.log("req.query", req.query);

    let dateFilter = {};
    
    // Date filtering - default to today
    if (startDate || endDate) {
      if (startDate) {
        dateFilter.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        dateFilter.$lte = endDateTime;
      }
    } else {
      // Default to today
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    // Parse locations if it's a string
    let parsedLocations = locations;
    if (typeof locations === 'string') {
      try {
        parsedLocations = JSON.parse(locations);
      } catch (e) {
        parsedLocations = [locations];
      }
    }

    const pipeline = [
      // Match orders by date
      { 
        $match: { 
          createdAt: dateFilter 
        } 
      },

      // Filter by locations if provided - match exact location names
      ...(parsedLocations && parsedLocations.length > 0 ? [{
        $match: {
          $expr: {
            $in: [
              { $trim: { input: { $arrayElemAt: [{ $split: ["$delivarylocation", ","] }, 0] } } },
              parsedLocations
            ]
          }
        }
      }] : []),
      
      // Unwind products to work with individual items
      { $unwind: "$allProduct" },
      
      // Lookup food item details
      {
        $lookup: {
          from: "fooditems",
          localField: "allProduct.foodItemId",
          foreignField: "_id",
          as: "foodItemDetails"
        }
      },
      
      // Filter out orders where food item doesn't exist
      {
        $match: {
          "foodItemDetails.0": { $exists: true }
        }
      },
      
      { $unwind: "$foodItemDetails" },
      
      // Filter by hubId - get products that have this hubId in locationPrice OR have no locationPrice (use base price)
      ...(hubId ? [{
        $match: {
          $or: [
            { "foodItemDetails.locationPrice.hubId": hubId },
            { "foodItemDetails.locationPrice": { $exists: false } },
            { "foodItemDetails.locationPrice": { $size: 0 } }
          ]
        }
      }] : []),
      
      // Group by food item to calculate metrics
      {
        $group: {
          _id: "$allProduct.foodItemId",
          foodName: { $first: "$foodItemDetails.foodname" },
          basePrice: { $first: "$foodItemDetails.foodprice" },
          locationPrices: { $first: "$foodItemDetails.locationPrice" },
          totalQuantity: { $sum: "$allProduct.quantity" },
          totalOrders: { $sum: 1 },
          lastSoldTime: { $max: "$createdAt" },
          orders: { 
            $push: {
              quantity: "$allProduct.quantity",
              createdAt: "$createdAt",
              delivaryLocation: "$delivarylocation"
            }
          }
        }
      },
      
      // Calculate price based on hubId - prioritize locationPrice over basePrice
      {
        $addFields: {
          relevantPrice: {
            $cond: {
              if: { 
                $and: [
                  hubId, 
                  { $isArray: "$locationPrices" },
                  { $gt: [{ $size: "$locationPrices" }, 0] }
                ] 
              },
              then: {
                $let: {
                  vars: {
                    hubPrice: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$locationPrices",
                            cond: { $eq: ["$$this.hubId", hubId] }
                          }
                        },
                        0
                      ]
                    }
                  },
                  in: {
                    $cond: {
                      if: "$$hubPrice",
                      then: { $toDouble: "$$hubPrice.foodprice" },
                      else: { $toDouble: "$basePrice" }
                    }
                  }
                }
              },
              else: { $toDouble: "$basePrice" }
            }
          }
        }
      },
      
      // Calculate total amount
      {
        $addFields: {
          totalAmount: { 
            $multiply: [
              { $toDouble: "$totalQuantity" }, 
              "$relevantPrice"
            ] 
          }
        }
      },
      
      // Filter by search term if provided
      ...(searchTerm ? [{
        $match: {
          foodName: { 
            $regex: searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 
            $options: 'i' 
          }
        }
      }] : []),
      
      // Sort by last sold time
      {
        $sort: {
          lastSoldTime: sortOrder === 'desc' ? -1 : 1
        }
      },
      
      // Project final structure
      {
        $project: {
          _id: 0,
          foodItemId: "$_id",
          foodName: 1,
          price: { $round: ["$relevantPrice", 2] },
          quantity: { $toInt: "$totalQuantity" },
          totalOrders: 1,
          totalAmount: { $round: ["$totalAmount", 2] },
          lastSoldTime: 1
        }
      }
    ];

    const salesData = await customerCartModel.aggregate(pipeline);

    // Calculate summary
    const summary = {
      totalItems: salesData.length,
      totalQuantitySold: salesData.reduce((sum, item) => sum + item.quantity, 0),
      totalRevenue: Math.round(salesData.reduce((sum, item) => sum + item.totalAmount, 0) * 100) / 100,
      totalOrders: salesData.reduce((sum, item) => sum + item.totalOrders, 0)
    };

    return res.status(200).json({
      success: true,
      data: salesData,
      summary,
      totalCount: salesData.length,
      filters: {
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || new Date().toISOString().split('T')[0],
        hubId: hubId || null,
        locations: parsedLocations || null,
        searchTerm: searchTerm || null,
        sortOrder
      }
    });

  } catch (error) {
    console.error("Error generating sales report:", error);
    return res.status(500).json({ 
      success: false,
      error: "Something went wrong while generating sales report"
    });
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
  

async exportExcelOrder(req, res) {
  try {
    const {
      search = '',
      startDate,
      endDate,
      slot,
      locations,
      status,
      orderType = 'corporate',
      hub
    } = req.query;

    // Build filter object
    let filter = {};
    
    if (orderType) {
      filter.orderdelivarytype = orderType;
    }

    if (hub && hub !== 'all') {
      filter.hub = hub;
    }

    if (status && status !== '') {
      filter.status = status;
    }

    if (slot && slot !== '') {
      filter.slot = slot;
    }

    if (locations) {
      const locationArray = Array.isArray(locations) ? locations : [locations];
      filter.delivarylocation = { $in: locationArray };
    }

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
      
      if (!isNaN(search.trim())) {
        orFilters.push({ Mobilenumber: Number(search.trim()) });
      }
      
      filter.$or = orFilters;
    }

    // console.log("Filter applied:", filter);

    // Use lean() for better performance and limit memory usage
    const orders = await customerCartModel
      .find(filter)
      .populate("allProduct.foodItemId")
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance

    // Check if dataset is too large
    if (orders.length > 50000) {
      return res.status(400).json({
        success: false,
        error: "Dataset too large. Please apply filters to reduce the number of records."
      });
    }

    // Create Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Corporate Bookings');

    // Define columns with proper formatting
    worksheet.columns = [
      { header: 'S.No', key: 'sno', width: 8 },
      { header: 'Date', key: 'date', width: 20 },
      {header: 'Time', key: 'time', width: 20 },
      { header: 'Order ID', key: 'orderid', width: 15 },
      { header: 'Order Status', key: 'status', width: 15 },
      { header: 'Customer', key: 'customer', width: 20 },
      { header: 'Total Order', key: 'totalorder', width: 20 },
      { header: 'Phone', key: 'phone', width: 15 },
      // { header: 'Hub', key: 'hub', width: 15 },
      { header: 'Slot Data', key: 'slotsdata', width: 15 },
      { header: 'Category Name', key: 'categoryname', width: 30 },
      { header: 'Product Name', key: 'productname', width: 40 },
      { header: 'Unit', key: 'unit', width: 20 },
      { header: 'Cutlery', key: 'cutlery', width: 10 },
      { header: 'Address', key: 'address', width: 40 },
      // { header: 'Delivery Charge', key: 'deliverycharge', width: 15 },
      // { header: 'Delivery Type', key: 'deliverytype', width: 15 },
      { header: 'Apply Wallet', key: 'applywallet', width: 12 },
      { header: 'Apply Coupon', key: 'applycoupon', width: 12 },
      { header: 'Total Amount', key: 'totalamount', width: 15 },
      { header: 'Rating', key: 'rating', width: 12 },
      { header: 'Comment', key: 'comment', width: 30 }
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Process data in chunks to avoid memory issues
    const chunkSize = 1000;
    let rowIndex = 2; // Start from row 2 (after header)

    for (let i = 0; i < orders.length; i += chunkSize) {
      const chunk = orders.slice(i, i + chunkSize);
      
      chunk.forEach((item, index) => {
        const globalIndex = i + index;
        
        // Safely extract product information
        const categories = item?.allProduct?.map(product => 
          product?.foodItemId?.foodcategory || 'N/A'
        ).join(", ") || "N/A";
        
        const products = item?.allProduct?.map(product => 
          `${product?.foodItemId?.foodname || 'N/A'} - (${product?.quantity || '0'}.Qty)`
        ).join(", ") || "N/A";
        
        const units = item?.allProduct?.map(product => 
          product?.foodItemId?.unit || 'N/A'
        ).join(", ") || "N/A";

        const row = worksheet.addRow({
          sno: globalIndex + 1,
          date: moment(item?.createdAt).format("DD-MM-YYYY"),
          time: moment(item?.createdAt).format("hh:mm A"),
          orderid: item?.orderid || 'N/A',
          status: item?.status || 'N/A',
          customer: item?.username || 'N/A',
          totalorder: item?.totalOrder || 'N/A',
          phone: item?.Mobilenumber || 'N/A',
        
          slotsdata: item?.slot || 'N/A',
          categoryname: categories,
          productname: products,
          unit: units,
          cutlery: item?.Cutlery || 'No',
          address: item?.delivarylocation || 'N/A',
          deliverycharge: item?.delivarytype || 'N/A',
    
          applywallet: item?.discountWallet || 'No',
          applycoupon: item?.coupon || 'No',
          totalamount: item?.allTotal || '0',
          rating: item?.rate || 'Not Rated',
          comment: item?.comement || 'No Comment'
        });

        // Add alternating row colors for better readability
        if (globalIndex % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8F8F8' }
          };
        }
      });

      // Log progress for large datasets
      // if (orders.length > 5000) {
      //   console.log(`Processed ${Math.min(i + chunkSize, orders.length)} of ${orders.length} records...`);
      // }
    }

    // Set response headers for Excel download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Corporate_Bookings_${moment().format('DD-MM-YYYY_HH-mm')}.xlsx"`
    );

    // Stream the Excel file directly to response
    await workbook.xlsx.write(res);
    
    console.log(`Excel export completed successfully. Total records: ${orders.length}`);
    
    // End the response
    res.end();

  } catch (error) {
    console.error('Error in exportExcelOrder:', error);
    
    // Make sure response hasn't been sent already
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: "Excel export failed",
        message: error.message
      });
    }
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

  async getPackerOrders2(req, res) {
  try {
    const { hub, slot, deliveryLocation } = req.query;
    
    // Get today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Build match stage
    const matchStage = {
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["Pending", "Partially Packed", "Packed", "Cooking", "Packing"] }
    };

    if (slot && slot !== 'all') {
      matchStage.slot = slot;
    }

    if (deliveryLocation && deliveryLocation !== 'all') {
      matchStage.delivarylocation = { 
        $regex: deliveryLocation, 
        $options: 'i' 
      };
    }

    // Main aggregation pipeline
    const aggregationPipeline = [
      { $match: matchStage },
      
      // Unwind products
      { $unwind: { path: "$allProduct", preserveNullAndEmptyArrays: false } },
      
      // Lookup product details
      {
        $lookup: {
          from: "fooditems", // Adjust collection name as needed
          localField: "allProduct.foodItemId",
          foreignField: "_id",
          as: "foodItemDetails"
        }
      },
      
      { $unwind: { path: "$foodItemDetails", preserveNullAndEmptyArrays: false } },
      
      // Unwind locationPrice to analyze hub matching
      { $unwind: { path: "$foodItemDetails.locationPrice", preserveNullAndEmptyArrays: false } },
      
      // Add computed fields for matching
      {
        $addFields: {
          deliveryLocationLower: { $toLower: { $trim: { input: { $ifNull: ["$delivarylocation", ""] } } } },
          locationMatches: {
            $anyElementTrue: {
              $map: {
                input: "$foodItemDetails.locationPrice.loccationAdreess",
                as: "addr",
                in: {
                  $regexMatch: {
                    input: { $toLower: "$$addr" },
                    regex: { $toLower: { $trim: { input: { $ifNull: ["$delivarylocation", ""] } } } }
                  }
                }
              }
            }
          }
        }
      },
      
      // Filter by hub if specified
      ...(hub && hub !== 'all' ? [{
        $match: {
          "foodItemDetails.locationPrice.hubName": hub,
          locationMatches: true
        }
      }] : [{
        $match: {
          locationMatches: true
        }
      }]),
      
      // Group back to get matching hubs per product
      {
        $group: {
          _id: {
            orderId: "$_id",
            productId: "$allProduct._id",
            orderid: "$orderid",
            username: "$username",
            slot: "$slot",
            deliveryLocation: "$delivarylocation",
            foodname: "$foodItemDetails.foodname",
            foodcategory: "$foodItemDetails.foodcategory",
            categoryName: "$foodItemDetails.categoryName",
            unit: "$foodItemDetails.unit",
            quantity: "$foodItemDetails.quantity",
            productQuantity: "$allProduct.quantity"
          },
          matchingHubs: { $addToSet: "$foodItemDetails.locationPrice.hubName" },
          hubDetails: { $first: "$foodItemDetails.locationPrice" }
        }
      },
      
      // Unwind quantity to create individual items
      {
        $addFields: {
          quantityArray: { $range: [0, { $ifNull: ["$_id.productQuantity", 1] }] }
        }
      },
      
      { $unwind: "$quantityArray" },
      
      // Unwind hubs to create separate records per hub
      { $unwind: "$matchingHubs" },
      
      // Filter by selected hub again after unwinding
      ...(hub && hub !== 'all' ? [{
        $match: { matchingHubs: hub }
      }] : []),
      
      // Project individual packing items
      {
        $project: {
          name: "$_id.foodname",
          category: "$_id.foodcategory",
          categoryName: "$_id.categoryName",
          unit: "$_id.unit",
          ordered: {
            $concat: [
              { $toString: { $ifNull: ["$_id.quantity", 1] } },
              " ",
              { $ifNull: ["$_id.unit", "unit"] }
            ]
          },
          totalOrdered: 1,
          hub: ["$matchingHubs"],
          slot: "$_id.slot",
          deliveryLocation: { $trim: { input: { $ifNull: ["$_id.deliveryLocation", "Unknown Location"] } } },
          originalOrderId: "$_id.orderId",
          originalProductId: "$_id.productId",
          itemSequence: { $add: ["$quantityArray", 1] },
          totalItemsInOrder: "$_id.productQuantity",
          orders: [{
            id: { $ifNull: ["$_id.orderid", { $toString: "$_id.orderId" }] },
            orderSlot: "$_id.slot",
            customerName: { $ifNull: ["$_id.username", "Unknown Customer"] },
            deliveryLocation: { $trim: { input: { $ifNull: ["$_id.deliveryLocation", "Unknown Location"] } } },
            quantity: 1,
            orderId: { $toString: "$_id.orderId" },
            productId: { $toString: "$_id.productId" },
            itemIndex: "$quantityArray"
          }],
          hubDetails: {
            hubName: "$matchingHubs",
            deliveryLocation: { $trim: { input: { $ifNull: ["$_id.deliveryLocation", "Unknown Location"] } } }
          },
          updatedAt: new Date()
        }
      }
    ];

    const individualPackingItems = await customerCartModel.aggregate(aggregationPipeline);

    if (!individualPackingItems.length) {
      return res.status(404).json({ 
        message: `No orders found for today${hub ? ` in ${hub}` : ''}${slot ? ` for slot ${slot}` : ''}${deliveryLocation ? ` for location ${deliveryLocation}` : ''}` 
      });
    }

    // Bulk upsert to Packing collection
    const Packing = require("../../Model/Packer/Packing");
    const bulkOps = individualPackingItems.map(item => ({
      updateOne: {
        filter: {
          name: item.name,
          hub: item.hub,
          slot: item.slot,
          deliveryLocation: item.deliveryLocation,
          originalOrderId: item.originalOrderId,
          originalProductId: item.originalProductId,
          itemSequence: item.itemSequence
        },
        update: {
          $set: {
            name: item.name,
            category: item.category,
            categoryName: item.categoryName,
            unit: item.unit,
            ordered: item.ordered,
            hubDetails: item.hubDetails,
            totalItemsInOrder: item.totalItemsInOrder,
            deliveryLocation: item.deliveryLocation,
            updatedAt: new Date()
          },
          $setOnInsert: {
            totalOrdered: 1,
            packed: 0,
            isPacked: false,
            isFullyPacked: false,
            hub: item.hub,
            slot: item.slot,
            originalOrderId: item.originalOrderId,
            originalProductId: item.originalProductId,
            itemSequence: item.itemSequence,
            orders: item.orders.map(order => ({ ...order, isPacked: false })),
            createdAt: new Date()
          }
        },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await Packing.bulkWrite(bulkOps);
    }

    // Fetch and group packing items using aggregation
    const packingQuery = {
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    };

    if (deliveryLocation && deliveryLocation !== 'all') {
      packingQuery.deliveryLocation = { 
        $regex: deliveryLocation, 
        $options: 'i' 
      };
    }

    const groupedPackingData = await Packing.aggregate([
      { $match: packingQuery },
      
      // Unwind hub array to work with it
      { $unwind: { path: "$hub", preserveNullAndEmptyArrays: true } },
      
      // Group by item, hub, slot, and delivery location
      {
        $group: {
          _id: {
            name: "$name",
            hub: "$hub",
            slot: "$slot",
            deliveryLocation: "$deliveryLocation"
          },
          firstItemId: { $first: "$_id" },
          name: { $first: "$name" },
          category: { $first: "$category" },
          categoryName: { $first: "$categoryName" },
          unit: { $first: "$unit" },
          ordered: { $first: "$ordered" },
          totalOrdered: { $sum: { $ifNull: ["$totalOrdered", 1] } },
          packed: { $sum: { $ifNull: ["$packed", 0] } },
          hub: { $first: ["$hub"] },
          slot: { $first: "$slot" },
          deliveryLocation: { $first: "$deliveryLocation" },
          hubDetails: { $first: "$hubDetails" },
          orders: { $push: "$orders" },
          individualItems: { $push: "$$ROOT" }
        }
      },
      
      // Flatten orders array
      { $unwind: { path: "$orders", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$orders", preserveNullAndEmptyArrays: true } },
      
      // Group again to deduplicate orders
      {
        $group: {
          _id: "$_id",
          firstItemId: { $first: "$firstItemId" },
          name: { $first: "$name" },
          category: { $first: "$category" },
          categoryName: { $first: "$categoryName" },
          unit: { $first: "$unit" },
          ordered: { $first: "$ordered" },
          totalOrdered: { $first: "$totalOrdered" },
          packed: { $first: "$packed" },
          hub: { $first: "$hub" },
          slot: { $first: "$slot" },
          deliveryLocation: { $first: "$deliveryLocation" },
          hubDetails: { $first: "$hubDetails" },
          orders: { 
            $addToSet: {
              $cond: [
                { $ne: ["$orders", null] },
                "$orders",
                "$$REMOVE"
              ]
            }
          },
          individualItems: { $first: "$individualItems" }
        }
      },
      
      // Add computed fields
      {
        $addFields: {
          isPacked: { $gt: ["$packed", 0] },
          isFullyPacked: { $eq: ["$packed", "$totalOrdered"] }
        }
      },
      
      // Sort results
      {
        $sort: {
          "hub.0": 1,
          slot: 1,
          deliveryLocation: 1,
          name: 1
        }
      },
      
      // Final projection
      {
        $project: {
          _id: "$firstItemId",
          name: 1,
          category: 1,
          categoryName: 1,
          unit: 1,
          ordered: 1,
          totalOrdered: 1,
          packed: 1,
          isPacked: 1,
          isFullyPacked: 1,
          orders: 1,
          hub: 1,
          slot: 1,
          deliveryLocation: 1,
          hubDetails: 1,
          individualItems: 1
        }
      }
    ]);

    // Calculate summary using aggregation
    const summaryAgg = await Packing.aggregate([
      { $match: packingQuery },
      {
        $group: {
          _id: null,
          totalOrders: { $addToSet: "$originalOrderId" },
          totalItems: { $sum: { $ifNull: ["$totalOrdered", 1] } },
          totalPacked: { $sum: { $ifNull: ["$packed", 0] } },
          hubs: { $addToSet: { $arrayElemAt: ["$hub", 0] } },
          slots: { $addToSet: "$slot" },
          deliveryLocations: { $addToSet: "$deliveryLocation" }
        }
      },
      {
        $project: {
          _id: 0,
          totalOrders: { $size: "$totalOrders" },
          totalItems: 1,
          totalPacked: 1,
          hubs: { $filter: { input: "$hubs", as: "h", cond: { $ne: ["$$h", null] } } },
          slots: { $filter: { input: "$slots", as: "s", cond: { $ne: ["$$s", null] } } },
          deliveryLocations: { $filter: { input: "$deliveryLocations", as: "d", cond: { $ne: ["$$d", null] } } }
        }
      }
    ]);

    const summary = summaryAgg[0] || {
      totalOrders: 0,
      totalItems: 0,
      totalPacked: 0,
      hubs: [],
      slots: [],
      deliveryLocations: []
    };

    return res.status(200).json({
      filters: { hub, slot, deliveryLocation },
      summary,
      packingData: groupedPackingData
    });

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