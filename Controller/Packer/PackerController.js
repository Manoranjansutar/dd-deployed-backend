const { default: axios } = require("axios");
const PackerModel = require("../../Model/Packer/PackerModel");
const jwt = require('jsonwebtoken');

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  }
class Packer {
    async createpacker(req, res) {
        try {
            const { username, mobileNumber, location } = req.body;
            try {
                if(!username) return res.status(400).json({error:"Please enter username"});
                if(!mobileNumber) return res.status(400).json({error:"Please enter mobile number"});
                let check=await PackerModel.findOne({mobileNumber:mobileNumber});
                if(check) return res.status(400).json({error:"Mobile Number already exits"})
                const packer = new PackerModel({ username, mobileNumber, location });
                await packer.save();
                res.status(201).json({ message: 'Packer added successfully', packer });
            } catch (error) {
                res.status(400).json({ message: 'Error adding packer', error: error.message });
            }
        } catch (error) {
            console.log(error);

        }
    }

       async sendPackerOtp(req, res) {
        const { mobileNumber } = req.body;
        const otp = generateOTP();
   
        try {
            if (!mobileNumber) {
                return res.status(400).json({ error: "Please provide mobile number" });
              }
            const check=await PackerModel.findOne({mobileNumber:mobileNumber});

            if(!check) res.status(401).json({ error: "Your mobile number is not register" });
            const payload = {
                "apiKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTJkNGI3ODU0MGZhN2FmOTQ1NzM5ZCIsIm5hbWUiOiJDSEVGIFNUVURJTyBJTk5PVkFUSU9OUyIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2NzUyZDRiNzg1NDBmYTdhZjk0NTczOTciLCJhY3RpdmVQbGFuIjoiQkFTSUNfTU9OVEhMWSIsImlhdCI6MTczMzQ4MTY1NX0.HMTWJFXWW7I0KG8U24jYvY9CUMEEl0tP1W-2X18GnDI",
                "campaignName": "otp_send",
                "destination": `91${mobileNumber}`,
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
                .post("https://backend.aisensy.com/campaign/t1/api/v2", payload)
                .then(async (data) => {
                  // If OTP not present, create a new record
                  check.otp = otp;
                  await check.save();
                  return res.status(200).json({ success: "OTP Successfully sent your whatsapp number" });
        
                })
                .catch((error) => {
                  console.error(error);
                  return res.status(500).json({ error: "Error sending OTP" });
                });
      
        } catch (error) {
          res.status(500).json({ message: 'Server error', error: error.message });
        }
      };
      
      // Verify OTP and Login
      async verificationPacker(req, res) {
        const { mobileNumber, otp } = req.body;
        try {
          let otpRecord = await PackerModel.findOne({ mobileNumber, otp });
          if (!otpRecord) return res.status(400).json({ message: 'Invalid OTP' });

          // Generate JWT for user (packer)
          otpRecord.otp=null
          otpRecord=await otpRecord.save()
          const token = jwt.sign({ mobileNumber, username: otpRecord.username ,_id:otpRecord._id}, "DailyADish", { expiresIn: '1h' });

         return res.status(200).json({ token, data: otpRecord });
        } catch (error) {
          res.status(500).json({ message: 'Server error', error: error.message });
        }
      };

async updatePacker(req,res){
    try {
        const {id, username, mobileNumber, location } = req.body;
        if(!id)return res.status(400).json({error:"Packer Id is required"});
        const data=await PackerModel.findById(id);
        if(!data) return res.status(400).json({error:"Packer not found"});
        if(username){
            data.username=username
        }
        if(mobileNumber){
            data.mobileNumber=mobileNumber
        }
        if(location){
            data.location=mobileNumber
        }
        await data.save();
        return res.status(200).json({success:"Successfully updated"})
    } catch (error) {
        console.log(error);
        
    }
}

    async deletPacker(req,res){
        const { id } = req.params;
        try {
          const packer = await PackerModel.findOneAndDelete({ _id: id });
          if (!packer) return res.status(404).json({ message: 'Packer not found' });
          res.json({ message: 'Packer deleted successfully' });
        } catch (error) {
          res.status(400).json({ message: 'Error deleting packer', error: error.message });
        }
    }

    async getAllPacker(req,res){
        try {
            const packers = await PackerModel.find().sort({_id:-1});
           return res.status(200).json({success:packers});
          } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
          }
    }
}

module.exports = new Packer()