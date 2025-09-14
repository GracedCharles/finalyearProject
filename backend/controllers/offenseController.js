const OffenseType = require('../models/OffenseType');

// Get all offense types
const getOffenseTypes = async (req, res) => {
  try {
    const offenseTypes = await OffenseType.find({}).sort({ code: 1 });
    res.json(offenseTypes);
  } catch (error) {
    console.error('Error fetching offense types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get offense type by ID
const getOffenseTypeById = async (req, res) => {
  try {
    const offenseType = await OffenseType.findById(req.params.id);
    
    if (!offenseType) {
      return res.status(404).json({ error: 'Offense type not found' });
    }
    
    res.json(offenseType);
  } catch (error) {
    console.error('Error fetching offense type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new offense type
const createOffenseType = async (req, res) => {
  try {
    const { code, description, amount, category } = req.body;
    
    const existingOffense = await OffenseType.findOne({ code });
    if (existingOffense) {
      return res.status(400).json({ error: 'Offense type with this code already exists' });
    }
    
    const offenseType = new OffenseType({
      code,
      description,
      amount,
      category
    });
    
    await offenseType.save();
    res.status(201).json(offenseType);
  } catch (error) {
    console.error('Error creating offense type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update an offense type
const updateOffenseType = async (req, res) => {
  try {
    const { code, description, amount, category } = req.body;
    
    const offenseType = await OffenseType.findByIdAndUpdate(
      req.params.id,
      { code, description, amount, category },
      { new: true, runValidators: true }
    );
    
    if (!offenseType) {
      return res.status(404).json({ error: 'Offense type not found' });
    }
    
    res.json(offenseType);
  } catch (error) {
    console.error('Error updating offense type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete an offense type
const deleteOffenseType = async (req, res) => {
  try {
    const offenseType = await OffenseType.findByIdAndDelete(req.params.id);
    
    if (!offenseType) {
      return res.status(404).json({ error: 'Offense type not found' });
    }
    
    res.json({ message: 'Offense type deleted successfully' });
  } catch (error) {
    console.error('Error deleting offense type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getOffenseTypes,
  getOffenseTypeById,
  createOffenseType,
  updateOffenseType,
  deleteOffenseType
};