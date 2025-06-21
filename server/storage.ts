import { 
  users, partners, inventory, deals, shipments, payments, qualityChecks,
  type User, type InsertUser, type Partner, type InsertPartner, 
  type Inventory, type InsertInventory, type Deal, type InsertDeal,
  type Shipment, type InsertShipment, type Payment, type InsertPayment,
  type QualityCheck, type InsertQualityCheck
} from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private partners: Map<number, Partner> = new Map();
  private inventory: Map<number, Inventory> = new Map();
  private deals: Map<number, Deal> = new Map();
  private shipments: Map<number, Shipment> = new Map();
  private payments: Map<number, Payment> = new Map();
  private qualityChecks: Map<number, QualityCheck> = new Map();
  
  private currentUserId = 1;
  private currentPartnerId = 1;
  private currentInventoryId = 1;
  private currentDealId = 1;
  private currentShipmentId = 1;
  private currentPaymentId = 1;
  private currentQualityCheckId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed admin user
    const adminUser: User = {
      id: this.currentUserId++,
      username: "admin",
      email: "admin@scrapflow.com",
      password: "admin123", // In production, this would be hashed
      role: "admin",
      name: "Admin User",
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Seed export manager
    const exportManager: User = {
      id: this.currentUserId++,
      username: "export_manager",
      email: "export@scrapflow.com",
      password: "export123",
      role: "export_manager",
      name: "Export Manager",
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(exportManager.id, exportManager);

    // Seed yard staff
    const yardStaff: User = {
      id: this.currentUserId++,
      username: "yard_staff",
      email: "yard@scrapflow.com",
      password: "yard123",
      role: "yard_staff",
      name: "Yard Staff",
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(yardStaff.id, yardStaff);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      role: insertUser.role || "yard_staff",
      isActive: insertUser.isActive ?? true,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Partner methods
  async getPartner(id: number): Promise<Partner | undefined> {
    return this.partners.get(id);
  }

  async getAllPartners(): Promise<Partner[]> {
    return Array.from(this.partners.values());
  }

  async createPartner(insertPartner: InsertPartner): Promise<Partner> {
    const partner: Partner = {
      ...insertPartner,
      id: this.currentPartnerId++,
      status: insertPartner.status || "active",
      phone: insertPartner.phone || null,
      address: insertPartner.address || null,
      documents: insertPartner.documents || [],
      createdAt: new Date(),
    };
    this.partners.set(partner.id, partner);
    return partner;
  }

  async updatePartner(id: number, updateData: Partial<InsertPartner>): Promise<Partner | undefined> {
    const partner = this.partners.get(id);
    if (!partner) return undefined;
    
    const updatedPartner = { ...partner, ...updateData };
    this.partners.set(id, updatedPartner);
    return updatedPartner;
  }

  async deletePartner(id: number): Promise<boolean> {
    return this.partners.delete(id);
  }

  // Inventory methods
  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    return this.inventory.get(id);
  }

  async getAllInventory(): Promise<Inventory[]> {
    return Array.from(this.inventory.values());
  }

  async createInventoryItem(insertItem: InsertInventory): Promise<Inventory> {
    const item: Inventory = {
      ...insertItem,
      id: this.currentInventoryId++,
      status: insertItem.status || "available",
      location: insertItem.location || null,
      inspectionNotes: insertItem.inspectionNotes || null,
      qualityReports: insertItem.qualityReports || [],
      createdAt: new Date(),
    };
    this.inventory.set(item.id, item);
    return item;
  }

  async updateInventoryItem(id: number, updateData: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const item = this.inventory.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...updateData };
    this.inventory.set(id, updatedItem);
    return updatedItem;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    return this.inventory.delete(id);
  }

  // Deal methods
  async getDeal(id: number): Promise<Deal | undefined> {
    return this.deals.get(id);
  }

  async getAllDeals(): Promise<Deal[]> {
    return Array.from(this.deals.values());
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const deal: Deal = {
      ...insertDeal,
      id: this.currentDealId++,
      status: insertDeal.status || "draft",
      currency: insertDeal.currency || "USD",
      paymentTerms: insertDeal.paymentTerms || null,
      specialInstructions: insertDeal.specialInstructions || null,
      documents: insertDeal.documents || [],
      createdAt: new Date(),
    };
    this.deals.set(deal.id, deal);
    return deal;
  }

  async updateDeal(id: number, updateData: Partial<InsertDeal>): Promise<Deal | undefined> {
    const deal = this.deals.get(id);
    if (!deal) return undefined;
    
    const updatedDeal = { ...deal, ...updateData };
    this.deals.set(id, updatedDeal);
    return updatedDeal;
  }

  async deleteDeal(id: number): Promise<boolean> {
    return this.deals.delete(id);
  }

  // Shipment methods
  async getShipment(id: number): Promise<Shipment | undefined> {
    return this.shipments.get(id);
  }

  async getAllShipments(): Promise<Shipment[]> {
    return Array.from(this.shipments.values());
  }

  async createShipment(insertShipment: InsertShipment): Promise<Shipment> {
    const shipment: Shipment = {
      ...insertShipment,
      id: this.currentShipmentId++,
      status: insertShipment.status || "preparation",
      containerNo: insertShipment.containerNo || null,
      vesselName: insertShipment.vesselName || null,
      eta: insertShipment.eta || null,
      trackingNotes: insertShipment.trackingNotes || null,
      createdAt: new Date(),
    };
    this.shipments.set(shipment.id, shipment);
    return shipment;
  }

  async updateShipment(id: number, updateData: Partial<InsertShipment>): Promise<Shipment | undefined> {
    const shipment = this.shipments.get(id);
    if (!shipment) return undefined;
    
    const updatedShipment = { ...shipment, ...updateData };
    this.shipments.set(id, updatedShipment);
    return updatedShipment;
  }

  // Payment methods
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getAllPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const payment: Payment = {
      ...insertPayment,
      id: this.currentPaymentId++,
      status: insertPayment.status || "pending",
      currency: insertPayment.currency || "USD",
      proofDocument: insertPayment.proofDocument || null,
      gstAmount: insertPayment.gstAmount || null,
      createdAt: new Date(),
    };
    this.payments.set(payment.id, payment);
    return payment;
  }

  async updatePayment(id: number, updateData: Partial<InsertPayment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment = { ...payment, ...updateData };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  // Quality Check methods
  async getQualityCheck(id: number): Promise<QualityCheck | undefined> {
    return this.qualityChecks.get(id);
  }

  async getAllQualityChecks(): Promise<QualityCheck[]> {
    return Array.from(this.qualityChecks.values());
  }

  async createQualityCheck(insertCheck: InsertQualityCheck): Promise<QualityCheck> {
    const check: QualityCheck = {
      ...insertCheck,
      id: this.currentQualityCheckId++,
      grossWeight: insertCheck.grossWeight || null,
      netWeight: insertCheck.netWeight || null,
      moisture: insertCheck.moisture || null,
      radiation: insertCheck.radiation || null,
      purityPercent: insertCheck.purityPercent || null,
      testResults: insertCheck.testResults || {},
      createdAt: new Date(),
    };
    this.qualityChecks.set(check.id, check);
    return check;
  }
}

export const storage = new MemStorage();
