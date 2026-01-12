const Client = require('../models/Client');

// Get all clients
const getAllClients = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      type, 
      search,
      sortBy = 'dateAdded',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    // Apply filters
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const clients = await Client.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Client.countDocuments(filter);

    res.json({
      clients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch clients',
      message: error.message 
    });
  }
};

// Get client by ID
const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch client',
      message: error.message 
    });
  }
};

// Create new client
const createClient = async (req, res) => {
  try {
    const clientData = req.body;
    
    // Check if email already exists
    const existingClient = await Client.findOne({ email: clientData.email });
    if (existingClient) {
      return res.status(400).json({ error: 'A client with this email already exists' });
    }

    const client = new Client(clientData);
    await client.save();
    
    res.status(201).json(client);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors 
      });
    }
    res.status(500).json({ 
      error: 'Failed to create client',
      message: error.message 
    });
  }
};

// Update client
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if email is being updated and already exists for another client
    if (updateData.email) {
      const existingClient = await Client.findOne({ 
        email: updateData.email,
        _id: { $ne: id }
      });
      if (existingClient) {
        return res.status(400).json({ error: 'A client with this email already exists' });
      }
    }

    const client = await Client.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors 
      });
    }
    res.status(500).json({ 
      error: 'Failed to update client',
      message: error.message 
    });
  }
};

// Delete client
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to delete client',
      message: error.message 
    });
  }
};

// Get client statistics
const getClientStats = async (req, res) => {
  try {
    const stats = await Client.aggregate([
      {
        $group: {
          _id: null,
          totalClients: { $sum: 1 },
          activeClients: { 
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } 
          },
          prospectClients: { 
            $sum: { $cond: [{ $eq: ["$status", "prospect"] }, 1, 0] } 
          },
          inactiveClients: { 
            $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] } 
          },
          residentialClients: { 
            $sum: { $cond: [{ $eq: ["$type", "residential"] }, 1, 0] } 
          },
          commercialClients: { 
            $sum: { $cond: [{ $eq: ["$type", "commercial"] }, 1, 0] } 
          },
          totalRevenue: { $sum: "$stats.totalPaid" },
          averageRating: { $avg: "$stats.rating" }
        }
      }
    ]);

    res.json(stats[0] || {
      totalClients: 0,
      activeClients: 0,
      prospectClients: 0,
      inactiveClients: 0,
      residentialClients: 0,
      commercialClients: 0,
      totalRevenue: 0,
      averageRating: 0
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch client statistics',
      message: error.message 
    });
  }
};

// Update client status
const updateClientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'prospect'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const client = await Client.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to update client status',
      message: error.message 
    });
  }
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientStats,
  updateClientStatus
};