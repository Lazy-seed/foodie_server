import Address from '../models/addressModel.js';

// Get all addresses for a user
export const getAddresses = async (req, res) => {
    try {
        let addressDoc = await Address.findOne({ userId: req.user.id });

        if (!addressDoc) {
            // Create empty address document if doesn't exist
            addressDoc = await Address.create({ userId: req.user.id, addresses: [] });
        }

        res.status(200).json({ addresses: addressDoc.addresses });
    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({ message: 'Failed to fetch addresses', error: error.message });
    }
};

// Add new address
export const addAddress = async (req, res) => {
    try {
        const { tag, firstName, lastName, address, city, postcode, contact, isDefault } = req.body;

        let addressDoc = await Address.findOne({ userId: req.user.id });

        if (!addressDoc) {
            addressDoc = new Address({ userId: req.user.id, addresses: [] });
        }

        // Check max addresses limit
        if (addressDoc.addresses.length >= addressDoc.maxAddresses) {
            return res.status(400).json({
                message: `Maximum ${addressDoc.maxAddresses} addresses allowed`
            });
        }

        // If this is set as default, unset all other defaults
        if (isDefault) {
            addressDoc.addresses.forEach(addr => addr.isDefault = false);
        }

        // If this is the first address, make it default
        const makeDefault = addressDoc.addresses.length === 0 || isDefault;

        addressDoc.addresses.push({
            tag,
            firstName,
            lastName,
            address,
            city,
            postcode,
            contact,
            isDefault: makeDefault
        });

        await addressDoc.save();

        res.status(201).json({
            message: 'Address added successfully',
            address: addressDoc.addresses[addressDoc.addresses.length - 1]
        });
    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({ message: 'Failed to add address', error: error.message });
    }
};

// Update address
export const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const { tag, firstName, lastName, address, city, postcode, contact, isDefault } = req.body;

        const addressDoc = await Address.findOne({ userId: req.user.id });

        if (!addressDoc) {
            return res.status(404).json({ message: 'No addresses found' });
        }

        const addressToUpdate = addressDoc.addresses.id(addressId);

        if (!addressToUpdate) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // If setting as default, unset all other defaults
        if (isDefault) {
            addressDoc.addresses.forEach(addr => {
                if (addr._id.toString() !== addressId) {
                    addr.isDefault = false;
                }
            });
        }

        // Update fields
        if (tag) addressToUpdate.tag = tag;
        if (firstName) addressToUpdate.firstName = firstName;
        if (lastName) addressToUpdate.lastName = lastName;
        if (address) addressToUpdate.address = address;
        if (city) addressToUpdate.city = city;
        if (postcode) addressToUpdate.postcode = postcode;
        if (contact) addressToUpdate.contact = contact;
        if (isDefault !== undefined) addressToUpdate.isDefault = isDefault;

        await addressDoc.save();

        res.status(200).json({
            message: 'Address updated successfully',
            address: addressToUpdate
        });
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({ message: 'Failed to update address', error: error.message });
    }
};

// Delete address
export const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;

        const addressDoc = await Address.findOne({ userId: req.user.id });

        if (!addressDoc) {
            return res.status(404).json({ message: 'No addresses found' });
        }

        const addressToDelete = addressDoc.addresses.id(addressId);

        if (!addressToDelete) {
            return res.status(404).json({ message: 'Address not found' });
        }

        const wasDefault = addressToDelete.isDefault;

        // Remove the address
        addressDoc.addresses.pull(addressId);

        // If deleted address was default, set first remaining address as default
        if (wasDefault && addressDoc.addresses.length > 0) {
            addressDoc.addresses[0].isDefault = true;
        }

        await addressDoc.save();

        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ message: 'Failed to delete address', error: error.message });
    }
};

// Set address as default
export const setDefaultAddress = async (req, res) => {
    try {
        const { addressId } = req.params;

        const addressDoc = await Address.findOne({ userId: req.user.id });

        if (!addressDoc) {
            return res.status(404).json({ message: 'No addresses found' });
        }

        const addressToSetDefault = addressDoc.addresses.id(addressId);

        if (!addressToSetDefault) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Unset all defaults
        addressDoc.addresses.forEach(addr => addr.isDefault = false);

        // Set this one as default
        addressToSetDefault.isDefault = true;

        await addressDoc.save();

        res.status(200).json({
            message: 'Default address updated successfully',
            address: addressToSetDefault
        });
    } catch (error) {
        console.error('Set default address error:', error);
        res.status(500).json({ message: 'Failed to set default address', error: error.message });
    }
};
