import { 
  users, partners, inventory, deals, shipments, payments, qualityChecks, documents, settings, lifecycleUpdates,
  type User, type InsertUser, type Partner, type InsertPartner, 
  type Inventory, type InsertInventory, type Deal, type InsertDeal,
  type Shipment, type InsertShipment, type Payment, type InsertPayment,
  type QualityCheck, type InsertQualityCheck, type Document, type InsertDocument,
  type Setting, type InsertSetting, type LifecycleUpdate, type InsertLifecycleUpdate
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Partners
  getPartner(id: number): Promise<Partner | undefined>;
  getAllPartners(): Promise<Partner[]>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: number, partner: Partial<InsertPartner>): Promise<Partner | undefined>;
  deletePartner(id: number): Promise<boolean>;

  // Inventory
  getInventoryItem(id: number): Promise<Inventory | undefined>;
  getAllInventory(): Promise<Inventory[]>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<Inventory | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;

  // Deals
  getDeal(id: number): Promise<Deal | undefined>;
  getAllDeals(): Promise<Deal[]>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: number, deal: Partial<InsertDeal>): Promise<Deal | undefined>;
  deleteDeal(id: number): Promise<boolean>;

  // Shipments
  getShipment(id: number): Promise<Shipment | undefined>;
  getAllShipments(): Promise<Shipment[]>;
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  updateShipment(id: number, shipment: Partial<InsertShipment>): Promise<Shipment | undefined>;

  // Payments
  getPayment(id: number): Promise<Payment | undefined>;
  getAllPayments(): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;

  // Quality Checks
  getQualityCheck(id: number): Promise<QualityCheck | undefined>;
  getAllQualityChecks(): Promise<QualityCheck[]>;
  createQualityCheck(check: InsertQualityCheck): Promise<QualityCheck>;

  // Documents
  getDocument(id: number): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  approveDocument(id: number, approvedBy: number): Promise<Document | undefined>;
  rejectDocument(id: number, rejectedBy: number, reason: string): Promise<Document | undefined>;

  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  getAllSettings(): Promise<Setting[]>;
  updateSetting(key: string, value: any, description?: string, updatedBy?: number): Promise<Setting>;
  deleteSetting(key: string): Promise<boolean>;

  // Lifecycle Updates
  createLifecycleUpdate(update: InsertLifecycleUpdate): Promise<LifecycleUpdate>;
  getAllLifecycleUpdates(): Promise<LifecycleUpdate[]>;
  getLifecycleUpdatesByInventory(inventoryId: number): Promise<LifecycleUpdate[]>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.seedData();
  }

  private async seedData() {
    try {
      // Check if users already exist
      const existingUsers = await db.select().from(users).limit(1);
      if (existingUsers.length > 0) {
        return; // Data already seeded
      }

      // Seed admin user
      await db.insert(users).values({
        username: "admin",
        email: "admin@scrapflow.com",
        password: "admin123", // In production, this would be hashed
        role: "admin",
        name: "Admin User",
        isActive: true,
      });

      // Seed export manager
      await db.insert(users).values({
        username: "export_manager",
        email: "export@scrapflow.com",
        password: "export123",
        role: "export_manager",
        name: "Export Manager",
        isActive: true,
      });

      // Seed yard staff
      await db.insert(users).values({
        username: "yard_staff",
        email: "yard@scrapflow.com",
        password: "yard123",
        role: "yard_staff",
        name: "Yard Staff",
        isActive: true,
      });

      // Seed default settings
      const defaultSettings = [
        { key: "company_name", value: "ScrapFlow Industries", description: "Company name displayed in the application", updatedBy: 1 },
        { key: "default_currency", value: "USD", description: "Default currency for transactions", updatedBy: 1 },
        { key: "gst_rate", value: 18, description: "GST rate for calculations", updatedBy: 1 },
        { key: "email_notifications_enabled", value: true, description: "Enable email notifications", updatedBy: 1 },
        { key: "session_timeout_minutes", value: 480, description: "Session timeout in minutes", updatedBy: 1 },
        { key: "max_login_attempts", value: 5, description: "Maximum login attempts before lockout", updatedBy: 1 },
        { key: "auto_approval_enabled", value: false, description: "Enable automatic approval for small orders", updatedBy: 1 },
        { key: "auto_approval_limit", value: 10000, description: "Maximum value for auto-approval", updatedBy: 1 },
      ];

      for (const setting of defaultSettings) {
        await db.insert(settings).values(setting);
      }

      console.log("Database seeded successfully");
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        role: insertUser.role || "yard_staff",
        isActive: insertUser.isActive ?? true,
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Partner methods
  async getPartner(id: number): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.id, id));
    return partner || undefined;
  }

  async getAllPartners(): Promise<Partner[]> {
    return await db.select().from(partners);
  }

  async createPartner(insertPartner: InsertPartner): Promise<Partner> {
    const [partner] = await db
      .insert(partners)
      .values({
        ...insertPartner,
        status: insertPartner.status || "active",
        phone: insertPartner.phone || null,
        address: insertPartner.address || null,
        documents: insertPartner.documents || [],
      })
      .returning();
    return partner;
  }

  async updatePartner(id: number, updateData: Partial<InsertPartner>): Promise<Partner | undefined> {
    const [partner] = await db
      .update(partners)
      .set(updateData)
      .where(eq(partners.id, id))
      .returning();
    return partner || undefined;
  }

  async deletePartner(id: number): Promise<boolean> {
    const result = await db.delete(partners).where(eq(partners.id, id));
    return result.rowCount > 0;
  }

  // Inventory methods
  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item || undefined;
  }

  async getAllInventory(): Promise<Inventory[]> {
    return await db.select().from(inventory);
  }

  async createInventoryItem(insertItem: InsertInventory): Promise<Inventory> {
    const [item] = await db
      .insert(inventory)
      .values({
        ...insertItem,
        status: insertItem.status || "available",
        location: insertItem.location || null,
        inspectionNotes: insertItem.inspectionNotes || null,
        qualityReports: insertItem.qualityReports || [],
        lifecycleStage: insertItem.lifecycleStage || "collection",
        barcode: insertItem.barcode || null,
        qrCode: insertItem.qrCode || null,
        batchNumber: insertItem.batchNumber || null,
      })
      .returning();
    return item;
  }

  async updateInventoryItem(id: number, updateData: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const [item] = await db
      .update(inventory)
      .set(updateData)
      .where(eq(inventory.id, id))
      .returning();
    return item || undefined;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    const result = await db.delete(inventory).where(eq(inventory.id, id));
    return result.rowCount > 0;
  }

  // Deal methods
  async getDeal(id: number): Promise<Deal | undefined> {
    const [deal] = await db.select().from(deals).where(eq(deals.id, id));
    return deal || undefined;
  }

  async getAllDeals(): Promise<Deal[]> {
    return await db.select().from(deals);
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const [deal] = await db
      .insert(deals)
      .values({
        ...insertDeal,
        status: insertDeal.status || "draft",
        currency: insertDeal.currency || "USD",
        paymentTerms: insertDeal.paymentTerms || null,
        specialInstructions: insertDeal.specialInstructions || null,
        documents: insertDeal.documents || [],
        dealType: insertDeal.dealType || "export",
        approvedBy: insertDeal.approvedBy || null,
        approvedAt: insertDeal.approvedAt || null,
        rejectedBy: insertDeal.rejectedBy || null,
        rejectedAt: insertDeal.rejectedAt || null,
        rejectionReason: insertDeal.rejectionReason || null,
      })
      .returning();
    return deal;
  }

  async updateDeal(id: number, updateData: Partial<InsertDeal>): Promise<Deal | undefined> {
    const [deal] = await db
      .update(deals)
      .set(updateData)
      .where(eq(deals.id, id))
      .returning();
    return deal || undefined;
  }

  async deleteDeal(id: number): Promise<boolean> {
    const result = await db.delete(deals).where(eq(deals.id, id));
    return result.rowCount > 0;
  }

  // Shipment methods
  async getShipment(id: number): Promise<Shipment | undefined> {
    const [shipment] = await db.select().from(shipments).where(eq(shipments.id, id));
    return shipment || undefined;
  }

  async getAllShipments(): Promise<Shipment[]> {
    return await db.select().from(shipments);
  }

  async createShipment(insertShipment: InsertShipment): Promise<Shipment> {
    const [shipment] = await db
      .insert(shipments)
      .values({
        ...insertShipment,
        status: insertShipment.status || "preparation",
        containerNo: insertShipment.containerNo || null,
        vesselName: insertShipment.vesselName || null,
        eta: insertShipment.eta || null,
        trackingNotes: insertShipment.trackingNotes || null,
      })
      .returning();
    return shipment;
  }

  async updateShipment(id: number, updateData: Partial<InsertShipment>): Promise<Shipment | undefined> {
    const [shipment] = await db
      .update(shipments)
      .set(updateData)
      .where(eq(shipments.id, id))
      .returning();
    return shipment || undefined;
  }

  // Payment methods
  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async getAllPayments(): Promise<Payment[]> {
    return await db.select().from(payments);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values({
        ...insertPayment,
        status: insertPayment.status || "pending",
        currency: insertPayment.currency || "USD",
        proofDocument: insertPayment.proofDocument || null,
        gstAmount: insertPayment.gstAmount || null,
        bankDetails: insertPayment.bankDetails || {},
        paymentDate: insertPayment.paymentDate || null,
        receivedBy: insertPayment.receivedBy || null,
      })
      .returning();
    return payment;
  }

  async updatePayment(id: number, updateData: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [payment] = await db
      .update(payments)
      .set(updateData)
      .where(eq(payments.id, id))
      .returning();
    return payment || undefined;
  }

  // Quality Check methods
  async getQualityCheck(id: number): Promise<QualityCheck | undefined> {
    const [check] = await db.select().from(qualityChecks).where(eq(qualityChecks.id, id));
    return check || undefined;
  }

  async getAllQualityChecks(): Promise<QualityCheck[]> {
    return await db.select().from(qualityChecks);
  }

  async createQualityCheck(insertCheck: InsertQualityCheck): Promise<QualityCheck> {
    const [check] = await db
      .insert(qualityChecks)
      .values({
        ...insertCheck,
        grossWeight: insertCheck.grossWeight || null,
        netWeight: insertCheck.netWeight || null,
        moisture: insertCheck.moisture || null,
        radiation: insertCheck.radiation || null,
        purityPercent: insertCheck.purityPercent || null,
        testResults: insertCheck.testResults || {},
        weighbridgeData: insertCheck.weighbridgeData || {},
        inspectionImages: insertCheck.inspectionImages || [],
        inventoryId: insertCheck.inventoryId || null,
      })
      .returning();
    return check;
  }

  // Documents
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async getAllDocuments(): Promise<Document[]> {
    return await db.select().from(documents);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values({
        ...insertDocument,
        status: insertDocument.status || "pending",
        approvedBy: insertDocument.approvedBy || null,
        approvedAt: insertDocument.approvedAt || null,
        rejectedBy: insertDocument.rejectedBy || null,
        rejectedAt: insertDocument.rejectedAt || null,
        rejectionReason: insertDocument.rejectionReason || null,
        fileSize: insertDocument.fileSize || null,
      })
      .returning();
    return document;
  }

  async updateDocument(id: number, updateData: Partial<InsertDocument>): Promise<Document | undefined> {
    const [document] = await db
      .update(documents)
      .set(updateData)
      .where(eq(documents.id, id))
      .returning();
    return document || undefined;
  }

  async approveDocument(id: number, approvedBy: number): Promise<Document | undefined> {
    const [document] = await db
      .update(documents)
      .set({
        status: "approved",
        approvedBy,
        approvedAt: new Date(),
        rejectedBy: null,
        rejectedAt: null,
        rejectionReason: null,
      })
      .where(eq(documents.id, id))
      .returning();
    return document || undefined;
  }

  async rejectDocument(id: number, rejectedBy: number, reason: string): Promise<Document | undefined> {
    const [document] = await db
      .update(documents)
      .set({
        status: "rejected",
        rejectedBy,
        rejectedAt: new Date(),
        rejectionReason: reason,
        approvedBy: null,
        approvedAt: null,
      })
      .where(eq(documents.id, id))
      .returning();
    return document || undefined;
  }

  // Settings
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting || undefined;
  }

  async getAllSettings(): Promise<Setting[]> {
    return await db.select().from(settings);
  }

  async updateSetting(key: string, value: any, description?: string, updatedBy?: number): Promise<Setting> {
    const existingSetting = await this.getSetting(key);
    
    if (existingSetting) {
      const [setting] = await db
        .update(settings)
        .set({
          value,
          description: description || existingSetting.description,
          updatedBy: updatedBy || 1,
          updatedAt: new Date(),
        })
        .where(eq(settings.key, key))
        .returning();
      return setting;
    } else {
      const [setting] = await db
        .insert(settings)
        .values({
          key,
          value,
          description: description || null,
          updatedBy: updatedBy || 1,
        })
        .returning();
      return setting;
    }
  }

  async deleteSetting(key: string): Promise<boolean> {
    const result = await db.delete(settings).where(eq(settings.key, key));
    return result.rowCount > 0;
  }

  // Lifecycle Updates
  async createLifecycleUpdate(update: InsertLifecycleUpdate): Promise<LifecycleUpdate> {
    try {
      const [lifecycleUpdate] = await db.insert(lifecycleUpdates).values(update).returning();
      return lifecycleUpdate;
    } catch (error) {
      console.error("Error creating lifecycle update:", error);
      throw error;
    }
  }

  async getAllLifecycleUpdates(): Promise<LifecycleUpdate[]> {
    try {
      return await db.select().from(lifecycleUpdates)
        .orderBy(desc(lifecycleUpdates.updatedAt));
    } catch (error) {
      console.error("Error getting all lifecycle updates:", error);
      return [];
    }
  }

  async getLifecycleUpdatesByInventory(inventoryId: number): Promise<LifecycleUpdate[]> {
    try {
      return await db.select().from(lifecycleUpdates)
        .where(eq(lifecycleUpdates.inventoryId, inventoryId))
        .orderBy(desc(lifecycleUpdates.updatedAt));
    } catch (error) {
      console.error("Error getting lifecycle updates for inventory:", error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();