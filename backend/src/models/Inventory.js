const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['cleaning_supplies', 'equipment', 'tools', 'safety_gear', 'uniforms', 'consumables', 'other'],
    required: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  unit: {
    type: String,
    enum: ['piece', 'bottle', 'gallon', 'liter', 'pound', 'kilogram', 'box', 'pack', 'roll', 'other'],
    default: 'piece'
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  minStockLevel: {
    type: Number,
    required: true,
    default: 10
  },
  maxStockLevel: {
    type: Number,
    default: 100
  },
  reorderPoint: {
    type: Number,
    default: 20
  },
  cost: {
    purchasePrice: {
      type: Number,
      required: true,
      min: 0
    },
    averageCost: {
      type: Number,
      default: 0
    },
    lastPurchasePrice: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  supplier: {
    name: {
      type: String,
      trim: true
    },
    contact: {
      phone: String,
      email: String,
      website: String
    },
    leadTime: {
      type: Number, // in days
      default: 7
    }
  },
  storage: {
    location: {
      type: String,
      trim: true
    },
    section: {
      type: String,
      trim: true
    },
    shelf: {
      type: String,
      trim: true
    }
  },
  safety: {
    isHazardous: {
      type: Boolean,
      default: false
    },
    safetyDataSheet: {
      type: String // URL to SDS document
    },
    handlingInstructions: String,
    disposalInstructions: String
  },
  images: [{
    url: String,
    description: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['active', 'discontinued', 'out_of_stock', 'on_order'],
    default: 'active'
  },
  lastRestocked: Date,
  nextOrderDate: Date,
  notes: String
}, {
  timestamps: true
});

// Stock transaction schema for tracking inventory movements
const stockTransactionSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true
  },
  type: {
    type: String,
    enum: ['purchase', 'usage', 'adjustment', 'waste', 'return', 'transfer'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unitCost: {
    type: Number,
    default: 0
  },
  totalCost: {
    type: Number,
    default: 0
  },
  stockBefore: {
    type: Number,
    required: true
  },
  stockAfter: {
    type: Number,
    required: true
  },
  reference: {
    type: String, // Job number, PO number, etc.
    trim: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  supplier: {
    name: String,
    invoiceNumber: String,
    purchaseOrderNumber: String
  },
  location: {
    from: String,
    to: String
  },
  notes: String,
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Stock alert schema for low stock notifications
const stockAlertSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true
  },
  type: {
    type: String,
    enum: ['low_stock', 'out_of_stock', 'overstock', 'expiring'],
    required: true
  },
  currentStock: {
    type: Number,
    required: true
  },
  threshold: {
    type: Number,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved'],
    default: 'active'
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedAt: Date,
  resolvedAt: Date,
  notes: String
}, {
  timestamps: true
});

// Pre-save middleware to update stock after transactions
stockTransactionSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const item = await mongoose.model('InventoryItem').findById(this.item);
      if (item) {
        this.stockBefore = item.currentStock;
        
        // Calculate new stock based on transaction type
        let newStock = item.currentStock;
        
        switch (this.type) {
          case 'purchase':
          case 'return':
            newStock += this.quantity;
            break;
          case 'usage':
          case 'waste':
            newStock -= this.quantity;
            break;
          case 'adjustment':
            newStock = this.quantity; // Adjustment sets absolute quantity
            break;
          case 'transfer':
            // For transfers, quantity can be positive or negative
            newStock += this.quantity;
            break;
        }
        
        this.stockAfter = Math.max(0, newStock);
        
        // Update the inventory item
        await mongoose.model('InventoryItem').findByIdAndUpdate(this.item, {
          currentStock: this.stockAfter,
          lastRestocked: this.type === 'purchase' ? new Date() : item.lastRestocked
        });
        
        // Check for stock alerts
        if (this.stockAfter <= item.reorderPoint) {
          await mongoose.model('StockAlert').findOneAndUpdate(
            { item: this.item, type: 'low_stock', status: 'active' },
            {
              item: this.item,
              type: this.stockAfter === 0 ? 'out_of_stock' : 'low_stock',
              currentStock: this.stockAfter,
              threshold: item.reorderPoint,
              severity: this.stockAfter === 0 ? 'critical' : 'high'
            },
            { upsert: true }
          );
        }
      }
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);
const StockTransaction = mongoose.model('StockTransaction', stockTransactionSchema);
const StockAlert = mongoose.model('StockAlert', stockAlertSchema);

module.exports = {
  InventoryItem,
  StockTransaction,
  StockAlert
};