/**
 * ============================================
 * ADDRESS CONTROLLER
 * ============================================
 * 
 * Handles all address-related operations:
 * - Get all addresses for a customer
 * - Add new address
 * - Update existing address
 * - Delete address
 * - Set default address
 * 
 * ============================================
 */

import { Customer } from "../../models/user.js";

/**
 * GET ALL ADDRESSES
 * 
 * Route: GET /api/address
 * Auth: Required (customer token)
 * 
 * Returns all addresses for the logged-in customer
 */
export const getAddresses = async (req, reply) => {
    try {
        const userId = req.user.userId;

        const customer = await Customer.findById(userId).select('addresses');

        if (!customer) {
            return reply.status(404).send({
                success: false,
                message: "Customer not found"
            });
        }

        return reply.send({
            success: true,
            addresses: customer.addresses || []
        });
    } catch (error) {
        console.error("Get Addresses Error:", error);
        return reply.status(500).send({
            success: false,
            message: "Failed to fetch addresses",
            error: error.message
        });
    }
};

/**
 * ADD NEW ADDRESS
 * 
 * Route: POST /api/address
 * Auth: Required (customer token)
 * 
 * Body: {
 *   label: "Home" | "Work" | "Hotel" | "Other",
 *   fullAddress: "123 Street, City",
 *   landmark: "Near Mall" (optional),
 *   floor: "2nd Floor" (optional),
 *   location: { latitude: 12.34, longitude: 56.78 } (optional),
 *   isDefault: true/false
 * }
 */
export const addAddress = async (req, reply) => {
    try {
        const userId = req.user.userId;
        const { label, fullAddress, landmark, floor, location, isDefault } = req.body;

        // Validate required field
        if (!fullAddress) {
            return reply.status(400).send({
                success: false,
                message: "Full address is required"
            });
        }

        const customer = await Customer.findById(userId);
        if (!customer) {
            return reply.status(404).send({
                success: false,
                message: "Customer not found"
            });
        }

        // Initialize addresses array if doesn't exist
        if (!customer.addresses) {
            customer.addresses = [];
        }

        // If this is set as default, remove default from others
        if (isDefault) {
            customer.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        // If this is first address, make it default
        const makeDefault = isDefault || customer.addresses.length === 0;

        // Create new address object
        const newAddress = {
            label: label || "Home",
            fullAddress,
            landmark: landmark || "",
            floor: floor || "",
            location: location || {},
            isDefault: makeDefault
        };

        customer.addresses.push(newAddress);
        await customer.save();

        // Get the newly added address (last one)
        const addedAddress = customer.addresses[customer.addresses.length - 1];

        return reply.send({
            success: true,
            message: "Address added successfully",
            address: addedAddress
        });
    } catch (error) {
        console.error("Add Address Error:", error);
        return reply.status(500).send({
            success: false,
            message: "Failed to add address",
            error: error.message
        });
    }
};

/**
 * UPDATE ADDRESS
 * 
 * Route: PUT /api/address/:addressId
 * Auth: Required (customer token)
 * 
 * Updates an existing address
 */
export const updateAddress = async (req, reply) => {
    try {
        const userId = req.user.userId;
        const { addressId } = req.params;
        const { label, fullAddress, landmark, floor, location, isDefault } = req.body;

        const customer = await Customer.findById(userId);
        if (!customer) {
            return reply.status(404).send({
                success: false,
                message: "Customer not found"
            });
        }

        // Find the address to update
        const addressIndex = customer.addresses.findIndex(
            addr => addr._id.toString() === addressId
        );

        if (addressIndex === -1) {
            return reply.status(404).send({
                success: false,
                message: "Address not found"
            });
        }

        // If setting as default, unset others
        if (isDefault) {
            customer.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        // Update fields
        if (label) customer.addresses[addressIndex].label = label;
        if (fullAddress) customer.addresses[addressIndex].fullAddress = fullAddress;
        if (landmark !== undefined) customer.addresses[addressIndex].landmark = landmark;
        if (floor !== undefined) customer.addresses[addressIndex].floor = floor;
        if (location) customer.addresses[addressIndex].location = location;
        if (isDefault !== undefined) customer.addresses[addressIndex].isDefault = isDefault;

        await customer.save();

        return reply.send({
            success: true,
            message: "Address updated successfully",
            address: customer.addresses[addressIndex]
        });
    } catch (error) {
        console.error("Update Address Error:", error);
        return reply.status(500).send({
            success: false,
            message: "Failed to update address",
            error: error.message
        });
    }
};

/**
 * DELETE ADDRESS
 * 
 * Route: DELETE /api/address/:addressId
 * Auth: Required (customer token)
 */
export const deleteAddress = async (req, reply) => {
    try {
        const userId = req.user.userId;
        const { addressId } = req.params;

        const customer = await Customer.findById(userId);
        if (!customer) {
            return reply.status(404).send({
                success: false,
                message: "Customer not found"
            });
        }

        // Find and remove the address
        const addressIndex = customer.addresses.findIndex(
            addr => addr._id.toString() === addressId
        );

        if (addressIndex === -1) {
            return reply.status(404).send({
                success: false,
                message: "Address not found"
            });
        }

        const wasDefault = customer.addresses[addressIndex].isDefault;
        customer.addresses.splice(addressIndex, 1);

        // If deleted address was default, make first remaining address default
        if (wasDefault && customer.addresses.length > 0) {
            customer.addresses[0].isDefault = true;
        }

        await customer.save();

        return reply.send({
            success: true,
            message: "Address deleted successfully"
        });
    } catch (error) {
        console.error("Delete Address Error:", error);
        return reply.status(500).send({
            success: false,
            message: "Failed to delete address",
            error: error.message
        });
    }
};

/**
 * SET DEFAULT ADDRESS
 * 
 * Route: PUT /api/address/:addressId/default
 * Auth: Required (customer token)
 */
export const setDefaultAddress = async (req, reply) => {
    try {
        const userId = req.user.userId;
        const { addressId } = req.params;

        const customer = await Customer.findById(userId);
        if (!customer) {
            return reply.status(404).send({
                success: false,
                message: "Customer not found"
            });
        }

        // Find the address
        const addressToSet = customer.addresses.find(
            addr => addr._id.toString() === addressId
        );

        if (!addressToSet) {
            return reply.status(404).send({
                success: false,
                message: "Address not found"
            });
        }

        // Unset all defaults, then set this one
        customer.addresses.forEach(addr => {
            addr.isDefault = addr._id.toString() === addressId;
        });

        await customer.save();

        return reply.send({
            success: true,
            message: "Default address updated",
            address: addressToSet
        });
    } catch (error) {
        console.error("Set Default Address Error:", error);
        return reply.status(500).send({
            success: false,
            message: "Failed to set default address",
            error: error.message
        });
    }
};
