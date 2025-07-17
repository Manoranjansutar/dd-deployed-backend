const HubModel = require("../../Model/Packer/HubModel");
const ProductModel=require('../../Model/Admin/Addproduct');

class Hub {
  async createHub(req, res) {
    try {
      const { hubName, locations } = req.body;
      // Input validation
      if (!hubName) return res.status(400).json({ error: "Please enter hub name" });

      if (!Array.isArray(locations) || !locations.length) return res.status(400).json({ error: "Please select at least one location" });

      // Check for existing hub
      const existingHub = await HubModel.findOne({ hubName });
      if (existingHub) return res.status(400).json({ error: "Hub name already exists" });

      // Create new hub
      const hub = new HubModel({ hubName, locations });
      await hub.save();
      res.status(201).json({ message: "Hub added successfully", hub });
    } catch (error) {
        console.log("error",error);
        
      res.status(400).json({ message: "Error adding hub", error: error.message });
    }
  }

  async updateHub(req, res) {
    try {
      const { hubId } = req.params;
      const { hubName, locations } = req.body;

      // Input validation
      if (!hubId) return res.status(400).json({ error: "Hub ID is required" });
      if (!hubName) return res.status(400).json({ error: "Please enter hub name" });
      if (!Array.isArray(locations) || !locations.length) return res.status(400).json({ error: "Please select at least one location" });

      // Find hub
      const hub = await HubModel.findOne({ hubId });
      if (!hub) return res.status(404).json({ error: "Hub not found" });
console.log("hubid",hubId);

      // Check for duplicate hub name
      const existingHub = await HubModel.findOne({ hubName, hubId: { $ne: hubId } });
      if (existingHub) return res.status(400).json({ error: "Hub name already exists" });

      // Update hub
      hub.hubName = hubName;
      hub.locations = locations;
      await ProductModel.updateMany(
        { "locationPrice.hubId": hubId },
        {
          $set: {
            "locationPrice.$.hubName": hubName,
            "locationPrice.$.loccationAdreess": locations
          }
        }
      );
      await hub.save();
      res.status(200).json({ message: "Hub updated successfully", hub });
    } catch (error) {
      res.status(400).json({ message: "Error updating hub", error: error.message });
    }
  }

  async deleteHub(req, res) {
    try {
      const { hubId } = req.params;
      const hub = await HubModel.findOneAndDelete({ hubId });
      if (!hub) return res.status(404).json({ message: "Hub not found" });
      // console.log();
      
      const productUpdateResult = await ProductModel.updateMany(
        { "locationPrice.hubId": hubId },
        {
          $pull: {
            locationPrice: { hubId: hubId }
          }
        }
      );
  
      console.log(`Removed hubId ${hubId} from ${productUpdateResult.modifiedCount} products`);
      res.status(200).json({ message: "Hub deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: "Error deleting hub", error: error.message });
    }
  }

  async getAllHubs(req, res) {
    try {
      const hubs = await HubModel.find().sort({ createdAt: -1 });
      res.status(200).json(hubs);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
}

module.exports = new Hub();