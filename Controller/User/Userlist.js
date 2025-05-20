const CustomerModel = require("../../Model/User/Userlist");
// const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const mongoose = require("mongoose");
const otpModel = require("../../Model/User/Otp");
const cron = require('node-cron');
const walletController=require('./Wallet');
const WalletModel=require('../../Model/User/Wallet')
const SelectAddressModel = require('../../Model/User/SelectedAddress');
const phonepayModel = require('../../Model/User/phonepay');
const { default: axios } = require("axios");
const { uploadFile2 } = require("../../Midleware/AWS");

class Customer {
  async loginWithOtp(req, res) {
    const { Mobile } = req.body;
  
    try {
      // Check if the mobile number is already registered
    
            // Generate OTP
              console.log("mobilee",Mobile)
    let otp = (Math.floor(Math.random() * 1000000) + 1000000)
      .toString()
      .substring(1);

    // Checking if the OTP is already present in the DB or not.
    const existingOtp = await otpModel.findOne({ Mobile: Mobile });

    const key = "Ae97f7ad9d6c2647071d78b6e94a3c87e";
    const sid = "RDABST";
    const to = Mobile;
    const body = `Hi, Your OTP  is ${otp}. Regards, Team Daily Dish`;
    
  const payload={
  "apiKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTJkNGI3ODU0MGZhN2FmOTQ1NzM5ZCIsIm5hbWUiOiJDSEVGIFNUVURJTyBJTk5PVkFUSU9OUyIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2NzUyZDRiNzg1NDBmYTdhZjk0NTczOTciLCJhY3RpdmVQbGFuIjoiQkFTSUNfTU9OVEhMWSIsImlhdCI6MTczMzQ4MTY1NX0.HMTWJFXWW7I0KG8U24jYvY9CUMEEl0tP1W-2X18GnDI",
  "campaignName": "otp_send",
  "destination": `91${Mobile}`,
  "userName": "CHEF STUDIO INNOVATIONS",
  "templateParams": [
    `${otp}`
  ],
  "source": "new-landing-page form",
  "media": {},
  "buttons": [
    {
      "type": "button",
      "sub_type": "url",
      "index": 0,
      "parameters": [
        {
          "type": "text",
          "text": `${otp}`
        }
      ]
    }
  ],
  "carouselCards": [],
  "location": {},
  "paramsFallbackValue": {
    "FirstName": "user"
  }
}
    axios
      .post("https://backend.aisensy.com/campaign/t1/api/v2",payload )
      .then(async (data) => {
  // If OTP not present, create a new record
      if (!existingOtp) {
    let newOtp = new otpModel({
      Mobile,
      otp,
    });

    newOtp
      .save()
      .then((data) => {
        return res.status(200).json({
          success: `OTP sent: ${data.otp}`,
          message:"Login successful, OTP sent",
  
        });
      })
      .catch((error) => {
        return res.status(402).json({ error: "Error saving OTP" });
      });
      
      }
      else {
          // Update the existing OTP
          await otpModel.findOneAndUpdate(
            { Mobile: Mobile },
            { $set: { otp: otp } },
            { new: true }
          );

          return res.status(200).json({
            success: "OTP sent successfully",
            message:"Login successful, OTP sent",
     
          });
        }
 
})
      .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: "Error sending OTP" });
      });
      

    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // OTP Varification==========================

  async otpVarification(req, res) {
    const { Mobile, otp } = req.body;
    console.log("Mobile, otp", Mobile, otp);

    try {
      const varify = await otpModel.findOne({
        Mobile: Mobile,
        otp: otp
      });
      
    //   if(Number(otp)){
    //           return res.status(400).json({ error: "OTP is wrong" });
    //   }

      if (!varify) {
        return res.status(401).json({ error: "Otp is invalid!" });
      }

      let isPhonePresent = await CustomerModel.findOne({
        Mobile: Mobile,
      });
      
      if(!isPhonePresent){
          isPhonePresent = await CustomerModel.create({
          Mobile: Mobile,
       });
        walletController.initializeWallet(isPhonePresent._id)
      }
      
      
      if (isPhonePresent.BlockCustomer == false)
        return res
          .status(400)
          .json({ error: "Your Account Is Blocked Pls Contact Admin" });

      return res
        .status(200)
        .json({ success: "OTP varified...", details: isPhonePresent });
    } catch (error) {
      console.log(error);
    }
  }

  async AddCustomer(req, res) {
    try {
      let { Fname, Mobile, Address, Flatno,companyId,companyName,status,employeeId ,subsidyAmount} = req.body;
      

      const checkMobileno = await CustomerModel.findOne({ Mobile: Mobile });
      if (checkMobileno) {
        return res.status(302).json({message:"User already Exist"});
      }

      const Adddata = new CustomerModel({
        Fname,
        Mobile,
        Address,
        Flatno,
        // ApartmentId
        companyId,employeeId ,subsidyAmount,
        companyName,status:status || 'Normal'
      });
      const savedCustomer = await Adddata.save();
      if (status === 'Employee') {
        const wallet = new WalletModel({
          userId: savedCustomer._id,
          companyId,
          balance: subsidyAmount,
          transactions: [{
            amount: subsidyAmount,
            type: 'credit',
            description: 'Initial employee subsidy',
            expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            isFreeCash: true
          }]
        });
        await wallet.save();
      }
      return res.status(200).json({ 
        success: "Register Successfully..!", 
        details: savedCustomer 
      });
    } catch (error) {
        console.log("ffhdfdff",error)
      return res.status(401).json({ error: "Registration Unsuccessfull",error });
    }
  }

  async loginCustomer(req, res) {
    let { Email, Password, token } = req.body;

    try {
      if (!Email || !Password) {
        return res.status(400).json({ error: "Please fill all the field" });
      }

      let isUserPresent = await CustomerModel.findOne({ Email: Email }).populate("ApartmentId");
      if (!isUserPresent) {
        return res
          .status(400)
          .json({ error: "Please Enter Registered Email Id..." });
      }

      const isCorrectPassword = await compare(Password, isUserPresent.Password);

      if (!isCorrectPassword) {
        return res
          .status(400)
          .json({ error: "Authentication is failed!!! password is wrong" });
      }

      if (isUserPresent.BlockCustomer === false) {
        return res.status(400).json({
          error: "Authentication is failed!!! Your Account is Blocked by Admin",
        });
      }
      isUserPresent.token = token;
      isUserPresent = await isUserPresent.save();

      return res
        .status(200)
        .json({ success: "Login Successfully...", details: isUserPresent });
    } catch (error) {
      console.error(error);
    }
  }

  async sendMail(req, res) {
    try {
      let { Email } = req.body;
      const isUserPresent = await CustomerModel.findOne({ Email: Email });
      if (!isUserPresent) {
        return res
          .status(400)
          .json({ error: "Please Enter Registered Email Id..." });
      }
      // Create a transporter
      const transporter = nodemailer.createTransport({
        service: "gmail", // Replace with your email service provider
        auth: {
          user: "amitparnets@gmail.com", // Replace with your email
          pass: "yzbzpllsthbvrdal", // Replace with your password or app-specific password
        },
        port: 465,
        host: "gsmtp.gmail.com",
      });

      // Generate a random OTP
      const otp = randomstring.generate({
        length: 6,
        charset: "numeric",
      });

      // Save the OTP to the user document in MongoDB
      isUserPresent.otp = otp;

      // Set a timer to clear the OTP after the expiration time
      setTimeout(() => {
        isUserPresent.otp = null; // Clear the OTP
        isUserPresent.save(); // Save the user document with the cleared OTP
      }, 60 * 1000); // Convert OTP_EXPIRATION_TIME to milliseconds

      await isUserPresent.save();

      // Email configuration
      const mailOptions = {
        from: "amitparnets@gmail.com",
        to: Email,
        subject: "OTP Verification",
        text: `Your OTP is: ${otp}`,
      };

      // Send the OTP via email
      const info = await transporter.sendMail(mailOptions);

      console.log("OTP sent:", info.response);
      res.json({ success: "OTP sent successfully" });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "Failed to send OTP" });
    }
  }

  async Otpverification(req, res) {
    try {
      let { otp, Email } = req.body;

      const user = await CustomerModel.findOne({ Email: Email });
      if (user.otp == otp) {
        return res.status(200).json({ success: " OTP verified successfully" });
      } else {
        // OTPs do not match
        return res.status(400).json({ error: "Invalid OTP" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async NewPassword(req, res) {
    try {
      const { Password, Email } = req.body;
      // Check if the email exists in the database
      const user = await CustomerModel.findOne({ Email: Email });

      if (user) {
        // Hash the new password if provided
        if (Password) {
          const hashedPassword = await hash(Password, 10);
          user.Password = hashedPassword; // Update the user's password
        }

        // Save the updated user document
        const updatedUser = await user.save();

        return res.status(200).json({
          success: "Password updated successfully",
          data: updatedUser,
        });
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updatedUser(req, res) {
    try {
      let {
        userId,
        Fname,
        Mobile,
        Email,
        Address,
   
    employeeId ,subsidyAmount
      } = req.body;

      let obj = {};
      if (Fname) {
        obj["Fname"] = Fname;
      }
      if (employeeId) {
        obj["employeeId"] = employeeId;
      }
      if (subsidyAmount|| subsidyAmount == 0) {
        obj["subsidyAmount"] = subsidyAmount;
      }
      if (Mobile) {
        obj["Mobile"] = Mobile;
      }
      if (Email) {
        obj["Email"] = Email;
      }

      if (Address) {
        obj["Address"] = Address;
      }
    //   if (Nooforders) {
    //     obj["Nooforders"] = Nooforders;
    //   }
    //   if (Lastorderdate) {
    //     obj["Lastorderdate"] = Lastorderdate;
    //   }
    //   if (lastorderamount) {
    //     obj["lastorderamount"] = lastorderamount;
    //   }
    //   if (Password) {
    //     Password = await hash(Password, 10);
    //     obj["Password"] = Password;
    //   }
      let data = await CustomerModel.findByIdAndUpdate(
        userId,
        { $set: obj },
        { new: true }
      );

      if (!data) return res.status(500).json({ error: "Something went wrong" });
      return res
        .status(200)
        .json({ success: "update successfully", userdata: data });
    } catch (error) {
      console.log(error);
    }
  }

  async profileimg(req, res) {
    try {
      const { userid } = req.body;
      let profileImage = req.files;
      if (!profileImage) {
        return res.status(400).json({ error: "No profile image provided" });
      }else if (profileImage.length > 0) {
      profileImage=await uploadFile2(profileImage[0], "profileImages");
    }

      if (!mongoose.Types.ObjectId.isValid(userid)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const updatedUser = await CustomerModel.findByIdAndUpdate(
        userid,
        { $set: { profileImage: profileImage } },
        { new: true }
      );

      if (updatedUser) {
        return res
          .status(200)
          .json({ success: updatedUser, msg: "Image uploaded successfully" });
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getRegisterUser(req, res) {
    try {
      const getRegisterDetails = await CustomerModel.find({}).sort({_id: -1  });
      if (getRegisterDetails) {
        return res.status(200).json({ success: getRegisterDetails });
      }
      console.log("getRegisterDetails", getRegisterDetails);
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // Block & unBlock User
  async BlockUser(req, res) {
    const BlockId = req.params.id;
    try {
      const User = await CustomerModel.findById({ _id: BlockId });
      if (User.BlockCustomer === false) {
        await CustomerModel.findByIdAndUpdate(
          { _id: User._id },
          { $set: { BlockCustomer: true } },
          { new: true }
        );
        return res.status(200).json({ msg: "Customer Unblocked " });
      } else {
        await CustomerModel.findByIdAndUpdate(
          { _id: User._id },
          { $set: { BlockCustomer: false } },
          { new: true }
        );
        return res.status(200).json({ success: "Customer Blocked" });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getUserByCompany(req, res) {
    const companyId = req.params.companyId;
    try {
      const users = await CustomerModel.find({ companyId: companyId }).sort({ createdAt: -1 });;

        return res.status(200).json({ success: users });
  

    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async deleteUser(req, res) {
    const userId = req.params.id;
    try {
      const user = await CustomerModel.findByIdAndDelete({ _id: userId });
      if (user) {
        await WalletModel.deleteOne({ userId: userId });
        await SelectAddressModel.deleteMany({ userId: userId });
        await phonepayModel.deleteMany({ userId: userId });
        return res.status(200).json({ success: "User deleted successfully" });
    
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

function formatDate(date) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

cron.schedule('0 0 * * *', async () => {
  // Runs at 12:00 AM every day
  try {
    const today = formatDate(new Date());
    console.log(`[${today}] Running subsidy expiration job...`);

    const employeeIds = await CustomerModel.find({ status: 'Employee' }).distinct('_id');
    const wallets = await WalletModel.find({ userId: { $in: employeeIds } });

    for (const wallet of wallets) {
      let expiredAmount = 0;
      const now = new Date();

      let alreadyExpiredToday = wallet.transactions.some(tx =>
        tx.description === 'Expired subsidy' &&
        formatDate(tx.createdAt) === today
      );

      if (alreadyExpiredToday) {
        console.log(`Wallet ${wallet._id} already processed for expiration today.`);
        continue;
      }

      wallet.transactions.forEach(tx => {
        if (
          tx.isFreeCash &&
          tx.expiryDate &&
          tx.expiryDate <= now &&
          !tx.expiredProcessed
        ) {
          expiredAmount += tx.amount;
          tx.expiredProcessed = true;
        }
      });

      if (expiredAmount > 0) {
        wallet.balance = Math.max(0, wallet.balance - expiredAmount);

        wallet.transactions.push({
          amount: expiredAmount,
          type: 'debit',
          description: 'Expired subsidy',
          isFreeCash: true,
          createdAt: now
        });
      }

      // Also mark all expired as processed, even if amount is 0
      wallet.transactions.forEach(tx => {
        if (
          tx.isFreeCash &&
          tx.expiryDate &&
          tx.expiryDate <= now
        ) {
          tx.expiredProcessed = true;
        }
      });

      await wallet.save();
    }
  } catch (error) {
    console.error('Error in subsidy expiration job:', error);
  }
});

cron.schedule('2 0 * * *', async () => {

  try {
    const today = formatDate(new Date());
    console.log(`[${today}] Running subsidy addition job...`);

    const employeeIds = await CustomerModel.find({ status: 'Employee' }).distinct('_id');
    const wallets = await WalletModel.find({ userId: { $in: employeeIds } });

    for (const wallet of wallets) {
      const customer = await CustomerModel.findById(wallet.userId);
      const subsidy = customer?.subsidyAmount || 0;

      // Check if already added today
      const alreadyAdded = wallet.transactions.some(tx =>
        (tx.description === 'Daily employee subsidy'|| tx.description ==="Initial employee subsidy")&&
        formatDate(tx.createdAt) === today
      );

      if (alreadyAdded) {
        console.log(`Wallet ${wallet._id} already received subsidy today.`);
        continue;
      }

      wallet.balance += subsidy;

      wallet.transactions.push({
        amount: subsidy,
        type: 'credit',
        description: 'Daily employee subsidy',
        expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isFreeCash: true,
        createdAt: new Date()
      });

      await wallet.save();
    }
  } catch (error) {
    console.error('Error in subsidy addition job:', error);
  }
});

const CutomerController = new Customer();
module.exports = CutomerController;
