import { insertDealSchema, insertInventorySchema, insertPartnerSchema, insertPaymentSchema, insertQualityCheckSchema, insertShipmentSchema, insertUserSchema } from "@shared/schema";
import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";

// Configure multer for file uploads
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: uploadStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only documents and images are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await storage.getUserByEmail(email);

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account is inactive" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });

  } catch (error: any) {
    console.error("🔴 Login Error:", error.message, error.stack);  // ✅ add this
    res.status(500).json({ message: "Login failed" });
  }
});


  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, userData);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  // Partner routes
  app.get("/api/partners", async (req, res) => {
    try {
      const partners = await storage.getAllPartners();
      res.json(partners);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch partners" });
    }
  });

  app.post("/api/partners", async (req, res) => {
    try {
      const partnerData = insertPartnerSchema.parse(req.body);
      const partner = await storage.createPartner(partnerData);
      res.status(201).json(partner);
    } catch (error) {
      res.status(400).json({ message: "Invalid partner data" });
    }
  });

  app.put("/api/partners/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const partnerData = insertPartnerSchema.partial().parse(req.body);
      const partner = await storage.updatePartner(id, partnerData);
      
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }

      res.json(partner);
    } catch (error) {
      res.status(400).json({ message: "Invalid partner data" });
    }
  });

  app.delete("/api/partners/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePartner(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Partner not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete partner" });
    }
  });

  // Inventory routes
  app.get("/api/inventory", async (req, res) => {
    try {
      const inventory = await storage.getAllInventory();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const inventoryData = insertInventorySchema.parse(req.body);
      const item = await storage.createInventoryItem(inventoryData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid inventory data" });
    }
  });

  app.put("/api/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const inventoryData = insertInventorySchema.partial().parse(req.body);
      const item = await storage.updateInventoryItem(id, inventoryData);
      
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }

      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid inventory data" });
    }
  });

  // Lifecycle update route for inventory
  app.patch("/api/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      // Get current inventory item to track previous stage
      const currentItem = await storage.getInventoryItem(id);
      if (!currentItem) {
        return res.status(404).json({ message: "Inventory item not found" });
      }

      // Update inventory with new lifecycle data
      const updatedItem = await storage.updateInventoryItem(id, {
        lifecycleStage: updateData.lifecycleStage,
        status: updateData.status,
        barcode: updateData.barcode,
        qrCode: updateData.qrCode,
        batchNumber: updateData.batchNumber,
        inspectionNotes: updateData.inspectionNotes
      });

      // Create lifecycle update record
      await storage.createLifecycleUpdate({
        inventoryId: id,
        previousStage: currentItem.lifecycleStage,
        newStage: updateData.lifecycleStage,
        status: updateData.status,
        barcode: updateData.barcode,
        qrCode: updateData.qrCode,
        batchNumber: updateData.batchNumber,
        inspectionNotes: updateData.inspectionNotes,
        updatedBy: 3 // Default to yard staff for now
      });

      res.json(updatedItem);
    } catch (error) {
      console.error("Lifecycle update error:", error);
      res.status(400).json({ message: "Failed to update lifecycle" });
    }
  });

  app.delete("/api/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteInventoryItem(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Inventory item not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });

  // Deal routes
  app.get("/api/deals", async (req, res) => {
    try {
      const deals = await storage.getAllDeals();
      res.json(deals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deals" });
    }
  });

  app.post("/api/deals", async (req, res) => {
    try {
      const dealData = insertDealSchema.parse(req.body);
      const deal = await storage.createDeal(dealData);
      res.status(201).json(deal);
    } catch (error) {
      res.status(400).json({ message: "Invalid deal data" });
    }
  });

  app.put("/api/deals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const dealData = insertDealSchema.partial().parse(req.body);
      const deal = await storage.updateDeal(id, dealData);
      
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }

      res.json(deal);
    } catch (error) {
      res.status(400).json({ message: "Invalid deal data" });
    }
  });

  // Shipment routes
  app.get("/api/shipments", async (req, res) => {
    try {
      const shipments = await storage.getAllShipments();
      res.json(shipments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shipments" });
    }
  });

  app.post("/api/shipments", async (req, res) => {
    try {
      const shipmentData = insertShipmentSchema.parse(req.body);
      const shipment = await storage.createShipment(shipmentData);
      res.status(201).json(shipment);
    } catch (error) {
      res.status(400).json({ message: "Invalid shipment data" });
    }
  });

  // Payment routes
  app.get("/api/payments", async (req, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data" });
    }
  });

  // Quality check routes
  app.get("/api/quality-checks", async (req, res) => {
    try {
      const checks = await storage.getAllQualityChecks();
      res.json(checks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quality checks" });
    }
  });

  app.post("/api/quality-checks", async (req, res) => {
    try {
      const checkData = insertQualityCheckSchema.parse(req.body);
      const check = await storage.createQualityCheck(checkData);
      res.status(201).json(check);
    } catch (error) {
      res.status(400).json({ message: "Invalid quality check data" });
    }
  });

  // Statistics endpoint for dashboard
  // Lifecycle tracking routes
  app.get("/api/lifecycle-updates", async (req, res) => {
    try {
      const updates = await storage.getAllLifecycleUpdates();
      res.json(updates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lifecycle updates" });
    }
  });

  app.get("/api/lifecycle-updates/:inventoryId", async (req, res) => {
    try {
      const inventoryId = parseInt(req.params.inventoryId);
      const updates = await storage.getLifecycleUpdatesByInventory(inventoryId);
      res.json(updates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory lifecycle updates" });
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      const inventory = await storage.getAllInventory();
      const deals = await storage.getAllDeals();
      const partners = await storage.getAllPartners();
      const shipments = await storage.getAllShipments();
      const lifecycleUpdates = await storage.getAllLifecycleUpdates();
      console.log(lifecycleUpdates)
      // Calculate lifecycle stage distribution
      const lifecycleStages = inventory.reduce((acc, item) => {
        const stage = item.lifecycleStage || 'collection';
        acc[stage] = (acc[stage] || 0) + 1;
        return acc;
      }, {});

      // Recent lifecycle activity (last 7 days)
      const recentUpdates = lifecycleUpdates.filter(update => {
        const updateDate = new Date(update.updatedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return updateDate >= weekAgo;
      });

      const stats = {
        totalInventory: inventory.length,
        activeDeals: deals.filter(deal => deal.status === 'confirmed' || deal.status === 'in_progress').length,
        monthlyRevenue: deals
          .filter(deal => deal.status === 'completed')
          .reduce((total, deal) => total + parseFloat(deal.totalValue), 0),
        pendingShipments: shipments.filter(shipment => shipment.status !== 'delivered').length,
        totalSuppliers: partners.filter(partner => partner.type === 'supplier' || partner.type === 'both').length,
        totalBuyers: partners.filter(partner => partner.type === 'buyer' || partner.type === 'both').length,
        activePartnerships: partners.filter(partner => partner.status === 'active').length,
        totalDeals: deals.length,
        completedDeals: deals.filter(deal => deal.status === 'completed').length,
        totalValue: deals.reduce((total, deal) => total + parseFloat(deal.totalValue), 0),
        lifecycleStages,
        recentLifecycleUpdates: recentUpdates.length,
        totalLifecycleUpdates: lifecycleUpdates.length,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Report generation endpoint
  app.get("/api/reports/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const inventory = await storage.getAllInventory();
      const deals = await storage.getAllDeals();
      const partners = await storage.getAllPartners();
      const shipments = await storage.getAllShipments();
      const payments = await storage.getAllPayments();

      let reportData = {};

      switch (type) {
        case 'inventory':
          reportData = {
            title: 'Inventory Summary Report',
            generatedAt: new Date().toISOString(),
            data: {
              totalItems: inventory.length,
              totalQuantity: inventory.reduce((sum, item) => sum + parseFloat(item.quantity), 0),
              byMetalType: inventory.reduce((acc, item) => {
                acc[item.metalType] = (acc[item.metalType] || 0) + parseFloat(item.quantity);
                return acc;
              }, {}),
              byGrade: inventory.reduce((acc, item) => {
                acc[item.grade] = (acc[item.grade] || 0) + 1;
                return acc;
              }, {}),
              byStatus: inventory.reduce((acc, item) => {
                acc[item.status] = (acc[item.status] || 0) + 1;
                return acc;
              }, {}),
              items: inventory
            }
          };
          break;

        case 'financial':
          const totalRevenue = deals.reduce((sum, deal) => sum + parseFloat(deal.totalValue), 0);
          const completedRevenue = deals
            .filter(deal => deal.status === 'completed')
            .reduce((sum, deal) => sum + parseFloat(deal.totalValue), 0);
          
          reportData = {
            title: 'Financial Report',
            generatedAt: new Date().toISOString(),
            data: {
              totalRevenue,
              completedRevenue,
              pendingRevenue: totalRevenue - completedRevenue,
              totalDeals: deals.length,
              completedDeals: deals.filter(deal => deal.status === 'completed').length,
              avgDealValue: totalRevenue / deals.length || 0,
              deals,
              payments
            }
          };
          break;

        case 'partners':
          reportData = {
            title: 'Partner Analysis Report',
            generatedAt: new Date().toISOString(),
            data: {
              totalPartners: partners.length,
              activePartners: partners.filter(p => p.status === 'active').length,
              suppliers: partners.filter(p => p.type === 'supplier' || p.type === 'both').length,
              buyers: partners.filter(p => p.type === 'buyer' || p.type === 'both').length,
              byCountry: partners.reduce((acc, partner) => {
                acc[partner.country] = (acc[partner.country] || 0) + 1;
                return acc;
              }, {}),
              partners
            }
          };
          break;

        case 'operations':
          reportData = {
            title: 'Operations Report',
            generatedAt: new Date().toISOString(),
            data: {
              totalShipments: shipments.length,
              activeShipments: shipments.filter(s => s.status !== 'delivered').length,
              completedShipments: shipments.filter(s => s.status === 'delivered').length,
              onTimeDeliveries: shipments.filter(s => s.status === 'delivered').length,
              shipments,
              deals: deals.filter(deal => deal.status !== 'draft')
            }
          };
          break;

        default:
          return res.status(400).json({ message: "Invalid report type" });
      }

      res.json(reportData);
    } catch (error) {
      console.error('Report generation error:', error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Documents routes
  app.get('/api/documents', async (req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

  app.post('/api/documents', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { dealId, documentType, uploadedBy } = req.body;
      
      const documentData = {
        dealId: parseInt(dealId),
        documentType,
        fileName: req.file.originalname,
        filePath: `/uploads/documents/${req.file.filename}`,
        fileSize: req.file.size,
        uploadedBy: parseInt(uploadedBy)
      };

      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      console.error('File upload error:', error);
      res.status(400).json({ error: 'Failed to upload document' });
    }
  });

  app.patch('/api/documents/:id/approve', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { approvedBy } = req.body;
      const document = await storage.approveDocument(id, approvedBy);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      res.json(document);
    } catch (error) {
      res.status(400).json({ error: 'Failed to approve document' });
    }
  });

  app.patch('/api/documents/:id/reject', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { rejectedBy, rejectionReason } = req.body;
      const document = await storage.rejectDocument(id, rejectedBy, rejectionReason);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      res.json(document);
    } catch (error) {
      res.status(400).json({ error: 'Failed to reject document' });
    }
  });

  // Settings routes
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.get('/api/settings/:key', async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ error: 'Setting not found' });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch setting' });
    }
  });

  app.put('/api/settings/:key', async (req, res) => {
    try {
      const { value, description, updatedBy } = req.body;
      const setting = await storage.updateSetting(req.params.key, value, description, updatedBy);
      res.json(setting);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update setting' });
    }
  });

  app.delete('/api/settings/:key', async (req, res) => {
    try {
      const deleted = await storage.deleteSetting(req.params.key);
      if (!deleted) {
        return res.status(404).json({ error: 'Setting not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete setting' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
