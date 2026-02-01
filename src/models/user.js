import mongoose from "mongoose";

/**
 * ============================================
 * USER MODELS
 * ============================================
 * 
 * This file contains schemas for all user types:
 * 1. Customer - App users who order groceries
 * 2. DeliveryPartner - Delivery personnel
 * 3. Admin - Admin panel users
 * 
 * ============================================
 */

// Base User Schema
const userSchema = new mongoose.Schema({
  name: { type: String },
  role: {
    type: String,
    enum: ["Customer", "Admin", "DeliveryPartner"],
    required: true,
  },
  isActivated: { type: Boolean, default: false }
})

/**
 * ============================================
 * ADDRESS SUB-SCHEMA (NEW!)
 * ============================================
 * 
 * Each customer can have multiple addresses.
 * One address can be set as default for delivery.
 * 
 * Labels: Home, Work, Hotel, Other
 */
const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    enum: ["Home", "Work", "Hotel", "Other"],
    default: "Home"
  },
  fullAddress: { type: String, required: true },  // Complete address string
  landmark: { type: String },                      // Optional landmark
  floor: { type: String },                         // Floor/Flat number
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  isDefault: { type: Boolean, default: false },  // Is this the default address?
}, { _id: true, timestamps: true });

/**
 * ============================================
 * CUSTOMER SCHEMA
 * ============================================
 */
const customerSchema = new mongoose.Schema({
  ...userSchema.obj,
  phone: { type: Number, required: true, unique: true },
  role: { type: String, enum: ["Customer"], default: "Customer" },

  // Current live location (for tracking)
  liveLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
  },

  // Single address (legacy - kept for backward compatibility)
  address: { type: String },

  // NEW: Multiple addresses array
  addresses: [addressSchema],
})


// Delivery Partner Schema
const deliveryPartnerSchema = new mongoose.Schema({
  ...userSchema.obj,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: Number, required: true },
  role: { type: String, enum: ["DeliveryPartner"], default: "DeliveryPartner" },
  liveLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  address: { type: String },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
  },
});

// Admin Schema

const adminSchema = new mongoose.Schema({
  ...userSchema.obj,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Admin"], default: "Admin" },
});

export const Customer = mongoose.model("Customer", customerSchema);
export const DeliveryPartner = mongoose.model(
  "DeliveryPartner",
  deliveryPartnerSchema
);
export const Admin = mongoose.model("Admin", adminSchema);


