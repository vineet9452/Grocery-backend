import "dotenv/config.js";
import mongoose from "mongoose";
import Branch from "./src/models/branch.js";

async function createBranch() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Check if branch already exists
        const existingBranch = await Branch.findOne();
        if (existingBranch) {
            console.log("Branch already exists:");
            console.log("BRANCH_ID:", existingBranch._id.toString());
            mongoose.connection.close();
            return;
        }

        // Create a new branch
        const branch = new Branch({
            name: "Main Store - Delhi",
            location: {
                latitude: 28.6139,       // Delhi coordinates
                longitude: 77.2090,
            },
            address: "Connaught Place, New Delhi, Delhi 110001",
            deliveryPartners: []
        });

        const savedBranch = await branch.save();
        console.log("Branch created successfully!");
        console.log("BRANCH_ID:", savedBranch._id.toString());
        console.log("\nCopy this ID and paste in config.tsx");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        mongoose.connection.close();
    }
}

createBranch();
